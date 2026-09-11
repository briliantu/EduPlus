const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const mailFrom = process.env.MAIL_FROM || 'EduPlus12 <no-reply@example.com>';
const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

const transporter = smtpHost && smtpUser && smtpPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: smtpUser,
            pass: smtpPassword
        }
    })
    : null;

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function sendWelcomeEmail({ name, email }) {
    if (!transporter) {
        console.warn('Welcome email skipped: SMTP is not configured.');
        return;
    }

    const safeName = escapeHtml(name);

    await transporter.sendMail({
        from: mailFrom,
        to: email,
        replyTo: mailFrom,
        subject: 'Bun venit pe EduPlus12',
        text: `Bun venit, ${name}!\n\nÎți mulțumim că te-ai înregistrat pe EduPlus12. Contul tău este pregătit, iar de acum poți folosi lecțiile și resursele platformei.\n\nAcesta este un mesaj automat. Te rugăm să nu răspunzi la acest email.`,
        html: `<p>Bun venit, ${safeName}!</p><p>Îți mulțumim că te-ai înregistrat pe <strong>EduPlus12</strong>. Contul tău este pregătit, iar de acum poți folosi lecțiile și resursele platformei.</p><p>Acesta este un mesaj automat. Te rugăm să nu răspunzi la acest email.</p>`
    });
}

async function sendVerificationEmail({ name, email, token }) {
    if (!transporter) {
        console.warn('Verification email skipped: SMTP is not configured.');
        return;
    }
    const link = `${appBaseUrl}/api/verify-email?token=${encodeURIComponent(token)}`;
    await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Verifică emailul pentru EduPlus12',
        text: `Bun venit, ${name}! Verifică adresa de email aici: ${link}`,
        html: `<p>Bun venit, ${escapeHtml(name)}!</p><p><a href="${link}">Verifică adresa de email</a> pentru a activa contul EduPlus12.</p>`
    });
}

async function sendPasswordResetEmail({ name, email, token }) {
    if (!transporter) {
        console.warn('Password reset email skipped: SMTP is not configured.');
        return;
    }
    const link = `${appBaseUrl}/pages/auth.html?reset=${encodeURIComponent(token)}`;
    await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Resetarea parolei EduPlus12',
        text: `Salut, ${name}! Resetează parola în 30 de minute aici: ${link}`,
        html: `<p>Salut, ${escapeHtml(name)}!</p><p><a href="${link}">Resetează parola</a> în următoarele 30 de minute.</p>`
    });
}

module.exports = { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail };
