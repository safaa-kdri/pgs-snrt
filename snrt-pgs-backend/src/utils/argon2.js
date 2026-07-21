const argon2 = require('argon2');

/**
 * Hachage Argon2id - configuration recommandee OWASP.
 * Utilise pour utilisateurs_internes.motDePasse et utilisateurs_externes.motDePasse
 * (cahier des charges 3.3.2 : "Les mots de passe devront etre haches a l'aide
 * de l'algorithme Argon2").
 */
async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, {
    type: argon2.argon2id,
    memoryCost: 19456, // ~19 MiB
    timeCost: 2,
    parallelism: 1,
  });
}

async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (err) {
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
