# Generated by Django 5.2.1 on 2025-05-15 06:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gestion_clinica', '0008_checklistpostpartido_intensidad_leve_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='intensidad_leve',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='intensidad_moderada',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='intensidad_severa',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='mecanismo_contacto',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='mecanismo_gesto_tecnico',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='mecanismo_indeterminado',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='mecanismo_sobrecarga',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='mecanismo_traumatismo',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='momento_calentamiento',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='momento_post_partido',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='momento_primer_tiempo',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='momento_segundo_tiempo',
        ),
        migrations.RemoveField(
            model_name='checklistpostpartido',
            name='zonas_anatomicas',
        ),
        migrations.AlterField(
            model_name='checklistpostpartido',
            name='intensidad_dolor',
            field=models.CharField(blank=True, choices=[('LEVE', 'Leve'), ('MODERADO', 'Moderado'), ('SEVERO', 'Severo')], max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='checklistpostpartido',
            name='mecanismo_dolor_evaluado',
            field=models.CharField(blank=True, choices=[('SOBRECARGA', 'Sobrecarga'), ('TRAUMATISMO', 'Traumatismo'), ('CONTACTO', 'Contacto'), ('GESTO_TECNICO', 'Gesto Técnico'), ('INDETERMINADO', 'Indeterminado')], max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='checklistpostpartido',
            name='momento_aparicion_molestia',
            field=models.CharField(blank=True, choices=[('PRIMER_TIEMPO', 'Primer Tiempo'), ('SEGUNDO_TIEMPO', 'Segundo Tiempo'), ('CALENTAMIENTO', 'Calentamiento'), ('POST_PARTIDO', 'Post Partido')], max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='checklistpostpartido',
            name='zona_anatomica_dolor',
            field=models.CharField(blank=True, choices=[('CABEZA', 'Cabeza'), ('CUELLO', 'Cuello'), ('HOMBRO', 'Hombro'), ('BRAZO', 'Brazo'), ('CODO', 'Codo'), ('ANTEBRAZO', 'Antebrazo'), ('MUÑECA', 'Muñeca'), ('MANO', 'Mano'), ('TORAX', 'Tórax'), ('ABDOMEN', 'Abdomen'), ('ESPALDA', 'Espalda'), ('CADERA', 'Cadera'), ('MUSLO', 'Muslo'), ('RODILLA', 'Rodilla'), ('PIERNA', 'Pierna'), ('TOBILLO', 'Tobillo'), ('PIE', 'Pie')], max_length=20, null=True),
        ),
    ]
