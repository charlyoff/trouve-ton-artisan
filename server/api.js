import express from 'express';
import helmet from 'helmet';
import { timingSafeEqual } from 'node:crypto';
import { Op } from 'sequelize';
import { config } from './config.js';
import { Artisan, Category, Specialty, serializeArtisan } from './models.js';
import { contactSchema, searchSchema, idSchema, parse } from './validation.js';
import { sendContact } from './mailer.js';

export function sameSecret(a, b) {
  const first = Buffer.from(a || ''), second = Buffer.from(b || '');
  return first.length === second.length && timingSafeEqual(first, second);
}
export const api = express();
api.disable('x-powered-by');
api.use(helmet());
api.use((req, res, next) => {
  if (!sameSecret(req.get('x-api-key'), config.key)) return res.status(401).json({ message: 'Accès non autorisé.' });
  next();
});
api.use(express.json({ limit: '16kb' }));

api.get('/categories', async (_req, res) => {
  res.json(await Category.findAll({ attributes: ['id', 'name', 'slug'], order: [['id', 'ASC']] }));
});
api.get('/artisans', async (req, res) => {
  const query = parse(searchSchema, req.query);
  const where = {};
  // instr treats %, _ and quotes as ordinary search characters. Sequelize escapes the value.
  if (query.q) {
    const { fn, col, where: sqlWhere } = await import('sequelize');
    where[Op.and] = sqlWhere(fn('INSTR', col('Artisan.name'), query.q), { [Op.gt]: 0 });
  }
  if (query.top) where.is_top = true;
  const artisans = await Artisan.findAll({
    where, attributes: { exclude: ['email'] },
    include: [{ model: Specialty, as: 'specialty', required: true,
      include: [{ model: Category, as: 'category', required: true,
        ...(query.category ? { where: { slug: query.category } } : {}) }] }],
    order: query.top ? [['id', 'ASC']] : [['name', 'ASC']], limit: query.top ? 3 : 100,
  });
  res.json(artisans.map(serializeArtisan));
});
const includes = [{ model: Specialty, as: 'specialty', include: [{ model: Category, as: 'category' }] }];
api.get('/artisans/:id', async (req, res) => {
  const artisan = await Artisan.findByPk(parse(idSchema, req.params.id), { attributes: { exclude: ['email'] }, include: includes });
  if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' });
  res.json(serializeArtisan(artisan));
});
api.post('/artisans/:id/contact', async (req, res) => {
  const id = parse(idSchema, req.params.id);
  const input = parse(contactSchema, req.body);
  const artisan = await Artisan.findByPk(id, { attributes: ['id', 'name', 'email'] });
  if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' });
  try { res.json(await sendContact(artisan, input)); }
  catch { res.status(503).json({ message: 'Le service de messagerie est indisponible. Réessayez plus tard.' }); }
});
api.use((_req, res) => res.status(404).json({ message: 'Ressource introuvable.' }));
api.use((error, _req, res, _next) => {
  const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 503;
  if (status === 503) console.error('API failure:', error.name);
  res.status(status).json({ message: status === 413 ? 'Message trop volumineux.' : status === 400 ? 'Vérifiez les champs saisis.' : 'Le service est momentanément indisponible.', ...(error.fields ? { fields: error.fields } : {}) });
});
