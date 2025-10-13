const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../db.json');

const getDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

exports.getPatients = (req, res) => {
  const db = getDb();
  res.json(db.patients);
};

exports.getPatientById = (req, res) => {
  const db = getDb();
  const patient = db.patients.find(p => p.id === req.params.id);
  if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
  res.json(patient);
};

exports.createPatient = (req, res) => {
  const db = getDb();
  const newPatient = {
    id: (db.patients.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.patients.push(newPatient);
  saveDb(db);
  res.status(201).json(newPatient);
};

exports.updatePatient = (req, res) => {
  const db = getDb();
  const index = db.patients.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Paciente no encontrado' });
  db.patients[index] = { ...db.patients[index], ...req.body, updatedAt: new Date().toISOString() };
  saveDb(db);
  res.json(db.patients[index]);
};

exports.deletePatient = (req, res) => {
  const db = getDb();
  db.patients = db.patients.filter(p => p.id !== req.params.id);
  saveDb(db);
  res.status(204).send();
};
