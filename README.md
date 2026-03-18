# FlowForge

FlowForge is a production-style GitHub Analytics Dashboard for repository health, throughput, and contributor performance.

It uses a React frontend and a Node.js + Express backend. The backend is the single source of truth and fetches data from the GitHub GraphQL API.

## Tech Stack

- Frontend: React, Vite, TypeScript
- Styling: Tailwind CSS + CSS Modules
- Charts: Recharts
- Notifications: react-hot-toast
- Backend: Express, TypeScript
- Data Source: GitHub GraphQL API

## Core Capabilities

- Activity and throughput analytics
- Repo velocity and merge performance
- Contributor ranking and share analysis
- Repo health score (0 to 100)
- Color-coded insights via toast notifications
- Runtime repository switching from the frontend
- Shareable URLs with owner/repo query params

## Tab Workspaces

- Dashboard: unified executive overview
- Repos: repository-focused operational workspace with PR/issue queues
- Contributors: contributor-focused workspace with ranking and contribution share

## Project Structure

- frontend: dashboard application
- backend: API layer and GitHub integration
- .github: Copilot/project instruction files

## Prerequisites

- Node.js 20+
- npm 10+
- GitHub token with repository access

## Environment Variables

### Backend

Create backend/.env:

    GITHUB_TOKEN=your_github_token
    GITHUB_OWNER=default_owner_optional
    GITHUB_REPO=default_repo_optional
    PORT=4000

Notes:

- GITHUB_TOKEN is required.
- GITHUB_OWNER and GITHUB_REPO are optional fallbacks.

### Frontend

Create frontend/.env (see frontend/.env.example):

    VITE_GITHUB_OWNER=default_owner_optional
    VITE_GITHUB_REPO=default_repo_optional
    VITE_API_BASE_URL=

Notes:

- VITE_GITHUB_OWNER and VITE_GITHUB_REPO are optional defaults.
- Users can switch owner/repo from the UI without code changes.
- VITE_API_BASE_URL is optional for cross-origin deployments.

## Install

From repository root:

    npm install

Optional manual install by package:

    cd frontend && npm install
    cd ../backend && npm install

## Run In Development

From repository root:

    npm run dev:all

Also available:

    npm run dev
    npm run dev:frontend
    npm run dev:backend

## Build

From repository root:

    npm run build

## Test

From repository root:

    npm run test

Current status:

- Placeholder script only (no automated test suite configured yet).

## Backend API

Health check:

    GET /health

GitHub overview:

    GET /api/github/overview

Query params:

- owner
- repo
- limit

Example:

    /api/github/overview?owner=octocat&repo=hello-world&limit=20

Response shape:

    {
      "commits": [],
      "prs": [],
      "issues": []
    }

## UX Notes

- Glassmorphism card system
- Loading skeletons across modules
- Empty states and error states
- Smooth hover animations and chart fade-ins
- Staggered card entrance animations
- Responsive desktop/mobile layout
- Share button for repo-specific URL state

## Troubleshooting

- If API calls return HTML instead of JSON in dev:
  - Ensure backend is running on port 4000.
  - Ensure Vite dev server proxy is enabled in frontend/vite.config.ts.
- If data fails to load:
  - Verify GITHUB_TOKEN in backend/.env.
  - Check token scopes/repository access.
- If repo data is missing:
  - Confirm owner/repo in the settings panel or URL query params.

## Roadmap Ideas

- Add automated tests (frontend + backend)
- Add user auth and saved repository presets
- Add persistent historical snapshots for long-term trends
- Add CI workflows and deployment documentation
