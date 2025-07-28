// Carga habilidades y datos extras a campeones en MongoDB
import 'dotenv/config';
import axios from 'axios';
import mongoose from 'mongoose';
import { Champion } from '../../models/mongodb/champion-modeldb.js';
import { info, error } from '../../utils/logger.js';

async function updateAllAbilities() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    info('Conectado a MongoDB para updateAbilities');

    // Obtener versión de Data Dragon
    const version = (await axios.get(
      'https://ddragon.leagueoflegends.com/api/versions.json'
    )).data[0];
    info(`Data Dragon version ${version}`);

    // Listar campeones seed
    const champs = Object.values(
      (await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
      )).data.data
    );
    info(`Obtenidos ${champs.length} campeones`);

    // Actualizar habilidades y datos de cada campeón
    for (const { id } of champs) {
      const data = (await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${id}.json`
      )).data.data[id];

      const passive = {
        name:        data.passive.name,
        description: data.passive.description,
        iconUrl:     `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${data.passive.image.full}`
      };
      const spells = data.spells.map(s => ({
        key:         s.key,
        name:        s.name,
        description: s.description,
        iconUrl:     `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${s.image.full}`
      }));
      const { lore, allytips, enemytips, info: champInfo, stats } = data;

      await Champion.updateChampion(id, {
        abilities: { passive, spells },
        lore,
        allytips,
        enemytips,
        info: champInfo,
        stats
      });

      info(`Actualizado ${id}`);
    }

    info('Todas las habilidades cargadas');
    process.exit(0);
  } catch (err) {
    error('Error en updateAbilities', { err });
    process.exit(1);
  }
}

updateAllAbilities();