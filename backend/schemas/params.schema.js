// Esquema Zod para validar parámetros de ruta
import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string()
        .nonempty({ message: 'El parámetro id es obligatorio' })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: 'ID inválido' })
});