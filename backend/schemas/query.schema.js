// Esquema Zod para query params en listados
import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.coerce.number()
          .int()
          .min(1, { message: 'Página mínima es 1' })
          .default(1),

  limit: z.coerce.number()
           .int()
           .min(1, { message: 'Límite mínimo es 1' })
           .max(100, { message: 'Límite máximo es 100' })
           .default(10),

  sort: z.string()
          .optional()
          .default('name'),

  region: z.string()
            .optional(),

  positions: z.preprocess(
    val => typeof val === 'string' && val
      ? val.split(',').map(s => s.trim())
      : [],
    z.array(z.string())
  )
});