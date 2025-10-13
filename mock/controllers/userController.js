const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../db.json');

const getDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

exports.getUsers = (req, res) => {
  const db = getDb();
  res.json(db.users);
};

exports.getUserById = (req, res) => {
  const db = getDb();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
};

exports.updateUser = (req, res) => {
  const db = getDb();
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Usuario no encontrado' });
  db.users[index] = { ...db.users[index], ...req.body, updatedAt: new Date().toISOString() };
  saveDb(db);
  res.json(db.users[index]);
};
