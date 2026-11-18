// Valida `req.body`, `req.params` o `req.query` con un esquema de Zod.
// Si los datos no son válidos responde 400 y la petición no llega al controller ni a MongoDB.
// Si son válidos, deja los datos ya convertidos y limpios en `req.validated[source]`.
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));

    return res.status(400).json({
      error: details.map((detail) => detail.message).join('. '),
      details,
    });
  }

  req.validated = { ...req.validated, [source]: result.data };
  next();
};
