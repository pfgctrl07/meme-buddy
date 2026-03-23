# Meme Buddy Deployment

This project is ready for a cloud prototype deployment with:

- Backend API on Render
- Web app on Render Static Site
- Expo mobile app pointing to the hosted API through `EXPO_PUBLIC_API_BASE_URL`

## Recommended Prototype Setup

### 1. Deploy the backend

Use the `meme-buddy-api` service from [render.yaml](/Users/priyan/Documents/New%20project/render.yaml).

Backend settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn --bind 0.0.0.0:$PORT wsgi:app`

Backend health check:

- `/health`

Backend benchmark endpoint:

- `/api/backtest`

Backend database note:

- The backend currently uses SQLite at `backend/meme_buddy.db`.
- This is fine for a hackathon prototype.
- On Render free instances, local disk is ephemeral unless you attach a persistent disk.

For a stable prototype, attach a Render disk and point the app folder to persistent storage if you want data to survive restarts.

## 2. Deploy the web app

Use the `meme-buddy-web` service from [render.yaml](/Users/priyan/Documents/New%20project/render.yaml).

Frontend settings:

- Build command: `npm install && npm run export:web`
- Publish directory: `dist`

Required environment variable:

- `EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.onrender.com`

## 3. Local production-like build

Backend:

```bash
cd backend
pip install -r requirements.txt
gunicorn --bind 0.0.0.0:5001 wsgi:app
```

Frontend:

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5001 npm run export:web
```

## 4. Docker backend option

You can also deploy the API with [Dockerfile.backend](/Users/priyan/Documents/New%20project/Dockerfile.backend).

Example:

```bash
docker build -f Dockerfile.backend -t meme-buddy-api .
docker run -p 5001:5001 -e PORT=5001 meme-buddy-api
```

## 5. Prototype-ready URLs

After deployment, these should work:

- `https://your-api-domain/health`
- `https://your-api-domain/api/dashboard`
- `https://your-api-domain/api/backtest`
- `https://your-web-domain`

## 6. What is prototype-ready vs production-ready

Prototype-ready:

- Hosted API
- Hosted web app
- Real benchmark endpoint
- Persistent event/join/user state if disk is attached

Still not production-ready:

- Real auth
- Postgres instead of SQLite
- Background jobs for refresh/backtesting
- Monitoring and rate limiting
- Persistent object storage for media/assets

## 7. Fastest deployment path

1. Push this repo to GitHub.
2. Create a new Render Blueprint using [render.yaml](/Users/priyan/Documents/New%20project/render.yaml).
3. Deploy `meme-buddy-api`.
4. Copy the API URL.
5. Set `EXPO_PUBLIC_API_BASE_URL` on `meme-buddy-web`.
6. Redeploy the web app.

That gives you a working hosted prototype fastest.
