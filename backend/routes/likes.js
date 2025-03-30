const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener el estado de like/dislike de un usuario para un video
router.get('/video/:videoId/usuario/:userId', async (req, res) => {
  const { videoId, userId } = req.params;
  
  try {
    const result = await db.query(
      'SELECT tipo FROM likes_videos WHERE id_video = $1 AND id_usuario = $2',
      [videoId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ like: null }); // El usuario no ha dado like ni dislike
    }
    
    res.json({ like: result.rows[0].tipo }); // true = like, false = dislike
  } catch (error) {
    console.error('Error al obtener estado de like:', error);
    res.status(500).json({ error: 'Error al obtener estado de like' });
  }
});

// Obtener la cantidad de likes y dislikes de un video
router.get('/video/:id/count', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Contar likes (tipo = true)
    const likesResult = await db.query(
      'SELECT COUNT(*) as likes FROM likes_videos WHERE id_video = $1 AND tipo = true',
      [id]
    );
    
    // Contar dislikes (tipo = false)
    const dislikesResult = await db.query(
      'SELECT COUNT(*) as dislikes FROM likes_videos WHERE id_video = $1 AND tipo = false',
      [id]
    );
    
    res.json({
      likes: parseInt(likesResult.rows[0].likes),
      dislikes: parseInt(dislikesResult.rows[0].dislikes)
    });
  } catch (error) {
    console.error('Error al obtener conteo de likes/dislikes:', error);
    res.status(500).json({ error: 'Error al obtener conteo de likes/dislikes' });
  }
});

// Dar like o dislike a un video
router.post('/', async (req, res) => {
  const { id_usuario, id_video, tipo } = req.body;
  
  if (!id_usuario || !id_video || tipo === undefined) {
    return res.status(400).json({ error: 'Los campos id_usuario, id_video y tipo son obligatorios' });
  }
  
  try {
    // Verificar si ya existe un like/dislike de este usuario para este video
    const checkResult = await db.query(
      'SELECT * FROM likes_videos WHERE id_usuario = $1 AND id_video = $2',
      [id_usuario, id_video]
    );
    
    if (checkResult.rows.length > 0) {
      // Si ya existe, actualizar el tipo
      await db.query(
        'UPDATE likes_videos SET tipo = $1 WHERE id_usuario = $2 AND id_video = $3',
        [tipo, id_usuario, id_video]
      );
    } else {
      // Si no existe, crear uno nuevo
      await db.query(
        'INSERT INTO likes_videos (id_usuario, id_video, tipo) VALUES ($1, $2, $3)',
        [id_usuario, id_video, tipo]
      );
    }
    
    res.json({ success: true, message: 'Like/dislike guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar like/dislike:', error);
    res.status(500).json({ error: 'Error al guardar like/dislike' });
  }
});

// Eliminar like o dislike de un video
router.delete('/video/:videoId/usuario/:userId', async (req, res) => {
  const { videoId, userId } = req.params;
  
  try {
    const result = await db.query(
      'DELETE FROM likes_videos WHERE id_video = $1 AND id_usuario = $2 RETURNING *',
      [videoId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró ningún like/dislike para eliminar' });
    }
    
    res.json({ success: true, message: 'Like/dislike eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar like/dislike:', error);
    res.status(500).json({ error: 'Error al eliminar like/dislike' });
  }
});

module.exports = router;