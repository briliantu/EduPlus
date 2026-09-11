const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const publicDirectory = path.join(__dirname, '..', 'public');
const dataDirectory = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDirectory, { recursive: true });
app.disable('x-powered-by');

const database = new DatabaseSync(path.join(dataDirectory, 'eduplus12.sqlite'));
database.exec('PRAGMA journal_mode = WAL');
database.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('elev', 'voluntar')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});
app.use(session({
    secret: process.env.SESSION_SECRET || 'eduplus12-local-development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(express.static(publicDirectory, {
    etag: true,
    maxAge: isProduction ? '1d' : 0
}));

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
    };
}

function getUserById(id) {
    return database.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
}

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/me', (req, res) => {
    if (!req.session.userId) {
        return res.json({ user: null });
    }

    const user = getUserById(req.session.userId);
    if (!user) {
        req.session.destroy(() => {});
        return res.json({ user: null });
    }

    return res.json({ user: publicUser(user) });
});

app.post('/api/register', async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role === 'voluntar' ? 'voluntar' : 'elev';

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
        return res.status(400).json({ message: 'Completează corect toate câmpurile. Parola trebuie să aibă cel puțin 8 caractere.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);
        const result = database.prepare(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
        ).run(name, email, passwordHash, role);
        const user = getUserById(result.lastInsertRowid);
        req.session.userId = user.id;
        return res.status(201).json({ user: publicUser(user) });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Există deja un cont cu această adresă de email.' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Nu am putut crea contul. Încearcă din nou.' });
    }
});

app.post('/api/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Emailul sau parola nu sunt corecte.' });
    }

    req.session.userId = user.id;
    return res.json({ user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ message: 'Deconectarea a eșuat.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`EduPlus12 is running at http://localhost:${port}`);
});
