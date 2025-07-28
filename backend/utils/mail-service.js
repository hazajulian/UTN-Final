// backend/src/utils/mail-service.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

let transporter;

async function createTransporter() {
  if (process.env.NODE_ENV === 'production') {
    // En producción usa SMTP real
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // En desarrollo: cuenta de prueba Ethereal
    const testAccount = await nodemailer.createTestAccount();
    console.log('ℹ️  Ethereal account:', testAccount.user);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

// Inicializa el transporter una sola vez
async function getTransporter() {
  if (!transporter) transporter = await createTransporter();
  return transporter;
}

/**
 * sendMail: envía un email. En dev, imprime Preview URL de Ethereal.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
export async function sendMail(options) {
  const tr = await getTransporter();
  const info = await tr.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no‑reply@example.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  // Si es Ethereal, getTestMessageUrl(info) devuelve la URL de preview
  if (process.env.NODE_ENV !== 'production') {
    const url = nodemailer.getTestMessageUrl(info);
    console.log(`📨 Preview URL: ${url}`);
  }
  return info;
}
