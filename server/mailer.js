import nodemailer from 'nodemailer';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { config } from './config.js';

const transport = config.mailMode === 'smtp' ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  requireTLS: process.env.SMTP_SECURE !== 'true',
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  connectionTimeout: 10000, socketTimeout: 15000,
}) : nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });

export async function sendContact(artisan, input) {
  // The recipient is read from MySQL, never accepted from the browser.
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM || 'Trouve ton artisan <no-reply@example.test>',
    to: artisan.email,
    replyTo: { name: input.name, address: input.email },
    subject: `[Trouve ton artisan] ${input.subject}`,
    text: `Bonjour ${artisan.name},\n\n${input.name} vous contacte via Trouve ton artisan.\n\n${input.message}\n\nRépondre à : ${input.email}\n`,
    disableFileAccess: true, disableUrlAccess: true,
  });
  if (config.mailMode === 'preview') {
    await mkdir('.local/outbox', { recursive: true });
    await writeFile(`.local/outbox/${randomUUID()}.eml`, info.message);
    return { mode: 'preview', message: 'Votre message a été enregistré en mode démonstration. Aucun e-mail n’a été envoyé.' };
  }
  if (!info.accepted?.length) throw new Error('SMTP rejected the recipient.');
  return { mode: 'smtp', message: 'Votre message a été transmis au serveur de messagerie. L’artisan pourra vous répondre à l’adresse indiquée.' };
}
