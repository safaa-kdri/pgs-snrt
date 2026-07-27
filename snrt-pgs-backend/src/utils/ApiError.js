
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Non authentifie.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Acces refuse.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Ressource introuvable.') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflit de donnees.') {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'Trop de tentatives. Veuillez reessayer plus tard.') {
    return new ApiError(429, message);
  }

  static internal(message = 'Erreur interne du serveur.') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
