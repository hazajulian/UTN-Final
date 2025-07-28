// Función para conectar a MongoDB usando Mongoose
import 'dotenv/config';
import mongoose from 'mongoose';
import { info, error } from '../utils/logger.js';

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    info('MongoDB conectado');
  } catch (err) {
    error('Error conectando a MongoDB', { err });
    process.exit(1);
  }
}

// Si se ejecuta directamente, iniciar conexión
if (import.meta.url === process.argv[1]) {
  connectDB();
}