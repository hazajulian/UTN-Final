// Esquema Zod para validar creación de champions custom
import { z } from 'zod';

export const createChampionSchema = z.object({
  id:        z.string().nonempty({ message: 'El campo id no puede estar vacío' }),
  name:      z.string().nonempty({ message: 'El campo name no puede estar vacío' }),
  title:     z.string().optional().default(''),
  region:    z.string().nonempty({ message: 'El campo region no puede estar vacío' }),
  positions: z.array(
               z.enum(['Top','Jungle','Mid','ADC','Support'], {
                 errorMap: () => ({ message: 'Posición inválida' })
               })
             )
             .nonempty({ message: 'Debes especificar al menos una posición' }),
  iconUrl:   z.string().url({ message: 'iconUrl debe ser una URL válida' }).optional(),
  splashUrl: z.string().url({ message: 'splashUrl debe ser una URL válida' }).optional(),
  lore:      z.string().optional().default(''),
  customAbilities: z.object({
    passive: z.object({
      name:        z.string().nonempty({ message: 'Nombre de la pasiva obligatorio' }),
      description: z.string().nonempty({ message: 'Descripción de la pasiva obligatoria' }),
      iconUrl:     z.string().url({ message: 'URL de icono de pasiva inválida' }).optional()
    }).optional(),
    spells: z.array(
      z.object({
        key:         z.enum(['Q','W','E','R'], {
                         errorMap: () => ({ message: 'Key debe ser Q, W, E o R' })
                       }),
        name:        z.string().nonempty({ message: 'Nombre de habilidad obligatorio' }),
        description: z.string().nonempty({ message: 'Descripción de habilidad obligatoria' }),
        iconUrl:     z.string().url({ message: 'URL de icono de habilidad inválida' }).optional()
      })
    )
    .max(4, { message: 'Máximo 4 habilidades (Q, W, E, R)' })
    .optional()
  }).optional()
});