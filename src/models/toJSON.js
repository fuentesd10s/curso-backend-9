// Muestra `id` en lugar de `_id` y oculta `__v`, para que las respuestas
// mantengan la misma forma que tenían con FileSystem.
export const toJSONOptions = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
};
