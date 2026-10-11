-- =====================================================================
-- Agenda Ya · Base de datos del PMV (MySQL 8 / MariaDB 10.6 o superior)
-- Proyecto productivo · Tecnólogo en ADSO · Ficha 2879633
-- Ejecuta este archivo completo en MySQL Workbench, phpMyAdmin o la consola:
--   mysql -u root -p < agendaya_bd.sql
-- ¡Cuidado! Borra y vuelve a crear las tablas: úsalo solo en desarrollo.
-- =====================================================================

SET NAMES utf8mb4;   -- para que las tildes y la ñ se guarden bien

CREATE DATABASE IF NOT EXISTS agendaya
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agendaya;

-- Se borran en orden inverso a las llaves foráneas
DROP TABLE IF EXISTS citas;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS servicios;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

-- ---------------------------------------------------------------------
-- 1. USUARIOS: una sola tabla para usuario y administrador (campo rol).
--    Así el inicio de sesión es uno solo y "permite el acceso según el rol" (HU3).
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombres           VARCHAR(80)  NOT NULL,
  apellidos         VARCHAR(80)  NOT NULL,
  email             VARCHAR(120) NOT NULL,
  telefono          VARCHAR(20)  NULL,
  fecha_nacimiento  DATE         NULL,
  clave_hash        VARCHAR(255) NOT NULL,          -- nunca la contraseña en texto plano
  rol               ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_usuarios_email UNIQUE (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. CATEGORÍAS: Médicos, Belleza, Deportes, Odontología, Veterinaria
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id_categoria  SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(60) NOT NULL,
  CONSTRAINT uq_categorias_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. SERVICIOS (HU5, HU6)
-- ---------------------------------------------------------------------
CREATE TABLE servicios (
  id_servicio      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_categoria     SMALLINT UNSIGNED NOT NULL,
  nombre           VARCHAR(100) NOT NULL,
  descripcion      VARCHAR(500) NULL,
  profesional      VARCHAR(120) NULL,
  establecimiento  VARCHAR(120) NULL,
  ciudad           VARCHAR(80)  NULL,
  precio           DECIMAL(10,2) NULL,              -- NULL mientras no esté definido
  duracion_min     SMALLINT UNSIGNED NOT NULL,
  activo           TINYINT(1)   NOT NULL DEFAULT 1,  -- solo los activos se pueden agendar
  id_admin         INT UNSIGNED NULL,               -- quién lo registró
  CONSTRAINT fk_servicios_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  CONSTRAINT fk_servicios_admin     FOREIGN KEY (id_admin)     REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  CONSTRAINT ck_servicios_duracion  CHECK (duracion_min > 0),
  CONSTRAINT ck_servicios_precio    CHECK (precio IS NULL OR precio >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. HORARIOS: cada fila es una franja que se puede reservar (HU7, HU13)
-- ---------------------------------------------------------------------
CREATE TABLE horarios (
  id_horario   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_servicio  INT UNSIGNED NOT NULL,
  fecha        DATE NOT NULL,
  hora_inicio  TIME NOT NULL,
  hora_fin     TIME NOT NULL,
  estado       ENUM('disponible','reservado','bloqueado') NOT NULL DEFAULT 'disponible',
  CONSTRAINT fk_horarios_servicio FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE,
  CONSTRAINT ck_horarios_horas    CHECK (hora_fin > hora_inicio),
  CONSTRAINT uq_horarios_franja   UNIQUE (id_servicio, fecha, hora_inicio),   -- no repite la misma franja
  INDEX ix_horarios_busqueda (id_servicio, fecha, estado)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. CITAS (HU8 a HU12). La fecha, la hora y el servicio se obtienen del horario:
--    así no hay datos repetidos que se puedan contradecir (3FN).
-- ---------------------------------------------------------------------
CREATE TABLE citas (
  id_cita         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT UNSIGNED NOT NULL,
  id_horario      INT UNSIGNED NOT NULL,
  estado          ENUM('pendiente','confirmada','cancelada','atendida') NOT NULL DEFAULT 'pendiente',
  observaciones   VARCHAR(500) NULL,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_citas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_citas_horario FOREIGN KEY (id_horario) REFERENCES horarios(id_horario),
  INDEX ix_citas_usuario (id_usuario, estado)
) ENGINE=InnoDB;

-- =====================================================================
-- DATOS DE PRUEBA (ficticios)
-- Contraseña de los dos usuarios de prueba: AgendaYa2026*
-- =====================================================================
INSERT INTO usuarios (nombres, apellidos, email, telefono, clave_hash, rol) VALUES
 ('Admin',  'Agenda Ya', 'admin@agendaya.test',   NULL, '$2b$10$5aTlAD.K2wJULxIH0BDf/uE3BcOD9r2eOgStyZKYhSXISl3EXEPn.', 'admin'),
 ('Usuaria','De Prueba', 'usuario@agendaya.test', NULL, '$2b$10$5aTlAD.K2wJULxIH0BDf/uE3BcOD9r2eOgStyZKYhSXISl3EXEPn.', 'usuario');

INSERT INTO categorias (nombre) VALUES
 ('Médicos'), ('Belleza'), ('Deportes'), ('Odontología'), ('Veterinaria');

INSERT INTO servicios (id_categoria, nombre, descripcion, profesional, establecimiento, duracion_min, id_admin) VALUES
 (1, 'Consulta médica',            'Consulta de medicina general.',        'Dr. Carlos Pérez', 'Clínica Salud Vida',      30, 1),
 (2, 'Corte de cabello',           'Corte y peinado.',                     NULL,               'Salón Bella Estilo',      45, 1),
 (3, 'Entrenamiento funcional',    'Clase personalizada de 1 hora.',       NULL,               'Centro Deportivo Activa', 60, 1),
 (4, 'Limpieza dental',            'Profilaxis y revisión general.',       NULL,               'Odontología Sonrisa',     30, 1),
 (5, 'Control veterinario',        'Revisión general de tu mascota.',      NULL,               'Veterinaria Patitas',     30, 1);

-- Franjas de lunes a viernes, durante los próximos 14 días, de 8:00 a. m. a 4:00 p. m.
-- (una cada hora, sin la franja de las 12:00). Se calculan desde la fecha de hoy.
INSERT INTO horarios (id_servicio, fecha, hora_inicio, hora_fin)
SELECT s.id_servicio,
       DATE_ADD(CURDATE(), INTERVAL d.n DAY)                        AS fecha,
       MAKETIME(h.hora, 0, 0)                                        AS hora_inicio,
       ADDTIME(MAKETIME(h.hora, 0, 0), SEC_TO_TIME(s.duracion_min * 60)) AS hora_fin
FROM servicios s
CROSS JOIN (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
            UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
            UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14) d
CROSS JOIN (SELECT 8 hora UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11
            UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16) h
WHERE DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL d.n DAY)) BETWEEN 2 AND 6;   -- 2 = lunes ... 6 = viernes

-- Consulta de verificación: franjas disponibles por servicio
SELECT s.nombre AS servicio, COUNT(*) AS franjas_disponibles
FROM horarios h JOIN servicios s ON s.id_servicio = h.id_servicio
WHERE h.estado = 'disponible'
GROUP BY s.nombre;

-- =====================================================================
-- OPCIONAL (recomendado): usuario de MySQL solo para la aplicación,
-- con permisos limitados. Cambia la contraseña y ponla en tu archivo .env.
-- =====================================================================
-- CREATE USER IF NOT EXISTS 'agendaya_app'@'localhost' IDENTIFIED BY 'cambia_esta_clave';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON agendaya.* TO 'agendaya_app'@'localhost';
-- FLUSH PRIVILEGES;