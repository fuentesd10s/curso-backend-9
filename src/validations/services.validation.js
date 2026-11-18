import { z } from 'zod';
import { requiredError, text, objectId } from './common.validation.js';

export const SORTABLE_FIELDS = ['name', 'price', 'duration', 'category'];

export const createServiceSchema = z.object({
  name: text('name'),
  description: text('description'),
  duration: z
    .number(requiredError('duration', 'un número'))
    .int('duration debe ser un número entero de minutos')
    .positive('duration debe ser mayor a 0'),
  price: z.number(requiredError('price', 'un número')).min(0, 'price no puede ser negativo'),
  category: text('category'),
  available: z.boolean(requiredError('available', 'true o false')),
});

// Todos los campos son opcionales, pero hay que mandar al menos uno.
// Los campos que no están en el esquema (como `id`) se descartan.
export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Hay que enviar al menos un campo para actualizar');

export const serviceIdSchema = z.object({
  sid: objectId('sid'),
});

export const servicesQuerySchema = z.object({
  category: z.string().trim().min(1, 'category no puede estar vacío').optional(),
  available: z
    .enum(['true', 'false'], 'available debe ser true o false')
    .transform((value) => value === 'true')
    .optional(),
  page: z.coerce
    .number('page debe ser un número')
    .int('page debe ser un número entero')
    .min(1, 'page debe ser 1 o mayor')
    .default(1),
  limit: z.coerce
    .number('limit debe ser un número')
    .int('limit debe ser un número entero')
    .min(1, 'limit debe ser 1 o mayor')
    .max(100, 'limit no puede ser mayor a 100')
    .default(10),
  sortBy: z.enum(SORTABLE_FIELDS, `sortBy debe ser uno de: ${SORTABLE_FIELDS.join(', ')}`).optional(),
  order: z.enum(['asc', 'desc'], 'order debe ser asc o desc').default('asc'),
});
