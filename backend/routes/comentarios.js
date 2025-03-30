const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener comentarios por video
router.get('/video/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT c.*, u.nombre_usuario
       FROM comentarios c
       JOIN usuarios u ON c.id_usuario = u.id_usuario
       WHERE c.id_video = $1
       ORDER BY c.fecha_comentario DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Crear un nuevo comentario
router.post('/', async (req, res) => {
  const { id_video, id_usuario, texto } = req.body;
  
  if (!id_video || !id_usuario || !texto) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO comentarios (id_video, id_usuario, texto) VALUES ($1, $2, $3) RETURNING *',
      [id_video, id_usuario, texto]
    );
    
    // Obtener el nombre de usuario para incluirlo en la respuesta
    const usuarioResult = await db.query(
      'SELECT nombre_usuario FROM usuarios WHERE id_usuario = $1',
      [id_usuario]
    );
    
    const comentario = {
      ...result.rows[0],
      nombre_usuario: usuarioResult.rows[0].nombre_usuario
    };
    
    res.status(201).json(comentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

// Eliminar un comentario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM comentarios WHERE id_comentario = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    
    res.json({ mensaje: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

module.exports = router;