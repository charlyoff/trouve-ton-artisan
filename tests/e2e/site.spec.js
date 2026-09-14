import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage, category filtering, literal search, detail, legal and 404', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.artisan-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Comment trouver mon artisan ?' })).toBeVisible();
  await page.getByRole('link', { name: 'Alimentation', exact: true }).click();
  await expect(page.locator('.artisan-card')).toHaveCount(4);
  await page.getByRole('link', { name: /Au pain chaud/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Au pain chaud');
  await expect(page.getByLabel('Nom', { exact: true })).toBeVisible();
  await page.getByRole('searchbox').fill('labbé');
  await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
  await expect(page.locator('.artisan-card')).toHaveCount(1);
  await expect(page.locator('.artisan-card')).toContainText('Chocolaterie Labbé');
  await page.getByRole('searchbox').fill("%' OR 1=1 --");
  await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Aucun artisan trouvé' })).toBeVisible();
  await page.getByRole('link', { name: 'Mentions légales', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Page en construction' })).toBeVisible();
  const response = await page.goto('/route-inexistante');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page non trouvée' })).toBeVisible();
  const missing = await page.goto('/artisan/99999');
  expect(missing.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page non trouvée' })).toBeVisible();
});

test('contact preview stores a message without claiming delivery', async ({ page }) => {
  await page.goto('/artisan/2');
  await page.getByLabel('Nom', { exact: true }).fill('Test automatisé');
  await page.getByLabel('E-mail', { exact: true }).fill('test@example.test');
  await page.getByLabel('Objet', { exact: true }).fill('Test du formulaire');
  await page.getByLabel('Message', { exact: true }).fill('Ceci est un message de test local, sans envoi externe.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Envoyer mon message' }).click();
  await expect(page.getByRole('status')).toContainText('Aucun e-mail n’a été envoyé');
});

test('API rejects direct access, forged contact, oversized body and write endpoints', async ({ request }) => {
  expect((await request.get('http://127.0.0.1:3101/artisans')).status()).toBe(401);
  expect((await request.post('/api/artisans/2/contact', { data: {} })).status()).toBe(403);
  expect((await request.delete('/api/artisans/2')).status()).toBe(404);
  expect((await request.get('/api/artisans?q=%25')).status()).toBe(200);
  expect(await (await request.get('/api/artisans?q=%25')).json()).toEqual([]);
  expect((await request.get('/api/artisans?category=invalid')).status()).toBe(400);
  const response = await request.get('/api/artisans/2');
  expect((await response.json()).email).toBeUndefined();
  expect(response.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(response.headers()['x-powered-by']).toBeUndefined();
  expect((await request.post('/api/artisans/2/contact', { data: { message: 'a'.repeat(20000) } })).status()).toBe(413);
});

for (const width of [390, 768, 1440]) {
  test(`responsive, accessible screens at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    for (const [name, route] of [['accueil', '/'], ['categorie', '/categorie/alimentation'], ['recherche', '/artisans?q=labbé'], ['fiche', '/artisan/3'], ['legal', '/mentions-legales'], ['404', '/page-inconnue']]) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.category-nav a')).toHaveCount(4);
      if (['accueil', 'categorie', 'recherche'].includes(name)) await expect(page.locator('.artisan-card').first()).toBeVisible();
      if (name === 'fiche') await expect(page.getByRole('button', { name: 'Envoyer mon message' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const analysis = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(analysis.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => ({ target: n.target, reason: n.failureSummary })) }))).toEqual([]);
      await page.screenshot({ path: `docs/screenshots/${name}-${width}.png`, fullPage: true });
    }
    if (width < 768) { await page.goto('/'); await page.getByRole('button', { name: 'Catégories' }).click(); await expect(page.getByRole('link', { name: 'Bâtiment', exact: true })).toBeVisible(); }
  });
}
