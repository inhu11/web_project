# Simple Web - Django + Next.js Full Stack

A full-stack web application with Django backend and Next.js frontend, featuring a real-time clock and interactive math quiz.

## Project Structure

```
simple_web/
├── backend/           # Django API (Python)
│   ├── api/          # API endpoints
│   ├── server/       # Django settings
│   └── requirements.txt
├── frontend/         # Next.js app (TypeScript + React)
│   └── app/
│       ├── page.tsx      # Home (Clock)
│       └── quiz/         # Math Quiz
├── .venv/            # Python virtual environment
└── package.json      # Root orchestrator
```

## Quick Start

### First Time Setup

```bash
npm run setup
cd backend && ../.venv/bin/python manage.py migrate
```

### Run Development Servers

```bash
npm run dev
```

This starts both servers:
- **Backend**: http://127.0.0.1:8000
- **Frontend**: http://localhost:3000

### Pages

- **Home Clock**: http://localhost:3000
- **Math Quiz**: http://localhost:3000/quiz

### API Endpoints

- `GET /api/time/` - Current server time
- `GET /api/math-quiz/` - Generate random math problem
- `GET /api/check-answer/` - Validate answer

## Admin Panel

Access Django admin at http://127.0.0.1:8000/admin/

**Credentials:**
- Username: `admin`
- Password: `admin`

## Tech Stack

**Backend:**
- Django 4.2
- Django CORS Headers
- SQLite

**Frontend:**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## Architecture

```
┌─────────────────────────────────────┐
│  Frontend (Next.js)                 │
│  http://localhost:3000              │
│  - UI/UX                            │
│  - User interactions                │
└─────────────────────────────────────┘
           ↓ HTTP Fetch
           ↓
┌─────────────────────────────────────┐
│  Backend (Django)                   │
│  http://127.0.0.1:8000              │
│  - Business logic                   │
│  - Data validation                  │
│  - API responses                    │
└─────────────────────────────────────┘
```

## Development

### Backend Only
```bash
cd backend
../.venv/bin/python manage.py runserver
```

### Frontend Only
```bash
cd frontend
npm run dev
```

### Create New Page
1. Add backend view in `backend/api/views.py`
2. Add URL route in `backend/api/urls.py`
3. Create page in `frontend/app/[name]/page.tsx`

## Notes

Perfect for teaching kids how frontend and backend work together!


