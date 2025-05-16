# Instrucciones para configurar PostgreSQL

## Usando pgAdmin 4

1. Abre pgAdmin 4 (se instala con PostgreSQL)
2. Crea una nueva base de datos:
   - Haz clic derecho en "Databases" en el panel izquierdo
   - Selecciona "Create" > "Database..."
   - Nombre: santiagowanderers_db
   - Owner: postgres (o tu usuario principal)
   - Encoding: UTF8
   - Haz clic en "Save"

3. Crea un nuevo usuario (opcional):
   - Expande "Login/Group Roles"
   - Haz clic derecho y selecciona "Create" > "Login/Group Role..."
   - Pestaña General: Nombre: sw_kine_user
   - Pestaña Definition: Contraseña: password123 (o usa una contraseña más segura)
   - Pestaña Privileges: Activa "Can login?" y "Create database"
   - Haz clic en "Save"

4. Otorga permisos (opcional si usas el usuario postgres):
   - Haz clic derecho en la base de datos "santiagowanderers_db"
   - Selecciona "Properties"
   - Ve a la pestaña "Security"
   - Haz clic en "+" para añadir un privilegio
   - Selecciona "sw_kine_user" en "Grantee"
   - Marca todas las casillas en "Privileges"
   - Haz clic en "Save"

## Modificar settings.py

Una vez creada la base de datos, modifica el archivo `santiagowanderers_kine/settings.py`:

1. Comenta o elimina la configuración de SQLite
2. Descomenta la configuración de PostgreSQL
3. Actualiza los valores según tu configuración real:
   - USER: "postgres" (o el usuario que hayas creado)
   - PASSWORD: Reemplaza con tu contraseña real
   - Guarda el archivo

## Ejecutar migraciones

Una vez configurado todo, ejecuta:

```
python manage.py migrate
python manage.py createsuperuser
```

Esto creará las tablas necesarias en la base de datos PostgreSQL y un superusuario para el panel de administración. 