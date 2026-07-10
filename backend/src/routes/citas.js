const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_citas_completas ORDER BY fecha DESC, hora DESC');
    res.render('citas', { citas: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/:id/estado', requireAuth, async (req, res) => {
  const { estado } = req.body;
  try {
    await pool.query("UPDATE cita SET estado = $1 WHERE id = $2", [estado, req.params.id]);
    res.redirect('/citas');
  } catch (err) {
    res.redirect('/citas');
  }
});

module.exports = router;
