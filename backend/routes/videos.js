const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener videos por género
router.get('/genero/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT v.*, u.nombre_usuario, g.nombre as genero
       FROM videos v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       JOIN generos g ON v.id_genero = g.id_genero
       WHERE v.id_genero = $1
       ORDER BY v.fecha_subida DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener videos por género:', error);
    res.status(500).json({ error: 'Error al obtener videos por género' });
  }
});

// Obtener videos por usuario
router.get('/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Agregamos un conteo de comentarios para cada video
    const result = await db.query(
      `SELECT v.*, u.nombre_usuario, g.nombre as genero,
       (SELECT COUNT(*) FROM comentarios c WHERE c.id_video = v.id_video) as comentarios_count
       FROM videos v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       JOIN generos g ON v.id_genero = g.id_genero
       WHERE v.id_usuario = $1
       ORDER BY v.fecha_subida DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener videos por usuario:', error);
    res.status(500).json({ error: 'Error al obtener videos por usuario' });
  }
});

// Obtener todos los videos con información del usuario y género
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.*, u.nombre_usuario, g.nombre as genero
       FROM videos v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       JOIN generos g ON v.id_genero = g.id_genero
       ORDER BY v.fecha_subida DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({ error: 'Error al obtener videos' });
  }
});

// Obtener un video por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT v.*, u.nombre_usuario, g.nombre as genero
       FROM videos v
       JOIN usuarios u ON v.id_usuario = u.id_usuario
       JOIN generos g ON v.id_genero = g.id_genero
       WHERE v.id_video = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener video:', error);
    res.status(500).json({ error: 'Error al obtener video' });
  }
});

// Crear un nuevo video
router.post('/', async (req, res) => {
  const { id_usuario, id_genero, titulo, descripcion, url_video } = req.body;
  
  if (!id_usuario || !id_genero || !titulo || !url_video) {
    return res.status(400).json({ error: 'Los campos id_usuario, id_genero, titulo y url_video son obligatorios' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id_usuario, id_genero, titulo, descripcion, url_video]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear video:', error);
    res.status(500).json({ error: 'Error al crear video' });
  }
});

// Actualizar un video existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, url_video, id_genero } = req.body;
  
  if (!titulo || !url_video || !id_genero) {
    return res.status(400).json({ error: 'Los campos titulo, url_video e id_genero son obligatorios' });
  }
  
  try {
    // Primero verificamos que el video exista
    const checkVideo = await db.query('SELECT * FROM videos WHERE id_video = $1', [id]);
    
    if (checkVideo.rows.length === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    // Actualizamos el video
    const result = await db.query(
      'UPDATE videos SET titulo = $1, descripcion = $2, url_video = $3, id_genero = $4 WHERE id_video = $5 RETURNING *',
      [titulo, descripcion, url_video, id_genero, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar video:', error);
    res.status(500).json({ error: 'Error al actualizar video' });
  }
});

// Eliminar un video
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM videos WHERE id_video = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    res.json({ mensaje: 'Video eliminado correctamente', video: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({ error: 'Error al eliminar video' });
  }
});

// Incrementar visualizaciones de un video
router.post('/:id/visualizacion', async (req, res) => {
  const { id } = req.params;
  const { session_id } = req.body;
  
  // Validar que se proporcione un session_id
  if (!session_id) {
    return res.status(400).json({ error: 'Se requiere session_id para registrar visualización' });
  }
  
  try {
    // Iniciar una transacción
    await db.query('BEGIN');
    
    // Verificar si el video existe
    const videoCheck = await db.query('SELECT * FROM videos WHERE id_video = $1', [id]);
    
    if (videoCheck.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    // Obtener la IP del cliente (opcional)
    const ip_address = req.headers['x-forwarded-for'] || 
                       req.connection.remoteAddress ||
                       null;
    
    // Verificar si ya existe una visualización con este session_id para este video
    const visualizacionCheck = await db.query(
      'SELECT * FROM visualizaciones WHERE id_video = $1 AND session_id = $2',
      [id, session_id]
    );
    
    let visualizacionRegistrada = false;
    
    if (visualizacionCheck.rows.length === 0) {
      // Si no existe, insertar una nueva visualización
      await db.query(
        'INSERT INTO visualizaciones (id_video, session_id, ip_address) VALUES ($1, $2, $3)',
        [id, session_id, ip_address]
      );
      
      // Incrementar el contador de visualizaciones en la tabla videos
      await db.query(
        'UPDATE videos SET visitas = visitas + 1 WHERE id_video = $1',
        [id]
      );
      
      visualizacionRegistrada = true;
    }
    
    // Obtener el número actual de visualizaciones
    const resultado = await db.query(
      'SELECT visitas FROM videos WHERE id_video = $1',
      [id]
    );
    
    // Confirmar la transacción
    await db.query('COMMIT');
    
    // Enviar respuesta
    res.json({
      visitas: resultado.rows[0].visitas,
      nueva_visualizacion: visualizacionRegistrada
    });
    
  } catch (error) {
    // Si ocurre algún error, revertir la transacción
    await db.query('ROLLBACK');
    
    console.error('Error al registrar visualización:', error);
    res.status(500).json({ error: 'Error al registrar visualización' });
  }
});

// Endpoint para obtener estadísticas de visualizaciones de un video
router.get('/:id/estadisticas', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar si el video existe
    const videoCheck = await db.query('SELECT titulo FROM videos WHERE id_video = $1', [id]);
    
    if (videoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    // Obtener estadísticas generales
    const generalStats = await db.query(
      'SELECT visitas FROM videos WHERE id_video = $1',
      [id]
    );
    
    // Obtener estadísticas de visualizaciones por día (últimos 7 días)
    const dailyStats = await db.query(
      `SELECT 
        DATE(fecha_visualizacion) as fecha,
        COUNT(*) as visualizaciones
       FROM visualizaciones
       WHERE id_video = $1
       AND fecha_visualizacion >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(fecha_visualizacion)
       ORDER BY fecha DESC`,
      [id]
    );
    
    // Enviar respuesta
    res.json({
      video_id: id,
      titulo: videoCheck.rows[0].titulo,
      total_visitas: generalStats.rows[0].visitas,
      visualizaciones_diarias: dailyStats.rows
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas de visualizaciones' });
  }
});

module.exports = router;