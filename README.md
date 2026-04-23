# Job Application Portal

A full-stack job application platform with a Next.js frontend and an Express/MongoDB backend. The project supports candidate registration, recruiter job posting, application tracking, and role-based access control.

## Project Structure

```text
job-portal/
|-- backend/         # Express API, database models, auth, business logic
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   `-- routes/
|-- frontend/        # Next.js application UI
|   |-- app/
|   |-- components/
|   |-- context/
|   |-- public/
|   `-- utils/
|-- .gitignore
`-- README.md
```

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Auth: JWT-based authentication

## Environment Setup

Create local environment files from the examples before running the project:

- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env.local`

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`

## Notes

- Sensitive values are intentionally excluded from version control.
- Generated directories such as `node_modules` and build output should not be committed.

