const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('./config/db');
const { requireRole, cargarPermisos } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const serviciosRoutes = require('./routes/servicios');
const sucursalesRoutes = require('./routes/sucursales');
const citasRoutes = require('./routes/citas');
const postulacionesRoutes = require('./routes/postulaciones');
const galeriaRoutes = require('./routes/galeria');
const configRoutes = require('./routes/configuracion');
const apiRoutes = require('./routes/api');
const bscRoutes = require('./routes/bsc');
const tableroRoutes = require('./routes/tablero');
const proveedoresRoutes = require('./routes/proveedores');
const aliadosRoutes = require('./routes/aliados');
const rolesRoutes = require('./routes/roles');
const clientesRoutes = require('./routes/clientes');
const empleadosRoutes = require('./routes/empleados');
const historialRoutes = require('./routes/historial');
const comunicacionRoutes = require('./routes/comunicacion');

const app = express();
const PORT = process.env.ADMIN_PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionMiddleware = session({
  store: new pgSession({ pool }),
  secret: process.env.SESSION_SECRET || 'demo-session-7c9L-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
});

app.use(sessionMiddleware);

app.use('/', cargarPermisos);
app.use('/', requireRole);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.path = req.path;
  next();
});

app.use('/', authRoutes);
app.use('/', dashboardRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/sucursales', sucursalesRoutes);
app.use('/citas', citasRoutes);
app.use('/postulaciones', postulacionesRoutes);
app.use('/galeria', galeriaRoutes);
app.use((req, res, next) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  const requestOrigin = req.headers.origin;
  const allowAll = allowedOrigins.includes('*');

  if (allowAll) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/configuracion', configRoutes);
app.use('/bsc', bscRoutes);
app.use('/tablero', tableroRoutes);
app.use('/api', apiRoutes);
app.use('/proveedores', proveedoresRoutes);
app.use('/roles', rolesRoutes);
app.use('/clientes', clientesRoutes);
app.use('/aliados', aliadosRoutes);
app.use('/empleados', empleadosRoutes);
app.use('/historial', historialRoutes);
app.use('/comunicacion', comunicacionRoutes);

const server = http.createServer(app);
const io = new Server(server);

// Compartir sesión con Socket.io
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
  const req = socket.request;
  const userId = req.session?.userId;
  
  if (userId) {
    // El usuario se une a una sala personal con su ID
    socket.join(`user_${userId}`);
    
    socket.on('sendMessage', async (data) => {
      try {
        const { toUserId, text } = data;
        if (!text || !toUserId) return;
        
        // Guardar mensaje en base de datos
        const result = await pool.query(
          `INSERT INTO mensaje (remitente_id, destinatario_id, contenido) 
           VALUES ($1, $2, $3) RETURNING id, remitente_id, destinatario_id, contenido, created_at`,
          [userId, toUserId, text]
        );
        const newMsg = result.rows[0];
        
        // Enviar a destinatario
        io.to(`user_${toUserId}`).emit('receiveMessage', newMsg);
        
        // Enviar a remitente (confirmación)
        io.to(`user_${userId}`).emit('receiveMessage', newMsg);
      } catch (err) {
        console.error('Socket.io sendMessage error:', err);
      }
    });
  }
});

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Panel admin: http://localhost:${PORT}`);
  });
}

module.exports = { app, server };
