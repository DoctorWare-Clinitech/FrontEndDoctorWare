// server.js - Mock API Server con autenticación

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Habilitar CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ==============================================
// RUTAS DE AUTENTICACIÓN CUSTOM
// ==============================================

// POST /api/auth/login
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email });

  // Buscar usuario en la base de datos
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

  // Generar token mock (en producción usarías JWT real)
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

  // Remover password de la respuesta
  const { password: _, ...userWithoutPassword } = user;

  console.log('✅ Login successful:', user.email);

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
  
  // Verificar si el email ya existe
  const existingUser = db.get('users').find({ email }).value();
  
  if (existingUser) {
    console.log('❌ Email already exists');
    return res.status(409).json({ 
      message: 'El email ya está registrado' 
    });
  }

  // Crear nuevo usuario
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

  // Guardar en la base de datos
  db.get('users').push(newUser).write();

  // Generar tokens
  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${newUser.id}-${Date.now()}`;

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

  // Extraer user ID del refresh token mock
  const userId = refreshToken.split('-')[3];
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();

  if (!user) {
    return res.status(401).json({ 
      message: 'Token inválido' 
    });
  }

  const newToken = `mock-jwt-token-${user.id}-${Date.now()}`;
  const newRefreshToken = `mock-refresh-token-${user.id}-${Date.now()}`;

  const { password: _, ...userWithoutPassword } = user;

  console.log('✅ Token refreshed for:', user.email);

  res.status(200).json({
    token: newToken,
    refreshToken: newRefreshToken,
    user: userWithoutPassword,
    expiresIn: 3600
  });
});

// GET /api/auth/me
server.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      message: 'No autorizado' 
    });
  }

  // Extraer user ID del token mock
  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('-')[3];

  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();

  if (!user) {
    return res.status(401).json({ 
      message: 'Token inválido' 
    });
  }

  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json(userWithoutPassword);
});

// POST /api/auth/forgot-password
server.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;

  console.log('🔑 Password reset requested for:', email);

  const db = router.db;
  const user = db.get('users').find({ email }).value();

  if (!user) {
    // Por seguridad, responder siempre lo mismo
    console.log('⚠️ Email not found, but responding success');
  }

  res.status(200).json({
    message: `Se ha enviado un correo de recuperación a ${email}`
  });
});

// POST /api/auth/reset-password
server.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  console.log('🔐 Password reset attempt with token');

  // En un sistema real, verificarías el token
  res.status(200).json({
    message: 'Contraseña actualizada correctamente'
  });
});

// ==============================================
// USAR ROUTER POR DEFECTO PARA OTRAS RUTAS
// ==============================================

// Reescribir rutas para agregar /api prefix
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}));

server.use(router);

// ==============================================
// INICIAR SERVIDOR
// ==============================================

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
  console.log('   GET    /api/users');
  console.log('   GET    /api/appointments');
  console.log('   GET    /api/patients');
  console.log('');
  console.log('👥 Usuarios de prueba:');
  console.log('   doctor@test.com / 123456 (Profesional)');
  console.log('   secretaria@test.com / 123456 (Secretaria)');
  console.log('   paciente@test.com / 123456 (Paciente)');
  console.log('   admin@test.com / 123456 (Admin)');
  console.log('');
});