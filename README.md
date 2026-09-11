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

The compiler uses Judge0 CE for C and C++ execution, so an internet connection is required for the compiler page.

## Public hosting

Read [docs/deployment.md](docs/deployment.md) before deploying. The local SQLite database is suitable for development, but a public deployment needs a hosted database so accounts survive restarts and redeploys.
