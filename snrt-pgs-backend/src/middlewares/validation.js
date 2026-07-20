const ApiError = require('../utils/ApiError');

/**
 * Middleware generique : valide req.body (ou req.params/req.query via
 * l'option `source`) contre un schema Joi donne. Renvoie toutes les erreurs
 * en une seule fois (abortEarly: false).
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message.replace(/"/g, ''));
      return next(ApiError.badRequest('Donnees invalides.', details));
    }

    req[source] = value;
    return next();
  };
}

module.exports = validate;
