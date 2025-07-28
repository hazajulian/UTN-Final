// Configuración y arranque del servidor: conexión a DB, rutas y Swagger
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { connectDB } from '../startpoint/mongo.js';
import userRouter from '../routes/user-route.js';
import contactRouter from '../routes/contact-route.js';
import championsRouter from '../routes/champions-route.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { info, error } from '../utils/logger.js';

// Conectar a MongoDB
try {
  await connectDB();
  info('MongoDB conectado');
} catch (err) {
  error('Error conectando a MongoDB', { err });
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Documentación Swagger
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'docs', 'swagger.json'));
});

app.get('/swagger-es.json', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'docs', 'swagger-es.json'));
});

// Rutas de autenticación y gestión de usuarios
app.use('/api/v1/auth', userRouter);

// Ruta de contacto
app.use('/api/v1', contactRouter);

// Rutas de campeones
app.use('/api/v1/champions', championsRouter);

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  info(`Servidor corriendo en http://localhost:${PORT}`);
});