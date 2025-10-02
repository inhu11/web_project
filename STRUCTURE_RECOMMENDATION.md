# Recommended Folder Structure

## Option 1: Monorepo with Single Frontend (Recommended for beginners)

```
simple_web/
├── backend/              # Django API
│   ├── api/             # Your app
│   ├── server/          # Django settings
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/            # Next.js (rename 'next' to 'frontend')
│   ├── app/
│   │   ├── page.tsx
│   │   └── quiz/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── .venv/              # Python virtualenv
├── .gitignore
├── package.json        # Root script runner
├── README.md
└── docker-compose.yml  # (optional for deployment)
```

## Option 2: Professional Monorepo (Better for scaling)

```
simple_web/
├── apps/
│   ├── api/            # Django backend
│   └── web/            # Next.js frontend
│
├── packages/           # Shared code (if needed)
│   └── types/          # Shared TypeScript types
│
├── .venv/
├── package.json        # Workspace orchestrator
└── README.md
```

## Option 3: Separate Repos (Best for large teams)

```
simple-web-api/         # Separate git repo
└── (Django code)

simple-web-frontend/    # Separate git repo
└── (Next.js code)
```

## Current Issues to Fix:

1. Remove `web/` folder (unused Vite app)
2. Rename `next/` to `frontend/` (clearer naming)
3. Create `backend/requirements.txt` for Python deps
4. Move Django SECRET_KEY to .env file (security)
5. Add proper README with architecture diagram

## Action Items:

```bash
# 1. Remove unused Vite app
rm -rf web/

# 2. Rename next to frontend
mv next frontend

# 3. Create requirements.txt
cd backend && ../.venv/bin/pip freeze > requirements.txt

# 4. Update package.json scripts
# Change "dev:web": "cd next && npm run dev"
# To     "dev:web": "cd frontend && npm run dev"
```

