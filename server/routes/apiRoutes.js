import { Router } from 'express';
import { contactArtisan, getArtisan, getArtisans } from '../controllers/artisanController.js';
import { getCategories } from '../controllers/categoryController.js';

export const apiRoutes = Router();

apiRoutes.get('/categories', getCategories);
apiRoutes.get('/artisans', getArtisans);
apiRoutes.get('/artisans/:id', getArtisan);
apiRoutes.post('/artisans/:id/contact', contactArtisan);
