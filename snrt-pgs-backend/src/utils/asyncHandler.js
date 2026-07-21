/**
 * Enveloppe les controleurs async pour transmettre automatiquement
 * les erreurs au middleware global (next(err)) sans repeter de try/catch.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
