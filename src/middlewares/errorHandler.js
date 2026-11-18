import mongoose from 'mongoose';
import { AppError } from '../errors/AppError.js';

export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El body no es un JSON válido' });
  }

  // Un dato con tipo incorrecto (por ejemplo, price: "abc") no pasa el schema de Mongoose.
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `Datos inválidos: ${error.message}` });
  }

  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}