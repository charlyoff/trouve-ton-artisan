import { sendContact } from '../mailer.js';
import { getContactTarget, getPublicArtisan, listArtisans } from '../services/artisanService.js';
import { contactSchema, idSchema, parse, searchSchema } from '../validation.js';

export async function getArtisans(req, res) {
  res.json(await listArtisans(parse(searchSchema, req.query)));
}

export async function getArtisan(req, res) {
  const artisan = await getPublicArtisan(parse(idSchema, req.params.id));
  if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' });
  res.json(artisan);
}

export async function contactArtisan(req, res) {
  const id = parse(idSchema, req.params.id);
  const input = parse(contactSchema, req.body);
  const artisan = await getContactTarget(id);
  if (!artisan) return res.status(404).json({ message: 'Artisan introuvable.' });

  try {
    res.json(await sendContact(artisan, input));
  } catch {
    res.status(503).json({ message: 'Le service de messagerie est indisponible. Réessayez plus tard.' });
  }
}
