Setup

Backend

1) cd /Users/nespresso/Desktop/projects/simple_web/backend
2) ../.venv/bin/python manage.py migrate
3) ../.venv/bin/python manage.py runserver

Frontend

1) cd /Users/nespresso/Desktop/projects/simple_web/web
2) npm run dev

Notes

- API: http://127.0.0.1:8000/api/time/
- Frontend: http://127.0.0.1:5173
- Proxy: requests to /api/* from the frontend are proxied to the backend


