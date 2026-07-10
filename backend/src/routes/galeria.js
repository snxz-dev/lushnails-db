const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM galeria ORDER BY orden, created_at DESC');
    res.render('galeria', { imagenes: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { titulo, url_imagen, categoria, orden } = req.body;
  try {
    await pool.query(
      'INSERT INTO galeria (titulo, url_imagen, categoria, orden) VALUES ($1, $2, $3, $4)',
      [titulo || null, url_imagen, categoria || null, parseInt(orden) || 0]
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
