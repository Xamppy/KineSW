# Santiago Wanderers - Sistema de Gestión Clínica

Este proyecto es un sistema de gestión de fichas clínicas para el equipo de fútbol Santiago Wanderers.

## Requisitos

- Python 3.8 o superior
- Django 5.2.1
- PostgreSQL 12.0 o superior

## Instalación

1. Clonar el repositorio
2. Crear un entorno virtual:
   ```
   python -m venv venv_kine
   ```
3. Activar el entorno virtual:
   - Windows: `.\venv_kine\Scripts\activate`
   - Linux/Mac: `source venv_kine/bin/activate`
4. Instalar dependencias:
   ```
   pip install -r requirements.txt
   ```
5. Configurar la base de datos PostgreSQL:
   - Crear una base de datos llamada `santiagowanderers_db`
   - Crear un usuario `sw_kine_user` con la contraseña adecuada
   - Otorgar todos los permisos al usuario en la base de datos

6. Realizar migraciones:
   ```
   python manage.py migrate
   ```
7. Ejecutar el servidor de desarrollo:
   ```
   python manage.py runserver
   ```

## Estructura del proyecto

- `santiagowanderers_kine/`: Configuración principal del proyecto Django
- `gestion_clinica/`: Aplicación principal para la gestión de fichas clínicas 