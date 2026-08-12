const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, cs.nombre AS categoria_nombre
       FROM galeria g
       LEFT JOIN categoria_servicio cs ON cs.id = g.id_categoria
       ORDER BY g.orden, g.created_at DESC`
    );
    const categorias = await pool.query('SELECT id, nombre FROM categoria_servicio ORDER BY orden');
    res.render('galeria', { imagenes: result.rows, categorias: categorias.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { titulo, url_imagen, id_categoria, orden } = req.body;
  try {
    await pool.query(
      'INSERT INTO galeria (titulo, url_imagen, id_categoria, orden) VALUES ($1, $2, $3, $4)',
      [titulo || null, url_imagen, id_categoria || null, parseInt(orden) || 0]
    );
    res.redirect('/galeria');
  } catch (err) {
    console.error(err);
    res.redirect('/galeria');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM galeria WHERE id = $1', [req.params.id]);
    res.redirect('/galeria');
  } catch (err) {
    res.redirect('/galeria');
  }
});

module.exports = router;
