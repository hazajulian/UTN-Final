// Importa campeones oficiales desde Data Dragon a MongoDB
import 'dotenv/config';
import axios from 'axios';
import mongoose from 'mongoose';
import { Champion } from '../../models/mongodb/champion-modeldb.js';
import { info, error } from '../../utils/logger.js';

async function seed() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    info('Conectado a MongoDB para seed');

    // Obtener versión de Data Dragon
    const versionRes = await axios.get(
      'https://ddragon.leagueoflegends.com/api/versions.json'
    );
    const version = versionRes.data[0];
    info(`Data Dragon version ${version}`);

    // Descargar listado de campeones
    const listRes = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    const rawList = Object.values(listRes.data.data);
    info(`Encontrados ${rawList.length} campeones`);

    // Procesar cada campeón y extraer skins
    const championsWithSkins = [];
    for (const champ of rawList) {
      const id = champ.id;
      const detailRes = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${id}.json`
      );
      const fullData = detailRes.data.data[id];

      const skins = fullData.skins.map(s => ({
        name:     s.name,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_${s.num}.jpg`
      }));

      // Incluir seed:true para campeones oficiales
      championsWithSkins.push({
        id,
        seed:      true,
        name:      fullData.name,
        title:     fullData.title,
        roles:     fullData.tags,
        positions: [], // se llenará manualmente
        region:    '',  // se llena en updateFields
        iconUrl:   `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${fullData.image.full}`,
        splashUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`,
        skins
      });

      info(`Procesado ${id} (${skins.length} skins)`);
    }

    // Reemplazar colección existente
    await Champion.deleteMany({});
    info('Colección champions vaciada');

    // Insertar nuevos campeones
    await Champion.insertMany(championsWithSkins);
    info(`Seed completo: ${championsWithSkins.length} campeones importados`);

    process.exit(0);
  } catch (err) {
    error('Error en seed', { err });
    process.exit(1);
  }
}

seed();