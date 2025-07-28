// Controladores para campeones seed y custom
import { Champion } from '../models/mongodb/champion-modeldb.js';
import { User } from '../models/mongodb/user-modeldb.js';
import { info, warn, error } from '../utils/logger.js';

// Listar campeones oficiales (seed) con paginación
export async function listSeedChampions(req, res) {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  try {
    const [total, items] = await Promise.all([
      Champion.countDocuments({ seed: true }),
      Champion.find({ seed: true })
        .select('id name title iconUrl splashUrl region positions')
        .sort('name')
        .skip(skip)
        .limit(limit)
    ]);

    info(`Fetched seed champions: page=${page} limit=${limit} total=${total}`);

    res.set('Cache-Control', 'public, max-age=60');
    return res.json({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: items
    });
  } catch (err) {
    error('Error listing seed champions', { err });
    throw err;
  }
}

// Obtener campeón por ID (seed o custom)
export async function getChampionById(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({ id: new RegExp(`^${id}$`, 'i') });
    if (!champ) {
      warn(`Champion not found: id=${id}`);
      return res.status(404).json({ message: 'Campeón no encontrado' });
    }

    info(`Fetched champion: id=${id}`);
    res.set('Cache-Control', 'public, max-age=120');
    return res.json(champ);
  } catch (err) {
    error('Error fetching champion by id', { err });
    throw err;
  }
}

// Crear campeón custom (requiere auth) y asociar al usuario
export async function createCustomChampion(req, res) {
  try {
    const data = { ...req.body, seed: false, owner: req.user._id };
    const created = await Champion.create(data);

    // Agregar el champion al array de customChampions del usuario
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { customChampions: created._id } }
    );

    info(`Created custom champion: id=${created.id}`);
    return res.status(201).json(created);
  } catch (err) {
    error('Error creating custom champion', { err });
    throw err;
  }
}

// Actualizar campeón custom (requiere auth)
export async function updateChampion(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({ id: new RegExp(`^${id}$`, 'i') });
    if (!champ) {
      warn(`Update attempt on non-existent champion: id=${id}`);
      return res.status(404).json({ message: 'Campeón no encontrado' });
    }
    if (champ.seed) {
      warn(`Update attempt on seed champion: id=${id}`);
      return res.status(403).json({ message: 'No puedes modificar un campeón por defecto' });
    }

    Object.assign(champ, req.body);
    const updated = await champ.save();

    info(`Updated custom champion: id=${id}`);
    return res.json(updated);
  } catch (err) {
    error('Error updating champion', { err });
    throw err;
  }
}

// Eliminar campeón custom (requiere auth) y quitar del user
export async function deleteChampion(req, res) {
  const { id } = req.params;

  try {
    const champ = await Champion.findOne({ id: new RegExp(`^${id}$`, 'i') });
    if (!champ) {
      warn(`Delete attempt on non-existent champion: id=${id}`);
      return res.status(404).json({ message: 'Campeón no encontrado' });
    }
    if (champ.seed) {
      warn(`Delete attempt on seed champion: id=${id}`);
      return res.status(403).json({ message: 'No puedes eliminar un campeón por defecto' });
    }

    // Quitar del usuario también:
    await User.findByIdAndUpdate(
      champ.owner,
      { $pull: { customChampions: champ._id } }
    );

    await champ.deleteOne();
    info(`Deleted custom champion: id=${id}`);
    return res.json({ message: 'Campeón eliminado correctamente' });
  } catch (err) {
    error('Error deleting champion', { err });
    throw err;
  }
}

// Listar custom champions del usuario autenticado
export async function listMyChampions(req, res) {
  try {
    const userId = req.user._id;
    const champs = await Champion.find({ seed: false, owner: userId });
    info(`Fetched custom champions for user: userId=${userId}`);
    return res.json(champs);
  } catch (err) {
    error('Error listing custom champions', { err });
    throw err;
  }
}