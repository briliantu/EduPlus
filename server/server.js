const path = require('path');
const fs = require('fs');
const crypto = require('node:crypto');
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('./mailer');

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const publicDirectory = path.join(__dirname, '..', 'public');
const dataDirectory = path.join(__dirname, '..', 'data');
const sessionDirectory = path.join(dataDirectory, 'sessions');
fs.mkdirSync(dataDirectory, { recursive: true });
fs.mkdirSync(sessionDirectory, { recursive: true });
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
try {
    database.exec('ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 0');
} catch (error) {
    if (!error.message.includes('duplicate column name')) {
        throw error;
    }
}
for (const column of [
    'email_verified INTEGER NOT NULL DEFAULT 0',
    'email_verification_token TEXT',
    'password_reset_token TEXT',
    'password_reset_expires_at TEXT'
]) {
    try {
        database.exec(`ALTER TABLE users ADD COLUMN ${column}`);
    } catch (error) {
        if (!error.message.includes('duplicate column name')) {
            throw error;
        }
    }
}
database.exec('UPDATE users SET email_verified = 1 WHERE email_verification_token IS NULL');
database.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        exercises TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS saved_lessons (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, lesson_id)
    );
    CREATE TABLE IF NOT EXISTS exercise_attempts (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL,
        exercise_index INTEGER NOT NULL,
        solved INTEGER NOT NULL DEFAULT 0,
        minutes_spent REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, lesson_id, exercise_index)
    );
    CREATE TABLE IF NOT EXISTS lesson_progress (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        minutes_spent REAL NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, lesson_id)
    )
`);

app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
const requestLimits = new Map();
function rateLimit({ windowMs, max, message }) {
    return (req, res, next) => {
        const key = `${req.ip}:${req.path}`;
        const now = Date.now();
        const entry = requestLimits.get(key);
        if (!entry || now - entry.startedAt >= windowMs) {
            requestLimits.set(key, { startedAt: now, count: 1 });
            return next();
        }
        entry.count += 1;
        if (entry.count > max) {
            return res.status(429).json({ message, retryAfterSeconds: Math.ceil((windowMs - (now - entry.startedAt)) / 1000) });
        }
        return next();
    };
}
setInterval(() => {
    const cutoff = Date.now() - 60 * 60 * 1000;
    for (const [key, entry] of requestLimits) {
        if (entry.startedAt < cutoff) requestLimits.delete(key);
    }
}, 15 * 60 * 1000).unref();
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});
app.use(session({
    store: new FileStore({
        path: sessionDirectory,
        ttl: 60 * 60 * 24 * 7,
        retries: 1
    }),
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
        credits: user.credits || 0,
        emailVerified: Boolean(user.email_verified),
        createdAt: user.created_at
    };
}

function getUserById(id) {
    return database.prepare('SELECT id, name, email, role, credits, created_at FROM users WHERE id = ?').get(id);
}

function startUserSession(req, userId, callback) {
    req.session.regenerate((error) => {
        if (error) {
            return callback(error);
        }
        req.session.userId = userId;
        return callback(null);
    });
}

const requiresEmailVerification = isProduction || process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
function createToken() {
    return crypto.randomBytes(32).toString('hex');
}

function verificationRequiredForUser(user) {
    return requiresEmailVerification && !user.email_verified;
}

const builtInLessons = [
    {
        id: 'builtin-quadratic', title: 'Ecuația de gradul al doilea', subject: 'Matematică',
        summary: 'Discriminantul și formula soluțiilor, explicate pas cu pas.',
        content: 'Pentru ax² + bx + c = 0, calculează Δ = b² - 4ac, apoi folosește x = (-b ± √Δ) / 2a.',
        exercises: [
            { type: 'choice', question: 'Care este discriminantul ecuației x² - 5x + 6 = 0?', options: ['1', '5', '25'], answer: '1' },
            { type: 'numeric', question: 'Care este rădăcina mai mică a ecuației x² - 5x + 6 = 0?', answer: '2' },
            { type: 'choice', question: 'Câte soluții reale are o ecuație cu Δ < 0?', options: ['0', '1', '2'], answer: '0' }
        ]
    },
    {
        id: 'builtin-derivatives', title: 'Derivata unei funcții', subject: 'Matematică',
        summary: 'Regula puterii și derivarea polinoamelor simple.',
        content: 'Regula puterii este (xⁿ)\' = n · xⁿ⁻¹. Derivează fiecare termen și adună rezultatele.',
        exercises: [
            { type: 'choice', question: 'Care este derivata lui 3x² - 4x + 1?', options: ['6x - 4', '3x - 4', '6x² - 4'], answer: '6x - 4' },
            { type: 'truefalse', question: 'Derivata unei constante este 1.', options: ['Adevărat', 'Fals'], answer: 'Fals' },
            { type: 'numeric', question: 'Pentru f(x) = x³, care este coeficientul lui x² în f\'(x)?', answer: '3' }
        ]
    },
    {
        id: 'builtin-graphs', title: 'Parcurgerea grafurilor', subject: 'Informatică',
        summary: 'Diferența dintre BFS și DFS și când le folosim.',
        content: 'BFS explorează pe niveluri folosind o coadă, iar DFS merge cât mai adânc folosind recursie sau o stivă.',
        exercises: [
            { type: 'choice', question: 'Ce structură de date folosește în mod obișnuit BFS?', options: ['Coadă', 'Stivă', 'Heap'], answer: 'Coadă' },
            { type: 'choice', question: 'Ce parcurgere este potrivită pentru distanțe minime într-un graf neponderat?', options: ['BFS', 'DFS', 'Sortare'], answer: 'BFS' },
            { type: 'truefalse', question: 'DFS poate fi implementat cu o stivă.', options: ['Adevărat', 'Fals'], answer: 'Adevărat' }
        ]
    },
    {
        id: 'builtin-sorting', title: 'Căutare și sortare', subject: 'Informatică',
        summary: 'Cum alegi o sortare și cum cauți eficient într-un vector.',
        content: 'Căutarea binară are nevoie de un vector sortat și reduce intervalul de căutare la fiecare pas.',
        exercises: [
            { type: 'choice', question: 'Care este complexitatea căutării binare?', options: ['O(log n)', 'O(n)', 'O(n²)'], answer: 'O(log n)' },
            { type: 'numeric', question: 'În câți pași aproximativi înjumătățește căutarea binară un vector de 16 elemente?', answer: '4' },
            { type: 'truefalse', question: 'Căutarea binară funcționează corect pe date nesortate.', options: ['Adevărat', 'Fals'], answer: 'Fals' }
        ]
    }
];

function requireUser(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Trebuie să fii autentificat.' });
    }
    const user = getUserById(req.session.userId);
    if (!user) {
        return res.status(401).json({ message: 'Sesiunea nu mai este validă.' });
    }
    req.user = user;
    return next();
}

function requireVolunteer(req, res, next) {
    if (req.user.role !== 'voluntar') {
        return res.status(403).json({ message: 'Doar voluntarii pot adăuga lecții.' });
    }
    return next();
}

function getLesson(lessonId) {
    const builtIn = builtInLessons.find((lesson) => lesson.id === lessonId);
    if (builtIn) {
        return builtIn;
    }
    if (!/^\d+$/.test(lessonId)) {
        return null;
    }
    const lesson = database.prepare('SELECT id, title, subject, summary, content, exercises, created_by FROM lessons WHERE id = ?').get(Number(lessonId));
    if (!lesson) {
        return null;
    }
    return { ...lesson, id: String(lesson.id), exercises: JSON.parse(lesson.exercises) };
}

function lessonForResponse(lesson, userId) {
    const saved = Boolean(database.prepare('SELECT 1 FROM saved_lessons WHERE user_id = ? AND lesson_id = ?').get(userId, lesson.id));
    const author = lesson.created_by ? database.prepare('SELECT name FROM users WHERE id = ?').get(lesson.created_by) : null;
    return {
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        summary: lesson.summary,
        content: lesson.content,
        exercises: lesson.exercises.map(({ answer, ...exercise }) => exercise),
        author: author ? author.name : 'EduPlus12',
        saved
    };
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

app.get('/api/lessons', (req, res) => {
    const userId = req.session.userId || 0;
    const customLessons = database.prepare('SELECT id, title, subject, summary, content, exercises, created_by FROM lessons ORDER BY created_at DESC').all()
        .map((lesson) => ({ ...lesson, id: String(lesson.id), exercises: JSON.parse(lesson.exercises) }));
    return res.json({ lessons: [...builtInLessons, ...customLessons].map((lesson) => lessonForResponse(lesson, userId)) });
});

app.post('/api/lessons', requireUser, requireVolunteer, (req, res) => {
    const title = String(req.body.title || '').trim();
    const subject = String(req.body.subject || '').trim();
    const summary = String(req.body.summary || '').trim();
    const content = String(req.body.content || '').trim();
    const exercises = Array.isArray(req.body.exercises) ? req.body.exercises : [];
    const validExercises = exercises.filter((exercise) => exercise && exercise.question && exercise.answer).slice(0, 5);

    if (title.length < 4 || subject.length < 2 || summary.length < 10 || content.length < 20 || validExercises.length < 2) {
        return res.status(400).json({ message: 'Completează lecția și adaugă cel puțin două exerciții valide.' });
    }

    const result = database.prepare(
        'INSERT INTO lessons (title, subject, summary, content, exercises, created_by) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, subject, summary, content, JSON.stringify(validExercises), req.user.id);
    database.prepare('UPDATE users SET credits = credits + 10 WHERE id = ?').run(req.user.id);
    const lesson = getLesson(String(result.lastInsertRowid));
    return res.status(201).json({ lesson: lessonForResponse(lesson, req.user.id), credits: req.user.credits + 10 });
});

app.post('/api/lessons/:lessonId/save', requireUser, (req, res) => {
    const lesson = getLesson(req.params.lessonId);
    if (!lesson) {
        return res.status(404).json({ message: 'Lecția nu există.' });
    }
    const existing = database.prepare('SELECT 1 FROM saved_lessons WHERE user_id = ? AND lesson_id = ?').get(req.user.id, lesson.id);
    if (existing) {
        database.prepare('DELETE FROM saved_lessons WHERE user_id = ? AND lesson_id = ?').run(req.user.id, lesson.id);
        return res.json({ saved: false });
    }
    database.prepare('INSERT INTO saved_lessons (user_id, lesson_id) VALUES (?, ?)').run(req.user.id, lesson.id);
    return res.json({ saved: true });
});

app.post('/api/lessons/:lessonId/attempt', requireUser, (req, res) => {
    if (req.user.role !== 'elev') {
        return res.status(403).json({ message: 'Zona de practică este disponibilă conturilor de elev.' });
    }
    const lesson = getLesson(req.params.lessonId);
    const exerciseIndex = Number(req.body.exerciseIndex);
    const exercise = lesson && lesson.exercises[exerciseIndex];
    if (!exercise) {
        return res.status(404).json({ message: 'Exercițiul nu există.' });
    }
    const answer = String(req.body.answer || '').trim().toLocaleLowerCase('ro');
    const expected = String(exercise.answer).trim().toLocaleLowerCase('ro');
    const correct = answer === expected;
    const minutesSpent = Math.min(Math.max(Number(req.body.minutesSpent) || 1, 1), 60);
    if (correct) {
        database.prepare(`
            INSERT INTO exercise_attempts (user_id, lesson_id, exercise_index, solved, minutes_spent)
            VALUES (?, ?, ?, 1, ?)
            ON CONFLICT(user_id, lesson_id, exercise_index) DO UPDATE SET solved = 1, minutes_spent = minutes_spent + excluded.minutes_spent
        `).run(req.user.id, lesson.id, exerciseIndex, minutesSpent);
    }
    const solvedCount = database.prepare('SELECT COUNT(*) AS count FROM exercise_attempts WHERE user_id = ? AND lesson_id = ? AND solved = 1').get(req.user.id, lesson.id).count;
    const completed = solvedCount >= lesson.exercises.length;
    database.prepare(`
        INSERT INTO lesson_progress (user_id, lesson_id, completed, minutes_spent)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed = MAX(completed, excluded.completed), minutes_spent = minutes_spent + excluded.minutes_spent, updated_at = CURRENT_TIMESTAMP
    `).run(req.user.id, lesson.id, completed ? 1 : 0, correct ? minutesSpent : 0);
    return res.json({
        correct,
        completed,
        solvedCount,
        total: lesson.exercises.length,
        explanation: correct
            ? 'Corect. Ai aplicat ideea principală a lecției.'
            : (exercise.explanation || 'Recitește explicația lecției și verifică fiecare pas înainte să încerci din nou.')
    });
});

app.get('/api/progress', requireUser, (req, res) => {
    const progress = database.prepare('SELECT COUNT(*) AS lessonsLearnt FROM lesson_progress WHERE user_id = ? AND completed = 1').get(req.user.id);
    const solved = database.prepare('SELECT COUNT(*) AS exercisesSolved FROM exercise_attempts WHERE user_id = ? AND solved = 1').get(req.user.id);
    const time = database.prepare('SELECT COALESCE(SUM(minutes_spent), 0) AS minutesSpent FROM lesson_progress WHERE user_id = ?').get(req.user.id);
    const totalLessons = builtInLessons.length + database.prepare('SELECT COUNT(*) AS count FROM lessons').get().count;
    return res.json({ lessonsLearnt: progress.lessonsLearnt, exercisesSolved: solved.exercisesSolved, hoursSpent: Math.round((time.minutesSpent / 60) * 10) / 10, totalLessons, credits: req.user.credits || 0 });
});

app.post('/api/compiler/run', rateLimit({ windowMs: 60 * 1000, max: 8, message: 'Ai atins limita de compilări. Încearcă din nou peste puțin timp.' }), async (req, res) => {
    const payload = req.body || {};
    if (!payload.source_code || !Number.isInteger(payload.language_id)) {
        return res.status(400).json({ message: 'Codul și limbajul sunt obligatorii.' });
    }
    try {
        const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language_id: payload.language_id,
                source_code: String(payload.source_code).slice(0, 50000),
                stdin: String(payload.stdin || '').slice(0, 10000),
                cpu_time_limit: 3,
                wall_time_limit: 5
            },)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            return res.status(502).json({ message: result.message || 'Serviciul de compilare nu este disponibil momentan.' });
        }
        return res.json(result);
    } catch (error) {
        console.error('Compiler unavailable:', error.message);
        return res.status(503).json({ message: 'Compilatorul este temporar indisponibil. Verifică soluția local și încearcă din nou.' });
    }
});

app.post('/api/register', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Prea multe încercări de înregistrare. Încearcă din nou mai târziu.' }), async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role === 'voluntar' ? 'voluntar' : 'elev';

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
        return res.status(400).json({ message: 'Completează corect toate câmpurile. Parola trebuie să aibă cel puțin 8 caractere.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);
        const verificationToken = createToken();
        const result = database.prepare(
            'INSERT INTO users (name, email, password_hash, role, email_verification_token, email_verified) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(name, email, passwordHash, role, verificationToken, requiresEmailVerification ? 0 : 1);
        const user = getUserById(result.lastInsertRowid);
        sendVerificationEmail({ name: user.name, email: user.email, token: verificationToken }).catch((error) => {
            console.error('Verification email could not be sent:', error);
        });
        if (verificationRequiredForUser(user)) {
            return res.status(201).json({ message: 'Contul a fost creat. Verifică adresa de email înainte de autentificare.' });
        }
        return startUserSession(req, user.id, (sessionError) => {
            if (sessionError) {
                return res.status(500).json({ message: 'Contul a fost creat, dar sesiunea nu a putut fi pornită.' });
            }
            sendWelcomeEmail({ name: user.name, email: user.email }).catch((error) => {
                console.error('Welcome email could not be sent:', error);
            });
            return res.status(201).json({ user: publicUser(user) });
        });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ message: 'Există deja un cont cu această adresă de email.' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Nu am putut crea contul. Încearcă din nou.' });
    }
});

app.post('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Prea multe încercări de autentificare. Încearcă din nou mai târziu.' }), async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = database.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: 'Emailul sau parola nu sunt corecte.' });
    }
    if (verificationRequiredForUser(user)) {
        return res.status(403).json({ message: 'Verifică adresa de email înainte de autentificare.' });
    }

    return startUserSession(req, user.id, (sessionError) => {
        if (sessionError) {
            return res.status(500).json({ message: 'Autentificarea a reușit, dar sesiunea nu a putut fi pornită.' });
        }
        return res.json({ user: publicUser(user) });
    });
});

app.get('/api/verify-email', (req, res) => {
    const token = String(req.query.token || '');
    const user = database.prepare('SELECT id FROM users WHERE email_verification_token = ?').get(token);
    if (!user) return res.status(400).send('Linkul de verificare nu este valid sau a expirat.');
    database.prepare('UPDATE users SET email_verified = 1, email_verification_token = NULL WHERE id = ?').run(user.id);
    return res.send('Email verificat. Te poți întoarce în EduPlus12 și te poți autentifica.');
});

app.post('/api/forgot-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Prea multe cereri. Încearcă din nou mai târziu.' }), (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = database.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email);
    if (user) {
        const token = createToken();
        database.prepare("UPDATE users SET password_reset_token = ?, password_reset_expires_at = datetime('now', '+30 minutes') WHERE id = ?").run(token, user.id);
        sendPasswordResetEmail({ name: user.name, email: user.email, token }).catch((error) => console.error('Password reset email failed:', error));
    }
    return res.json({ message: 'Dacă există un cont pentru această adresă, vei primi instrucțiuni de resetare.' });
});

app.post('/api/reset-password', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Prea multe cereri. Încearcă din nou mai târziu.' }), async (req, res) => {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    if (password.length < 8) return res.status(400).json({ message: 'Parola trebuie să aibă cel puțin 8 caractere.' });
    const user = database.prepare("SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires_at > datetime('now')").get(token);
    if (!user) return res.status(400).json({ message: 'Linkul de resetare nu este valid sau a expirat.' });
    const passwordHash = await bcrypt.hash(password, 12);
    database.prepare('UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = ?').run(passwordHash, user.id);
    return res.json({ message: 'Parola a fost schimbată. Te poți autentifica.' });
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
