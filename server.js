// server.js

const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Secret para firmar tokens (en producción debe ser una variable de entorno)
const JWT_SECRET = 'doctorware-secret-key-2024';
const JWT_EXPIRES_IN = '1h';

// Función para generar JWT
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Habilitar CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// POST /api/auth/login
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email });

  const db = router.db;
  const user = db.get('users').find({ email }).value();

  if (!user) {
    console.log('❌ User not found');
    return res.status(404).json({ 
      message: 'Usuario no encontrado' 
    });
  }

  if (user.password !== password) {
    console.log('❌ Invalid password');
    return res.status(401).json({ 
      message: 'Contraseña incorrecta' 
    });
  }

  // Generar tokens JWT válidos
  const token = generateToken(user);
  const refreshToken = generateToken({ ...user, type: 'refresh' });

  const { password: _, ...userWithoutPassword } = user;

  console.log('✅ Login successful:', user.email);
  console.log('🎫 Token generated');

  res.status(200).json({
    token,
    refreshToken,
    user: userWithoutPassword,
    expiresIn: 3600
  });
});

// POST /api/auth/register
server.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, phone } = req.body;

  console.log('📝 Register attempt:', { email, role });

  const db = router.db;
  const existingUser = db.get('users').find({ email }).value();
  
  if (existingUser) {
    console.log('❌ Email already exists');
    return res.status(409).json({ 
      message: 'El email ya está registrado' 
    });
  }

  const newUser = {
    id: String(Date.now()),
    email,
    password,
    name,
    role: role || 'patient',
    status: 'active',
    phone: phone || '',
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.get('users').push(newUser).write();

  const token = generateToken(newUser);
  const refreshToken = generateToken({ ...newUser, type: 'refresh' });

  const { password: _, ...userWithoutPassword } = newUser;

  console.log('✅ Registration successful:', newUser.email);

  res.status(201).json({
    token,
    refreshToken,
    user: userWithoutPassword,
    expiresIn: 3600
  });
});

// POST /api/auth/refresh
server.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  console.log('🔄 Token refresh attempt');

  if (!refreshToken) {
    return res.status(400).json({ 
      message: 'Refresh token requerido' 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const db = router.db;
    const user = db.get('users').find({ id: decoded.sub }).value();

    if (!user) {
      return res.status(401).json({ 
        message: 'Token inválido' 
      });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateToken({ ...user, type: 'refresh' });

    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Token refreshed for:', user.email);

    res.status(200).json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: userWithoutPassword,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(401).json({ 
      message: 'Token inválido o expirado' 
    });
  }
});

// GET /api/auth/me
server.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      message: 'No autorizado' 
    });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    const db = router.db;
    const user = db.get('users').find({ id: decoded.sub }).value();

    if (!user) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Auth error:', error);
    return res.status(401).json({ 
      message: 'Token inválido' 
    });
  }
});

// POST /api/auth/forgot-password
server.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  console.log('🔑 Password reset requested for:', email);

  res.status(200).json({
    message: `Se ha enviado un correo de recuperación a ${email}`
  });
});

// POST /api/auth/reset-password
server.post('/api/auth/reset-password', (req, res) => {
  console.log('🔐 Password reset attempt');

  res.status(200).json({
    message: 'Contraseña actualizada correctamente'
  });
});

// GET /api/appointments
server.get('/api/appointments', (req, res) => {
  console.log('📋 Get appointments');
  
  const db = router.db;
  let appointments = db.get('appointments').value();

  // Filtrar por professionalId si se proporciona
  if (req.query.professionalId) {
    appointments = appointments.filter(a => a.professionalId === req.query.professionalId);
  }

  // Filtrar por fecha si se proporciona
  if (req.query.startDate) {
    const startDate = new Date(req.query.startDate);
    appointments = appointments.filter(a => new Date(a.date) >= startDate);
  }

  if (req.query.endDate) {
    const endDate = new Date(req.query.endDate);
    appointments = appointments.filter(a => new Date(a.date) <= endDate);
  }

  console.log(`✅ Returning ${appointments.length} appointments`);
  res.json(appointments);
});

// PUT /api/appointments/:id
server.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  console.log('✏️ Update appointment:', id);

  const db = router.db;
  const appointment = db.get('appointments').find({ id }).value();

  if (!appointment) {
    return res.status(404).json({ message: 'Turno no encontrado' });
  }

  const updated = { ...appointment, ...updates, updatedAt: new Date().toISOString() };
  db.get('appointments').find({ id }).assign(updated).write();

  console.log('✅ Appointment updated');
  res.json(updated);
});

// GET /api/patients
server.get('/api/patients', (req, res) => {
  console.log('👥 Get patients');
  
  const db = router.db;
  const patients = db.get('patients').value();

  console.log(`✅ Returning ${patients.length} patients`);
  res.json(patients);
});

// Reescribir rutas para agregar /api prefix
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}));

server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log('');
  console.log('🚀 Mock API Server corriendo en:');
  console.log(`   http://localhost:${PORT}`);
  console.log('');
  console.log('📚 Endpoints disponibles:');
  console.log('   POST   /api/auth/login');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/refresh');
  console.log('   GET    /api/auth/me');
  console.log('   POST   /api/auth/forgot-password');
  console.log('   POST   /api/auth/reset-password');
  console.log('');
  console.log('👥 Usuarios de prueba:');
  console.log('   doctor@test.com / 123456 (Profesional)');
  console.log('   secretaria@test.com / 123456 (Secretaria)');
  console.log('   paciente@test.com / 123456 (Paciente)');
  console.log('   admin@test.com / 123456 (Admin)');
  console.log('');
  console.log('🔑 JWT Secret:', JWT_SECRET);
  console.log('');
});