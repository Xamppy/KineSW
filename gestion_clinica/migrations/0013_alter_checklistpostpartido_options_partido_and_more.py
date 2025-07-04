# Generated by Django 5.2.1 on 2025-06-10 23:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion_clinica', '0012_auto_20250528_2035'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='checklistpostpartido',
            options={'ordering': ['-partido__fecha', '-fecha_registro_checklist'], 'verbose_name': 'Checklist Post-Partido', 'verbose_name_plural': 'Checklists Post-Partido'},
        ),
        migrations.CreateModel(
            name='Partido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateField(help_text='Fecha del partido')),
                ('rival', models.CharField(help_text='Nombre del equipo rival', max_length=100)),
                ('condicion', models.CharField(choices=[('local', 'Local'), ('visitante', 'Visitante')], help_text='Local o Visitante', max_length=20)),
                ('convocados', models.ManyToManyField(blank=True, help_text='Jugadores convocados para este partido (máximo 22)', related_name='partidos_convocados', to='gestion_clinica.jugador')),
            ],
            options={
                'verbose_name': 'Partido',
                'verbose_name_plural': 'Partidos',
                'ordering': ['-fecha'],
            },
        ),
        migrations.AddField(
            model_name='checklistpostpartido',
            name='partido',
            field=models.ForeignKey(blank=True, help_text='Partido al que corresponde este checklist', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='checklists', to='gestion_clinica.partido'),
        ),
        migrations.AlterUniqueTogether(
            name='checklistpostpartido',
            unique_together={('jugador', 'partido')},
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='fecha_partido_evaluado',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='rival',
        ),
    ]
