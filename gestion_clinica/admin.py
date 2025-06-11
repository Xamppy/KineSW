from django.contrib import admin
from django.forms import ModelForm, RadioSelect
from django.utils.html import format_html
from .models import Division, Jugador, AtencionKinesica, Lesion, ArchivoMedico, ChecklistPostPartido, Partido, EstadoDiarioLesion
from django import forms

@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)
    ordering = ('nombre',)

@admin.register(Jugador)
class JugadorAdmin(admin.ModelAdmin):
    list_display = ('rut', 'nombres', 'apellidos', 'get_division', 'get_edad', 'activo')
    list_filter = ('division', 'activo', 'nacionalidad', 'prevision_salud', 'lateralidad')
    search_fields = ('rut', 'nombres', 'apellidos', 'numero_ficha')
    list_per_page = 20
    
    # Campos agrupados para una mejor visualización en el formulario
    fieldsets = (
        ('Información Personal', {
            'fields': ('rut', 'nombres', 'apellidos', 'fecha_nacimiento', 'nacionalidad')
        }),
        ('Información Deportiva', {
            'fields': ('division', 'lateralidad', 'activo', 'numero_ficha')
        }),
        ('Información Física', {
            'fields': ('peso_kg', 'estatura_cm')
        }),
        ('Información Médica', {
            'fields': ('prevision_salud',)
        }),
    )

    def get_division(self, obj):
        return obj.division.nombre if obj.division else "-"
    get_division.short_description = 'División'
    get_division.admin_order_field = 'division__nombre'

    def get_edad(self, obj):
        return obj.edad if obj.edad is not None else "-"
    get_edad.short_description = 'Edad'

@admin.register(AtencionKinesica)
class AtencionKinesicaAdmin(admin.ModelAdmin):
    list_display = ('jugador', 'fecha_atencion', 'profesional_a_cargo', 'estado_actual')
    list_filter = ('fecha_atencion', 'profesional_a_cargo', 'estado_actual')
    search_fields = ('jugador__nombres', 'jugador__apellidos', 'jugador__rut', 'motivo_consulta')
    date_hierarchy = 'fecha_atencion'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('jugador', 'profesional_a_cargo', 'fecha_atencion')
        }),
        ('Detalle de la Atención', {
            'fields': ('motivo_consulta', 'prestaciones_realizadas', 'estado_actual', 'observaciones')
        }),
    )
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filtros para los campos de relaciones"""
        if db_field.name == "jugador":
            kwargs["queryset"] = Jugador.objects.filter(activo=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Lesion)
class LesionAdmin(admin.ModelAdmin):
    list_display = ('jugador', 'fecha_lesion', 'diagnostico_resumido', 'region_cuerpo', 'gravedad_lesion', 'dias_restantes')
    list_filter = ('fecha_lesion', 'tipo_lesion', 'region_cuerpo', 'gravedad_lesion', 'condicion_lesion', 'etapa_deportiva_lesion')
    search_fields = ('jugador__nombres', 'jugador__apellidos', 'jugador__rut', 'diagnostico_medico')
    date_hierarchy = 'fecha_lesion'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('jugador', 'fecha_lesion', 'diagnostico_medico')
        }),
        ('Clasificación de la Lesión', {
            'fields': ('tipo_lesion', 'region_cuerpo', 'mecanismo_lesional', 'condicion_lesion', 'etapa_deportiva_lesion', 'gravedad_lesion')
        }),
        ('Tiempos de Recuperación', {
            'fields': ('dias_recuperacion_estimados', 'dias_recuperacion_reales', 'partidos_ausente_estimados')
        }),
        ('Observaciones', {
            'fields': ('observaciones_lesion',)
        }),
    )
    
    def diagnostico_resumido(self, obj):
        """Muestra una versión resumida del diagnóstico"""
        if len(obj.diagnostico_medico) > 40:
            return f"{obj.diagnostico_medico[:40]}..."
        return obj.diagnostico_medico
    diagnostico_resumido.short_description = 'Diagnóstico'
    
    def dias_restantes(self, obj):
        """Calcula los días restantes de recuperación si hay estimación"""
        if obj.dias_recuperacion_estimados and not obj.dias_recuperacion_reales:
            import datetime
            dias_transcurridos = (datetime.date.today() - obj.fecha_lesion).days
            dias_restantes = obj.dias_recuperacion_estimados - dias_transcurridos
            return dias_restantes if dias_restantes > 0 else "Recuperación completada"
        elif obj.dias_recuperacion_reales:
            return "Recuperado"
        return "-"
    dias_restantes.short_description = 'Días restantes'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filtros para los campos de relaciones"""
        if db_field.name == "jugador":
            kwargs["queryset"] = Jugador.objects.filter(activo=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(ArchivoMedico)
class ArchivoMedicoAdmin(admin.ModelAdmin):
    list_display = ('jugador', 'tipo_archivo', 'titulo_descripcion', 'fecha_documento')
    list_filter = ('tipo_archivo', 'fecha_documento')
    search_fields = ('jugador__nombres', 'jugador__apellidos', 'jugador__rut', 'titulo_descripcion', 'observaciones')
    date_hierarchy = 'fecha_documento'
    
    fieldsets = (
        ('Información del Documento', {
            'fields': ('jugador', 'tipo_archivo', 'titulo_descripcion', 'fecha_documento')
        }),
        ('Archivo', {
            'fields': ('archivo', 'observaciones')
        }),
    )
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filtros para los campos de relaciones"""
        if db_field.name == "jugador":
            kwargs["queryset"] = Jugador.objects.filter(activo=True)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Partido)
class PartidoAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'rival', 'condicion', 'cantidad_convocados')
    list_filter = ('fecha', 'condicion')
    search_fields = ('rival',)
    date_hierarchy = 'fecha'
    filter_horizontal = ('convocados',)  # Interface más amigable para seleccionar múltiples jugadores
    ordering = ('-fecha',)
    
    fieldsets = (
        ('Información del Partido', {
            'fields': ('fecha', 'rival', 'condicion')
        }),
        ('Convocatoria', {
            'fields': ('convocados',),
            'description': 'Seleccione hasta 22 jugadores para la convocatoria'
        }),
    )
    
    def cantidad_convocados(self, obj):
        """Muestra la cantidad de jugadores convocados"""
        return obj.convocados.count()
    cantidad_convocados.short_description = 'Convocados'
    
    def formfield_for_manytomany(self, db_field, request, **kwargs):
        """Filtros para los campos many-to-many"""
        if db_field.name == "convocados":
            kwargs["queryset"] = Jugador.objects.filter(activo=True).order_by('apellidos', 'nombres')
        return super().formfield_for_manytomany(db_field, request, **kwargs)
    
    def get_queryset(self, request):
        """Optimiza las consultas"""
        return super().get_queryset(request).prefetch_related('convocados')

@admin.register(ChecklistPostPartido)
class ChecklistPostPartidoAdmin(admin.ModelAdmin):
    list_display = ('jugador', 'get_fecha_partido', 'get_rival_partido', 'dolor_molestia', 'realizado_por')
    list_filter = ('partido__fecha', 'dolor_molestia', 'realizado_por', 'partido__rival')
    search_fields = ('jugador__nombres', 'jugador__apellidos', 'jugador__rut', 'partido__rival', 'diagnostico_presuntivo_postpartido')
    date_hierarchy = 'partido__fecha'
    
    fieldsets = (
        ('Información del Checklist', {
            'fields': ('jugador', 'partido', 'realizado_por')
        }),
        ('Evaluación de Dolor/Molestia', {
            'fields': ('dolor_molestia', 'intensidad_dolor', 'zona_anatomica_dolor', 'mecanismo_dolor_evaluado', 'momento_aparicion_molestia')
        }),
        ('Diagnóstico y Tratamiento', {
            'fields': ('diagnostico_presuntivo_postpartido', 'tratamiento_inmediato_realizado', 'observaciones_checklist')
        }),
    )
    
    def get_fecha_partido(self, obj):
        return obj.partido.fecha.strftime("%d/%m/%Y") if obj.partido else "-"
    get_fecha_partido.short_description = 'Fecha Partido'
    get_fecha_partido.admin_order_field = 'partido__fecha'
    
    def get_rival_partido(self, obj):
        return obj.partido.rival if obj.partido else "-"
    get_rival_partido.short_description = 'Rival'
    get_rival_partido.admin_order_field = 'partido__rival'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filtros para los campos de relaciones"""
        if db_field.name == "jugador":
            kwargs["queryset"] = Jugador.objects.filter(activo=True)
        if db_field.name == "partido":
            kwargs["queryset"] = Partido.objects.all().order_by('-fecha')
        # Pre-seleccionar al usuario actual como realizado_por
        if db_field.name == "realizado_por" and request.user.is_authenticated:
            kwargs["initial"] = request.user.id
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def get_queryset(self, request):
        """Optimiza las consultas"""
        return super().get_queryset(request).select_related('jugador', 'partido', 'realizado_por')

@admin.register(EstadoDiarioLesion)
class EstadoDiarioLesionAdmin(admin.ModelAdmin):
    list_display = ('lesion', 'fecha', 'estado', 'registrado_por')
    list_filter = ('estado', 'fecha', 'registrado_por')
    search_fields = ('lesion__diagnostico_medico', 'lesion__jugador__nombres', 'lesion__jugador__apellidos', 'observaciones')
    date_hierarchy = 'fecha'
    ordering = ('-fecha',)
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('lesion', 'fecha', 'estado')
        }),
        ('Registro', {
            'fields': ('registrado_por', 'observaciones')
        }),
    )
    
    def get_queryset(self, request):
        """Optimiza las consultas"""
        return super().get_queryset(request).select_related('lesion', 'lesion__jugador', 'registrado_por')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filtros y valores por defecto para los campos de relaciones"""
        if db_field.name == "lesion":
            # Solo mostrar lesiones activas
            kwargs["queryset"] = Lesion.objects.filter(esta_activa=True).select_related('jugador')
        # Pre-seleccionar al usuario actual como registrado_por
        if db_field.name == "registrado_por" and request.user.is_authenticated:
            kwargs["initial"] = request.user.id
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def save_model(self, request, obj, form, change):
        """Asigna automáticamente el usuario que registra si no está establecido"""
        if not obj.registrado_por:
            obj.registrado_por = request.user
        super().save_model(request, obj, form, change)
