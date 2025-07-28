// Aplica regiones y posiciones desde un JSON a campeones en MongoDB
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Champion } from '../../models/mongodb/champion-modeldb.js';
import { info, warn, error } from '../../utils/logger.js';

// Obtener __dirname en módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function run() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    info('Conectado a MongoDB para updateFields');

    // Leer mapping de regiones y posiciones desde data/regions-and-positions.json
    const filePath = path.join(__dirname, '..', 'regions-and-positions.json');
    info(`Leyendo mapping: ${filePath}`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const mapping = JSON.parse(raw);

    // Actualizar cada campeón según el mapping
    for (const [id, fields] of Object.entries(mapping)) {
      const updated = await Champion.updateChampion(id, fields);
      if (updated) {
        info(`Actualizado ${id}: ${JSON.stringify(fields)}`);
      } else {
        warn(`No existe ${id}, omitiendo`);
      }
    }

    info('updateFields completado');
    process.exit(0);
  } catch (err) {
    error('Error en updateFields', { err });
    process.exit(1);
  }
}

run();