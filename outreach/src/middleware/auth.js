const bcrypt = require('bcrypt');

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/login');
}

async function verifyPassword(password) {
  const hash = process.env.MASTER_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

module.exports = { requireAuth, verifyPassword };
