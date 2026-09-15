import { listCategories } from '../services/artisanService.js';

export async function getCategories(_req, res) {
  res.json(await listCategories());
}
