-- Crear base de datos
CREATE DATABASE santiagowanderers_db WITH ENCODING 'UTF8' LC_COLLATE 'Spanish_Spain.1252' LC_CTYPE 'Spanish_Spain.1252';

-- Crear usuario
CREATE USER sw_kine_user WITH PASSWORD 'password123';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE santiagowanderers_db TO sw_kine_user; 