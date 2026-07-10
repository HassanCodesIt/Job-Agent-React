# Job-Agent-React

React/Next.js replication of [`HassanCodesIt/JOB-Agent`](https://github.com/HassanCodesIt/JOB-Agent), optimized for Vercel deployment.

## What is replicated

- Guided setup flow (`/setup`) with profile save and resume parse endpoint
- Application intake workflows (`/apply`) for text/job/poster paths via API routes
- Draft lifecycle (`/drafts`) including regenerate/delete/send/toggle actions
- Reply workflows (`/replies` and `/replies/[appId]`)
- Outreach campaign controls (`/outreach`) with start/pause/resume/retry endpoints
- Stats and inbox sync endpoints

## Tech stack

- Next.js App Router (React + TypeScript)
- API Route Handlers for server-side workflows
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Screenshots

### Dashboard

![Dashboard](https://github.com/user-attachments/assets/78acff2b-072c-4823-949f-db2922371605)

### Setup

![Setup](https://github.com/user-attachments/assets/6dca4a40-92f1-4687-b616-56383c4a6d07)

## Vercel optimization

- Native Next.js App Router project structure for Vercel
- `vercel.json` function duration configuration for API routes
- `.env.example` includes required environment variables from JOB-Agent

## API surface (React version)

All endpoints are exposed under `/api/*` in this repo and mirror the original feature groups:

- Setup/User: `/api/setup/parse-resume`, `/api/setup/save`, `/api/user`
- Applications: `/api/applications`, `/api/applications/job`, `/api/applications/poster`, `/api/applications/poster/paste`, `/api/applications/[appId]`, `/api/applications/[appId]/draft`, `/api/applications/[appId]/submit`, `/api/applications/[appId]/draft/toggle-star`, `/api/applications/[appId]/draft/toggle-favorite`
- Drafts/Email: `/api/drafts/regenerate/[draftId]`, `/api/drafts/[draftId]`, `/api/emails/send/[draftId]`, `/api/emails/send/direct`
- Replies/Sync/Stats: `/api/replies/generate`, `/api/sync`, `/api/stats`
- Campaigns: `/api/campaigns/start`, `/api/campaigns/[campaignId]`, `/api/campaigns/[campaignId]/items`, `/api/campaigns/[campaignId]/pause`, `/api/campaigns/[campaignId]/resume`, `/api/campaigns/[campaignId]/retry`, `/api/campaigns/[campaignId]/retry_failed`

> Note: The current implementation uses an in-memory store for local/dev parity and can be replaced with persistent DB integrations for production workflows.
