const { verifyToken } = require('../utils/token');

function authMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Falta el token de autenticación' });
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  req.user = decoded;
  next();
}

module.exports = authMiddleware;
