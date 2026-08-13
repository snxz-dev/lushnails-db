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

router.post('/clear-test-data', requireAuth, async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Only remove test data: citas and clientes
      await client.query('DELETE FROM cita_servicio');
      await client.query('DELETE FROM servicio_realizado');
      await client.query('DELETE FROM cita');
      await client.query('DELETE FROM cliente');
      await client.query('COMMIT');
      res.render('configuracion', { configs: (await pool.query('SELECT * FROM configuracion ORDER BY clave')).rows, message: 'Datos de prueba eliminados.' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error clearing test data:', e);
      res.render('configuracion', { configs: (await pool.query('SELECT * FROM configuracion ORDER BY clave')).rows, error: 'Error al eliminar datos de prueba' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.redirect('/configuracion');
  }
});

module.exports = router;
