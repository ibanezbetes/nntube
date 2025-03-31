-- 1) ELIMINAR VIDEOS Y CATEGORÍAS EXISTENTES

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


-- Inserción de algunos usuarios de ejemplo
INSERT INTO usuarios (nombre_usuario, email, contrasenia) VALUES
('Admin', 'admin@ntt.com', 'admin'),
('Lazar', 'lazar@ntt.com', '1234'),
('Ibañez', 'ibanez@ntt.com', '1234'),
('Iñigo', 'inigo@ntt.com', '1234');



-- 2) INSERTAR LAS NUEVAS CATEGORÍAS
INSERT INTO generos (nombre) VALUES
('Connected & Data-driven : Automotive'),
('Digital Horizon: Banking'),
('NTT DATA Podcast'),
('NTT DATA Innovation Conference'),
('The Awakening of the Industries'),
('SHARE - The Awakening of Telco Industry'),
('CARE - The Awakening of Insurance Industry'),
('TRUST - The Awakening of Banking Industry');

-- 3) INSERTAR LOS NUEVOS VIDEOS ASOCIADOS A CADA CATEGORÍA
-- Connected & Data-driven : Automotive
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'Connected & Data-driven : Automotive'),
    'Connected & Data-driven : Automotive 1',
    'Video de la categoría Connected & Data-driven : Automotive',
    'https://youtu.be/sW_QzmzOiso?si=UtyENhwazq11ObhV'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'Connected & Data-driven : Automotive'),
    'Connected & Data-driven : Automotive 2',
    'Video de la categoría Connected & Data-driven : Automotive',
    'https://youtu.be/VIenEzXwAQk?si=OYkO8LOTDs-c4h-o');

-- Digital Horizon: Banking
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'Digital Horizon: Banking'),
    'Digital Horizon: Banking 1',
    'Video de la categoría Digital Horizon: Banking',
    'https://youtu.be/oqaTBiJc_Tc?si=M6YpZCfAd13AwOkA'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'Digital Horizon: Banking'),
    'Digital Horizon: Banking 2',
    'Video de la categoría Digital Horizon: Banking',
    'https://youtu.be/9zsUN0-o_po?si=bzFdAxgXhOQxU_LY'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'Digital Horizon: Banking'),
    'Digital Horizon: Banking 3',
    'Video de la categoría Digital Horizon: Banking',
    'https://youtu.be/bYJa5Go2rVI?si=5a60R9CvI7LuQIg8'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'Digital Horizon: Banking'),
    'Digital Horizon: Banking 4',
    'Video de la categoría Digital Horizon: Banking',
    'https://youtu.be/Sp_MKvPkjrs?si=uzkWWZalgYl7IFQX');

-- NTT DATA Podcast
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 1',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/Y-6KxHz7hEc?si=eyKhlVIywOQDSVlt'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 2',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/5N-xheeakR8?si=omk7jCMItnvtEx5g'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 3',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/RNR-pTzyygw?si=WJ4pvYLDemj-Qd6i'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 4',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/0ZaOFUziZ10?si=wk0tB2shfsnngmbw'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 5',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/cpEWubixkG8?si=3rjy0_fN4JPPcgS1'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 6',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/Oya1RNs1_rY?si=dSltX1hyrACiQuGs'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Podcast'),
    'NTT DATA Podcast 7',
    'Video de la categoría NTT DATA Podcast',
    'https://youtu.be/-kloPwT8lK0?si=vx7_n1z6xfLE11VC');

-- NTT DATA Innovation Conference
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Innovation Conference'),
    'NTT DATA Innovation Conference 1',
    'Video de la categoría NTT DATA Innovation Conference',
    'https://youtu.be/vXsjXrbOVtM?si=MnIpTCx0dWgMLRkZ'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Innovation Conference'),
    'NTT DATA Innovation Conference 2',
    'Video de la categoría NTT DATA Innovation Conference',
    'https://youtu.be/altdRYjQOC4?si=G1BvkirUythxAqqk'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Innovation Conference'),
    'NTT DATA Innovation Conference 3',
    'Video de la categoría NTT DATA Innovation Conference',
    'https://youtu.be/IjFQIcyOoos?si=Dr5M6bzgPzO-FKH4'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Innovation Conference'),
    'NTT DATA Innovation Conference 4',
    'Video de la categoría NTT DATA Innovation Conference',
    'https://youtu.be/azMffzvBbq8?si=hIpQyTwYTSVJT2I5'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Innovation Conference'),
    'NTT DATA Innovation Conference 5',
    'Video de la categoría NTT DATA Innovation Conference',
    'https://youtu.be/B-QpGNra7GU?si=MJS7q5ndk6Fq75H5'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'NTT DATA Innovation Conference'),
    'NTT DATA Innovation Conference 6',
    'Video de la categoría NTT DATA Innovation Conference',
    'https://youtu.be/7rgbTJtzeuI?si=iO5TDY46gRLkjGHM');

-- The Awakening of the Industries
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'The Awakening of the Industries'),
    'The Awakening of the Industries 1',
    'Video de la categoría The Awakening of the Industries',
    'https://www.youtube.com/watch?v=ZVyavJOd3hc&list=PLrrE6ni9HQ4zVYrAIOfsw1ZXln-LnwgBv'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'The Awakening of the Industries'),
    'The Awakening of the Industries 2',
    'Video de la categoría The Awakening of the Industries',
    'https://www.youtube.com/watch?v=Eh0F3o8e42c&list=PLrrE6ni9HQ4zVYrAIOfsw1ZXln-LnwgBv&index=2'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'The Awakening of the Industries'),
    'The Awakening of the Industries 3',
    'Video de la categoría The Awakening of the Industries',
    'https://www.youtube.com/watch?v=LMyU_gfvsdM&list=PLrrE6ni9HQ4zVYrAIOfsw1ZXln-LnwgBv&index=3'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'The Awakening of the Industries'),
    'The Awakening of the Industries 4',
    'Video de la categoría The Awakening of the Industries',
    'https://www.youtube.com/watch?v=dez6kXjhMhI&list=PLrrE6ni9HQ4zVYrAIOfsw1ZXln-LnwgBv&index=4'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'The Awakening of the Industries'),
    'The Awakening of the Industries 5',
    'Video de la categoría The Awakening of the Industries',
    'https://www.youtube.com/watch?v=lZHXKxDyLbw&list=PLrrE6ni9HQ4zVYrAIOfsw1ZXln-LnwgBv&index=5'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'The Awakening of the Industries'),
    'The Awakening of the Industries 6',
    'Video de la categoría The Awakening of the Industries',
    'https://www.youtube.com/watch?v=axmqWPFVFeo&list=PLrrE6ni9HQ4zVYrAIOfsw1ZXln-LnwgBv&index=6');

-- SHARE - The Awakening of Telco Industry
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'SHARE - The Awakening of Telco Industry'),
    'SHARE - Telco Industry 1',
    'Video de la categoría SHARE - The Awakening of Telco Industry',
    'https://www.youtube.com/watch?v=lZHXKxDyLbw&list=PLrrE6ni9HQ4xi2L2-EQcbI_PiVViu_uc8'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'SHARE - The Awakening of Telco Industry'),
    'SHARE - Telco Industry 2',
    'Video de la categoría SHARE - The Awakening of Telco Industry',
    'https://www.youtube.com/watch?v=_HmbgX_ylbo&list=PLrrE6ni9HQ4xi2L2-EQcbI_PiVViu_uc8&index=2'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'SHARE - The Awakening of Telco Industry'),
    'SHARE - Telco Industry 3',
    'Video de la categoría SHARE - The Awakening of Telco Industry',
    'https://www.youtube.com/watch?v=uqyrqbLwecE&list=PLrrE6ni9HQ4xi2L2-EQcbI_PiVViu_uc8&index=3'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'SHARE - The Awakening of Telco Industry'),
    'SHARE - Telco Industry 4',
    'Video de la categoría SHARE - The Awakening of Telco Industry',
    'https://www.youtube.com/watch?v=cWN2irCKoIg&list=PLrrE6ni9HQ4xi2L2-EQcbI_PiVViu_uc8&index=4'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'SHARE - The Awakening of Telco Industry'),
    'SHARE - Telco Industry 5',
    'Video de la categoría SHARE - The Awakening of Telco Industry',
    'https://www.youtube.com/watch?v=UX6PO8Ls9TU&list=PLrrE6ni9HQ4xi2L2-EQcbI_PiVViu_uc8&index=5'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'SHARE - The Awakening of Telco Industry'),
    'SHARE - Telco Industry 6',
    'Video de la categoría SHARE - The Awakening of Telco Industry',
    'https://www.youtube.com/watch?v=77EZNbXB60w&list=PLrrE6ni9HQ4xi2L2-EQcbI_PiVViu_uc8&index=6');

-- CARE - The Awakening of Insurance Industry
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 1',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=axmqWPFVFeo&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 2',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=0vaWbUiKCCU&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd&index=2'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 3',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=RFNYgDsia0w&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd&index=3'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 4',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=Kg2tBB1yHDk&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd&index=4'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 5',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=hAnih2uf2E4&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd&index=5'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 6',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=uc-VlmijeLk&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd&index=6'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'CARE - The Awakening of Insurance Industry'),
    'CARE - Insurance Industry 7',
    'Video de la categoría CARE - The Awakening of Insurance Industry',
    'https://www.youtube.com/watch?v=YdNIpe988gk&list=PLrrE6ni9HQ4wpmtX8UAvg_ruu1Bt23BRd&index=7');

-- TRUST - The Awakening of Banking Industry
INSERT INTO videos (id_usuario, id_genero, titulo, descripcion, url_video)
VALUES
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 1',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=dez6kXjhMhI&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 2',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=f3FmFWaqP84&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO&index=2'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 3',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=NRJtnFZAUGM&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO&index=3'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 4',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=L0buvo_gxsE&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO&index=4'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 5',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=DrcQlsqV6UI&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO&index=5'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 6',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=rOybARicNGw&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO&index=6'),
(1, (SELECT id_genero FROM generos WHERE nombre = 'TRUST - The Awakening of Banking Industry'),
    'TRUST - Banking Industry 7',
    'Video de la categoría TRUST - The Awakening of Banking Industry',
    'https://www.youtube.com/watch?v=pAceVmqJa7k&list=PLrrE6ni9HQ4zfahKI_peIroNYaMftpMnO&index=7');