# Construction Task Manager

A small full-stack application for securely tracking construction tasks, deadlines, and costs. The frontend is plain HTML, CSS, and JavaScript; the API uses Express and MongoDB.

## Features

- Account registration and JWT login
- Per-user task isolation
- Task creation, editing, deletion, deadlines, and cost totals
- Input validation in both the browser and API
- Safe DOM rendering for user-created task names
- Configurable API and CORS origins

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and replace `JWT_SECRET`.
2. Start MongoDB locally or set `MONGO_URI` to your database.
3. In `backend`, run `npm install` and `npm start`.
4. Serve `frontend` with a local static-file server on an origin listed in `CLIENT_ORIGINS`.

The frontend defaults to `http://localhost:5000`. A deployed page can set `window.CONSTRUCTION_API_URL` before loading `script.js`.

## Security notes

- Passwords must be 8–128 characters and are hashed with bcrypt.
- The API refuses to start without database and JWT secrets.
- Task content is inserted with `textContent`, preventing stored HTML/script execution.
- Authentication tokens are kept in session storage and expire after one hour.
