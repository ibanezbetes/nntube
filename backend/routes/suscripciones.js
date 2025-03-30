const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Verificar si un usuario está suscrito a otro
router.get('/verificar/:idSuscriptor/:idSuscrito', async (req, res) => {
  const { idSuscriptor, idSuscrito } = req.params;
  
  try {
    const result = await db.query(
      'SELECT * FROM suscripciones WHERE id_suscriptor = $1 AND id_suscrito = $2',
      [idSuscriptor, idSuscrito]
    );
    
    res.json({ suscrito: result.rows.length > 0 });
  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    res.status(500).json({ error: 'Error al verificar suscripción' });
  }
});

// Obtener la cantidad de suscriptores de un usuario
router.get('/cantidad/:idUsuario', async (req, res) => {
  const { idUsuario } = req.params;
  
  try {
    const result = await db.query(
      'SELECT COUNT(*) as cantidad FROM suscripciones WHERE id_suscrito = $1',
      [idUsuario]
    );
    
    res.json({ cantidad: parseInt(result.rows[0].cantidad) });
  } catch (error) {
    console.error('Error al obtener cantidad de suscriptores:', error);
    res.status(500).json({ error: 'Error al obtener cantidad de suscriptores' });
  }
});

// Suscribirse a un usuario
router.post('/', async (req, res) => {
  const { id_suscriptor, id_suscrito } = req.body;
  
  if (!id_suscriptor || !id_suscrito) {
    return res.status(400).json({ error: 'Los campos id_suscriptor e id_suscrito son obligatorios' });
  }
  
  if (id_suscriptor === id_suscrito) {
    return res.status(400).json({ error: 'No puedes suscribirte a ti mismo' });
  }
  
  try {
    // Verificar si ya existe la suscripción
    const checkResult = await db.query(
      'SELECT * FROM suscripciones WHERE id_suscriptor = $1 AND id_suscrito = $2',
      [id_suscriptor, id_suscrito]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Ya estás suscrito a este usuario' });
    }
    
    // Crear la suscripción
    await db.query(
      'INSERT INTO suscripciones (id_suscriptor, id_suscrito) VALUES ($1, $2)',
      [id_suscriptor, id_suscrito]
    );
    
    res.json({ success: true, message: 'Suscripción creada correctamente' });
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    res.status(500).json({ error: 'Error al crear suscripción' });
  }
});

// Cancelar suscripción
router.delete('/:idSuscriptor/:idSuscrito', async (req, res) => {
  const { idSuscriptor, idSuscrito } = req.params;
  
  try {
    const result = await db.query(
      'DELETE FROM suscripciones WHERE id_suscriptor = $1 AND id_suscrito = $2 RETURNING *',
      [idSuscriptor, idSuscrito]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró la suscripción' });
    }
    
    res.json({ success: true, message: 'Suscripción cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    res.status(500).json({ error: 'Error al cancelar suscripción' });
  }
});

module.exports = router;