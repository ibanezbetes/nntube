const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL utilizando variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verificación inicial de la conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos PostgreSQL');
  release();
});

// Exportación de la función de consulta para su uso en otros módulos
module.exports = {
  query: (text, params) => pool.query(text, params),
};
