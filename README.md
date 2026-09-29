# Narra

A study companion for Thomas Mann's novella *Mario und der Zauberer*. Students get a summary, the key passages, answers grounded in the text with page and line citations, an audiobook with live line highlighting, and quizzes. No account, one link for the whole class.

Built in three weeks as a learning and portfolio project. The full plan (German) is in [PROJEKT.md](PROJEKT.md).

## Stack

- Next.js (App Router, TypeScript) and Tailwind CSS on Vercel
- Claude API with prompt caching: the whole book sits in context, no RAG
- ElevenLabs for text-to-speech with timestamps and speech-to-text
- Better Stack for structured logs, uptime monitoring and a public status page
- Supabase (Postgres) for the request and cost log, rate limits and a daily cost cap. No Redis: a class of students does not need it

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional for now
npm run dev
```

Health check: `GET /api/health`. Every API route logs one structured JSON entry per request to stdout and, when configured, to Better Stack.

## Design

Light mode follows the "Adria" direction, dark mode the "Bühne" direction. Both share one type system: Bricolage Grotesque for headings, Literata for the book text, Figtree for the interface.

*More on architecture decisions, cost control and OCR quality will follow as the project progresses.*
