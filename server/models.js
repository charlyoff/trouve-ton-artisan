import { Sequelize, DataTypes } from 'sequelize';
import 'dotenv/config';

export const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  logging: false,
  pool: { max: 5, min: 0, idle: 10000, acquire: 10000 },
  dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {},
  define: { timestamps: false },
});

export const Category = db.define('Category', {
  id: { type: DataTypes.SMALLINT.UNSIGNED, primaryKey: true },
  name: DataTypes.STRING(80), slug: DataTypes.STRING(80),
}, { tableName: 'categories' });
export const Specialty = db.define('Specialty', {
  id: { type: DataTypes.SMALLINT.UNSIGNED, primaryKey: true },
  name: DataTypes.STRING(100), category_id: DataTypes.SMALLINT.UNSIGNED,
}, { tableName: 'specialties' });
export const Artisan = db.define('Artisan', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
  name: DataTypes.STRING(160), rating: DataTypes.DECIMAL(2, 1), city: DataTypes.STRING(120),
  about: DataTypes.TEXT, email: DataTypes.STRING(254), website: DataTypes.STRING(500),
  is_top: DataTypes.BOOLEAN, specialty_id: DataTypes.SMALLINT.UNSIGNED,
}, { tableName: 'artisans' });
Category.hasMany(Specialty, { foreignKey: 'category_id', as: 'specialties' });
Specialty.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Specialty.hasMany(Artisan, { foreignKey: 'specialty_id', as: 'artisans' });
Artisan.belongsTo(Specialty, { foreignKey: 'specialty_id', as: 'specialty' });

// No sync/alter here: the API only reads the schema initialized by SQL scripts.
export function serializeArtisan(model) {
  const a = model.toJSON();
  return { id: a.id, name: a.name, rating: Number(a.rating), city: a.city, about: a.about,
    website: a.website, isTop: a.is_top, specialty: a.specialty.name,
    category: a.specialty.category.name, categorySlug: a.specialty.category.slug };
}
