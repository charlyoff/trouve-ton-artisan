import test from 'node:test';
import assert from 'node:assert/strict';
import { contactSchema, searchSchema, idSchema } from '../server/validation.js';
const valid = { name: 'Alice Test', email: 'alice@example.test', subject: 'Demande de devis', message: 'Bonjour, je souhaite un devis pour mon projet.', consent: true, website: '' };
test('contact accepts a complete, valid request', () => assert.equal(contactSchema.safeParse(valid).success, true));
test('contact rejects header injection, forged recipients, missing consent and bots', () => {
  for (const input of [{ ...valid, subject: 'Devis\r\nBcc: attacker@example.test' }, { ...valid, email: 'bad-address' }, { ...valid, to: 'other@example.test' }, { ...valid, consent: false }, { ...valid, website: 'https://spam.test' }, { ...valid, message: 'a'.repeat(5001) }]) {
    assert.equal(contactSchema.safeParse(input).success, false);
  }
});
test('query and identifiers reject unknown fields and malformed values', () => {
  for (const input of [{ q: ['a', 'b'] }, { category: 'inconnue' }, { top: 'false' }, { q: 'a'.repeat(101) }, { admin: 'true' }]) assert.equal(searchSchema.safeParse(input).success, false);
  for (const input of ['0', '-1', '1 OR 1=1', '3.2', '99999999999999']) assert.equal(idSchema.safeParse(input).success, false);
});
