from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.contrib.auth.models import Group
from .models import (
    Division, Jugador, AtencionKinesica, 
    Lesion, ArchivoMedico, ChecklistPostPartido, Partido,
    EstadoDiarioLesion, UserProfile
)
from .serializers import (
    DivisionSerializer, JugadorSerializer, 
    AtencionKinesicaSerializer, LesionSerializer,
    ArchivoMedicoSerializer, ChecklistPostPartidoSerializer, PartidoSerializer,
    UserRegistrationSerializer, UserLoginSerializer, UserBasicSerializer,
    UserSerializer, EstadoDiarioLesionSerializer, LesionActivaSerializer,
    UserDetailSerializer, UserRegistrationByAdminSerializer
)
import re
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

User = get_user_model()

# Clase de permisos personalizada
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo lectura a no-administradores
    y escritura completa a administradores
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.groups.filter(name='Administrador').exists()
        )

class IsMedicoOrAdmin(permissions.BasePermission):
    """
    Permiso para operaciones que requieren ser médico o administrador
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return (request.user.is_superuser or 
                request.user.groups.filter(name__in=['Administrador', 'Cuerpo médico']).exists())

# Vista para gestión de usuarios (solo administradores)
class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de usuarios - Solo administradores
    """
    queryset = User.objects.all().select_related('profile').prefetch_related('groups')
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'profile__rut']
    ordering_fields = ['last_name', 'first_name', 'date_joined']
    ordering = ['last_name', 'first_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationByAdminSerializer
        return UserDetailSerializer

    @action(detail=False, methods=['get'])
    def roles(self, request):
        """Endpoint para obtener los roles disponibles"""
        roles = Group.objects.exclude(name='Administrador').values_list('name', flat=True)
        return Response(list(roles))

    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """Cambiar el rol de un usuario"""
        user = self.get_object()
        new_role = request.data.get('role')
        
        if not new_role:
            return Response({'error': 'Rol requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Remover grupos actuales (excepto Administrador si es superuser)
            if not user.is_superuser:
                user.groups.clear()
            else:
                user.groups.exclude(name='Administrador').delete()
            
            # Asignar nuevo grupo
            group = Group.objects.get(name=new_role)
            user.groups.add(group)
            
            serializer = self.get_serializer(user)
            return Response(serializer.data)
            
        except Group.DoesNotExist:
            return Response({'error': 'Rol no válido'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activar/desactivar usuario"""
        user = self.get_object()
        
        # No permitir desactivar superusuarios
        if user.is_superuser:
            return Response({'error': 'No se puede desactivar un superusuario'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = not user.is_active
        user.save()
        
        # También actualizar el perfil
        if hasattr(user, 'profile'):
            user.profile.activo = user.is_active
            user.profile.save()
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)

# Create your views here.

class InformeLesionesView(APIView):
    """
    Vista para generar informes de lesiones en un rango de fechas específico
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response({
                'error': 'Los parámetros start_date y end_date son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from django.db.models import Q
            
            # Consultar nuevas lesiones en el rango de fechas
            nuevas_lesiones = Lesion.objects.filter(
                fecha_lesion__range=[start_date, end_date]
            ).select_related('jugador').order_by('fecha_lesion')
            
            # Consultar lesiones finalizadas en el rango de fechas
            lesiones_finalizadas = Lesion.objects.filter(
                fecha_fin__range=[start_date, end_date]
            ).select_related('jugador').order_by('fecha_fin')
            
            # Consultar lesiones activas (que no tienen fecha_fin o fecha_fin es posterior al período)
            lesiones_activas = Lesion.objects.filter(
                Q(fecha_fin__isnull=True) | Q(fecha_fin__gt=end_date),
                fecha_lesion__lte=end_date
            ).select_related('jugador').order_by('fecha_lesion')
            
            # Consultar cambios de estado diarios en el rango de fechas
            cambios_diarios = EstadoDiarioLesion.objects.filter(
                fecha__range=[start_date, end_date]
            ).select_related('lesion__jugador', 'registrado_por').order_by('fecha')
            
            # Serializar los datos
            nuevas_lesiones_data = LesionSerializer(nuevas_lesiones, many=True, context={'request': request}).data
            lesiones_finalizadas_data = LesionSerializer(lesiones_finalizadas, many=True, context={'request': request}).data
            lesiones_activas_data = LesionSerializer(lesiones_activas, many=True, context={'request': request}).data
            cambios_diarios_data = EstadoDiarioLesionSerializer(cambios_diarios, many=True, context={'request': request}).data
            
            # Preparar respuesta estructurada
            response_data = {
                'periodo': {
                    'inicio': start_date,
                    'fin': end_date
                },
                'nuevas_lesiones': nuevas_lesiones_data,
                'lesiones_finalizadas': lesiones_finalizadas_data,
                'lesiones_activas': lesiones_activas_data,
                'cambios_diarios': cambios_diarios_data,
                'resumen': {
                    'total_nuevas_lesiones': len(nuevas_lesiones_data),
                    'total_lesiones_finalizadas': len(lesiones_finalizadas_data),
                    'total_lesiones_activas': len(lesiones_activas_data),
                    'total_cambios_diarios': len(cambios_diarios_data)
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Error al generar el informe: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Vistas para la API REST
class DivisionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar divisiones
    """
    queryset = Division.objects.all().order_by('nombre')
    serializer_class = DivisionSerializer
    permission_classes = [IsAdminOrReadOnly]
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
    permission_classes = [IsMedicoOrAdmin]
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
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_foto(self, request, pk=None):
        """
        Endpoint personalizado para subir foto de perfil
        """
        jugador = self.get_object()
        
        if 'foto_perfil' not in request.FILES:
            return Response({
                'error': 'No se ha enviado ningún archivo'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Actualizar la foto del jugador
        jugador.foto_perfil = request.FILES['foto_perfil']
        jugador.save()
        
        # Serializar el jugador actualizado
        serializer = self.get_serializer(jugador, context={'request': request})
        
        return Response({
            'message': 'Foto subida exitosamente',
            'jugador': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def lesiones(self, request, pk=None):
        """
        Endpoint para obtener todas las lesiones de un jugador específico
        """
        jugador = self.get_object()
        lesiones = Lesion.objects.filter(jugador=jugador).order_by('-fecha_lesion')
        
        # Usar el serializer de lesiones para devolver los datos completos
        from .serializers import LesionSerializer
        serializer = LesionSerializer(lesiones, many=True, context={'request': request})
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class AtencionKinesicaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar atenciones kinésicas
    """
    queryset = AtencionKinesica.objects.all().select_related('jugador', 'profesional_a_cargo').order_by('-fecha_atencion')
    serializer_class = AtencionKinesicaSerializer
    permission_classes = [IsMedicoOrAdmin]
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
    permission_classes = [IsMedicoOrAdmin]
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

    @action(detail=False, methods=['get'])
    def activas(self, request):
        """
        Obtiene todas las lesiones activas
        """
        lesiones_activas = Lesion.objects.filter(esta_activa=True).select_related('jugador').prefetch_related('historial_diario')
        serializer = LesionActivaSerializer(lesiones_activas, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def historial_diario(self, request, pk=None):
        """
        Obtiene el historial diario de una lesión específica
        """
        lesion = self.get_object()
        historial = lesion.historial_diario.all()
        serializer = EstadoDiarioLesionSerializer(historial, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """
        Finaliza una lesión marcándola como inactiva
        """
        lesion = self.get_object()
        lesion.esta_activa = False
        lesion.fecha_fin = timezone.now().date()
        lesion.save()
        return Response({
            'status': 'success',
            'message': 'Lesión finalizada correctamente',
            'fecha_fin': lesion.fecha_fin
        }, status=status.HTTP_200_OK)

class ArchivoMedicoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar archivos médicos
    """
    queryset = ArchivoMedico.objects.all().select_related('jugador').order_by('-fecha_documento')
    serializer_class = ArchivoMedicoSerializer
    permission_classes = [IsMedicoOrAdmin]
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

class PartidoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar partidos
    """
    queryset = Partido.objects.all().prefetch_related('convocados').order_by('-fecha')
    serializer_class = PartidoSerializer
    permission_classes = [IsMedicoOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['condicion', 'fecha']
    search_fields = ['rival']
    ordering_fields = ['fecha', 'rival']
    
    def get_queryset(self):
        """
        Permite filtrar por fecha y condición
        """
        queryset = Partido.objects.all().prefetch_related('convocados').order_by('-fecha')
        fecha_desde = self.request.query_params.get('fecha_desde', None)
        fecha_hasta = self.request.query_params.get('fecha_hasta', None)
        condicion = self.request.query_params.get('condicion', None)
        
        if fecha_desde:
            queryset = queryset.filter(fecha__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha__lte=fecha_hasta)
        if condicion:
            queryset = queryset.filter(condicion=condicion)
            
        return queryset
    
    def get_serializer_context(self):
        """
        Añadir el request al contexto para generar URLs absolutas
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    @action(detail=True, methods=['get'])
    def convocados(self, request, pk=None):
        """
        Obtiene los jugadores convocados para un partido específico
        """
        partido = self.get_object()
        convocados = partido.convocados.all()
        serializer = JugadorSerializer(convocados, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def convocar_jugador(self, request, pk=None):
        """
        Convoca un jugador para el partido
        """
        partido = self.get_object()
        jugador_id = request.data.get('jugador_id')
        
        try:
            jugador = Jugador.objects.get(id=jugador_id)
            
            # Verificar que no se excedan los 22 jugadores
            if partido.convocados.count() >= 22:
                return Response({
                    'error': 'No se pueden convocar más de 22 jugadores para un partido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            partido.convocados.add(jugador)
            return Response({
                'message': f'Jugador {jugador} convocado exitosamente'
            }, status=status.HTTP_200_OK)
            
        except Jugador.DoesNotExist:
            return Response({
                'error': 'Jugador no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def quitar_convocatoria(self, request, pk=None):
        """
        Quita la convocatoria de un jugador para el partido
        """
        partido = self.get_object()
        jugador_id = request.data.get('jugador_id')
        
        try:
            jugador = Jugador.objects.get(id=jugador_id)
            partido.convocados.remove(jugador)
            return Response({
                'message': f'Convocatoria de {jugador} retirada exitosamente'
            }, status=status.HTTP_200_OK)
            
        except Jugador.DoesNotExist:
            return Response({
                'error': 'Jugador no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

class ChecklistPostPartidoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar checklists post-partido
    """
    queryset = ChecklistPostPartido.objects.all().select_related('jugador', 'realizado_por', 'partido').order_by('-partido__fecha')
    serializer_class = ChecklistPostPartidoSerializer
    permission_classes = [IsMedicoOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'jugador', 'partido', 'realizado_por', 'dolor_molestia', 'intensidad_dolor',
        'zona_anatomica_dolor', 'mecanismo_dolor_evaluado', 'momento_aparicion_molestia'
    ]
    search_fields = ['partido__rival', 'diagnostico_presuntivo_postpartido', 'jugador__nombres', 'jugador__apellidos']
    ordering_fields = ['partido__fecha', 'jugador__apellidos', 'dolor_molestia']
    
    def get_queryset(self):
        """
        Permite filtrar por jugador, partido y dolor
        """
        queryset = ChecklistPostPartido.objects.all().select_related('jugador', 'realizado_por', 'partido').order_by('-partido__fecha')
        jugador = self.request.query_params.get('jugador', None)
        partido = self.request.query_params.get('partido', None)
        dolor = self.request.query_params.get('dolor_molestia', None)
        
        if jugador is not None:
            queryset = queryset.filter(jugador=jugador)
        if partido is not None:
            queryset = queryset.filter(partido=partido)
        if dolor is not None:
            queryset = queryset.filter(dolor_molestia=(dolor.lower() == 'true'))
            
        return queryset
    
    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario que realiza el checklist
        """
        serializer.save(realizado_por=self.request.user)
    
    @action(detail=False, methods=['get'])
    def por_partido(self, request):
        """
        Obtiene todos los checklists agrupados por partido
        """
        partido_id = request.query_params.get('partido_id')
        if not partido_id:
            return Response({
                'error': 'Se requiere el parámetro partido_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            partido = Partido.objects.get(id=partido_id)
            checklists = ChecklistPostPartido.objects.filter(partido=partido).select_related('jugador')
            serializer = ChecklistPostPartidoSerializer(checklists, many=True, context={'request': request})
            
            return Response({
                'partido': PartidoSerializer(partido, context={'request': request}).data,
                'checklists': serializer.data
            })
            
        except Partido.DoesNotExist:
            return Response({
                'error': 'Partido no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

class EstadoDiarioLesionViewSet(viewsets.ModelViewSet):
    """
    API endpoint para ver y editar estados diarios de lesiones
    """
    queryset = EstadoDiarioLesion.objects.all().select_related('lesion', 'registrado_por').order_by('-fecha')
    serializer_class = EstadoDiarioLesionSerializer
    permission_classes = [IsMedicoOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lesion', 'fecha', 'estado']
    search_fields = ['lesion__diagnostico_medico', 'lesion__jugador__nombres', 'lesion__jugador__apellidos', 'observaciones']
    ordering_fields = ['fecha', 'lesion__jugador__apellidos']
    
    def get_queryset(self):
        """
        Permite filtrar por lesión
        """
        queryset = EstadoDiarioLesion.objects.all().select_related('lesion', 'registrado_por').order_by('-fecha')
        lesion = self.request.query_params.get('lesion', None)
        
        if lesion is not None:
            queryset = queryset.filter(lesion=lesion)
            
        return queryset

    def perform_create(self, serializer):
        """
        Asigna automáticamente el usuario que registra
        """
        serializer.save(registrado_por=self.request.user)

class EstadosLesionListView(APIView):
    """
    Vista simple para obtener las opciones de estado de lesión
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        estados = [
            {'value': choice[0], 'label': choice[1]}
            for choice in EstadoDiarioLesion.ESTADO_CHOICES
        ]
        return Response(estados)

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
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        rut = serializer.validated_data['rut']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=rut, password=password)
        if user:
            if user.is_active:
                refresh = RefreshToken.for_user(user)
                
                # Obtener el rol del usuario
                role = None
                if user.groups.exists():
                    role = user.groups.first().name
                
                return Response({
                    'refresh': str(refresh),
                    'access_token': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': role,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'La cuenta está desactivada'
                }, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({
                'error': 'Credenciales incorrectas'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
