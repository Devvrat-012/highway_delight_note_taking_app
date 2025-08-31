# Highway Delight - Note Taking Application

A full-stack note-taking application built with React TypeScript frontend and Node.js TypeScript backend.

## Features

- User authentication with email/OTP and Google OAuth
- JWT-based authorization
- Create and delete notes
- Dark/Light mode toggle
- Mobile-friendly responsive design
- Real-time validation and error handling

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS, Redux Toolkit
- **Backend**: Node.js with TypeScript, Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, Google OAuth, OTP verification

## Project Structure

```
highway-delight/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── shared/                 # Shared types and utilities
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies for all projects:
   ```bash
   npm run install:all
   ```

3. Set up environment variables

4. Set up the database:
   ```bash
   cd server
   npx prisma migrate dev
   ```

## Development

Run both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
# Highway Delight

Quick checklist
- Node 18+ and npm installed
- PostgreSQL running and reachable

Install

1. Clone the repo:

```powershell
git clone <repo-url> highway-delight
cd highway-delight
```

2. Install dependencies for root, client and server:

```powershell
npm run install:all
```

Environment files
- Server: `server/.env` — required keys:
   - DATABASE_URL (Postgres connection)
   - JWT_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - EMAIL_SERVICE_API_KEY (if using email)

- Client: `client/.env` — required keys:
   - VITE_API_URL (e.g. http://localhost:5001)
   - VITE_GOOGLE_CLIENT_ID

Example (server/.env):

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/highway_delight
JWT_SECRET=super-secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_SERVICE_API_KEY=your_email_key
```

Example (client/.env):

```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Database migrations

```powershell
cd server
npm run db:migrate
```

Client Generation
```powershell
npm run db:generate
```

Development (run both apps)

From the repository root:

```powershell
npm run dev
```

This runs both the frontend and backend concurrently (defaults used in this project):
- Frontend (Vite) typically on http://localhost:5173
- Backend typically on http://localhost:5001

Build for production

```powershell
npm run build
```

Start production server

```powershell
npm start
```

Notes & tips
- Client env vars must be prefixed with `VITE_` for Vite to expose them to the browser.
- The server issues httpOnly cookies for auth; ensure `VITE_API_URL` origin matches the server when testing cookies.
- If the client can't authenticate on reload, confirm `VITE_API_URL` and CORS origins match and that cookies are allowed.

More
- For other tasks see `package.json` scripts in the repo root and inside `client/` and `server/`.

License: MIT
