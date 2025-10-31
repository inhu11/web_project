# ⚽ 페널티킥 게임 - Django + Next.js

재미있는 페널티킥 슈팅 게임! Django 백엔드와 Next.js 프론트엔드를 사용한 풀스택 웹 애플리케이션입니다.

## 🎮 게임 설명

골키퍼를 상대로 페널티킥을 차는 게임입니다. 왼쪽, 중앙, 오른쪽 중 방향을 선택하고 골키퍼와 다른 방향을 선택하면 골을 넣을 수 있습니다!

## 📁 프로젝트 구조

```
web_project/
├── backend/              # Django API (Python)
│   ├── api/             # API 엔드포인트
│   │   ├── views.py     # penalty_kick 로직
│   │   └── urls.py      # API 라우팅
│   ├── server/          # Django 설정
│   └── requirements.txt # Python 의존성
│
├── frontend/            # Next.js 앱 (TypeScript + React)
│   ├── app/
│   │   ├── page.tsx         # 홈 (리다이렉트)
│   │   └── penalty/         # 페널티킥 게임
│   │       └── page.tsx
│   ├── public/
│   │   ├── audios/soccer/   # 게임 사운드
│   │   └── images/soccer/   # 게임 이미지
│   └── package.json
│
├── .venv/               # Python 가상환경
└── package.json         # 루트 스크립트 실행기
```

## 🚀 빠른 시작

### 최초 설정

```bash
npm run setup
cd backend && ../.venv/bin/python manage.py migrate
```

### 개발 서버 실행

```bash
npm run dev
```

두 서버가 동시에 실행됩니다:
- **백엔드**: http://127.0.0.1:8000
- **프론트엔드**: http://localhost:3000

### 게임 플레이

브라우저에서 http://localhost:3000 으로 접속하면 자동으로 페널티킥 게임으로 이동합니다!

## 🛠️ 기술 스택

**백엔드:**
- Django 4.2
- Django CORS Headers
- SQLite
- Python 3.x

**프론트엔드:**
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript

## 🎯 주요 기능

- 🎮 인터랙티브한 페널티킥 게임플레이
- 🎨 아름다운 UI/UX 디자인
- 🔊 실감나는 사운드 이펙트
- ⚽ 공 애니메이션 및 골키퍼 다이빙 동작
- 📊 점수 추적 시스템
- 🎯 5번의 슈팅 기회

## 📡 API 엔드포인트

- `GET /api/penalty-kick/?choice={left|center|right}` - 페널티킥 실행 및 결과 반환

## 🏗️ 아키텍처

```
┌─────────────────────────────────────┐
│  Frontend (Next.js)                 │
│  http://localhost:3000              │
│  - 게임 UI/UX                       │
│  - 사용자 인터랙션                  │
│  - 애니메이션 & 사운드              │
└─────────────────────────────────────┘
           ↓ HTTP Fetch
           ↓
┌─────────────────────────────────────┐
│  Backend (Django)                   │
│  http://127.0.0.1:8000              │
│  - 게임 로직                        │
│  - 랜덤 골키퍼 선택                 │
│  - 승패 판정                        │
└─────────────────────────────────────┘
```

## 💻 개발

### 백엔드만 실행
```bash
cd backend
../.venv/bin/python manage.py runserver
```

### 프론트엔드만 실행
```bash
cd frontend
npm run dev
```

## 📝 라이선스

MIT

---

즐거운 게임 되세요! ⚽🎉
