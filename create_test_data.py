#!/usr/bin/env python
"""
Script para crear datos de prueba para el sistema de checklists post-partido
"""
import os
import sys
import django
from datetime import date, timedelta
import random

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'santiagowanderers_kine.settings')
django.setup()

from gestion_clinica.models import Jugador, Partido, ChecklistPostPartido
from django.contrib.auth.models import User

def crear_datos_prueba():
    print("🏈 Creando datos de prueba para el sistema de checklists post-partido...")
    
    # 1. Crear algunos partidos de ejemplo
    partidos_data = [
        {
            'fecha': date.today() - timedelta(days=7),
            'rival': 'Universidad de Chile',
            'condicion': 'local'
        },
        {
            'fecha': date.today() - timedelta(days=14),
            'rival': 'Colo-Colo',
            'condicion': 'visitante'
        },
        {
            'fecha': date.today() - timedelta(days=21),
            'rival': 'Universidad Católica',
            'condicion': 'local'
        }
    ]
    
    partidos_creados = []
    for partido_data in partidos_data:
        partido, created = Partido.objects.get_or_create(
            fecha=partido_data['fecha'],
            rival=partido_data['rival'],
            defaults={'condicion': partido_data['condicion']}
        )
        partidos_creados.append(partido)
        print(f"✅ {'Creado' if created else 'Existe'} partido: {partido}")
    
    # 2. Obtener jugadores activos para las convocatorias
    jugadores_activos = list(Jugador.objects.filter(activo=True))
    
    if len(jugadores_activos) < 22:
        print(f"⚠️  Solo hay {len(jugadores_activos)} jugadores activos. Se recomiendan al menos 22.")
        jugadores_convocados = jugadores_activos
    else:
        # Seleccionar 22 jugadores aleatorios para cada partido
        jugadores_convocados = random.sample(jugadores_activos, 22)
    
    # 3. Asignar convocatorias a los partidos
    for partido in partidos_creados:
        # Limpiar convocatoria existente
        partido.convocados.clear()
        
        # Agregar jugadores convocados
        partido.convocados.set(jugadores_convocados)
        print(f"👥 Convocados {partido.convocados.count()} jugadores para: {partido}")
    
    # 4. Crear checklists de prueba
    # Obtener un usuario para asignar como realizado_por
    try:
        usuario = User.objects.first()
        if not usuario:
            print("❌ No hay usuarios en el sistema. Creando usuario de prueba...")
            usuario = User.objects.create_user(
                username='admin_prueba',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='Prueba'
            )
    except Exception as e:
        print(f"❌ Error al obtener/crear usuario: {e}")
        return
    
    # Datos de ejemplo para checklists
    zonas_anatomicas = ['MUSLO', 'RODILLA', 'TOBILLO', 'HOMBRO', 'CADERA']
    intensidades = ['LEVE', 'MODERADO', 'SEVERO']
    mecanismos = ['SOBRECARGA', 'TRAUMATISMO', 'CONTACTO', 'GESTO_TECNICO']
    momentos = ['PRIMER_TIEMPO', 'SEGUNDO_TIEMPO', 'CALENTAMIENTO']
    
    checklists_creados = 0
    
    for partido in partidos_creados:
        # Crear checklists para algunos jugadores convocados (no todos)
        jugadores_partido = list(partido.convocados.all())
        
        # Crear checklists para 8-12 jugadores aleatorios por partido
        num_checklists = random.randint(8, min(12, len(jugadores_partido)))
        jugadores_con_checklist = random.sample(jugadores_partido, num_checklists)
        
        for jugador in jugadores_con_checklist:
            # Determinar si el jugador tuvo dolor/molestia (70% probabilidad de no tener)
            tiene_dolor = random.choice([True, False, False, False, False, False, False])
            
            checklist_data = {
                'jugador': jugador,
                'partido': partido,
                'realizado_por': usuario,
                'dolor_molestia': tiene_dolor,
            }
            
            # Si tiene dolor, completar campos relacionados
            if tiene_dolor:
                checklist_data.update({
                    'intensidad_dolor': random.choice(intensidades),
                    'zona_anatomica_dolor': random.choice(zonas_anatomicas),
                    'mecanismo_dolor_evaluado': random.choice(mecanismos),
                    'momento_aparicion_molestia': random.choice(momentos),
                    'diagnostico_presuntivo_postpartido': 'Molestia muscular leve, posible sobrecarga.',
                    'tratamiento_inmediato_realizado': 'Aplicación de hielo y reposo.',
                    'observaciones_checklist': 'Jugador refiere molestia durante el partido.'
                })
            else:
                checklist_data['observaciones_checklist'] = 'Sin molestias reportadas.'
            
            # Crear el checklist
            try:
                checklist, created = ChecklistPostPartido.objects.get_or_create(
                    jugador=jugador,
                    partido=partido,
                    defaults=checklist_data
                )
                
                if created:
                    checklists_creados += 1
                    dolor_emoji = "🤕" if tiene_dolor else "😊"
                    print(f"✅ {dolor_emoji} Checklist: {jugador.nombres} {jugador.apellidos} - {partido.rival}")
                
            except Exception as e:
                print(f"❌ Error creando checklist para {jugador}: {e}")
    
    # 5. Resumen
    print(f"\n📊 RESUMEN DE DATOS CREADOS:")
    print(f"   🏈 Partidos: {len(partidos_creados)}")
    print(f"   👥 Jugadores convocados por partido: {len(jugadores_convocados)}")
    print(f"   📋 Checklists creados: {checklists_creados}")
    
    # 6. Información adicional
    total_checklists = ChecklistPostPartido.objects.count()
    checklists_con_dolor = ChecklistPostPartido.objects.filter(dolor_molestia=True).count()
    
    print(f"\n📈 ESTADÍSTICAS ACTUALES:")
    print(f"   📋 Total de checklists en BD: {total_checklists}")
    print(f"   🤕 Checklists con dolor/molestia: {checklists_con_dolor}")
    print(f"   😊 Checklists sin molestias: {total_checklists - checklists_con_dolor}")
    
    print(f"\n🎉 ¡Datos de prueba creados exitosamente!")
    print(f"\n💡 PRÓXIMOS PASOS:")
    print(f"   1. Accede al admin de Django para ver los partidos creados")
    print(f"   2. Usa la API /partidos/ para listar los partidos")
    print(f"   3. Usa la API /checklists/ para ver los checklists")
    print(f"   4. Crea nuevos checklists asociados a los partidos existentes")

if __name__ == '__main__':
    try:
        crear_datos_prueba()
    except Exception as e:
        print(f"❌ Error ejecutando el script: {e}")
        sys.exit(1) 