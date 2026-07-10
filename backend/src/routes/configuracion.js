const { Router } = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configuracion ORDER BY clave');
    res.render('configuracion', { configs: result.rows });
  } catch (err) {
    console.error(err);
    res.send('Error');
  }
});

router.post('/', requireAuth, async (req, res) => {
  const entries = Object.entries(req.body);
  if (entries.length === 0) return res.redirect('/configuracion');
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [clave, valor] of entries) {
        if (clave.startsWith('_')) continue;
        await client.query(
          'UPDATE configuracion SET valor = $1 WHERE clave = $2',
          [valor, clave]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.redirect('/configuracion');
  } catch (err) {
    console.error(err);
    res.redirect('/configuracion');
  }
});

module.exports = router;
