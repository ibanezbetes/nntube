// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');
const videosRoutes = require('./routes/videos');
const generosRoutes = require('./routes/generos');
const comentariosRoutes = require('./routes/comentarios');
const likesRoutes = require('./routes/likes');
const suscripcionesRoutes = require('./routes/suscripciones');
const searchRoutes = require('./routes/search');
const valoracionesRoutes = require('./routes/valoraciones');

const app = express();
const PORT = process.env.PORT || 3007;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/generos', generosRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/suscripciones', suscripcionesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/valoraciones', valoracionesRoutes);

// Ruta de inicio
app.get('/', (req, res) => {
  res.redirect('http://127.0.0.1:3001/frontend/index.html');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
