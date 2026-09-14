import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createHmac, randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

export const gateway = express();
gateway.disable('x-powered-by');
if (process.env.TRUST_PROXY === '1') gateway.set('trust proxy', 1);
gateway.use(helmet({
  strictTransportSecurity: config.production ? undefined : false,
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"],
    imgSrc: ["'self'", 'data:'], fontSrc: ["'self'"], connectSrc: ["'self'"],
    objectSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'self'"],
    formAction: ["'self'"], upgradeInsecureRequests: config.production ? [] : null,
  } },
}));
gateway.use('/api', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Trop de requêtes. Réessayez dans une minute.' } }));
gateway.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
gateway.use(express.json({ limit: '16kb' }));

function sign(value) { return createHmac('sha256', config.key).update(value).digest('hex'); }
function cookieValue(req) {
  return req.headers.cookie?.split(';').map(v => v.trim()).find(v => v.startsWith('artisan_session='))?.slice(16);
}
gateway.get('/api/session', (_req, res) => {
  const token = `${Date.now()}.${randomBytes(24).toString('hex')}`;
  res.cookie('artisan_session', `${token}.${sign(token)}`, { httpOnly: true, secure: config.production, sameSite: 'strict', maxAge: 3600000, path: '/api' });
  res.json({ csrfToken: token, mailMode: config.mailMode });
});
const contacts = rateLimit({ windowMs: 15 * 60000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Vous avez envoyé plusieurs demandes. Réessayez dans 15 minutes.' } });
gateway.post('/api/artisans/:id/contact', contacts, (req, res, next) => {
  const token = req.get('x-csrf-token') || '';
  const age = Date.now() - Number(token.split('.')[0]);
  if (req.get('origin') !== config.origin || !/^\d{13}\.[a-f0-9]{48}$/.test(token) || age < 0 || age > 3600000 || cookieValue(req) !== `${token}.${sign(token)}`) {
    return res.status(403).json({ message: 'La session a expiré. Rechargez la page avant de réessayer.' });
  }
  next();
});

// Only these routes cross the server-side bridge. API_KEY never reaches React.
gateway.use('/api', async (req, res) => {
  const validGet = req.method === 'GET' && /^\/(categories|artisans(?:\/[1-9]\d{0,8})?)$/.test(req.path);
  const validPost = req.method === 'POST' && /^\/artisans\/[1-9]\d{0,8}\/contact$/.test(req.path);
  if (!validGet && !validPost) return res.status(404).json({ message: 'Ressource introuvable.' });
  try {
    const response = await fetch(`http://${config.apiHost}:${config.apiPort}${req.url}`, {
      method: req.method, headers: { 'x-api-key': config.key, 'content-type': 'application/json' },
      ...(validPost ? { body: JSON.stringify(req.body) } : {}), signal: AbortSignal.timeout(20000),
    });
    res.status(response.status).json(await response.json());
  } catch { res.status(503).json({ message: 'Le service est momentanément indisponible. Réessayez dans quelques instants.' }); }
});
gateway.get('/health', (_req, res) => res.json({ status: 'ok' }));
gateway.use(express.static(path.resolve('dist'), { index: false }));
gateway.get('/{*path}', async (req, res, next) => {
  try {
    const valid = /^\/$|^\/artisans\/?$|^\/categorie\/(batiment|services|fabrication|alimentation)\/?$|^\/artisan\/[1-9]\d{0,8}\/?$|^\/(mentions-legales|donnees-personnelles|accessibilite|cookies)\/?$/.test(req.path);
    let status = valid ? 200 : 404;
    if (/^\/artisan\//.test(req.path) && valid) {
      const response = await fetch(`http://${config.apiHost}:${config.apiPort}/artisans/${req.path.split('/')[2]}`, { headers: { 'x-api-key': config.key }, signal: AbortSignal.timeout(5000) });
      status = response.status;
    }
    const html = await readFile(path.resolve('dist/index.html'), 'utf8');
    res.status(status).type('html').send(html);
  } catch (error) { next(error); }
});
gateway.use((error, _req, res, _next) => {
  res.status(error.status === 413 ? 413 : error.status === 400 ? 400 : 503).json({ message: error.status === 413 ? 'Message trop volumineux.' : 'Le service est momentanément indisponible.' });
});
