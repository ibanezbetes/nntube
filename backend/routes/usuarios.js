const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id_usuario, nombre_usuario, email, fecha_creacion FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT id_usuario, nombre_usuario, email, fecha_creacion FROM usuarios WHERE id_usuario = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre_usuario, email, contrasenia } = req.body;
  
  if (!nombre_usuario || !email || !contrasenia) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO usuarios (nombre_usuario, email, contrasenia) VALUES ($1, $2, $3) RETURNING *',
      [nombre_usuario, email, contrasenia]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, contrasenia } = req.body;
  
  if (!email || !contrasenia) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }
  
  try {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1 AND contrasenia = $2',
      [email, contrasenia]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    const usuario = result.rows[0];
    
    // Enviamos los datos del usuario (sin la contraseña)
    delete usuario.contrasenia;
    res.json(usuario);
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({ error: 'Error en inicio de sesión' });
  }
});

module.exports = router;