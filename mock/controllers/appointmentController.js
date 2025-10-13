const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../db.json');

const getDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

exports.getAppointments = (req, res) => {
  const db = getDb();
  res.json(db.appointments);
};

exports.getAppointmentById = (req, res) => {
  const db = getDb();
  const appointment = db.appointments.find(a => a.id === req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Turno no encontrado' });
  res.json(appointment);
};

exports.createAppointment = (req, res) => {
  const db = getDb();
  const newAppointment = {
    id: (db.appointments.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.appointments.push(newAppointment);
  saveDb(db);
  res.status(201).json(newAppointment);
};

exports.updateAppointment = (req, res) => {
  const db = getDb();
  const index = db.appointments.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Turno no encontrado' });
  db.appointments[index] = { ...db.appointments[index], ...req.body, updatedAt: new Date().toISOString() };
  saveDb(db);
  res.json(db.appointments[index]);
};

exports.deleteAppointment = (req, res) => {
  const db = getDb();
  db.appointments = db.appointments.filter(a => a.id !== req.params.id);
  saveDb(db);
  res.status(204).send();
};
