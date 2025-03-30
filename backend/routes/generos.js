const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los géneros
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM generos ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener géneros:', error);
    res.status(500).json({ error: 'Error al obtener géneros' });
  }
});

// Obtener un género por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM generos WHERE id_genero = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener género:', error);
    res.status(500).json({ error: 'Error al obtener género' });
  }
});

// Crear un nuevo género
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  
  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del género es obligatorio' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO generos (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear género:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Ya existe un género con ese nombre' });
    }
    
    res.status(500).json({ error: 'Error al crear género' });
  }
});

module.exports = router;