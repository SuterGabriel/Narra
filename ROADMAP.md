# Narra Roadmap

Everything that is planned or still open, as of 30 September 2026. The original project plan (German) is in [PROJEKT.md](PROJEKT.md); this file tracks what is left.

Legend: `[ ]` open · `[~]` started · owner in brackets where it is not the code: **(Gabriel)** needs you, **(together)** needs both.

---

## 1. Blocking inputs

Most open work waits on these. Nothing below in sections 4, 5 and 6 can be finished without them.

- [ ] **Supabase project** "narra" (region Frankfurt or Zurich); set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and Vercel. **(Gabriel)**
- [ ] **Anthropic API key** and **model choice** for the question feature (Opus 5 is the default; Sonnet 5 costs about half). Set `ANTHROPIC_API_KEY`, optionally `ANTHROPIC_MODEL`. Add a monthly spend limit in the Anthropic console. **(Gabriel)**
- [ ] **ElevenLabs API key** from the Creator plan, a chosen German voice, and the plan's **expiry date** noted in a calendar (reminder one week before). **(Gabriel)**
- [ ] **Source material for T&U chapter 1 and 2** (script or textbook pages the summary was made from). **(Gabriel)**
- [ ] **Decisions** **(Gabriel)**
  - [ ] English works: content in English, interface in German?
  - [ ] Who adds works for now: only us (curated), or students upload themselves?
  - [ ] Study plan on Üben: small link or its own tile?
  - [ ] Commit the business-model section that was added to PROJEKT.md, or keep it out of the repo?

---

## 2. Clarity and structure (no keys needed, can start now)

Principle: *keep it simple*. Every page has one job; nothing is hidden inside something else. See the memory of past attempts: a busy start page, a spotlight tour and an onboarding questionnaire were all removed in favour of a self-explanatory start page.

### 2.1 Less nesting
- [ ] **Reading a passage (desktop):** only navigation and text. Remove the passage list from the sidebar and the right-hand panel. "Why this passage matters" becomes a collapsible box above the text (so phones get it too). Pronunciation opens under the tapped word, as on phones. Keep "Next passage".
- [ ] **Lesen overview:** one short list. Overview becomes entry "0 · Das Buch in 20 Minuten"; each passage shows number, title, page and one sentence of focus. Search and "Read the whole book" as plain rows at the end.
- [ ] **Üben:** four equal tiles (Quiz, Flashcards, Quote duel, Mock exam). "Only wrong answers" becomes a toggle inside the quiz. Daily mini quiz, study plan and glossary as three small links below.

### 2.2 Glossary
- [ ] One glossary per work, under Lesen: old and rare words (Chok, Schniepel, Dependance, Byzantinismus), Italian and French expressions with pronunciation, literary terms (Novelle, Ich-Erzähler, Vorausdeutung, Allegorie, Leitmotiv), historical background (Faschismus, Duce, Suggestion). Each entry cites where it occurs.
- [ ] Merge the pronunciation list into the glossary (one list instead of two).
- [ ] Underlined words in the text open the glossary card (meaning plus pronunciation).
- [ ] "Practise terms" as a flashcard source.
- [ ] Every citation checked by `npm run check:content`, as for all content.

---

## 3. Question feature go-live

Code, streaming UI, citation check, source panel, limits and cost logging are built and tested with a mock. What is left:

- [ ] Run the migration in `supabase/migrations/` and test `consume_quota` (per-client limit, daily budget, client limit reached, budget reached).
- [ ] First real answers: check citation accuracy on 20 test questions; tune the prompt if invalid citations appear.
- [ ] Decide `DAILY_BUDGET_USD` (proposal 5) and `ASK_PER_CLIENT_DAILY` (proposal 30).
- [ ] Verify one `ai_request` log per question in Better Stack and one row in `ai_requests`.
- [ ] Replace the mock screenshot of the question page in the README.

---

## 4. Better Stack

Done: uptime monitor on `/api/health` (3 minutes, all regions, e-mail), HTTP log source, structured logs for every API request (request id, route, status, duration, commit). Env vars are set for Vercel **Production** only (the CLI loops on Preview; not needed while we deploy from `main`).

- [ ] **Public status page**, linked from the app footer/sidebar and the README. Can be done now (about 5 minutes). **(together)**
- [ ] **Alerts** (need real AI traffic):
  - [ ] daily spend reaches 80 % of the budget
  - [ ] p95 answer time above a threshold (e.g. 20 s) for 10 minutes
  - [ ] share of invalid citations above 10 % in an hour
  - [ ] any 5xx on `/api/ask`
- [ ] **Dashboard / cost view:** requests per day, cost per day, cache hit rate, answer time. Either in Better Stack or as a small page fed by the `ai_requests` table.
- [ ] Mention status page and alerts in the README section "Observability".

---

## 5. ElevenLabs (voice)

Nothing built yet except the data (pronunciation/glossary entries with IPA) and disabled buttons. Voice activates what already exists; nothing new goes on the start page.

- [ ] **Audiobook of the 18 key passages** with word timestamps; the spoken line lights up. Generated once, stored (e.g. Vercel Blob or Supabase Storage), never regenerated per visit. Budget: key passages ≈ 30 000 characters.
- [ ] **Pronunciation audio** for glossary terms, generated once and cached.
- [ ] **Repeat after me:** record, speech-to-text, compare, simple feedback.
- [ ] **Voice question:** activate the microphone in the question box; optional spoken answer (streaming, short latency; Flash model for cost).
- [ ] Log characters and cost per TTS/STT request like AI requests (`characters` column already exists).
- [ ] Decide what happens after the Creator plan expires (keep generated audio, fall back to free tier).

---

## 6. Multiple works and subjects

Goal: Narra works for any course text, not only *Mario und der Zauberer*.

### 6.1 Architecture
- [ ] **Works registry:** title, author, language, subject, type, visibility (public/private), citation scheme. Routes per work (e.g. `/mario/…`, `/sonnys-blues/…`).
- [ ] **Start page stays simple:** with one work it looks as today; with several, a "Was lernst du?" choice first, then the same three steps.
- [ ] **Two content types:**
  - *Literature* (Mario, Sonny's Blues): text with page/line, key passages, quotes, glossary.
  - *Subject chapter* (T&U, economics): learning objectives, a summary per objective (explanation, definitions, examples, "Kurz gesagt"), quiz and flashcards, citations to source pages.
- [ ] **Private works:** copyrighted texts never go into the public repo or public pages. Text and generated content live in Supabase; access via a class link with a code; only the server reads them.

### 6.2 Works
- [ ] **Sonny's Blues** (James Baldwin, protected until 2057 → private): transcribe 21 pages locally with page, line and footnotes; verify like Mario; generate passages, quiz, glossary (English content).
- [ ] **T&U chapter 1 and 2:** summary by learning objectives in the style of the example PDF, with citations to the source (needs source material). Diagrams (feedback loop, tolerance curve, pyramids) later.
- [ ] **Economics:** needs an example document to shape the format.

### 6.3 Later
- [ ] Self-service "Create summary": upload PDF plus learning objectives, generated study pack with a cost cap. Only after the curated flow works.

---

## 7. Engagement

- [ ] Class leaderboard for the quote duel and daily quiz (nickname + points in Supabase, no accounts).

---

## 8. Class test and feedback

- [ ] Share the link with the class (already usable: overview, passages, quiz, flashcards, mock exam). **(Gabriel)**
- [ ] Collect feedback (what was unclear, what was used) and fix the top issues.

---

## 9. Portfolio and applications

- [ ] **Better Stack:** apply for Full-stack Engineer (if not done yet); message Paweł Wal after the status page is live, with repo link. Keep the message factual (no invented anecdotes). **(Gabriel)**
- [ ] **ElevenLabs:** application for Full-Stack Engineer (Front-End Leaning) once voice features run. **(Gabriel)**
- [ ] README: final screenshots (real answers, audiobook), status page link, metrics (cost per question, cache hit rate, Lighthouse).
- [ ] **Demo video** (2 minutes): start page → overview → passage with audiobook → question with citations → Better Stack dashboard. **(together)**
- [ ] Make sure the repo stays free of copyrighted texts (only Mario is public domain).

---

## 10. Technical notes and small debts

- [ ] CI installs with `npm install` instead of `npm ci` because the Windows-written lockfile misses Tailwind's optional wasm deps for Linux (npm/cli#4828). Revisit when npm fixes it or regenerate the lockfile on Linux.
- [ ] Vercel env vars for Preview are missing (CLI prompt loop). Add in the dashboard if preview deployments are ever needed.
- [ ] Next.js writes `AGENTS.md`/`CLAUDE.md` into the repo; keep committed.
- [ ] Old spotlight-tour and onboarding code is removed; `src/lib/profile.ts` now only stores the plan length and the last reading position.

---

## Done so far (for reference)

- Verified book text: pages 9–107, 2 558 lines; every tenth page proofread character by character, 0 errors.
- Content: overview, 18 key passages, 60 quiz questions, 60 flashcards, 40 quotes, 104 pronunciation entries; 413 citations verified automatically.
- App: simple start page, reader with highlighted citations, full-text search, quiz, flashcards with Anki export, daily mini quiz with streak, mock exam, quote duel, study plan (1/2/3 weeks), question feature (mock-tested), light/dark mode with one type system.
- Operations: structured logging, health check with database status, uptime monitor, security headers, sitemap, share image.
- Quality: 29 unit tests, CI on every push, Lighthouse 95–100 on the main pages.
