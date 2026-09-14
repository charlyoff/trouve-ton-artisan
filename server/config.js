import 'dotenv/config';

export const config = {
  production: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3000),
  apiPort: Number(process.env.API_PORT || 3001),
  apiHost: process.env.API_HOST || '127.0.0.1',
  origin: process.env.APP_ORIGIN || 'http://localhost:5173',
  key: process.env.API_KEY || '',
  mailMode: process.env.MAIL_MODE || 'preview',
};

export function validateConfig() {
  if (config.key.length < 32 || config.key.startsWith('replace-')) throw new Error('Configure a random API_KEY (32+ characters) in .env.');
  if (config.production && !config.origin.startsWith('https://')) throw new Error('APP_ORIGIN must use HTTPS in production.');
  if (!['preview', 'smtp'].includes(config.mailMode)) throw new Error('MAIL_MODE must be preview or smtp.');
  if (config.mailMode === 'smtp' && (!process.env.SMTP_HOST || !process.env.MAIL_FROM)) throw new Error('SMTP_HOST and MAIL_FROM are required.');
}
