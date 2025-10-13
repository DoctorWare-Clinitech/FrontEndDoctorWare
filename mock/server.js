const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const path = require('path');
const authMiddleware = require('./middleware/auth');
const roleGuard = require('./middleware/roleGuard');
const authController = require('./controllers/authController');
const appointmentController = require('./controllers/appointmentController');
const patientController = require('./controllers/patientController');
const userController = require('./controllers/userController');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(bodyParser.json());

// 🔐 Auth Routes
server.post('/auth/login', authController.login);
server.post('/auth/register', authController.register);
server.get('/auth/me', authMiddleware, authController.me);
server.post('/auth/refresh', authController.refresh);

// 📅 Appointments
server.get('/appointments', authMiddleware, roleGuard(['professional', 'secretary', 'admin']), appointmentController.getAppointments);
server.get('/appointments/:id', authMiddleware, appointmentController.getAppointmentById);
server.post('/appointments', authMiddleware, roleGuard(['professional', 'secretary']), appointmentController.createAppointment);
server.put('/appointments/:id', authMiddleware, appointmentController.updateAppointment);
server.delete('/appointments/:id', authMiddleware, roleGuard(['admin']), appointmentController.deleteAppointment);

// 👨‍⚕️ Patients
server.get('/patients', authMiddleware, roleGuard(['professional', 'secretary', 'admin']), patientController.getPatients);
server.get('/patients/:id', authMiddleware, patientController.getPatientById);
server.post('/patients', authMiddleware, roleGuard(['professional', 'secretary']), patientController.createPatient);
server.put('/patients/:id', authMiddleware, patientController.updatePatient);
server.delete('/patients/:id', authMiddleware, roleGuard(['admin']), patientController.deletePatient);

// 👥 Users
server.get('/users', authMiddleware, roleGuard(['admin']), userController.getUsers);
server.get('/users/:id', authMiddleware, roleGuard(['admin']), userController.getUserById);
server.put('/users/:id', authMiddleware, roleGuard(['admin']), userController.updateUser);

// 📦 Fallback JSON Server
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Mock API (DoctorWare) running on http://localhost:${PORT}`);
});
