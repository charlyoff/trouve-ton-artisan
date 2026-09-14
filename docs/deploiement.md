# Deploiement

Le site complet a besoin de deux services: l'application Node.js et une base MySQL. Un hebergement statique seul ne suffit pas, car le formulaire et les donnees artisans passent par une API Express.

## Option VPS ou serveur d'ecole

1. Installer Docker et Docker Compose.
2. Copier le projet sur le serveur.
3. Copier `docker-compose.example.yml` vers `docker-compose.yml`.
4. Remplacer les mots de passe, `API_KEY` et `APP_ORIGIN`.
5. Configurer un SMTP si les emails reels doivent partir.
6. Lancer:

```bash
docker compose up -d --build
```

## Option hebergeur Node + MySQL

1. Creer une base MySQL.
2. Importer `database/schema.sql`, puis `database/seed.sql`.
3. Configurer les variables d'environnement de l'application.
4. Executer `npm ci`, `npm run build`, puis `npm start`.

## Email

En local et tant qu'aucun SMTP n'est fourni, `MAIL_MODE=preview` garde une trace des messages sans envoyer d'email. Pour la production, passer a `MAIL_MODE=smtp` et renseigner `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` et `SMTP_PASS`.
