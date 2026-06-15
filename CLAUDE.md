# One Day Dashboard — Claude Instructions

## On Session Start
When starting a new session in this project, automatically run /briefing to give Moustafa his daily update before anything else.

## Project Overview
This is the One Day Dashboard — a unified life dashboard that aggregates Gmail, Google Calendar, and Google Drive across different life areas (spaces).

## MCP Tools Available
- **claude.ai Gmail** — read emails from moustafa97elzanaty@gmail.com
- **claude.ai Google Calendar** — read calendar events
- **claude.ai Google Drive** — read documents and files

## Spaces
- **Personal** — Gmail: moustafa97elzanaty@gmail.com

## Skills
- `/briefing` — generates a daily briefing from emails and calendar events

## Code Structure
- `backend/src/index.js` — Express server with Google OAuth
- `backend/src/auth.js` — Google OAuth helpers
- `frontend/src/pages/Dashboard.jsx` — main dashboard page
- `frontend/src/pages/Login.jsx` — login page
