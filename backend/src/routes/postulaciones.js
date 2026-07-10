const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM postulacion ORDER BY fecha DESC');
    res.render('postulaciones', { postulaciones: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/:id/leida', requireAuth, async (req, res) => {
  try {
    await pool.query('UPDATE postulacion SET leida = true WHERE id = $1', [req.params.id]);
    res.redirect('/postulaciones');
  } catch (err) {
    res.redirect('/postulaciones');
  }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM postulacion WHERE id = $1', [req.params.id]);
    res.redirect('/postulaciones');
  } catch (err) {
    res.redirect('/postulaciones');
  }
});

module.exports = router;
