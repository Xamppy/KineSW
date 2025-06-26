import React, { useState, useEffect } from 'react';
import { getJugadores, getAllLesionesPorJugador, getHistorialDiarioLesion, getDatosInformeLesiones } from '../services/api';
import HistorialLesionGraph from '../components/HistorialLesionGraph';
import InformeTemplate from '../components/informes/InformeTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const HistorialLesionesPage = () => {
  // Estados principales
  const [jugadores, setJugadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [lesionesJugador, setLesionesJugador] = useState([]);
  const [selectedLesion, setSelectedLesion] = useState(null);
  const [historialSeleccionado, setHistorialSeleccionado] = useState([]);
  
  // Estados de carga
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  const [loadingLesiones, setLoadingLesiones] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'jugadores' | 'lesiones' | 'historial'

  // Estados para el modal de informes
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [tipoInforme, setTipoInforme] = useState('diario');
  const [fechaReferencia, setFechaReferencia] = useState(new Date().toISOString().split('T')[0]);
  const [loadingInforme, setLoadingInforme] = useState(false);
  const [datosParaInforme, setDatosParaInforme] = useState(null);

  // Cargar jugadores al montar el componente
  useEffect(() => {
    const cargarJugadores = async () => {
      try {
        setLoadingJugadores(true);
        setError(null);
        setErrorType(null);
        const data = await getJugadores({ activo: true });
        setJugadores(data);
      } catch (err) {
        console.error('Error al cargar jugadores:', err);
        setError('No se pudo cargar la lista de jugadores. Por favor, intenta nuevamente.');
        setErrorType('jugadores');
        setJugadores([]);
      } finally {
        setLoadingJugadores(false);
      }
    };

    cargarJugadores();
  }, []);

  // Cargar lesiones cuando cambie el jugador seleccionado
  useEffect(() => {
    const cargarLesiones = async () => {
      if (!selectedJugador) {
        setLesionesJugador([]);
        setError(null);
        setErrorType(null);
        return;
      }

      try {
        setLoadingLesiones(true);
        setError(null);
        setErrorType(null);
        console.log('Cargando lesiones para jugador:', selectedJugador.id);
        const lesiones = await getAllLesionesPorJugador(selectedJugador.id);
        setLesionesJugador(lesiones);
        console.log('Lesiones cargadas:', lesiones);
      } catch (error) {
        console.error('Error al cargar lesiones:', error);
        setError(`No se pudo cargar el historial de lesiones de ${selectedJugador.nombres} ${selectedJugador.apellidos}. Por favor, intenta nuevamente.`);
        setErrorType('lesiones');
        setLesionesJugador([]);
      } finally {
        setLoadingLesiones(false);
      }
    };

    cargarLesiones();
  }, [selectedJugador]);

  // Cargar historial diario cuando cambie la lesión seleccionada
  useEffect(() => {
    const cargarHistorial = async () => {
      if (!selectedLesion) {
        setHistorialSeleccionado([]);
        // No limpiar error aquí para que persista el error de lesiones si existe
        return;
      }

      try {
        setLoadingHistorial(true);
        // Solo limpiar error si es del tipo historial
        if (errorType === 'historial') {
          setError(null);
          setErrorType(null);
        }
        console.log('Cargando historial diario para lesión:', selectedLesion.id);
        const historial = await getHistorialDiarioLesion(selectedLesion.id);
        setHistorialSeleccionado(historial);
        console.log('Historial diario cargado:', historial);
      } catch (error) {
        console.error('Error al cargar historial diario:', error);
        setError(`No se pudo cargar la evolución de la lesión "${selectedLesion.diagnostico_medico}". Por favor, intenta nuevamente.`);
        setErrorType('historial');
        setHistorialSeleccionado([]);
      } finally {
        setLoadingHistorial(false);
      }
    };

    cargarHistorial();
  }, [selectedLesion, errorType]);

  // Filtrar jugadores por término de búsqueda
  const filteredJugadores = jugadores.filter(jugador =>
    `${jugador.nombres} ${jugador.apellidos}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    jugador.rut.includes(searchTerm)
  );

  // Manejar selección de jugador
  const handleJugadorSelect = (jugador) => {
    setSelectedJugador(jugador);
    setSelectedLesion(null);
    setHistorialSeleccionado([]);
    // Limpiar errores de lesiones e historial al cambiar jugador
    if (errorType === 'lesiones' || errorType === 'historial') {
      setError(null);
      setErrorType(null);
    }
  };

  // Manejar selección de lesión
  const handleLesionSelect = (lesion) => {
    setSelectedLesion(lesion);
    setHistorialSeleccionado([]);
    // Limpiar error de historial al cambiar lesión
    if (errorType === 'historial') {
      setError(null);
      setErrorType(null);
    }
    console.log('Lesión seleccionada:', lesion);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  // Función para reintentar según el tipo de error
  const handleRetry = () => {
    clearError();
    if (errorType === 'jugadores') {
      window.location.reload(); // Recargar página para jugadores
    } else if (errorType === 'lesiones' && selectedJugador) {
      // Forzar recarga de lesiones
      setSelectedJugador({...selectedJugador});
    } else if (errorType === 'historial' && selectedLesion) {
      // Forzar recarga de historial
      setSelectedLesion({...selectedLesion});
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener icono de tipo de lesión
  const getTipoLesionIcon = (tipo) => {
    switch (tipo) {
      case 'muscular':
        return '💪';
      case 'ligamentosa':
        return '🦴';
      case 'osea':
        return '🩻';
      case 'tendinosa':
        return '🎯';
      case 'articular':
        return '⚙️';
      default:
        return '🏥';
    }
  };

  // Función para obtener colores de gravedad
  const getGravedadColor = (gravedad) => {
    switch (gravedad) {
      case 'leve':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'menor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderada':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'grave':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'severa':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para formatear texto amigable
  const formatearTextoAmigable = (texto) => {
    if (!texto) return 'N/A';
    
    // Mapeo de valores específicos conocidos
    const mapeoTextos = {
      // Regiones del cuerpo
      'tobillo_izq': 'Tobillo Izquierdo',
      'tobillo_der': 'Tobillo Derecho',
      'rodilla_izq': 'Rodilla Izquierda',
      'rodilla_der': 'Rodilla Derecha',
      'cadera_izq': 'Cadera Izquierda',
      'cadera_der': 'Cadera Derecha',
      'hombro_izq': 'Hombro Izquierdo',
      'hombro_der': 'Hombro Derecho',
      'muneca_izq': 'Muñeca Izquierda',
      'muneca_der': 'Muñeca Derecha',
      'codo_izq': 'Codo Izquierdo',
      'codo_der': 'Codo Derecho',
      
      // Tipos de lesión
      'muscular': 'Muscular',
      'ligamentosa': 'Ligamentosa',
      'osea': 'Ósea',
      'tendinosa': 'Tendinosa',
      'articular': 'Articular',
      
      // Gravedad
      'leve': 'LEVE',
      'menor': 'MENOR',
      'moderada': 'MODERADA',
      'grave': 'GRAVE',
      'severa': 'SEVERA'
    };
    
    // Si existe un mapeo específico, usarlo
    if (mapeoTextos[texto.toLowerCase()]) {
      return mapeoTextos[texto.toLowerCase()];
    }
    
    // Si no, formatear genéricamente
    return texto
      .replace(/_/g, ' ') // Reemplazar guiones bajos con espacios
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  };

  // Funciones para manejo de informes
  const calcularRangoFechas = (tipo, fecha) => {
    const fechaRef = new Date(fecha);
    let startDate, endDate;

    switch (tipo) {
      case 'diario':
        startDate = new Date(fechaRef);
        endDate = new Date(fechaRef);
        break;
      case 'semanal':
        startDate = new Date(fechaRef);
        startDate.setDate(fechaRef.getDate() - fechaRef.getDay()); // Inicio de semana (domingo)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Fin de semana (sábado)
        break;
      case 'mensual':
        startDate = new Date(fechaRef.getFullYear(), fechaRef.getMonth(), 1);
        endDate = new Date(fechaRef.getFullYear(), fechaRef.getMonth() + 1, 0);
        break;
      case 'anual':
        startDate = new Date(fechaRef.getFullYear(), 0, 1);
        endDate = new Date(fechaRef.getFullYear(), 11, 31);
        break;
      default:
        startDate = endDate = new Date(fechaRef);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const handleGenerarInforme = async () => {
    try {
      setLoadingInforme(true);
      const { startDate, endDate } = calcularRangoFechas(tipoInforme, fechaReferencia);
      
      console.log('Generando informe:', { tipoInforme, fechaReferencia, startDate, endDate });
      
      const datos = await getDatosInformeLesiones(startDate, endDate);
      console.log('Datos del informe obtenidos:', datos);
      
      setDatosParaInforme(datos);
      setShowInformeModal(false);
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al generar el informe. Por favor, intenta nuevamente.');
    } finally {
      setLoadingInforme(false);
    }
  };

  // useEffect para generar PDF cuando cambien los datos del informe
  useEffect(() => {
    const generarPDF = async () => {
      if (!datosParaInforme) return;

      try {
        console.log('Generando PDF nativo optimizado para impresión...');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Dimensiones y configuración
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;
        let pageNumber = 1;
        
        // Función para añadir nueva página
        const addNewPage = () => {
          pdf.addPage();
          pageNumber++;
          currentY = margin;
          
          // Encabezado en páginas adicionales
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text('Santiago Wanderers - Informe de Lesionados', margin, 15);
          
          // Número de página
          pdf.setFontSize(8);
          pdf.setTextColor(120);
          pdf.text(`Página ${pageNumber}`, pageWidth - margin - 20, pageHeight - 10);
          
          currentY = 25;
        };
        
        // Función para verificar espacio y añadir página si es necesario
        const checkPageSpace = (requiredSpace) => {
          if (currentY + requiredSpace > pageHeight - margin - 15) {
            addNewPage();
          }
        };
        
        // ENCABEZADO CON LOGO
        // Añadir logo si está disponible
        try {
          // Crear canvas temporal para convertir la imagen
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const logoImg = new Image();
          
          // Intentar cargar el logo
          await new Promise((resolve, reject) => {
            logoImg.onload = () => {
              canvas.width = logoImg.width;
              canvas.height = logoImg.height;
              ctx.drawImage(logoImg, 0, 0);
              
              // Convertir a base64 y añadir al PDF
              const imgData = canvas.toDataURL('image/png');
              pdf.addImage(imgData, 'PNG', margin, currentY, 16, 16);
              resolve();
            };
            logoImg.onerror = () => reject(new Error('No se pudo cargar el logo'));
            logoImg.src = '/logo-sw.png';
          });
          
          // Texto del encabezado al lado del logo
          pdf.setFontSize(20);
          pdf.setTextColor(5, 150, 105); // Verde Santiago Wanderers
          pdf.text('Equipo Médico Santiago Wanderers', margin + 20, currentY + 8);
          
          pdf.setFontSize(14);
          pdf.setTextColor(100);
          pdf.text('Informe de Lesionados', margin + 20, currentY + 14);
          
        } catch (error) {
          console.log('Logo no disponible, usando encabezado sin logo:', error);
          // Encabezado sin logo como fallback
          pdf.setFontSize(20);
          pdf.setTextColor(5, 150, 105);
          pdf.text('Equipo Médico Santiago Wanderers', margin, currentY + 8);
          
          pdf.setFontSize(14);
          pdf.setTextColor(100);
          pdf.text('Informe de Lesionados', margin, currentY + 14);
        }
        
        currentY += 20;
        
        // Fecha de generación
        pdf.setFontSize(10);
        pdf.setTextColor(150);
        const fechaGeneracion = new Date().toLocaleDateString('es-ES');
        pdf.text(`Generado el ${fechaGeneracion}`, pageWidth - margin - 40, margin + 5);
        
        // PERÍODO DEL INFORME
        pdf.setFontSize(14);
        pdf.setTextColor(60);
        pdf.text('Período del Informe', margin, currentY);
        currentY += 8;
        
        pdf.setFontSize(16);
        pdf.setTextColor(5, 150, 105);
        const periodo = `${formatearFecha(datosParaInforme.periodo.inicio)} al ${formatearFecha(datosParaInforme.periodo.fin)}`;
        pdf.text(periodo, margin, currentY);
        currentY += 15;
        
        // RESUMEN EJECUTIVO CON DISEÑO PROFESIONAL
        pdf.setFillColor(248, 250, 252); // Fondo gris claro
        pdf.rect(margin, currentY, contentWidth, 40, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(margin, currentY, contentWidth, 40, 'S');
        
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text('RESUMEN EJECUTIVO', margin + 5, currentY + 8);
        
        currentY += 15;
        
        const resumen = [
          { 
            label: 'Lesiones Activas', 
            value: datosParaInforme.resumen.total_nuevas_lesiones, 
            color: [220, 38, 38], // Rojo para activas
            icon: '⚠️'
          },
          { 
            label: 'Lesiones Finalizadas', 
            value: datosParaInforme.resumen.total_lesiones_finalizadas, 
            color: [34, 197, 94], // Verde para finalizadas
            icon: '✅'
          },
          { 
            label: 'Seguimientos', 
            value: datosParaInforme.resumen.total_cambios_diarios, 
            color: [59, 130, 246], // Azul para seguimientos
            icon: '📊'
          }
        ];
        
        // Tarjetas de resumen más elegantes
        const cardWidth = (contentWidth - 20) / 3;
        let xPos = margin + 5;
        
        resumen.forEach((item, index) => {
          // Fondo de la tarjeta
          pdf.setFillColor(255, 255, 255);
          pdf.rect(xPos, currentY, cardWidth, 20, 'F');
          pdf.setDrawColor(item.color[0], item.color[1], item.color[2]);
          pdf.setLineWidth(0.5);
          pdf.rect(xPos, currentY, cardWidth, 20, 'S');
          
          // Línea superior de color
          pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
          pdf.rect(xPos, currentY, cardWidth, 3, 'F');
          
          // Número principal
          pdf.setFontSize(20);
          pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
          pdf.text(item.value.toString(), xPos + cardWidth/2, currentY + 12, { align: 'center' });
          
          // Etiqueta
          pdf.setFontSize(8);
          pdf.setTextColor(71, 85, 105);
          pdf.text(item.label, xPos + cardWidth/2, currentY + 17, { align: 'center' });
          
          xPos += cardWidth + 5;
        });
        
        currentY += 50;
        
        // SECCIÓN LESIONES ACTIVAS
        if (datosParaInforme.nuevas_lesiones && datosParaInforme.nuevas_lesiones.length > 0) {
          checkPageSpace(50);
          
          // Encabezado de sección con icono y color
          pdf.setFillColor(254, 242, 242); // Fondo rojo claro
          pdf.rect(margin, currentY, contentWidth, 12, 'F');
          pdf.setDrawColor(220, 38, 38);
          pdf.setLineWidth(2);
          pdf.line(margin, currentY, margin + contentWidth, currentY);
          
          pdf.setFontSize(14);
          pdf.setTextColor(220, 38, 38);
          pdf.text('LESIONES ACTIVAS', margin + 5, currentY + 8);
          
          pdf.setFontSize(9);
          pdf.setTextColor(127, 29, 29);
          pdf.text(`Total: ${datosParaInforme.nuevas_lesiones.length} lesiones`, margin + contentWidth - 50, currentY + 8);
          
          currentY += 18;
          
          // Encabezado simplificado para formato de 2 líneas
          pdf.setFillColor(220, 38, 38);
          pdf.rect(margin, currentY, contentWidth, 12, 'F');
          
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.text('JUGADOR | FECHA | DIAGNÓSTICO COMPLETO', margin + 4, currentY + 8);
          currentY += 12;
          
          // Filas de datos con formato de 2 líneas más grandes
          datosParaInforme.nuevas_lesiones.forEach((lesion, index) => {
            checkPageSpace(30);
            
            // Fondo alternado más alto
            if (index % 2 === 0) {
              pdf.setFillColor(254, 242, 242);
              pdf.rect(margin, currentY, contentWidth, 30, 'F');
            }
            
            // Borde izquierdo de color según gravedad
            pdf.setFillColor(220, 38, 38);
            pdf.rect(margin, currentY, 2, 30, 'F');
            
            // PRIMERA LÍNEA
            pdf.setFontSize(10);
            pdf.setTextColor(51, 51, 51);
            
            // Nombre del jugador en negrita (línea 1)
            pdf.setFont('helvetica', 'bold');
            pdf.text(lesion.jugador_nombre, margin + 6, currentY + 10);
            
            // Fecha (línea 1)
            pdf.setFont('helvetica', 'normal');
            pdf.text(formatearFecha(lesion.fecha_lesion), margin + 6, currentY + 18);
            
            // SEGUNDA LÍNEA - Diagnóstico completo
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Diagnóstico:', margin + 6, currentY + 26);
            
            pdf.setTextColor(51, 51, 51);
            pdf.setFont('helvetica', 'normal');
            
            // Dividir diagnóstico en múltiples líneas si es muy largo
            const diagnosticoCompleto = lesion.diagnostico_medico;
            if (diagnosticoCompleto.length > 70) {
              const linea1 = diagnosticoCompleto.substring(0, 70);
              const linea2 = diagnosticoCompleto.substring(70, 140);
              pdf.text(linea1, margin + 35, currentY + 26);
              if (linea2) {
                // Aumentar altura si necesita segunda línea
                checkPageSpace(8);
                if (index % 2 === 0) {
                  pdf.setFillColor(254, 242, 242);
                  pdf.rect(margin, currentY, contentWidth, 38, 'F');
                }
                pdf.setFillColor(220, 38, 38);
                pdf.rect(margin, currentY, 2, 38, 'F');
                pdf.text(linea2, margin + 35, currentY + 33);
                currentY += 8;
              }
            } else {
              pdf.text(diagnosticoCompleto, margin + 35, currentY + 26);
            }
            
            // Tipo y Región en la esquina derecha - alineados
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Tipo:', margin + contentWidth - 75, currentY + 10);
            pdf.setTextColor(51, 51, 51);
            pdf.setFont('helvetica', 'normal');
            pdf.text(lesion.tipo_lesion_display, margin + contentWidth - 50, currentY + 10);
            
            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Región:', margin + contentWidth - 75, currentY + 18);
            pdf.setTextColor(51, 51, 51);
            pdf.setFont('helvetica', 'normal');
            pdf.text(lesion.region_cuerpo_display, margin + contentWidth - 50, currentY + 18);
            
            currentY += 35;
          });
          
          currentY += 15;
        } else {
          // Mensaje cuando no hay lesiones activas
          checkPageSpace(30);
          pdf.setFillColor(240, 253, 244);
          pdf.rect(margin, currentY, contentWidth, 20, 'F');
          pdf.setDrawColor(34, 197, 94);
          pdf.rect(margin, currentY, contentWidth, 20, 'S');
          
          pdf.setFontSize(12);
          pdf.setTextColor(34, 197, 94);
          pdf.text('No hay lesiones activas en este período', margin + contentWidth/2, currentY + 12, { align: 'center' });
          
          currentY += 35;
        }
        
        // SECCIÓN LESIONES FINALIZADAS
        if (datosParaInforme.lesiones_finalizadas && datosParaInforme.lesiones_finalizadas.length > 0) {
          checkPageSpace(50);
          
          // Encabezado de sección con icono y color
          pdf.setFillColor(240, 253, 244); // Fondo verde claro
          pdf.rect(margin, currentY, contentWidth, 12, 'F');
          pdf.setDrawColor(34, 197, 94);
          pdf.setLineWidth(2);
          pdf.line(margin, currentY, margin + contentWidth, currentY);
          
          pdf.setFontSize(14);
          pdf.setTextColor(34, 197, 94);
          pdf.text('LESIONES FINALIZADAS', margin + 5, currentY + 8);
          
          pdf.setFontSize(9);
          pdf.setTextColor(21, 128, 61);
          pdf.text(`Total: ${datosParaInforme.lesiones_finalizadas.length} recuperaciones`, margin + contentWidth - 60, currentY + 8);
          
          currentY += 18;
          
          // Encabezado simplificado para formato de 2 líneas
          pdf.setFillColor(34, 197, 94);
          pdf.rect(margin, currentY, contentWidth, 12, 'F');
          
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.text('JUGADOR | FECHA ALTA | DIAGNÓSTICO COMPLETO | DURACIÓN', margin + 4, currentY + 8);
          currentY += 12;
          
          // Filas de datos con formato de 2 líneas más grandes
          datosParaInforme.lesiones_finalizadas.forEach((lesion, index) => {
            checkPageSpace(30);
            
            // Fondo alternado más alto
            if (index % 2 === 0) {
              pdf.setFillColor(240, 253, 244);
              pdf.rect(margin, currentY, contentWidth, 30, 'F');
            }
            
            // Borde izquierdo verde
            pdf.setFillColor(34, 197, 94);
            pdf.rect(margin, currentY, 2, 30, 'F');
            
            // Calcular duración si hay fechas
            let duracion = 'N/A';
            if (lesion.fecha_lesion && lesion.fecha_fin) {
              const fechaInicio = new Date(lesion.fecha_lesion);
              const fechaFin = new Date(lesion.fecha_fin);
              const dias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
              duracion = `${dias} días`;
            }
            
            // PRIMERA LÍNEA
            pdf.setFontSize(10);
            pdf.setTextColor(51, 51, 51);
            
            // Nombre del jugador en negrita (línea 1)
            pdf.setFont('helvetica', 'bold');
            pdf.text(lesion.jugador_nombre, margin + 6, currentY + 10);
            
            // Fecha de alta (línea 1)
            pdf.setFont('helvetica', 'normal');
            pdf.text('Alta: ' + formatearFecha(lesion.fecha_fin), margin + 6, currentY + 18);
            
            // SEGUNDA LÍNEA - Diagnóstico completo
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Diagnóstico:', margin + 6, currentY + 26);
            
            pdf.setTextColor(51, 51, 51);
            pdf.setFont('helvetica', 'normal');
            
            // Dividir diagnóstico en múltiples líneas si es muy largo
            const diagnosticoCompleto = lesion.diagnostico_medico;
            if (diagnosticoCompleto.length > 70) {
              const linea1 = diagnosticoCompleto.substring(0, 70);
              const linea2 = diagnosticoCompleto.substring(70, 140);
              pdf.text(linea1, margin + 35, currentY + 26);
              if (linea2) {
                // Aumentar altura si necesita segunda línea
                checkPageSpace(8);
                if (index % 2 === 0) {
                  pdf.setFillColor(240, 253, 244);
                  pdf.rect(margin, currentY, contentWidth, 38, 'F');
                }
                pdf.setFillColor(34, 197, 94);
                pdf.rect(margin, currentY, 2, 38, 'F');
                pdf.text(linea2, margin + 35, currentY + 33);
                currentY += 8;
              }
            } else {
              pdf.text(diagnosticoCompleto, margin + 35, currentY + 26);
            }
            
            // Tipo y Duración en la esquina derecha - alineados
            pdf.setFontSize(9);
            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Tipo:', margin + contentWidth - 75, currentY + 10);
            pdf.setTextColor(51, 51, 51);
            pdf.setFont('helvetica', 'normal');
            pdf.text(lesion.tipo_lesion_display, margin + contentWidth - 50, currentY + 10);
            
            pdf.setTextColor(75, 85, 99);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Duración:', margin + contentWidth - 75, currentY + 18);
            pdf.setTextColor(51, 51, 51);
            pdf.setFont('helvetica', 'normal');
            pdf.text(duracion, margin + contentWidth - 50, currentY + 18);
            
            currentY += 35;
          });
          
          currentY += 15;
        } else {
          // Mensaje cuando no hay lesiones finalizadas
          checkPageSpace(30);
          pdf.setFillColor(254, 242, 242);
          pdf.rect(margin, currentY, contentWidth, 20, 'F');
          pdf.setDrawColor(220, 38, 38);
          pdf.rect(margin, currentY, contentWidth, 20, 'S');
          
          pdf.setFontSize(12);
          pdf.setTextColor(220, 38, 38);
          pdf.text('No hay lesiones finalizadas en este período', margin + contentWidth/2, currentY + 12, { align: 'center' });
          
          currentY += 35;
        }
        
        // SECCIÓN SEGUIMIENTOS Y EVOLUCIÓN
        if (datosParaInforme.cambios_diarios && datosParaInforme.cambios_diarios.length > 0) {
          checkPageSpace(50);
          
          // Encabezado de sección
          pdf.setFillColor(239, 246, 255); // Fondo azul claro
          pdf.rect(margin, currentY, contentWidth, 12, 'F');
          pdf.setDrawColor(59, 130, 246);
          pdf.setLineWidth(2);
          pdf.line(margin, currentY, margin + contentWidth, currentY);
          
          pdf.setFontSize(14);
          pdf.setTextColor(59, 130, 246);
          pdf.text('SEGUIMIENTOS Y EVOLUCION', margin + 5, currentY + 8);
          
          pdf.setFontSize(9);
          pdf.setTextColor(30, 64, 175);
          pdf.text(`Total: ${datosParaInforme.cambios_diarios.length} registros`, margin + contentWidth - 50, currentY + 8);
          
          currentY += 18;
          
          // Agrupar cambios por jugador para mejor organización
          const cambiosPorJugador = {};
          datosParaInforme.cambios_diarios.forEach(cambio => {
            const nombreJugador = cambio.lesion?.jugador_nombre || cambio.jugador_nombre || 'Jugador desconocido';
            if (!cambiosPorJugador[nombreJugador]) {
              cambiosPorJugador[nombreJugador] = [];
            }
            cambiosPorJugador[nombreJugador].push(cambio);
          });
          
          // Mostrar solo los primeros 5 jugadores con más seguimientos
          const jugadoresOrdenados = Object.keys(cambiosPorJugador)
            .sort((a, b) => cambiosPorJugador[b].length - cambiosPorJugador[a].length)
            .slice(0, 5);
          
          jugadoresOrdenados.forEach((jugador, jugadorIndex) => {
            checkPageSpace(25);
            
            // Tarjeta por jugador
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin, currentY, contentWidth, 20, 'F');
            pdf.setDrawColor(226, 232, 240);
            pdf.rect(margin, currentY, contentWidth, 20, 'S');
            
            // Borde izquierdo azul
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin, currentY, 3, 20, 'F');
            
            // Nombre del jugador
            pdf.setFontSize(10);
            pdf.setTextColor(30, 41, 59);
            pdf.setFont('helvetica', 'bold');
            pdf.text(jugador, margin + 8, currentY + 6);
            
            // Número de seguimientos
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${cambiosPorJugador[jugador].length} seguimientos`, margin + 8, currentY + 10);
            
            // Último estado
            const ultimoCambio = cambiosPorJugador[jugador][cambiosPorJugador[jugador].length - 1];
            pdf.setFontSize(8);
            pdf.setTextColor(59, 130, 246);
            pdf.text(`Último estado: ${ultimoCambio.estado_display || ultimoCambio.estado_actual || 'N/A'}`, margin + 8, currentY + 14);
            
            // Fecha del último seguimiento
            pdf.setFontSize(7);
            pdf.setTextColor(156, 163, 175);
            pdf.text(`Última actualización: ${formatearFecha(ultimoCambio.fecha)}`, margin + contentWidth - 60, currentY + 6);
            
            // Indicador de mejora
            if (ultimoCambio.mejora_notable) {
              pdf.setFillColor(34, 197, 94);
              pdf.circle(margin + contentWidth - 15, currentY + 12, 2, 'F');
              pdf.setFontSize(6);
              pdf.setTextColor(34, 197, 94);
              pdf.text('✓', margin + contentWidth - 16, currentY + 13);
            } else {
              pdf.setFillColor(156, 163, 175);
              pdf.circle(margin + contentWidth - 15, currentY + 12, 2, 'F');
              pdf.setFontSize(6);
              pdf.setTextColor(156, 163, 175);
              pdf.text('○', margin + contentWidth - 16, currentY + 13);
            }
            
            currentY += 25;
          });
          
          // Nota informativa si hay más seguimientos
          if (Object.keys(cambiosPorJugador).length > 5) {
            checkPageSpace(15);
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, currentY, contentWidth, 10, 'F');
            
            pdf.setFontSize(8);
            pdf.setTextColor(107, 114, 128);
            const jugadoresRestantes = Object.keys(cambiosPorJugador).length - 5;
            pdf.text(`* Se muestran los 5 jugadores con más seguimientos. Hay ${jugadoresRestantes} jugadores adicionales con seguimientos.`, 
              margin + 5, currentY + 6);
            
            currentY += 15;
          }
          
          currentY += 10;
        } else {
          // Mensaje cuando no hay seguimientos
          checkPageSpace(30);
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin, currentY, contentWidth, 20, 'F');
          pdf.setDrawColor(156, 163, 175);
          pdf.rect(margin, currentY, contentWidth, 20, 'S');
          
          pdf.setFontSize(12);
          pdf.setTextColor(107, 114, 128);
          pdf.text('No hay seguimientos registrados en este período', margin + contentWidth/2, currentY + 12, { align: 'center' });
          
          currentY += 35;
        }
        
        // PIE DEL INFORME
        checkPageSpace(20);
        pdf.setDrawColor(200);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text('Este informe fue generado automáticamente por el Sistema de Gestión Clínica', margin, currentY);
        currentY += 4;
        pdf.text('Santiago Wanderers - Equipo Médico', margin, currentY);
        currentY += 4;
        pdf.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, margin, currentY);
        
        // Número de página en la primera página
        pdf.setPage(1);
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text('Página 1', pageWidth - margin - 20, pageHeight - 10);
        
        const fileName = `informe-lesionados-${tipoInforme}-${fechaReferencia}.pdf`;
        pdf.save(fileName);
        
        console.log('PDF nativo generado exitosamente:', fileName);
        
        // Limpiar datos después de generar el PDF
        setDatosParaInforme(null);
      } catch (error) {
        console.error('Error al generar PDF:', error);
        alert('Error al generar el PDF. Por favor, intenta nuevamente.');
        setDatosParaInforme(null);
      }
    };

    generarPDF();
  }, [datosParaInforme, tipoInforme, fechaReferencia]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-wanderers-green">
                Historial de Lesiones
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Revisa el historial completo de lesiones de cada jugador
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-500">Total jugadores</p>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                  <p className="text-xl sm:text-2xl font-bold text-wanderers-green">
                    {loadingJugadores ? (
                      <span className="animate-pulse">--</span>
                    ) : (
                      jugadores.length
                    )}
                  </p>
                  <div className="w-2 h-2 rounded-full bg-wanderers-green"></div>
                </div>
              </div>
              <button
                onClick={() => setShowInformeModal(true)}
                className="inline-flex items-center px-4 py-2 bg-wanderers-green text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar Informe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Error Global */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar datos
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reintentar
                  </button>
                  <button
                    onClick={clearError}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Panel Izquierdo - Lista de Jugadores */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-wanderers-green">
                  Seleccionar Jugador
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Busca y selecciona un jugador para ver su historial de lesiones
                </p>
              </div>

              <div className="p-4">
                {/* Barra de búsqueda */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-wanderers-green focus:border-wanderers-green sm:text-sm"
                    placeholder="Buscar por nombre o RUT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Lista de jugadores */}
                {loadingJugadores ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center py-4 mb-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-wanderers-green"></div>
                      <span className="ml-2 text-gray-600 text-sm">Cargando jugadores...</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-20 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">{error}</p>
                  </div>
                ) : filteredJugadores.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {searchTerm ? 'No se encontraron jugadores con ese criterio' : 'No hay jugadores registrados'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredJugadores.map((jugador) => (
                      <button
                        key={jugador.id}
                        onClick={() => handleJugadorSelect(jugador)}
                        className={`
                          w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md
                          ${selectedJugador?.id === jugador.id
                            ? 'border-wanderers-green bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-wanderers-green'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg flex-shrink-0">👤</span>
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {jugador.nombres} {jugador.apellidos}
                              </h3>
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">División:</span> {jugador.division_nombre}
                              </p>
                              <p className="text-xs text-gray-600">
                                <span className="font-medium">RUT:</span> {jugador.rut}
                              </p>
                            </div>
                          </div>

                          <div className="ml-2 flex-shrink-0">
                            <svg 
                              className={`w-5 h-5 transition-colors duration-200 ${
                                selectedJugador?.id === jugador.id
                                  ? 'text-wanderers-green'
                                  : 'text-gray-400'
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Historial del Jugador */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-wanderers-green">
                  {selectedJugador ? `Historial de ${selectedJugador.nombres} ${selectedJugador.apellidos}` : 'Historial de Lesiones'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedJugador ? 'Registro completo de todas las lesiones' : 'Seleccione un jugador para ver su historial'}
                </p>
              </div>

              <div className="p-6">
                {!selectedJugador ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Seleccione un Jugador
                    </h3>
                    <p className="text-gray-600">
                      Elija un jugador de la lista para ver su historial completo de lesiones
                    </p>
                  </div>
                ) : loadingLesiones ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-wanderers-green border-opacity-20 mx-auto mb-4">
                        <div className="absolute top-0 left-0 h-12 w-12 border-4 border-wanderers-green border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-wanderers-green font-semibold">Cargando historial de lesiones...</p>
                        <p className="text-gray-500 text-sm">
                          Obteniendo el registro completo de {selectedJugador.nombres} {selectedJugador.apellidos}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : lesionesJugador.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-green-500 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sin Lesiones Registradas
                    </h3>
                    <p className="text-gray-600">
                      Este jugador no tiene lesiones registradas en el sistema
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        Resumen de Lesiones
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-sm font-medium text-blue-900">Total de Lesiones</p>
                          <p className="text-2xl font-bold text-blue-600">{lesionesJugador.length}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-medium text-red-900">Lesiones Activas</p>
                          <p className="text-2xl font-bold text-red-600">
                            {lesionesJugador.filter(l => l.esta_activa).length}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-sm font-medium text-green-900">Lesiones Recuperadas</p>
                          <p className="text-2xl font-bold text-green-600">
                            {lesionesJugador.filter(l => !l.esta_activa).length}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Lista de Lesiones */}
                    <div className="space-y-4">
                      <h4 className="text-base font-medium text-gray-900">
                        Historial de Lesiones
                      </h4>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {lesionesJugador.map((lesion) => (
                          <div
                            key={lesion.id}
                            onClick={() => handleLesionSelect(lesion)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                              ${selectedLesion?.id === lesion.id
                                ? 'border-wanderers-green bg-green-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-wanderers-green'
                              }
                            `}
                          >
                            {/* Header de la lesión */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-lg">{getTipoLesionIcon(lesion.tipo_lesion)}</span>
                                  <h5 className="font-semibold text-gray-900 text-sm flex-1">
                                    {lesion.diagnostico_medico}
                                  </h5>
                                  {/* Badge de estado prominente */}
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border-2 ${
                                      lesion.esta_activa
                                        ? 'bg-red-100 text-red-900 border-red-300 shadow-sm'
                                        : 'bg-green-100 text-green-900 border-green-300 shadow-sm'
                                    }`}
                                  >
                                    {lesion.esta_activa ? 'ACTIVA' : 'RECUPERADA'}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Inicio:</span>
                                    <span className="ml-1">{formatearFecha(lesion.fecha_lesion)}</span>
                                  </div>
                                  
                                  {lesion.fecha_fin ? (
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="font-medium">Fin:</span>
                                      <span className="ml-1">{formatearFecha(lesion.fecha_fin)}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-orange-600">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="font-medium">En progreso</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium">Región:</span>
                                    <span className="ml-1">{formatearTextoAmigable(lesion.region_cuerpo_display || lesion.region_cuerpo)}</span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">Tipo:</span>
                                    <span className="ml-1">{formatearTextoAmigable(lesion.tipo_lesion_display || lesion.tipo_lesion)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end space-y-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${getGravedadColor(lesion.gravedad_lesion)}`}
                                >
                                  {formatearTextoAmigable(lesion.gravedad_lesion_display || lesion.gravedad_lesion)}
                                </span>
                              </div>
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 text-xs bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-wanderers-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <span className="font-semibold text-gray-800">Días estimados:</span>
                                  <span className="ml-1 text-wanderers-green font-bold">{lesion.dias_recuperacion_estimados}</span>
                                </div>
                              </div>
                              
                              {lesion.dias_recuperacion_reales ? (
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <span className="font-semibold text-gray-800">Días reales:</span>
                                    <span className="ml-1 text-green-600 font-bold">{lesion.dias_recuperacion_reales}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center text-orange-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-semibold">En recuperación...</span>
                                </div>
                              )}
                            </div>

                            {/* Indicador de selección */}
                            {selectedLesion?.id === lesion.id && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-wanderers-green to-green-600 rounded-lg text-white">
                                <div className="flex items-center justify-center">
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-bold text-sm">LESIÓN SELECCIONADA</span>
                                </div>
                                <p className="text-center text-xs mt-1 opacity-90">
                                  Revisa los detalles y evolución abajo
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detalles de la Lesión Seleccionada */}
                    {selectedLesion && (
                      <div className="mt-6 space-y-6">
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-wanderers-green mb-4">
                            📋 Detalles de la Lesión Seleccionada
                          </h4>
                          
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                            {/* Header de la lesión */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getTipoLesionIcon(selectedLesion.tipo_lesion)}</span>
                                <div>
                                  <h5 className="text-xl font-bold text-gray-900">
                                    {selectedLesion.diagnostico_medico}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {selectedJugador.nombres} {selectedJugador.apellidos}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGravedadColor(selectedLesion.gravedad_lesion)}`}
                                >
                                  {formatearTextoAmigable(selectedLesion.gravedad_lesion_display || selectedLesion.gravedad_lesion)}
                                </span>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedLesion.esta_activa
                                      ? 'bg-red-100 text-red-800 border-red-200'
                                      : 'bg-green-100 text-green-800 border-green-200'
                                  }`}
                                >
                                  {selectedLesion.esta_activa ? 'Activa' : 'Recuperada'}
                                </span>
                              </div>
                            </div>

                            {/* Información detallada */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {/* Fechas */}
                              <div className="space-y-3">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                  📅 Fechas
                                </h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Fecha Inicio:</span>
                                    <span className="text-sm font-medium">{formatearFecha(selectedLesion.fecha_lesion)}</span>
                                  </div>
                                  {selectedLesion.fecha_fin && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Fecha Fin:</span>
                                      <span className="text-sm font-medium">{formatearFecha(selectedLesion.fecha_fin)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Características */}
                              <div className="space-y-3">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                  🔍 Características
                                </h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Tipo:</span>
                                    <span className="text-sm font-medium">{formatearTextoAmigable(selectedLesion.tipo_lesion_display || selectedLesion.tipo_lesion)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Región:</span>
                                    <span className="text-sm font-medium">{formatearTextoAmigable(selectedLesion.region_cuerpo_display || selectedLesion.region_cuerpo)}</span>
                                  </div>
                                  {selectedLesion.mecanismo_lesion && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Mecanismo:</span>
                                      <span className="text-sm font-medium">{selectedLesion.mecanismo_lesion}</span>
                                    </div>
                                  )}
                                  {selectedLesion.condicion_deportiva && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Condición:</span>
                                      <span className="text-sm font-medium">{selectedLesion.condicion_deportiva}</span>
                                    </div>
                                  )}
                                  {selectedLesion.etapa_temporada && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Etapa:</span>
                                      <span className="text-sm font-medium">{selectedLesion.etapa_temporada}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Recuperación */}
                              <div className="space-y-3">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                                  ⏱️ Recuperación
                                </h6>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Días Estimados:</span>
                                    <span className="text-sm font-medium">{selectedLesion.dias_recuperacion_estimados} días</span>
                                  </div>
                                  {selectedLesion.dias_recuperacion_reales && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Días Reales:</span>
                                      <span className="text-sm font-medium">{selectedLesion.dias_recuperacion_reales} días</span>
                                    </div>
                                  )}
                                  {selectedLesion.partidos_ausente && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Partidos Ausente:</span>
                                      <span className="text-sm font-medium">{selectedLesion.partidos_ausente}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Observaciones */}
                            {selectedLesion.observaciones && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h6 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">
                                  📝 Observaciones
                                </h6>
                                <p className="text-sm text-gray-700 bg-white rounded p-3 border">
                                  {selectedLesion.observaciones}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gráfica de Historial Diario */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-semibold text-wanderers-green mb-4">
                            📈 Evolución Diaria de la Lesión
                          </h4>
                          
                          {loadingHistorial ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wanderers-green mx-auto mb-4"></div>
                              <p className="text-gray-600">Cargando historial diario...</p>
                            </div>
                          ) : historialSeleccionado.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="text-gray-400 mb-3">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <h5 className="text-lg font-medium text-gray-900 mb-2">
                                Sin Historial Diario
                              </h5>
                              <p className="text-gray-600">
                                Esta lesión no tiene registros de evolución diaria
                              </p>
                            </div>
                          ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <HistorialLesionGraph historial={historialSeleccionado} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configuración de Informe */}
      {showInformeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Generar Informe de Lesiones
                </h3>
                <button
                  onClick={() => setShowInformeModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Informe
                </label>
                <select
                  value={tipoInforme}
                  onChange={(e) => setTipoInforme(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                >
                  <option value="diario">Cambios del Día</option>
                  <option value="semanal">Resumen Semanal</option>
                  <option value="mensual">Resumen Mensual</option>
                  <option value="anual">Resumen Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Referencia
                </label>
                <input
                  type="date"
                  value={fechaReferencia}
                  onChange={(e) => setFechaReferencia(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wanderers-green focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Tipo seleccionado:</strong> {
                    tipoInforme === 'diario' ? 'Informe de un día específico' :
                    tipoInforme === 'semanal' ? 'Informe de la semana que contiene la fecha' :
                    tipoInforme === 'mensual' ? 'Informe del mes seleccionado' :
                    'Informe del año seleccionado'
                  }
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInformeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerarInforme}
                disabled={loadingInforme}
                className="px-4 py-2 bg-wanderers-green text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wanderers-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loadingInforme ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generar y Descargar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template del informe (oculto) */}
      {datosParaInforme && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <InformeTemplate datos={datosParaInforme} />
        </div>
      )}
    </div>
  );
};

export default HistorialLesionesPage; 
