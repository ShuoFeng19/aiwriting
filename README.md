# AI-assisted CT-oriented Writing Practice

A simplified classroom web app for the AI group in an EFL argumentative writing
intervention. Students complete one fixed five-stage writing workflow. AI is
available only during brainstorming and peer-reviewing.

The app does not expose a free-form chat box. The server instructs the model not
to write or rewrite a student's paragraph.

## Student workflow

1. AI-assisted CT-oriented brainstorming
2. Drafting
3. AI-assisted CT-oriented peer-reviewing
4. Feedback judgement
5. Revising

Only stages 1 and 3 show an input box, an AI generation button and an AI output
box. Stages 2, 4 and 5 show concise independent-work instructions only.

In Step 1, the brainstorming box is pre-filled with five required items:
target claim, grounds, supporting information, warrant, and inference or implication.
AI output is Chinese-only IELTS teacher feedback in plain text. It gives targeted
comments, concrete examples and sentence fragments, but does not write the full
paragraph for the student.

## Features

- Home page for Student ID and writing topic
- One fixed step-by-step workflow
- Server-side OpenAI Responses API route
- Fixed system instruction that prohibits paragraph generation and rewriting
- Local JSON process-data storage
- Railway Volume support for persistent online storage
- Password-protected teacher page
- CSV export for analysis

## Requirements

- Node.js 20 LTS or later
- npm
- An OpenAI API key

The official OpenAI JavaScript SDK disables browser usage by default because
exposing API credentials in client code is unsafe. This project calls OpenAI
only from `app/api/ai/route.ts`.

References:

- [OpenAI Responses API reference](https://platform.openai.com/docs/api-reference/responses/create)
- [Official OpenAI JavaScript SDK](https://github.com/openai/openai-node)
- [OpenAI API key safety guidance](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety)
- [Next.js App Router installation](https://nextjs.org/docs/app/getting-started/installation)

## Install

```bash
npm install
```

### Windows portable setup

If Node.js or npm is not installed, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
```

This downloads the official Node.js `v24.16.0` LTS Windows x64 portable runtime
from `nodejs.org` into the local `.runtime` folder and installs the dependencies.
It does not change the machine-wide Node.js installation.

## Configure `.env.local`

Copy `.env.local.example` to `.env.local` and replace the placeholder values:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.4-mini
ADMIN_PASSWORD=change_this_password
```

Never commit `.env.local`. Never put `OPENAI_API_KEY` in frontend code or a
browser-accessible environment variable.

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On Windows after the portable setup script, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-windows.ps1
```

## Student use

1. Enter the assigned anonymous Student ID.
2. Enter the teacher-provided argumentative writing topic.
3. Complete the five workflow stages in order.
4. In brainstorming, enter initial ideas or questions and generate AI support.
5. Draft the paragraph independently.
6. In peer-reviewing, paste the independently written paragraph and generate AI
   feedback.
7. Judge the feedback and revise independently.

## Teacher use

1. Open [http://localhost:3000/admin](http://localhost:3000/admin).
2. Enter the password configured as `ADMIN_PASSWORD`.
3. Click **View submissions** to inspect saved AI interactions.
4. Click **Export CSV** to download `writing-intervention-submissions.csv`.

Each saved record includes:

- Student ID
- Topic
- Workflow stage
- Student input
- AI output
- Timestamp

## Change workflow text and prompts

- Edit student-visible stage titles and instructions in `lib/workflow.ts`.
- Edit server-side AI tasks in `lib/prompts.ts`.
- Keep the fixed `SYSTEM_INSTRUCTION` unless the intervention design changes.
- Keep prompts constrained to guidance, questions, options and feedback.

## Railway deployment

For the simplest small-class online deployment, use Railway with one attached
Volume. The app automatically writes student records to
`RAILWAY_VOLUME_MOUNT_PATH` when Railway provides it.

Follow [`DEPLOY-RAILWAY-CN.md`](./DEPLOY-RAILWAY-CN.md).

## Production note

The JSON store is appropriate for a small classroom experiment running on one
server process. For multiple replicas or a larger cohort, replace `lib/storage.ts`
with a database and use stronger teacher authentication.

As of June 2, 2026, `npm audit` reports two moderate-severity advisories inherited
through the current stable Next.js dependency tree. There are no high- or
critical-severity advisories. Re-run `npm audit` before deployment and upgrade to
a patched stable Next.js release when one becomes available.
