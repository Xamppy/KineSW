from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Division, Jugador, AtencionKinesica, 
    Lesion, ArchivoMedico, ChecklistPostPartido
)
from .serializers import (
    DivisionSerializer, JugadorSerializer, 
    AtencionKinesicaSerializer, LesionSerializer,
    ArchivoMedicoSerializer, ChecklistPostPartidoSerializer,
    UserRegistrationSerializer, UserLoginSerializer, UserBasicSerializer,
    UserSerializer
)
import re
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

User = get_user_model()

# Create your views here.

# Vistas para la API REST
class DivisionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar divisiones
    """
    queryset = Division.objects.all().order_by('nombre')
    serializer_class = DivisionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre']

class JugadorViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar jugadores.
    Soporta la subida de fotos de perfil a través de formularios multipart/form-data.
    """
    queryset = Jugador.objects.all().select_related('division').prefetch_related(
        'atenciones_kinesicas', 'lesiones', 'archivos_medicos', 'checklists_post_partido'
    ).order_by('apellidos', 'nombres')
    serializer_class = JugadorSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['division', 'activo', 'nacionalidad', 'lateralidad', 'prevision_salud']
    search_fields = ['rut', 'nombres', 'apellidos', 'numero_ficha']
    ordering_fields = ['apellidos', 'nombres', 'fecha_nacimiento', 'division__nombre']
    
    def get_queryset(self):
        """
        Permite filtrar por división y estado activo
        """
        queryset = Jugador.objects.all().select_related('division').prefetch_related(
            'atenciones_kinesicas', 'lesiones', 'archivos_medicos', 'checklists_post_partido'
        ).order_by('apellidos', 'nombres')
        division = self.request.query_params.get('division', None)
        activo = self.request.query_params.get('activo', None)
        
        if division is not None:
            queryset = queryset.filter(division=division)
        if activo is not None:
            queryset = queryset.filter(activo=(activo.lower() == 'true'))
            
        return queryset

    def get_serializer_context(self):
        """
        Añadir el request al contexto para generar URLs absolutas de las fotos
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

class AtencionKinesicaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar atenciones kinésicas
    """
    queryset = AtencionKinesica.objects.all().select_related('jugador', 'profesional_a_cargo').order_by('-fecha_atencion')
    serializer_class = AtencionKinesicaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['jugador', 'profesional_a_cargo', 'estado_actual']
    search_fields = ['motivo_consulta', 'prestaciones_realizadas', 'jugador__nombres', 'jugador__apellidos']
    ordering_fields = ['fecha_atencion', 'jugador__apellidos']
    
    def get_queryset(self):
        """
        Permite filtrar por jugador y profesional
        """
        queryset = AtencionKinesica.objects.all().select_related('jugador', 'profesional_a_cargo').order_by('-fecha_atencion')
        jugador = self.request.query_params.get('jugador', None)
        profesional = self.request.query_params.get('profesional', None)
        
        if jugador is not None:
            queryset = queryset.filter(jugador=jugador)
        if profesional is not None:
            queryset = queryset.filter(profesional_a_cargo=profesional)
            
        return queryset

class LesionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar lesiones
    """
    queryset = Lesion.objects.all().select_related('jugador').order_by('-fecha_lesion')
    serializer_class = LesionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'jugador', 'tipo_lesion', 'region_cuerpo', 'mecanismo_lesional', 
        'condicion_lesion', 'etapa_deportiva_lesion', 'gravedad_lesion'
    ]
    search_fields = ['diagnostico_medico', 'jugador__nombres', 'jugador__apellidos']
    ordering_fields = ['fecha_lesion', 'jugador__apellidos', 'gravedad_lesion']
    
    def get_queryset(self):
        """
        Permite filtrar por jugador y tipo de lesión
        """
        queryset = Lesion.objects.all().select_related('jugador').order_by('-fecha_lesion')
        jugador = self.request.query_params.get('jugador', None)
        tipo = self.request.query_params.get('tipo_lesion', None)
        
        if jugador is not None:
            queryset = queryset.filter(jugador=jugador)
        if tipo is not None:
            queryset = queryset.filter(tipo_lesion=tipo)
            
        return queryset

class ArchivoMedicoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar archivos médicos
    """
    queryset = ArchivoMedico.objects.all().select_related('jugador').order_by('-fecha_documento')
    serializer_class = ArchivoMedicoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['jugador', 'tipo_archivo']
    search_fields = ['titulo_descripcion', 'observaciones', 'jugador__nombres', 'jugador__apellidos']
    ordering_fields = ['fecha_documento', 'jugador__apellidos', 'tipo_archivo']
    
    def get_queryset(self):
        """
        Permite filtrar por jugador y tipo de archivo
        """
        queryset = ArchivoMedico.objects.all().select_related('jugador').order_by('-fecha_documento')
        jugador = self.request.query_params.get('jugador', None)
        tipo = self.request.query_params.get('tipo_archivo', None)
        
        if jugador is not None:
            queryset = queryset.filter(jugador=jugador)
        if tipo is not None:
            queryset = queryset.filter(tipo_archivo=tipo)
            
        return queryset
    
    def get_serializer_context(self):
        """
        Añadir el request al contexto para generar URLs absolutas
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context

class ChecklistPostPartidoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar checklists post-partido
    """
    queryset = ChecklistPostPartido.objects.all().select_related('jugador', 'realizado_por').order_by('-fecha_partido_evaluado')
    serializer_class = ChecklistPostPartidoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'jugador', 'realizado_por', 'dolor_molestia', 'intensidad_dolor',
        'zona_anatomica_dolor', 'mecanismo_dolor_evaluado', 'momento_aparicion_molestia'
    ]
    search_fields = ['rival', 'diagnostico_presuntivo_postpartido', 'jugador__nombres', 'jugador__apellidos']
    ordering_fields = ['fecha_partido_evaluado', 'jugador__apellidos', 'dolor_molestia']
    
    def get_queryset(self):
        """
        Permite filtrar por jugador y fecha
        """
        queryset = ChecklistPostPartido.objects.all().select_related('jugador', 'realizado_por').order_by('-fecha_partido_evaluado')
        jugador = self.request.query_params.get('jugador', None)
        dolor = self.request.query_params.get('dolor_molestia', None)
        
        if jugador is not None:
            queryset = queryset.filter(jugador=jugador)
        if dolor is not None:
            queryset = queryset.filter(dolor_molestia=(dolor.lower() == 'true'))
            
        return queryset

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Vista para registrar un nuevo usuario y devolver tokens JWT
    """
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'error': 'Error en el registro',
            'detail': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Error interno del servidor',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Vista para iniciar sesión y devolver tokens JWT
    """
    try:
        rut = request.data.get('rut')
        password = request.data.get('password')

        if not rut or not password:
            return Response({
                'error': 'Por favor, proporciona RUT y contraseña'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Limpiar el RUT
        rut_limpio = re.sub(r'[^0-9kK]', '', rut)
        
        # Intentar autenticar usando el RUT limpio como username
        user = authenticate(username=rut_limpio, password=password)

        if user is None:
            return Response({
                'error': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': UserSerializer(user).data
        })
    except Exception as e:
        return Response({
            'error': 'Error interno del servidor',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
