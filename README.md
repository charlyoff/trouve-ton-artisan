# Trouve ton artisan

Site web React + Express + MySQL realise pour le devoir bilan "Trouve ton artisan".

Le projet contient une interface responsive, une API REST securisee, une base relationnelle MySQL alimentee depuis le fichier `data.xlsx`, les scripts SQL demandes, des tests automatises et un dossier de presentation PDF.

## Fonctionnalites

- Accueil avec les 4 etapes du parcours et les 3 artisans mis en avant.
- Menu de navigation alimente par les categories stockees en base.
- Recherche par nom d'artisan.
- Pages categorie avec cartes artisan.
- Fiche detail artisan avec note, specialite, ville, description, site web optionnel et formulaire de contact.
- Pages legales volontairement en construction, comme demande dans le brief.
- Page 404 dediee pour les URL inconnues.
- Responsive mobile, tablette et desktop.
- SEO de base par page: titre, description, robots et sitemap declaratif.

## Stack

- React 19, React Router, Bootstrap 5 et Sass.
- Node.js, Express, Sequelize et MySQL.
- API organisee par responsabilites: routes, controllers, services et middlewares.
- Helmet, validation Zod, rate limit, session CSRF et cookie `HttpOnly`.
- Playwright + axe-core pour les tests de parcours et d'accessibilite.

## Prerequis

- Node.js 22.12 ou plus recent.
- MySQL 8 ou MariaDB compatible.
- Un terminal PowerShell sous Windows.

## Installation locale

```powershell
npm install
Copy-Item .env.example .env
```

Renseigner ensuite `.env` avec les informations MySQL. Pour une base locale vide:

```powershell
npm run db:setup
npm run build
npm start
```

Le site est servi par defaut sur `http://localhost:3000`.

Pour travailler en mode developpement:

```powershell
npm run dev
```

## Base de donnees

Les scripts demandes pour le rendu sont dans:

- `database/schema.sql`: creation du schema relationnel.
- `database/seed.sql`: alimentation des categories, specialites et artisans.

Le script `scripts/extract-sources.py` a servi a convertir les donnees du tableur fourni vers SQL, en conservant les libelles et descriptions du fichier source. Le schema contient maintenant une entite `cities` reliee aux artisans par `city_id` afin d'eviter les redondances de ville.

## Variables d'environnement principales

- `APP_ORIGIN`: origine publique autorisee, par exemple `http://localhost:3000`.
- `PORT`: port public de l'application Express.
- `API_PORT`: port interne de l'API privee.
- `API_KEY`: cle interne partagee entre la passerelle et l'API.
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: acces lecture a la base.
- `MAIL_MODE`: `preview` en local, `smtp` en production.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: configuration SMTP si l'envoi reel est active.

En local, `MAIL_MODE=preview` cree des fichiers `.eml` dans `.local/mail-preview/` au lieu d'envoyer des emails reels.

## Tests

```powershell
npm run test
npm run build
npm run test:e2e
npm run audit:prod
```

Les tests end-to-end couvrent les parcours principaux, le formulaire de contact, les protections API, l'absence d'IDs dupliques, la hierarchie des titres et des audits axe-core en 390, 768 et 1440 px.

## Livrables

- Dossier PDF: `output/pdf/dossier-trouve-ton-artisan.pdf`.
- Captures de validation: `docs/screenshots/`.
- Donnees extraites: `docs/source-data.json`.
- Maquettes Figma: lien fourni dans le dossier du devoir. Les captures incluses ici sont les captures du site final teste en responsive.

## Notes de securite

L'API publique ne parle pas directement a la base: le navigateur appelle une passerelle Express qui verifie l'origine, le cookie de session et le jeton CSRF, puis relaie vers une API privee avec une cle interne.

Le compte MySQL applicatif doit avoir seulement les droits `SELECT`. Les operations d'administration de donnees sont separees et non exposees dans ce site public.

## Limite police Graphik

Le brief demande Graphik, mais les sources publiques trouvees ne garantissent pas un droit de redistribution web. Le CSS utilise donc `Graphik` si elle est installee localement, puis une police libre proche en fallback. Voir `public/fonts/README.md`.
