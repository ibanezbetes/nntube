-- Estructura de Base de Datos para NTTube (Clon de YouTube simplificado)

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenia VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de géneros
CREATE TABLE generos (
    id_genero SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de videos
CREATE TABLE videos (
    id_video SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_genero INT REFERENCES generos(id_genero),
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    url_video TEXT NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS visitas INT DEFAULT 0;

-- Tabla de comentarios
CREATE TABLE comentarios (
    id_comentario SERIAL PRIMARY KEY,
    id_video INT REFERENCES videos(id_video) ON DELETE CASCADE,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de likes/dislikes de videos
CREATE TABLE likes_videos (
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_video INT REFERENCES videos(id_video) ON DELETE CASCADE,
    tipo BOOLEAN NOT NULL, -- TRUE = like, FALSE = dislike
    PRIMARY KEY (id_usuario, id_video)
);

-- Tabla de valoraciones (estrellas)
CREATE TABLE valoraciones (
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_video INT REFERENCES videos(id_video) ON DELETE CASCADE,
    valoracion INT CHECK (valoracion BETWEEN 1 AND 5),
    PRIMARY KEY (id_usuario, id_video)
);

-- Tabla de suscripciones entre usuarios
CREATE TABLE suscripciones (
    id_suscriptor INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_suscrito INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    PRIMARY KEY (id_suscriptor, id_suscrito),
    CHECK (id_suscriptor <> id_suscrito)
);

-- Tabla para registrar visualizaciones únicas por sesión
CREATE TABLE visualizaciones (
    id_visualizacion SERIAL PRIMARY KEY,
    id_video INT REFERENCES videos(id_video) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,  -- Para capturar la IP (opcional)
    fecha_visualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_video, session_id)  -- Restricción de unicidad para evitar duplicados
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_visualizaciones_video ON visualizaciones(id_video);
CREATE INDEX idx_visualizaciones_session ON visualizaciones(session_id);

-- Comentario explicativo
COMMENT ON TABLE visualizaciones IS 'Registra las visualizaciones únicas por sesión para cada video';
COMMENT ON COLUMN visualizaciones.session_id IS 'Identificador único de la sesión del usuario';
COMMENT ON COLUMN visualizaciones.ip_address IS 'Dirección IP del cliente (opcional, para análisis)';

-- Inserción de algunos géneros básicos
INSERT INTO generos (nombre) VALUES
('Musica'),
('Juegos'),
('Deportes'),
('Educacion'),
('Comedia'),
('Ciencia y tecnologia'),
('Noticias'),
('Entretenimiento'),
('Peliculas y series'),
('Animacion'),
('Cortometrajes'),
('Tutoriales'),
('Vlogs'),
('Estilo de vida'),
('Negocios y emprendimiento'),
('Desarrollo personal'),
('Motivacion'),
('Relaciones personales'),
('Cultura pop'),
('Criptomonedas y blockchain'),
('Videojuegos'),
('Cocina'),
('Viajes'),
('Salud y bienestar'),
('Arte y diseño'),
('Animales'),
('Documentales'),
('Familia y crianza'),
('Autos y vehiculos'),
('Moda y belleza'),
('Finanzas personales'),
('Historia'),
('Religion y espiritualidad');

-- Inserción de algunos usuarios de ejemplo
INSERT INTO usuarios (nombre_usuario, email, contrasenia) VALUES
('Admin', 'admin@ntt.com', 'admin'),
('Lazar', 'lazar@ntt.com', '1234'),
('Ibañez', 'ibanez@ntt.com', '1234'),
('Iñigo', 'inigo@ntt.com', '1234');


-- Inserción de algunos videos de ejemplo
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video) VALUES
(1, 1, 'Mi primer videoclip', 'Un tema musical original.', 'https://youtu.be/wZpOBmHTJho?si=1cHJcBGE2-8Jnokk'),
(2, 2, 'Gameplay épico', 'Jugando al mejor juego del año.', 'https://youtu.be/xWWINsWUt5E?si=kZMtPYTklZVysEqF'),
(3, 21, 'Tutorial de fútbol', 'Cómo hacer un buen pase.', 'https://youtu.be/_YOu_-c2BUM?si=RVSwGVu2kZ9qDPcj');

--Rellenar con mas ejemplos
