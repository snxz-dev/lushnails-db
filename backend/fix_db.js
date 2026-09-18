const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

// Forzar la conexión a Neon (en caso de que localmente haya otra)
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(poolConfig);

async function fixDb() {
  try {
    console.log('🔗 Conectando a Neon...');
    
    // 1. Borrar todos los usuarios EXCEPTO demo-admin
    console.log('🧹 Limpiando usuarios extra...');
    const delResult = await pool.query(
      "DELETE FROM usuario_admin WHERE email != 'demo-admin@lushnails.example'"
    );
    console.log(`✅ Se eliminaron ${delResult.rowCount} usuarios extra.`);

    // 2. Hashear la contraseña con el mismo bcrypt que usa Node.js
    console.log('🔐 Generando nuevo hash para demo-admin...');
    const newPassword = 'DemoAdmin_7c9L_2026';
    const hash = await bcrypt.hash(newPassword, 10);
    
    // 3. Actualizar la contraseña del demo-admin
    console.log('💾 Actualizando contraseña en base de datos...');
    const upResult = await pool.query(
      "UPDATE usuario_admin SET password_hash = $1 WHERE email = 'demo-admin@lushnails.example'",
      [hash]
    );
    
    if (upResult.rowCount > 0) {
      console.log('✅ Contraseña de demo-admin restablecida exitosamente.');
      console.log('👉 Ahora puedes iniciar sesión con:');
      console.log('   Email: demo-admin@lushnails.example');
      console.log('   Pass:  DemoAdmin_7c9L_2026');
    } else {
      console.log('❌ No se encontró el usuario demo-admin@lushnails.example. ¿Fue borrado?');
    }

  } catch (err) {
    console.error('❌ Error en el script:', err);
  } finally {
    await pool.end();
  }
}

fixDb();
