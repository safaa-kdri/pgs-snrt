// src/middlewares/validation.js
// ✅ VERSION SIMPLIFIÉE AVEC LOGS DE BASE

const ApiError = require('../utils/ApiError');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => {
        const field = d.path.join('.');
        const message = d.message.replace(/"/g, '');
        return `${field}: ${message}`;
      });

      // ✅ Log simple pour le débogage
      console.log('❌ [Validation] Erreurs:', details);
      console.log('📥 [Validation] Données reçues:', JSON.stringify(req[source], null, 2));

      return next(ApiError.badRequest('Données invalides.', details));
    }

    req[source] = value;
    return next();
  };
}

module.exports = validate;