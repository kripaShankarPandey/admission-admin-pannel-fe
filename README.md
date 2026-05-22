# Admission Today Admin Panel

Internal admin dashboard for managing colleges, locations, homepage content, and editorial data for Admission Today.

## Requirements

- Node.js 20+
- npm 10+

## Environment

Create a local env file from the example:

```bash
cp .env.example .env
```

Required variable:

- `NEXT_PUBLIC_API_URL`: base URL of the Nest backend, for example `http://localhost:4000`

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
```

## Notes

- Authentication is cookie-based for the admin token.
- All admin data should flow through backend APIs; avoid static page-local fallbacks when extending the dashboard.
