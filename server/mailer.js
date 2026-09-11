const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const mailFrom = process.env.MAIL_FROM || 'EduPlus12 <no-reply@example.com>';

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

module.exports = { sendWelcomeEmail };
