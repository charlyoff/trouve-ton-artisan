import express from 'express';
import helmet from 'helmet';
import { requireInternalApiKey } from './middlewares/internalAuth.js';
import { apiRoutes } from './routes/apiRoutes.js';

export const api = express();

api.disable('x-powered-by');
api.use(helmet());
api.use(requireInternalApiKey);
api.use(express.json({ limit: '16kb' }));
api.use(apiRoutes);

api.use((_req, res) => res.status(404).json({ message: 'Ressource introuvable.' }));
api.use((error, _req, res, _next) => {
  const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 503;
  if (status === 503) console.error('API failure:', error.name);
  res.status(status).json({
    message: status === 413 ? 'Message trop volumineux.' : status === 400 ? 'Vérifiez les champs saisis.' : 'Le service est momentanément indisponible.',
    ...(error.fields ? { fields: error.fields } : {}),
  });
});
