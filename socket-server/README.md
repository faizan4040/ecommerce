# Chat socket server

The real-time part of the store chat (Socket.IO). It runs **separately** from the Next.js
website so it can be deployed on its own, for example on Render.

## Local development

From the project root:

```bash
npm run dev          # starts Next.js (port 3000) AND this socket server (port 4000)
# or separately
npm run dev:next
npm run dev:socket
```

Locally it reads `MONGODB_URI` and `SECRET_KEY` from the Next app's `.env.local`, so nothing
extra is needed.

## Deploy on Render

1. **New → Web Service**, connect this repository.
2. **Root Directory:** `socket-server`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment variables:**
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | same database as the website |
   | `SECRET_KEY` | **exactly** the same as the website's `SECRET_KEY` |
   | `CLIENT_ORIGINS` | your website URL(s), e.g. `https://kmfshoes.com,https://www.kmfshoes.com` |
6. **Health check path:** `/health`

Then, in the **website** environment (Vercel / wherever Next.js runs) set:

```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-service.onrender.com
```

and redeploy the website.

> Render's free plan sleeps after inactivity – the first chat connection after a sleep can take
> ~30 seconds. A paid instance keeps it always on.

## How it works

- The website calls `/api/chat/token` (logged-in users/admins only) and connects with that
  short-lived signed token. The server verifies it with `SECRET_KEY`.
- The sender of every message is taken from the token, never from the browser payload.
- Events: `message:send`, `message:edit`, `message:delete`, `typing`, `room:read`,
  `room:delete` (admin) → server emits `message:new`, `message:updated`, `message:deleted`,
  `room:update`, `room:read`, `room:deleted`, `typing`, `presence`, `support:status`.
