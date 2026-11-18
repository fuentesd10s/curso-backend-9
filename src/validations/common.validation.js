import { z } from 'zod';
import mongoose from 'mongoose';

// Mensaje distinto si el campo falta o si tiene otro tipo.
export const requiredError = (field, type) => ({
  error: (issue) =>
    issue.input === undefined ? `${field} es obligatorio` : `${field} debe ser ${type}`,
});

export const text = (field) => z.string(requiredError(field, 'texto')).trim().min(1, `${field} no puede estar vacío`);

export const objectId = (field) =>
  z
    .string(requiredError(field, 'texto'))
    .refine((value) => mongoose.isValidObjectId(value), `${field} no es un id válido`);
