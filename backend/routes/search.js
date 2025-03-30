const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * Ruta de búsqueda de videos
 * Ejemplo de uso:
 * GET /api/search?q=palabraClave
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    // Si no se recibe un término de búsqueda, retornamos todos los videos
    if (!q || q.trim() === '') {
      const allVideos = await db.query(`
        SELECT v.*, u.nombre_usuario, g.nombre AS genero
        FROM videos v
        JOIN usuarios u ON v.id_usuario = u.id_usuario
        JOIN generos g ON v.id_genero = g.id_genero
        ORDER BY v.fecha_subida DESC
      `);
      return res.json(allVideos.rows);
    }

    // Búsqueda por coincidencia en título, descripción, nombre de usuario o género
    const searchTerm = `%${q.trim()}%`;
    const result = await db.query(`
      SELECT v.*, u.nombre_usuario, g.nombre AS genero
      FROM videos v
      JOIN usuarios u ON v.id_usuario = u.id_usuario
      JOIN generos g ON v.id_genero = g.id_genero
      WHERE 
        v.titulo ILIKE $1 OR
        v.descripcion ILIKE $1 OR
        u.nombre_usuario ILIKE $1 OR
        g.nombre ILIKE $1
      ORDER BY 
        CASE
          WHEN v.titulo ILIKE $1 THEN 1
          WHEN v.descripcion ILIKE $1 THEN 2
          WHEN g.nombre ILIKE $1 THEN 3
          WHEN u.nombre_usuario ILIKE $1 THEN 4
          ELSE 5
        END,
        v.fecha_subida DESC
    `, [searchTerm]);

    console.log(`Búsqueda por "${q}" retornó ${result.rows.length} resultados`);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error al realizar la búsqueda:', error);
    return res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
});

module.exports = router;