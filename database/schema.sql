-- MySQL 8.0.16+ / MariaDB 10.6+. Run inside an empty database.
-- No DROP, no destructive reset. Runtime account requires SELECT only.
SET NAMES utf8mb4;

CREATE TABLE categories (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_category_name (name),
  UNIQUE KEY uq_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE specialties (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specialty_name (name),
  CONSTRAINT fk_specialty_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cities (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_city_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE artisans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  rating DECIMAL(2,1) NOT NULL,
  about TEXT NOT NULL,
  email VARCHAR(254) NOT NULL,
  website VARCHAR(500) NULL,
  is_top BOOLEAN NOT NULL DEFAULT FALSE,
  specialty_id SMALLINT UNSIGNED NOT NULL,
  city_id SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_artisan_name (name),
  KEY idx_artisan_top (is_top),
  KEY idx_artisan_city (city_id),
  CONSTRAINT ck_rating CHECK (rating BETWEEN 0 AND 5),
  CONSTRAINT ck_top CHECK (is_top IN (0,1)),
  CONSTRAINT fk_artisan_specialty FOREIGN KEY (specialty_id) REFERENCES specialties(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_artisan_city FOREIGN KEY (city_id) REFERENCES cities(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
