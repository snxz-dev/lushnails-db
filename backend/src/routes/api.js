const { Router } = require('express');
const pool = require('../config/db');

const router = Router();

router.post('/postular', async (req, res) => {
  const { nombre, correo, telefono } = req.body;
  if (!nombre || !correo || !telefono) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    await pool.query(
      'INSERT INTO postulacion (nombre, correo, telefono) VALUES ($1, $2, $3)',
      [nombre, correo, telefono]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error al guardar postulación:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
