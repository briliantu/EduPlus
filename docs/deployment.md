# Free hosting options

## Recommended: Render + Neon

This is the best fit once public accounts matter:

1. Push the repository to GitHub.
2. Create a free web service on Render.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Create a free Neon Postgres database.
5. Migrate the `users` table from SQLite to Postgres and replace the local session store with `connect-pg-simple`.
6. Add `DATABASE_URL`, `SESSION_SECRET`, and `NODE_ENV=production` as Render environment variables.

Render free services sleep when idle. The first request after inactivity can be slow, but the service is suitable for a volunteer project. Neon keeps the account database outside the web server, so redeploys do not erase users.

## Fast demo: Render with SQLite

You can deploy the current project without changing the database, but it is only a demo. Free web-service disks are not guaranteed to persist, so users may disappear after a restart or redeploy. Do not use this option for important registrations.

## Static-only option

GitHub Pages or Cloudflare Pages can host the `public/` folder for free, but they cannot run `server/server.js` or securely store accounts. They are suitable only after authentication is moved to a service such as Supabase Auth.

## Production checklist

- Set a long random `SESSION_SECRET`.
- Use HTTPS and secure cookies.
- Move SQLite to hosted Postgres.
- Use a persistent session store instead of Express's default in-memory store.
- Add email verification and password reset before collecting real personal data.
- Add rate limiting to login and registration endpoints.
- Keep `data/` and secrets out of Git.
