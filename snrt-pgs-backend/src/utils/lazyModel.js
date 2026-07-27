const mongoose = require('mongoose');

/**
 * Recupere un modele Mongoose deja enregistre sans dependre du fichier qui
 * le definit (utile tant que tous les modeles de l'equipe - Application,
 * Internship, Department, Period, Notification... - ne sont pas encore
 * merges dans le depot). Renvoie null si le modele n'est pas (encore)
 * enregistre, plutot que de faire planter la requete.
 */
function getModelSafe(name) {
  try {
    return mongoose.model(name);
  } catch (err) {
    return null;
  }
}

module.exports = { getModelSafe };

