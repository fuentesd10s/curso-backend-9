import { AppError } from '../errors/AppError.js';

// Se ejecuta cuando ninguna ruta coincide: responde 404 con el mismo formato que el resto de los errores.
export function notFound(req, res, next) {
  next(new AppError(`No existe la ruta ${req.method} ${req.originalUrl}`, 404));
}
