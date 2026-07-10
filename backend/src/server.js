const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('./config/db');
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

const app = express();
const PORT = process.env.ADMIN_PORT || 4000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  store: new pgSession({ pool }),
  secret: process.env.SESSION_SECRET || 'cambiar-clave',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/configuracion', configRoutes);
app.use('/bsc', bscRoutes);
app.use('/tablero', tableroRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Panel admin: http://localhost:${PORT}`);
});
