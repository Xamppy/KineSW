from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DivisionViewSet, JugadorViewSet, AtencionKinesicaViewSet,
    LesionViewSet, ArchivoMedicoViewSet, ChecklistPostPartidoViewSet,
    register_user, login_user
)

# Configuración del router para la API
router = DefaultRouter()
router.register(r'divisiones', DivisionViewSet)
router.register(r'jugadores', JugadorViewSet)
router.register(r'atenciones', AtencionKinesicaViewSet)
router.register(r'lesiones', LesionViewSet)
router.register(r'archivos', ArchivoMedicoViewSet)
router.register(r'checklists', ChecklistPostPartidoViewSet)

urlpatterns = [
    # URLs de la API
    path('', include(router.urls)),
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
] 