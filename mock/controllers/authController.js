const fs = require('fs');
const path = require('path');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/token');

const dbPath = path.join(__dirname, '../../db.json');
const getUsers = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8')).users;
const saveUsers = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

exports.login = (req, res) => {
  const { email, password } = req.body;
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return res.json({ token, refreshToken, user });
};

exports.register = (req, res) => {
  const { email, password, name, role } = req.body;
  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ message: 'El correo ya está registrado' });
  }

  const newUser = {
    id: (users.length + 1).toString(),
    email,
    password,
    name,
    role: role || 'patient',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers({ ...JSON.parse(fs.readFileSync(dbPath)), users });

  const token = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  res.status(201).json({ token, refreshToken, user: newUser });
};

exports.me = (req, res) => {
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

exports.refresh = (req, res) => {
  const { refreshToken } = req.body;
  const decoded = verifyToken(refreshToken);
  if (!decoded) return res.status(401).json({ message: 'Refresh token inválido o expirado' });

  const users = getUsers();
  const user = users.find((u) => u.id === decoded.sub);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const newToken = generateAccessToken(user);
  const newRefresh = generateRefreshToken(user);

  res.json({ token: newToken, refreshToken: newRefresh, user });
};
