const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Endpoint para registrar o actualizar la valoración de un video
router.post('/', async (req, res) => {
    const { id_usuario, id_video, valoracion } = req.body;

    // Validar que se reciban todos los campos requeridos
    if (!id_usuario || !id_video || valoracion === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos: id_usuario, id_video y valoracion' });
    }

    // Validar que la valoración esté entre 1 y 5
    if (valoracion < 1 || valoracion > 5) {
        return res.status(400).json({ error: 'La valoración debe estar entre 1 y 5' });
    }

    try {
        // Verificar si ya existe una valoración para este usuario y video
        const checkResult = await db.query(
            'SELECT * FROM valoraciones WHERE id_usuario = $1 AND id_video = $2',
            [id_usuario, id_video]
        );

        if (checkResult.rows.length > 0) {
            // Si ya existe, actualizamos la valoración existente
            const updateResult = await db.query(
                'UPDATE valoraciones SET valoracion = $1 WHERE id_usuario = $2 AND id_video = $3 RETURNING *',
                [valoracion, id_usuario, id_video]
            );
            return res.status(200).json({ 
                message: 'Valoración actualizada correctamente', 
                rating: updateResult.rows[0] 
            });
        } else {
            // Insertar una nueva valoración
            const insertResult = await db.query(
                'INSERT INTO valoraciones (id_usuario, id_video, valoracion) VALUES ($1, $2, $3) RETURNING *',
                [id_usuario, id_video, valoracion]
            );
            return res.status(201).json({ 
                message: 'Valoración registrada correctamente', 
                rating: insertResult.rows[0] 
            });
        }
    } catch (error) {
        console.error('Error registrando la valoración:', error);
        return res.status(500).json({ error: 'Error registrando la valoración' });
    }
});

// Obtener la valoración promedio de un video
router.get('/video/:videoId/promedio', async (req, res) => {
    const { videoId } = req.params;
    
    try {
        const result = await db.query(
            'SELECT ROUND(AVG(valoracion)::numeric, 1) as promedio, COUNT(*) as total FROM valoraciones WHERE id_video = $1',
            [videoId]
        );
        
        res.json({
            promedio: result.rows[0].promedio || "0.0",
            total: parseInt(result.rows[0].total) || 0
        });
    } catch (error) {
        console.error('Error al obtener promedio de valoraciones:', error);
        res.status(500).json({ error: 'Error al obtener promedio de valoraciones' });
    }
});

// Obtener la valoración de un usuario específico para un video
router.get('/video/:videoId/usuario/:userId', async (req, res) => {
    const { videoId, userId } = req.params;
    
    try {
        const result = await db.query(
            'SELECT valoracion FROM valoraciones WHERE id_video = $1 AND id_usuario = $2',
            [videoId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.json({ valoracion: null });
        }
        
        res.json({ valoracion: result.rows[0].valoracion });
    } catch (error) {
        console.error('Error al obtener valoración de usuario:', error);
        res.status(500).json({ error: 'Error al obtener valoración de usuario' });
    }
});

// Obtener todas las valoraciones de un video
router.get('/video/:videoId', async (req, res) => {
    const { videoId } = req.params;
    
    try {
        const result = await db.query(
            `SELECT v.*, u.nombre_usuario 
             FROM valoraciones v
             JOIN usuarios u ON v.id_usuario = u.id_usuario
             WHERE v.id_video = $1
             ORDER BY v.id_usuario`,
            [videoId]
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener valoraciones:', error);
        res.status(500).json({ error: 'Error al obtener valoraciones' });
    }
});

// Eliminar una valoración
router.delete('/video/:videoId/usuario/:userId', async (req, res) => {
    const { videoId, userId } = req.params;
    
    try {
        const result = await db.query(
            'DELETE FROM valoraciones WHERE id_video = $1 AND id_usuario = $2 RETURNING *',
            [videoId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Valoración no encontrada' });
        }
        
        res.json({ message: 'Valoración eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar valoración:', error);
        res.status(500).json({ error: 'Error al eliminar valoración' });
    }
});

module.exports = router;