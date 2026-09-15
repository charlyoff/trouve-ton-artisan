# Corrections apres notation

Ce document recense les corrections effectuees apres la grille ayant attribue 15/20.

## Corrige dans le code

- Ajout d'une entite `cities` en base de donnees pour eviter les redondances de ville.
- Mise a jour du MLD SQL avec `artisans.city_id` et une cle etrangere vers `cities`.
- Reorganisation de l'API en dossiers `routes`, `controllers`, `services` et `middlewares`.
- Correction de la hierarchie de titres HTML: les cartes de liste utilisent maintenant un niveau adapte au contexte.
- Ajout d'un controle Playwright contre les IDs dupliques et les sauts de niveaux de titres.
- Mise a jour des tests d'integration MySQL pour verifier les villes et le compte applicatif en lecture seule.

## Verifications

- `npm run check`
- `npm run test:db`
- `npm run test:e2e`
- `npm run audit:prod`

## Points externes restants

- Maquettes Figma: verifier le partage public ou fournir un lien accessible au correcteur.
- Hebergement: fournir une URL publique d'un hebergement compatible Node.js + MySQL.
