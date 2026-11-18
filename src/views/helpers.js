// Helpers de presentación: solo dan formato, no tienen reglas de negocio.
export const hbsHelpers = {
  price: (value) => `$${Number(value).toLocaleString('es-AR')}`,
  availability: (available) => (available ? 'Disponible' : 'No disponible'),
  eq: (a, b) => a === b,
};
