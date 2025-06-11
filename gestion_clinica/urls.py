from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DivisionViewSet, JugadorViewSet, AtencionKinesicaViewSet,
    LesionViewSet, ArchivoMedicoViewSet, ChecklistPostPartidoViewSet, PartidoViewSet,
    EstadoDiarioLesionViewSet, EstadosLesionListView,
    login_view, register_view
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Configuración del router para la API
router = DefaultRouter()
router.register(r'divisiones', DivisionViewSet)
router.register(r'jugadores', JugadorViewSet)
router.register(r'atenciones', AtencionKinesicaViewSet)
router.register(r'lesiones', LesionViewSet)
router.register(r'archivos', ArchivoMedicoViewSet)
router.register(r'partidos', PartidoViewSet)
router.register(r'checklists', ChecklistPostPartidoViewSet)
router.register(r'estados-diarios', EstadoDiarioLesionViewSet)

urlpatterns = [
    # URLs de la API
    path('', include(router.urls)),
    # Vista específica para obtener opciones de estados de lesión
    path('estados-lesion-opciones/', EstadosLesionListView.as_view(), name='estados-lesion-opciones'),
    # Rutas de autenticación
    path('auth/login/', login_view, name='auth-login'),
    path('auth/register/', register_view, name='auth-register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
] 