const jwt = require('jsonwebtoken');

const SECRET_KEY = 'doctorware_mock_secret';
const TOKEN_EXPIRATION = '1h';
const REFRESH_EXPIRATION = '7d';

exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    SECRET_KEY,
    { expiresIn: TOKEN_EXPIRATION }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign({ sub: user.id }, SECRET_KEY, { expiresIn: REFRESH_EXPIRATION });
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};
