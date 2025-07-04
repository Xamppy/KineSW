# Generated by Django 5.2.1 on 2025-06-27 00:57

from django.db import migrations

def asignar_admin_inicial(apps, schema_editor):
    """
    Asignar rol de administrador al usuario Felipe Orellana
    """
    User = apps.get_model('auth', 'User')
    Group = apps.get_model('auth', 'Group')
    UserProfile = apps.get_model('gestion_clinica', 'UserProfile')
    
    # Buscar al usuario por RUT o crear si no existe
    rut_felipe = '19976194-3'  # RUT sin puntos ni guión
    
    try:
        # Intentar encontrar el usuario por username (RUT)
        usuario = User.objects.get(username=rut_felipe)
    except User.DoesNotExist:
        # Si no existe, crearlo
        usuario = User.objects.create(
            username=rut_felipe,
            email='felipe.orellana@santiagowanderers.cl',
            first_name='Felipe',
            last_name='Orellana',
            is_staff=True,
            is_superuser=True,
            password='pbkdf2_sha256$1000000$PeRCXSP4PxxBXnrATanZkB$GZxa6mLHRUtzy/EOHThF4u/8z3J7AfxuxY/LBSkppCM='  # Hash para admin123
        )
        usuario.save()
    
    # Asegurarse de que tiene permisos de staff y superuser
    if not usuario.is_staff or not usuario.is_superuser:
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.save()
    
    # Asignar al grupo Administrador
    try:
        admin_group = Group.objects.get(name='Administrador')
        usuario.groups.add(admin_group)
    except Group.DoesNotExist:
        pass  # El grupo se creará en la migración anterior
    
    # Crear el perfil del usuario (sin verificar si existe)
    UserProfile.objects.get_or_create(
        user=usuario,
        defaults={
            'rut': '19.976.194-3',
            'cargo': 'Administrador del Sistema',
            'activo': True
        }
    )

def revertir_admin_inicial(apps, schema_editor):
    """
    Función para revertir la migración si es necesario
    """
    User = apps.get_model('auth', 'User')
    Group = apps.get_model('auth', 'Group')
    
    rut_felipe = '19976194-3'
    
    try:
        usuario = User.objects.get(username=rut_felipe)
        admin_group = Group.objects.get(name='Administrador')
        usuario.groups.remove(admin_group)
    except (User.DoesNotExist, Group.DoesNotExist):
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('gestion_clinica', '0017_crear_grupos_roles'),
    ]

    operations = [
        migrations.RunPython(asignar_admin_inicial, revertir_admin_inicial),
    ]
