from rest_framework import serializers
from .models import Division, Jugador, AtencionKinesica, Lesion, ArchivoMedico, ChecklistPostPartido, validar_rut_chileno, EstadoDiarioLesion
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer para el modelo User con información completa"""
    groups = serializers.StringRelatedField(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=True)
    rut = serializers.CharField(source='username', required=True)  # Usar username como rut

    class Meta:
        model = User
        fields = ('id', 'rut', 'email', 'first_name', 'last_name', 'password', 'groups')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_rut(self, value):
        try:
            rut_limpio = validar_rut_chileno(value)
            return rut_limpio
        except ValidationError as e:
            raise serializers.ValidationError(str(e))

    def validate_password(self, value):
        try:
            validate_password(value)
            return value
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))

    def create(self, validated_data):
        username_data = validated_data.pop('username')  # Obtener el RUT del campo username
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            username=username_data,
            password=password,
            **validated_data
        )
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        if 'username' in validated_data:
            validated_data.pop('username')  # No permitir cambiar el RUT/username
        return super().update(instance, validated_data)

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para el registro de usuarios"""
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    rol = serializers.ChoiceField(choices=['kinesiologo', 'medico', 'auxiliar'])
    rut = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('rut', 'password', 'password2', 'email', 'first_name', 'last_name', 'rol')

    def validate(self, attrs):
        try:
            print("Validando datos:", attrs)  # Debug
            if attrs['password'] != attrs['password2']:
                raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
            
            try:
                validate_password(attrs['password'])
            except ValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})

            # Limpiar y validar el RUT
            rut = attrs['rut']
            print(f"RUT antes de limpiar: {rut}")  # Debug
            rut_limpio = validar_rut_chileno(rut)
            print(f"RUT después de validar: {rut_limpio}")  # Debug
            
            # Verificar si el RUT ya está en uso
            if User.objects.filter(username=rut_limpio).exists():
                raise serializers.ValidationError({"rut": "Este RUT ya está registrado"})

            # Guardar el RUT limpio
            attrs['rut'] = rut_limpio
            return attrs
        except ValidationError as e:
            print(f"Error de validación: {str(e)}")  # Debug
            raise serializers.ValidationError({"rut": str(e)})
        except Exception as e:
            print(f"Error inesperado en validate: {str(e)}")  # Debug
            raise serializers.ValidationError({"error": f"Error inesperado: {str(e)}"})

    def create(self, validated_data):
        try:
            print("Creando usuario con datos:", validated_data)  # Debug
            validated_data.pop('password2')
            rol = validated_data.pop('rol')
            rut = validated_data.pop('rut')
            
            # Usar el RUT limpio como username
            user = User.objects.create_user(
                username=rut,
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                password=validated_data['password']
            )
            
            # Crear o obtener el grupo según el rol
            from django.contrib.auth.models import Group
            grupo, _ = Group.objects.get_or_create(name=rol)
            user.groups.add(grupo)
            
            return user
        except Exception as e:
            print(f"Error inesperado en create: {str(e)}")  # Debug
            raise serializers.ValidationError({"error": f"Error al crear usuario: {str(e)}"})

class UserLoginSerializer(serializers.Serializer):
    """Serializer para el login de usuarios"""
    rut = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate_rut(self, value):
        try:
            # Limpiar y validar el RUT
            rut_limpio = re.sub(r'[^0-9kK]', '', value)
            validar_rut_chileno(rut_limpio)
            return rut_limpio
        except ValidationError as e:
            raise serializers.ValidationError(str(e))
        except Exception as e:
            raise serializers.ValidationError(f"Error al validar RUT: {str(e)}")

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para devolver información mínima del usuario"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'groups']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class DivisionSerializer(serializers.ModelSerializer):
    cantidad_jugadores = serializers.SerializerMethodField()
    
    class Meta:
        model = Division
        fields = '__all__'
    
    def get_cantidad_jugadores(self, obj):
        return obj.jugadores.filter(activo=True).count()

class JugadorSerializer(serializers.ModelSerializer):
    division_nombre = serializers.CharField(source='division.nombre', read_only=True)
    edad = serializers.IntegerField(read_only=True)
    foto_perfil_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Jugador
        fields = [
            'id', 'rut', 'nombres', 'apellidos', 'fecha_nacimiento',
            'nacionalidad', 'foto_perfil', 'foto_perfil_url', 'lateralidad',
            'peso_kg', 'estatura_cm', 'prevision_salud', 'numero_ficha',
            'division', 'division_nombre', 'activo', 'edad'
        ]
        extra_kwargs = {
            'foto_perfil': {'write_only': True}  # La foto original solo para escritura
        }

    def get_foto_perfil_url(self, obj):
        if obj.foto_perfil:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
        return None

class AtencionKinesicaSerializer(serializers.ModelSerializer):
    jugador_nombre = serializers.CharField(source='jugador.__str__', read_only=True)
    profesional_nombre = serializers.CharField(source='profesional_a_cargo.get_full_name', read_only=True)
    
    class Meta:
        model = AtencionKinesica
        fields = '__all__'

class LesionSerializer(serializers.ModelSerializer):
    jugador_nombre = serializers.CharField(source='jugador.__str__', read_only=True)
    dias_restantes = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesion
        fields = '__all__'
    
    def get_dias_restantes(self, obj):
        if obj.dias_recuperacion_estimados and not obj.dias_recuperacion_reales:
            from django.utils import timezone
            dias_transcurridos = (timezone.now().date() - obj.fecha_lesion).days
            dias_restantes = obj.dias_recuperacion_estimados - dias_transcurridos
            return dias_restantes if dias_restantes > 0 else "Recuperación completada"
        elif obj.dias_recuperacion_reales:
            return "Recuperado"
        return None

class ArchivoMedicoSerializer(serializers.ModelSerializer):
    jugador_nombre = serializers.CharField(source='jugador.__str__', read_only=True)
    
    class Meta:
        model = ArchivoMedico
        fields = '__all__'

class ChecklistPostPartidoSerializer(serializers.ModelSerializer):
    jugador_nombre = serializers.CharField(source='jugador.__str__', read_only=True)
    realizado_por_nombre = serializers.CharField(source='realizado_por.get_full_name', read_only=True)
    
    class Meta:
        model = ChecklistPostPartido
        fields = '__all__'

class EstadoDiarioLesionSerializer(serializers.ModelSerializer):
    registrado_por_nombre = serializers.CharField(source='registrado_por.get_full_name', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = EstadoDiarioLesion
        fields = ['id', 'lesion', 'fecha', 'estado', 'estado_display', 'registrado_por', 'registrado_por_nombre', 'observaciones']
        extra_kwargs = {
            'lesion': {'required': True},
            'registrado_por': {'required': False, 'read_only': True}
        }

class LesionActivaSerializer(serializers.ModelSerializer):
    jugador = JugadorSerializer(read_only=True)
    tipo_lesion_display = serializers.CharField(source='get_tipo_lesion_display', read_only=True)
    region_cuerpo_display = serializers.CharField(source='get_region_cuerpo_display', read_only=True)
    gravedad_lesion_display = serializers.CharField(source='get_gravedad_lesion_display', read_only=True)
    historial_diario = EstadoDiarioLesionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesion
        fields = [
            'id', 'jugador', 'fecha_lesion', 'diagnostico_medico',
            'esta_activa', 'fecha_fin', 'tipo_lesion', 'tipo_lesion_display',
            'region_cuerpo', 'region_cuerpo_display', 'gravedad_lesion',
            'gravedad_lesion_display', 'dias_recuperacion_estimados',
            'dias_recuperacion_reales', 'historial_diario'
        ]
        read_only_fields = ['esta_activa', 'fecha_fin'] 