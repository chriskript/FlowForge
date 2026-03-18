# FlowForge

FlowForge is a production-style GitHub Analytics Dashboard that visualizes repository activity, velocity, throughput, contributor patterns, and health signals.

The app uses a React frontend and a Node.js + Express backend. The backend is the single source of truth and pulls data from the GitHub GraphQL API.

## Tech Stack

- Frontend: React, Vite, TypeScript
- UI: Tailwind CSS + CSS Modules
- Charts: Recharts
- Backend: Express, TypeScript
- Data Source: GitHub GraphQL API

## What You Can Track

- Commit activity trends
- Pull request and issue throughput
- Repo velocity and merge performance
- Contributor leaderboard and heatmap
- Repo health score (0 to 100)
- Insights and risk notifications

## Project Structure

- frontend: React dashboard app
- backend: Express API service for GitHub GraphQL
- .github: project instructions and workflow docs

## Prerequisites

- Node.js 20+
- npm 10+
- A GitHub personal access token with access to target repositories

## Environment Variables

### Backend

Create backend/.env with:

    GITHUB_TOKEN=your_github_token
    GITHUB_OWNER=default_owner_optional
    GITHUB_REPO=default_repo_optional
    PORT=4000

### Frontend

Use frontend/.env.example as reference. Create frontend/.env with:

    VITE_GITHUB_OWNER=default_owner_optional
    VITE_GITHUB_REPO=default_repo_optional

The UI also supports runtime repository switching through the settings panel, so users can change owner/repo without editing code.

## Install

From the repository root:

    npm install

Frontend and backend dependencies can also be installed separately:

    cd frontend && npm install
    cd ../backend && npm install

## Run In Development

From the repository root:

    npm run dev

This starts:

- Frontend on Vite dev server
- Backend on Express dev server

Optional split commands from root:

    npm run dev:frontend
    npm run dev:backend

## Build

From the repository root:

    npm run build

## Backend API

Health check:

    GET /health

GitHub overview endpoint:

    GET /api/github/overview

Optional query params:

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

## UX Features

- Glassmorphism cards and modern dashboard layout
- Loading skeletons
- Empty states for all major sections
- Error handling and retry actions
- Responsive behavior across desktop and mobile
- Animated card entrance and chart transitions
- Color-coded toast insights for trend changes

## Dashboard Modules

- Activity Overview
- Repo Velocity
- Issue Throughput
- Contributors
- Insights
- Repo Health

## Notes

- Ensure GITHUB_TOKEN is valid and can access the selected repository.
- If API requests fail, use the in-app retry action and verify env variables.
- If no repository is selected, use the settings panel at the top of the dashboard.

## Next Improvements

- Add authentication and per-user saved repositories
- Add historical storage for trend comparison over longer windows
- Add tests for score and insights calculations
- Add CI pipeline and deployment docs
