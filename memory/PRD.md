# HireFlow — Product Requirements & Build Log

## Original Problem Statement
Build **HireFlow**, an AI-powered hiring platform for HR teams. Takes a team from zero to hired: create jobs with hiring quotas, upload resumes, let AI rank & analyze candidates, move them through a visual Kanban pipeline, generate screening questions, draft emails, and track progress from a single dashboard. AI is embedded at 7 points. Includes a full admin panel (deferred).

## User Choices (locked)
- **Stack:** React (CRA/craco) + FastAPI + MongoDB (instead of the spec's Node/SQLite/Vite)
- **AI:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via Emergent Universal LLM key
- **Scope phase 1:** Core hiring flow first; Admin panel + Reports deferred
- **Seed:** demo admin + HR accounts + sample jobs/candidates

## Design System (from user spec)
- Fonts: DM Sans (UI) + DM Mono (resume/JD text)
- Palette: navy #0f1629 sidebar, indigo #4f6ef7 primary, amber AI accents, teal/coral/purple/green for stages
- Layout: fixed 240px navy sidebar, gray-50 content, sticky white topbar, max-width 980px content body
- AI styling convention: amber buttons/badges (#fffbeb bg, #fde68a border, #92400e text)

## Architecture
- **Backend** (`/app/backend`): modular FastAPI — `server.py` (wiring + startup seed + /uploads static), `database.py` (motor, collections, indexes), `auth.py` (bcrypt + JWT 7d), `ai_service.py` (Claude via emergentintegrations + 7 prompt builders + JSON parser + usage logging), `models.py`, `routes_auth.py`, `routes_jobs.py`, `routes_candidates.py` (pypdf parse), `routes_ai.py`, `routes_dashboard.py`, `seed.py`.
- **Frontend** (`/app/frontend/src`): `App.js` (router + Private/Public/Admin routes + sonner Toaster), `api.js` (axios + interceptors), `context/AuthContext.jsx`, `components/Layout.jsx` (Sidebar/Topbar), `components/ui.jsx`, `constants.js`, pages: Login, Signup, Dashboard, Jobs, JobCreate, JobDetail, CandidateBoard (Kanban), CandidateDetail, ComingSoon.
- **DB collections:** users, jobs, candidates, stage_transitions, ai_usage_log, login_activity (uuid string `id` fields, no ObjectId exposure).

## Implemented (2026-05-30)
- ✅ Auth: signup/login/me, JWT+bcrypt, role (hr/admin), login_activity logging, auth guards
- ✅ Jobs: CRUD, hiring quota, pause/close, activity feed, per-job stats
- ✅ Candidates: multi-PDF upload (pypdf text extraction, name/email/phone regex), list/detail/delete, stage move + transitions, bulk stage move, notes
- ✅ 7 AI features (Claude Sonnet 4.5): rank (batch 10, structured score/summary/skills/red flags), enhance-JD (side-by-side modal), screening questions, draft email (invite/rejection), deep summary, compare candidates, pipeline-health
- ✅ Dashboard: 5 stat cards, AI pipeline health widget, jobs overview table, action items, upcoming interviews
- ✅ Kanban board: 10 stages, native HTML5 drag-drop, optimistic updates + toasts, quota-met celebration, candidate side panel with inline AI actions
- ✅ Candidate detail: 60/40 split, AI actions panel, notes, activity timeline, resume preview, stage controls
- ✅ Seed demo data (2 users, 2 jobs, 6 candidates with AI scores/stages)
- ✅ Tested: backend pytest (100% after bulk-stage route fix) + frontend E2E (100%)

## Backlog / Next Tasks
- **P0 (next session):** Admin panel — Admin Dashboard (user activity table, login feed), User Management (activate/deactivate, role change), Uploaded Resumes (global), System Analytics charts, AI Usage & Cost (uses ai_usage_log).
- **P1:** Reports page — Time-to-Hire bar, Stage Funnel, Skill Gap heatmap, Hiring Quota tracker (Recharts).
- **P2:** Edit Job page; PDF viewer/serving in candidate detail; email send integration; deadline reminders; per-file upload progress bars.

## Known Notes
- AI endpoints take 3-15s (real Claude calls).
- Reports & /admin/* are intentional "coming soon" placeholders.
