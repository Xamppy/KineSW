from django.db import models
from django.utils import timezone  # Necesario para calcular la edad
from django.conf import settings  # Para referenciar al User model
from django.core.exceptions import ValidationError
from multiselectfield import MultiSelectField
import re
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

# Validador personalizado para RUT chileno
def validar_rut_chileno(value):
    try:
        print(f"Validando RUT: {value}")  # Debug
        # Eliminar puntos y guión
        rut_limpio = re.sub(r'[^0-9kK]', '', value)
        print(f"RUT limpio: {rut_limpio}")  # Debug
        
        if len(rut_limpio) < 2:
            raise ValidationError('El RUT debe tener al menos 2 caracteres')
        
        # Separar cuerpo y dígito verificador
        cuerpo = rut_limpio[:-1]
        dv = rut_limpio[-1].upper()
        
        # Validar que el cuerpo contenga solo números
        if not cuerpo.isdigit():
            raise ValidationError('El RUT debe contener solo números antes del dígito verificador')
        
        # Validar que el cuerpo tenga un largo válido (7 u 8 dígitos)
        if len(cuerpo) < 7 or len(cuerpo) > 8:
            raise ValidationError('El RUT debe tener entre 7 y 8 dígitos antes del dígito verificador')
        
        # Calcular dígito verificador
        suma = 0
        multiplo = 2
        
        for r in reversed(cuerpo):
            suma += int(r) * multiplo
            multiplo = multiplo + 1 if multiplo < 7 else 2
        
        resto = suma % 11
        dv_calculado = '0' if resto == 0 else 'K' if resto == 1 else str(11 - resto)
        
        print(f"DV calculado: {dv_calculado}, DV recibido: {dv}")  # Debug
        
        if dv != dv_calculado:
            raise ValidationError('El RUT ingresado no es válido')
            
        return rut_limpio  # Retornar el RUT limpio
    except ValidationError:
        raise
    except Exception as e:
        print(f"Error inesperado validando RUT: {str(e)}")  # Debug
        raise ValidationError(f'Error al validar RUT: {str(e)}')

# Create your models here.

def ruta_archivo_medico(instance, filename):
    # El archivo se subirá a MEDIA_ROOT/archivos_medicos/jugador_<id>/<filename>
    return f'archivos_medicos/jugador_{instance.jugador.id}/{filename}'

def ruta_foto_perfil_jugador(instance, filename):
    # La foto se subirá a MEDIA_ROOT/jugadores/fotos_perfil/jugador_<id>/<filename>
    return f'jugadores/fotos_perfil/jugador_{instance.id}/{filename}'

class Division(models.Model):
    nombre = models.CharField(max_length=100, unique=True, help_text="Ej: Primer Equipo, Femenino, Cadetes Sub-17")

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "División"
        verbose_name_plural = "Divisiones"

class Jugador(models.Model):
    rut = models.CharField(max_length=12, unique=True, 
                          help_text="Formato XX.XXX.XXX-Y o X.XXX.XXX-Y", 
                          validators=[validar_rut_chileno])
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    nacionalidad = models.CharField(max_length=50, default="Chilena")
    foto_perfil = models.ImageField(upload_to=ruta_foto_perfil_jugador, null=True, blank=True, verbose_name="Foto de Perfil")

    LATERALIDAD_CHOICES = [
        ('zurdo', 'Zurdo'),
        ('diestro', 'Diestro'),
        ('ambidiestro', 'Ambidiestro'),
    ]
    lateralidad = models.CharField(max_length=20, choices=LATERALIDAD_CHOICES)

    peso_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Peso en Kilogramos")
    estatura_cm = models.IntegerField(null=True, blank=True, help_text="Estatura en centímetros")

    PREVISION_CHOICES = [
        ('fonasa', 'FONASA'),
        ('isapre', 'Isapre'),
        ('otra', 'Otra'),
    ]
    prevision_salud = models.CharField(max_length=20, choices=PREVISION_CHOICES)

    numero_ficha = models.CharField(max_length=20, unique=True, blank=True, null=True, help_text="Número de ficha único interno del club")
    
    division = models.ForeignKey(Division, on_delete=models.SET_NULL, null=True, blank=True, related_name="jugadores")
    activo = models.BooleanField(default=True, help_text="Indica si el jugador está actualmente activo en el club")

    # Propiedad para calcular la edad
    @property
    def edad(self):
        if self.fecha_nacimiento:
            hoy = timezone.now().date()
            return hoy.year - self.fecha_nacimiento.year - ((hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
        return None
    
    def save(self, *args, **kwargs):
        # Si no tiene número de ficha, generar uno automáticamente
        if not self.numero_ficha:
            # Obtener el último número de ficha y aumentarlo en 1
            ultimo = Jugador.objects.all().order_by('-numero_ficha').first()
            
            # Si hay jugadores con número de ficha
            if ultimo and ultimo.numero_ficha and ultimo.numero_ficha.isdigit():
                next_num = int(ultimo.numero_ficha) + 1
            else:
                next_num = 1
                
            self.numero_ficha = f"{next_num:04d}"  # Formato con ceros a la izquierda (ej: 0001)
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombres} {self.apellidos} ({self.rut})"

    class Meta:
        verbose_name = "Jugador"
        verbose_name_plural = "Jugadores"
        ordering = ['apellidos', 'nombres']

class AtencionKinesica(models.Model):
    jugador = models.ForeignKey(Jugador, on_delete=models.CASCADE, related_name="atenciones_kinesicas")
    profesional_a_cargo = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="atenciones_realizadas")
    fecha_atencion = models.DateTimeField(default=timezone.now)
    motivo_consulta = models.TextField()
    prestaciones_realizadas = models.TextField()
    
    ESTADO_CHOICES = [
        ('tratamiento', 'En tratamiento'),
        ('alta', 'Alta médica'),
        ('derivado', 'Derivado a especialista'),
        ('control', 'Control periódico'),
        ('otro', 'Otro'),
    ]
    estado_actual = models.CharField(max_length=50, choices=ESTADO_CHOICES, help_text="Estado actual del paciente")
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Atención a {self.jugador.apellidos} - {self.fecha_atencion.strftime('%Y-%m-%d')}"

    class Meta:
        verbose_name = "Atención Kinésica"
        verbose_name_plural = "Atenciones Kinésicas"
        ordering = ['-fecha_atencion']

class Lesion(models.Model):
    jugador = models.ForeignKey(Jugador, on_delete=models.CASCADE, related_name="lesiones")
    fecha_lesion = models.DateField()
    diagnostico_medico = models.TextField()
    
    TIPO_LESION_CHOICES = [
        ('muscular', 'Muscular'),
        ('ligamentosa', 'Ligamentosa'),
        ('osea', 'Ósea'),
        ('tendinosa', 'Tendinosa'),
        ('articular', 'Articular'),
        ('meniscal', 'Meniscal'),
        ('contusion', 'Contusión'),
        ('otra', 'Otra'),
    ]
    tipo_lesion = models.CharField(max_length=100, choices=TIPO_LESION_CHOICES)

    REGION_CUERPO_CHOICES = [
        # Miembro inferior
        ('tobillo_izq', 'Tobillo Izquierdo'),
        ('tobillo_der', 'Tobillo Derecho'),
        ('rodilla_izq', 'Rodilla Izquierda'),
        ('rodilla_der', 'Rodilla Derecha'),
        ('cadera_izq', 'Cadera Izquierda'),
        ('cadera_der', 'Cadera Derecha'),
        ('muslo_ant_izq', 'Muslo Anterior Izquierdo'),
        ('muslo_ant_der', 'Muslo Anterior Derecho'),
        ('muslo_post_izq', 'Muslo Posterior Izquierdo'),
        ('muslo_post_der', 'Muslo Posterior Derecho'),
        ('pantorrilla_izq', 'Pantorrilla Izquierda'),
        ('pantorrilla_der', 'Pantorrilla Derecha'),
        ('pie_izq', 'Pie Izquierdo'),
        ('pie_der', 'Pie Derecho'),
        # Miembro superior
        ('hombro_izq', 'Hombro Izquierdo'),
        ('hombro_der', 'Hombro Derecho'),
        ('codo_izq', 'Codo Izquierdo'),
        ('codo_der', 'Codo Derecho'),
        ('muneca_izq', 'Muñeca Izquierda'),
        ('muneca_der', 'Muñeca Derecha'),
        ('mano_izq', 'Mano Izquierda'),
        ('mano_der', 'Mano Derecha'),
        # Tronco
        ('columna_cervical', 'Columna Cervical'),
        ('columna_dorsal', 'Columna Dorsal'),
        ('columna_lumbar', 'Columna Lumbar'),
        ('abdomen', 'Abdomen'),
        ('pelvis', 'Pelvis'),
        # Cabeza
        ('cabeza', 'Cabeza'),
        ('facial', 'Región Facial'),
        # Otro
        ('otra', 'Otra Región'),
    ]
    region_cuerpo = models.CharField(max_length=100, choices=REGION_CUERPO_CHOICES)

    MECANISMO_LESIONAL_CHOICES = [
        ('contacto', 'Por contacto'),
        ('sin_contacto', 'Sin contacto'),
        ('sobrecarga', 'Sobrecarga'),
        ('traumatico', 'Traumático'),
        ('indirecto', 'Mecanismo indirecto'),
        ('otro', 'Otro mecanismo'),
    ]
    mecanismo_lesional = models.CharField(max_length=100, choices=MECANISMO_LESIONAL_CHOICES)

    CONDICION_LESION_CHOICES = [
        ('aguda', 'Aguda'),
        ('cronica', 'Crónica'),
        ('recidivante', 'Recidivante'),
        ('sobreaguda', 'Sobreaguda'),
    ]
    condicion_lesion = models.CharField(max_length=50, choices=CONDICION_LESION_CHOICES)
    
    ETAPA_DEPORTIVA_CHOICES = [
        ('pretemporada', 'Pretemporada'),
        ('competencia', 'Competencia'),
        ('posttemporada', 'Posttemporada'),
        ('entrenamiento', 'Entrenamiento'),
        ('partido', 'Partido oficial'),
        ('amistoso', 'Partido amistoso'),
    ]
    etapa_deportiva_lesion = models.CharField(max_length=50, choices=ETAPA_DEPORTIVA_CHOICES)

    GRAVEDAD_LESION_CHOICES = [
        ('leve', 'Leve (1-7 días)'),
        ('moderada', 'Moderada (8-28 días)'),
        ('grave', 'Grave (> 28 días)'),
        ('severa', 'Severa (requiere cirugía)'),
    ]
    gravedad_lesion = models.CharField(max_length=50, choices=GRAVEDAD_LESION_CHOICES)

    dias_recuperacion_estimados = models.IntegerField(null=True, blank=True)
    dias_recuperacion_reales = models.IntegerField(null=True, blank=True)
    observaciones_lesion = models.TextField(blank=True, null=True)
    partidos_ausente_estimados = models.IntegerField(null=True, blank=True, help_text="Ingreso manual por ahora")

    def __str__(self):
        return f"Lesión de {self.jugador.apellidos} - {self.diagnostico_medico[:30]} ({self.fecha_lesion.strftime('%Y-%m-%d')})"

    class Meta:
        verbose_name = "Lesión"
        verbose_name_plural = "Lesiones"
        ordering = ['-fecha_lesion']

class ArchivoMedico(models.Model):
    jugador = models.ForeignKey(Jugador, on_delete=models.CASCADE, related_name="archivos_medicos")
    
    TIPO_ARCHIVO_CHOICES = [
        ('imagen', 'Imagen (Radiografía, RMN, Eco)'),
        ('informe', 'Informe Médico'),
        ('otro', 'Otro Documento'),
    ]
    tipo_archivo = models.CharField(max_length=20, choices=TIPO_ARCHIVO_CHOICES)
    titulo_descripcion = models.CharField(max_length=255)
    fecha_documento = models.DateField(default=timezone.now)
    archivo = models.FileField(upload_to=ruta_archivo_medico)  # Configurar MEDIA_ROOT y MEDIA_URL en settings.py
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_tipo_archivo_display()} de {self.jugador.apellidos} - {self.titulo_descripcion}"

    class Meta:
        verbose_name = "Archivo Médico"
        verbose_name_plural = "Archivos Médicos"
        ordering = ['-fecha_documento']

class ChecklistPostPartido(models.Model):
    OPCIONES_ZONA = [
        ('CABEZA', 'Cabeza'),
        ('CUELLO', 'Cuello'),
        ('HOMBRO', 'Hombro'),
        ('BRAZO', 'Brazo'),
        ('CODO', 'Codo'),
        ('ANTEBRAZO', 'Antebrazo'),
        ('MUÑECA', 'Muñeca'),
        ('MANO', 'Mano'),
        ('TORAX', 'Tórax'),
        ('ABDOMEN', 'Abdomen'),
        ('ESPALDA', 'Espalda'),
        ('CADERA', 'Cadera'),
        ('MUSLO', 'Muslo'),
        ('RODILLA', 'Rodilla'),
        ('PIERNA', 'Pierna'),
        ('TOBILLO', 'Tobillo'),
        ('PIE', 'Pie'),
    ]
    
    OPCIONES_INTENSIDAD = [
        ('LEVE', 'Leve'),
        ('MODERADO', 'Moderado'),
        ('SEVERO', 'Severo'),
    ]
    
    OPCIONES_MECANISMO = [
        ('SOBRECARGA', 'Sobrecarga'),
        ('TRAUMATISMO', 'Traumatismo'),
        ('CONTACTO', 'Contacto'),
        ('GESTO_TECNICO', 'Gesto Técnico'),
        ('INDETERMINADO', 'Indeterminado'),
    ]
    
    OPCIONES_MOMENTO = [
        ('PRIMER_TIEMPO', 'Primer Tiempo'),
        ('SEGUNDO_TIEMPO', 'Segundo Tiempo'),
        ('CALENTAMIENTO', 'Calentamiento'),
        ('POST_PARTIDO', 'Post Partido'),
    ]
    
    jugador = models.ForeignKey(Jugador, on_delete=models.CASCADE, related_name="checklists_post_partido")
    realizado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="checklists_completados")
    fecha_partido_evaluado = models.DateField(default=timezone.now)  # Fecha del partido que se evalúa
    rival = models.CharField(max_length=100, blank=True, null=True, help_text="Opcional: Rival del partido evaluado")
    
    dolor_molestia = models.BooleanField(default=False, verbose_name="¿Sintió Dolor/Molestia?")
    intensidad_dolor = models.CharField(max_length=20, choices=OPCIONES_INTENSIDAD, null=True, blank=True)
    mecanismo_dolor_evaluado = models.CharField(max_length=20, choices=OPCIONES_MECANISMO, null=True, blank=True)
    momento_aparicion_molestia = models.CharField(max_length=20, choices=OPCIONES_MOMENTO, null=True, blank=True)
    zona_anatomica_dolor = models.CharField(max_length=20, choices=OPCIONES_ZONA, null=True, blank=True)
    diagnostico_presuntivo_postpartido = models.TextField(null=True, blank=True)
    tratamiento_inmediato_realizado = models.TextField(null=True, blank=True)
    observaciones_checklist = models.TextField(null=True, blank=True)
    fecha_registro_checklist = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Checklist {self.jugador.apellidos} - Partido {self.fecha_partido_evaluado.strftime('%Y-%m-%d')}"

    class Meta:
        verbose_name = "Checklist Post-Partido"
        verbose_name_plural = "Checklists Post-Partido"
        ordering = ['-fecha_partido_evaluado', '-fecha_registro_checklist']
