import { timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

export function sameSecret(a, b) {
  const first = Buffer.from(a || '');
  const second = Buffer.from(b || '');
  return first.length === second.length && timingSafeEqual(first, second);
}

export function requireInternalApiKey(req, res, next) {
  if (!sameSecret(req.get('x-api-key'), config.key)) {
    return res.status(401).json({ message: 'Accès non autorisé.' });
  }
  next();
}
