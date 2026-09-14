import { z } from 'zod';

const singleLine = (min, max) => z.string().trim().min(min).max(max).refine(v => !/[\r\n\u0000]/.test(v), 'Valeur invalide.');
export const contactSchema = z.object({
  name: singleLine(2, 100),
  email: singleLine(3, 254).pipe(z.email()),
  subject: singleLine(3, 160),
  message: z.string().trim().min(10).max(5000).refine(v => !v.includes('\u0000')),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
}).strict();

export const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(['batiment', 'services', 'fabrication', 'alimentation']).optional(),
  top: z.enum(['true']).optional(),
}).strict();
export const idSchema = z.string().regex(/^[1-9]\d{0,8}$/).transform(Number);

export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = new Error('Vérifiez les champs saisis.');
    error.status = 400;
    error.fields = [...new Set(result.error.issues.map(i => i.path[0]).filter(Boolean))];
    throw error;
  }
  return result.data;
}
