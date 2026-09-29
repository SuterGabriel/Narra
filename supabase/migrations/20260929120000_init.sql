-- Narra: request log, cost ledger and rate limits.
-- All tables are server-only: RLS is on and there are no policies, so only the
-- service role (used by Next.js API routes) can read or write.

-- One row per AI or voice request. Source for the daily cost cap and the cost dashboard.
create table public.ai_requests (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  request_id      uuid not null,
  route           text not null,
  model           text,
  input_tokens    integer not null default 0,
  output_tokens   integer not null default 0,
  cache_read_tokens  integer not null default 0,
  cache_write_tokens integer not null default 0,
  characters      integer not null default 0, -- ElevenLabs bills per character
  cost_usd        numeric(10, 6) not null default 0,
  duration_ms     integer not null,
  status          integer not null,
  error           text
);

create index ai_requests_created_at_idx on public.ai_requests (created_at desc);

-- Per-client daily counter. The IP is hashed with a server secret before it gets here.
create table public.rate_limits (
  ip_hash text    not null,
  day     date    not null,
  count   integer not null default 0,
  primary key (ip_hash, day)
);

alter table public.ai_requests enable row level security;
alter table public.rate_limits enable row level security;

-- Today's date in Swiss time, so limits reset at local midnight.
create or replace function public.narra_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Europe/Zurich')::date;
$$;

-- Atomically checks the global daily budget and the per-client limit, then counts the request.
-- Returns allowed = false with a reason instead of raising, so the API can answer politely.
create or replace function public.consume_quota(
  p_ip_hash          text,
  p_per_client_limit integer,
  p_daily_budget_usd numeric
)
returns table (allowed boolean, reason text, used integer, spent_usd numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := public.narra_today();
  v_spent numeric;
  v_used  integer;
begin
  select coalesce(sum(r.cost_usd), 0)
    into v_spent
    from public.ai_requests r
   where r.created_at >= (v_today::timestamp at time zone 'Europe/Zurich');

  if v_spent >= p_daily_budget_usd then
    return query select false, 'daily_budget', null::integer, v_spent;
    return;
  end if;

  insert into public.rate_limits as rl (ip_hash, day, count)
  values (p_ip_hash, v_today, 1)
  on conflict (ip_hash, day)
  do update set count = rl.count + 1
  where rl.count < p_per_client_limit
  returning rl.count into v_used;

  if v_used is null then
    return query select false, 'client_limit', p_per_client_limit, v_spent;
    return;
  end if;

  return query select true, null::text, v_used, v_spent;
end;
$$;

revoke all on function public.consume_quota(text, integer, numeric) from public, anon, authenticated;
revoke all on function public.narra_today() from public, anon, authenticated;
