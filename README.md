# Workers

A dockerized fullstack app to connect workers with people willing to hire them.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Tailwind CSS (CDN), Vanilla JS |
| Backend | Django REST Framework (DRF) |
| Database | PostgreSQL 15 |
| Containerisation | Docker & Docker Compose |

## Project Structure

```
workers/
├── backend/               # Django REST Framework API
│   ├── accounts/          # Authentication app (User model, JWT)
│   ├── workers_api/       # Django project settings & URLs
│   ├── Dockerfile
│   ├── entrypoint.sh      # DB wait + migrate + collectstatic
│   └── requirements.txt
├── frontend/              # Static HTML/CSS/JS served by nginx
│   ├── index.html         # Login / Register page
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js         # Fetch wrapper for the DRF API
│   │   └── auth.js        # Login & Register UI logic
│   ├── nginx/default.conf # nginx config + API proxy
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Quick Start

### 1. Clone & configure

```bash
git clone <repo-url>
cd workers
cp .env.example .env
# Edit .env and set a strong SECRET_KEY and DB_PASSWORD
```

### 2. Build & run

```bash
docker compose up --build
```

The first run will:
- Start PostgreSQL
- Wait for the DB to be ready
- Run Django migrations
- Collect static files
- Start the Gunicorn application server
- Start the nginx frontend server

### 3. Open in your browser

| Service | URL |
|---------|-----|
| App (frontend) | http://localhost |
| API | http://localhost/api/ |
| Django Admin | http://localhost:8000/admin/ |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login/` | No | Obtain JWT access + refresh tokens |
| POST | `/api/auth/register/` | No | Create a new user account |
| POST | `/api/auth/token/refresh/` | No | Refresh an access token |
| GET/PATCH | `/api/auth/me/` | JWT | Get / update current user profile |

### Login example

```bash
curl -s -X POST http://localhost/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}' | python3 -m json.tool
```

### Create superuser (for Django Admin)

```bash
docker compose exec backend python manage.py createsuperuser
```

## Development

### Run backend tests

```bash
docker compose exec backend python manage.py test
```

### Apply new migrations

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | insecure default | Django secret key |
| `DEBUG` | `False` | Enable Django debug mode |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `DB_NAME` | `workers_db` | PostgreSQL database name |
| `DB_USER` | `workers_user` | PostgreSQL user |
| `DB_PASSWORD` | `workers_pass` | PostgreSQL password |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Allow all CORS origins (disable in prod) |
