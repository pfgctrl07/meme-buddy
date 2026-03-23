# Meme Buddy Full-Stack Deployment

This guide deploys:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

The stack used here is:

- [frontend](/Users/priyan/Documents/New%20project/frontend)
- [backend-node](/Users/priyan/Documents/New%20project/backend-node)

## Before you start

You need:

- a GitHub account
- a Vercel account
- a Render account
- a MongoDB Atlas account

## 1. Push the project to GitHub

From the repo root:

```bash
cd "/Users/priyan/Documents/New project"
git init
git add .
git commit -m "Prepare Meme Buddy full-stack deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/meme-buddy.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## 2. Create MongoDB Atlas database

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Add your IP or allow access from anywhere for prototype use
5. Copy the connection string

It will look like:

```bash
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/meme-buddy?retryWrites=true&w=majority
```

Use this as `MONGODB_URI` on Render.

## 3. Deploy backend to Render

### Option A: Render dashboard

1. Go to [https://render.com](https://render.com)
2. Click `New +` → `Web Service`
3. Connect your GitHub repo
4. Select the repo
5. Use these settings:

- Name: `meme-buddy-api-node`
- Root Directory: `backend-node`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables to add:

```bash
PORT=5000
MONGODB_URI=YOUR_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
CLIENT_URL=https://YOUR_VERCEL_APP.vercel.app
ALLOWED_ORIGINS=https://YOUR_VERCEL_APP.vercel.app
```

If you want preview deployments from Vercel to work too, later update `ALLOWED_ORIGINS` like this:

```bash
ALLOWED_ORIGINS=https://YOUR_VERCEL_APP.vercel.app,https://YOUR-VERCEL-PREVIEW.vercel.app,http://localhost:3000
```

Backend live URL will look like:

```bash
https://meme-buddy-api-node.onrender.com
```

Check it:

```bash
curl https://meme-buddy-api-node.onrender.com/health
```

### Option B: Render Blueprint

This repo includes:

- [render-node.yaml](/Users/priyan/Documents/New%20project/render-node.yaml)

You can create a Render Blueprint from that file if you prefer.

## 4. Deploy frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click `Add New...` → `Project`
3. Import the same GitHub repo
4. Set the project root to:

```bash
frontend
```

5. Add this environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://meme-buddy-api-node.onrender.com/api
```

6. Click Deploy

Frontend live URL will look like:

```bash
https://meme-buddy.vercel.app
```

This repo includes:

- [frontend/vercel.json](/Users/priyan/Documents/New%20project/frontend/vercel.json)

## 5. Update backend CORS after Vercel deploy

Once Vercel gives you the final frontend URL, go back to Render and make sure these are correct:

```bash
CLIENT_URL=https://YOUR_VERCEL_APP.vercel.app
ALLOWED_ORIGINS=https://YOUR_VERCEL_APP.vercel.app,http://localhost:3000
```

Then redeploy the backend.

## 6. Production URLs

Your final app should be live at:

- Frontend:
  `https://YOUR_VERCEL_APP.vercel.app`
- Backend:
  `https://meme-buddy-api-node.onrender.com`
- Backend health:
  `https://meme-buddy-api-node.onrender.com/health`

## 7. Local commands before deployment

Backend:

```bash
cd "/Users/priyan/Documents/New project/backend-node"
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd "/Users/priyan/Documents/New project/frontend"
cp .env.example .env.local
npm install
npm run dev
```

## 8. Production fixes already handled

These deployment fixes are already in the code:

- frontend API URL uses `NEXT_PUBLIC_API_BASE_URL`
- backend port uses `PORT`
- backend CORS supports `ALLOWED_ORIGINS`
- Vercel config exists
- Render config exists

## 9. Final checklist

Before sharing the prototype:

1. Atlas cluster is reachable
2. Render backend `/health` returns `ok`
3. Vercel frontend loads
4. Register/login works
5. Create event works
6. Join event works
7. Dashboard loads after login

## 10. Exact beginner-friendly deployment order

1. Push repo to GitHub
2. Create MongoDB Atlas database
3. Deploy backend on Render
4. Copy Render backend URL
5. Deploy frontend on Vercel
6. Set `NEXT_PUBLIC_API_BASE_URL` to the Render backend URL + `/api`
7. Update Render `CLIENT_URL` and `ALLOWED_ORIGINS` with the Vercel URL
8. Redeploy backend
9. Test login, dashboard, create trend, and join trend
