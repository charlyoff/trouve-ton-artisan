import { col, fn, Op, where as sqlWhere } from 'sequelize';
import { Artisan, Category, City, Specialty, serializeArtisan } from '../models.js';

function artisanIncludes(categorySlug) {
  return [
    {
      model: Specialty,
      as: 'specialty',
      required: true,
      include: [{
        model: Category,
        as: 'category',
        required: true,
        ...(categorySlug ? { where: { slug: categorySlug } } : {}),
      }],
    },
    { model: City, as: 'city', required: true },
  ];
}

export function listCategories() {
  return Category.findAll({
    attributes: ['id', 'name', 'slug'],
    order: [['id', 'ASC']],
  });
}

export async function listArtisans(query) {
  const where = {};
  if (query.q) {
    // INSTR searches the literal value, so SQL wildcards stay ordinary characters.
    where[Op.and] = sqlWhere(fn('INSTR', col('Artisan.name'), query.q), { [Op.gt]: 0 });
  }
  if (query.top) where.is_top = true;

  const artisans = await Artisan.findAll({
    where,
    attributes: { exclude: ['email'] },
    include: artisanIncludes(query.category),
    order: query.top ? [['id', 'ASC']] : [['name', 'ASC']],
    limit: query.top ? 3 : 100,
  });
  return artisans.map(serializeArtisan);
}

export async function getPublicArtisan(id) {
  const artisan = await Artisan.findByPk(id, {
    attributes: { exclude: ['email'] },
    include: artisanIncludes(),
  });
  return artisan ? serializeArtisan(artisan) : null;
}

export function getContactTarget(id) {
  return Artisan.findByPk(id, { attributes: ['id', 'name', 'email'] });
}
