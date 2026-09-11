# EduPlus12

EduPlus12 is a learning platform for Bacalaureat preparation.

## Project structure

```text
public/              Browser pages and static assets
	index.html         Homepage
	pages/             Program, lessons, compiler, signup, and account pages
	assets/css/        Shared styles
	assets/js/         Browser behavior
server/              Express server and API routes
data/                Local SQLite database (ignored by Git)
docs/                Deployment notes
```

## Run locally

Requirements: Node.js 22.5 or newer.

```powershell
npm.cmd install
npm.cmd start
```

Open <http://localhost:3000> in the browser.

Accounts are stored in `data/eduplus12.sqlite`. Passwords are hashed with bcrypt and login state is kept in a server session.

## Welcome email

Registration sends an optional automatic welcome email. Configure SMTP through environment variables; never commit these values:

```powershell
$env:SMTP_HOST = "smtp.example.com"
$env:SMTP_PORT = "587"
$env:SMTP_USER = "your-smtp-user"
$env:SMTP_PASSWORD = "your-smtp-password"
$env:SMTP_SECURE = "false"
$env:MAIL_FROM = "EduPlus12 <no-reply@your-domain.example>"
npm.cmd start
```

For Gmail, use an app password rather than your normal account password. If SMTP is not configured, registration still works and the server logs that the email was skipped.

## Cookies

The login cookie is created by `express-session`. It is `httpOnly`, uses `sameSite: 'lax'`, expires after seven days, and becomes `secure` in production. Before deployment, set a long random `SESSION_SECRET`, use HTTPS, and keep the persistent session store. Do not store passwords or authentication tokens in browser-readable cookies.

## Earning revenue

Keep the core learning access free and monetize optional value: paid tutoring or mentor bookings, a school or NGO subscription, premium exam packs, or carefully selected sponsorships. Add payments only after publishing pricing, refund terms, privacy information, and terms of service. For payments, use a provider such as Stripe or a local processor and verify payment webhooks on the server; never trust a success flag sent by the browser. Avoid selling personal learner data and avoid intrusive advertising around students.

The compiler uses Judge0 CE for C and C++ execution, so an internet connection is required for the compiler page.

## Public hosting

Read [docs/deployment.md](docs/deployment.md) before deploying. The local SQLite database is suitable for development, but a public deployment needs a hosted database so accounts survive restarts and redeploys.
