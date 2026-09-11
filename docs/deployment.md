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
- Set `REQUIRE_EMAIL_VERIFICATION=true` and configure `APP_BASE_URL` plus SMTP variables so verification and password reset links work.
- Login, registration, password recovery, and compiler requests have per-process rate limits. After moving to multiple instances, replace the in-memory limiter with Redis or provider-level rate limiting.
- Run `npm test` in CI before deployment.
- Keep `data/` and secrets out of Git.

The current UI already uses a dark visual theme and responsive layouts. The lesson page includes progress, feedback, and a five-minute exam simulation. Add verified Bacalaureat questions only from licensed or official sources; keep subject/year metadata in a separate content import rather than copying unverified material into production.
