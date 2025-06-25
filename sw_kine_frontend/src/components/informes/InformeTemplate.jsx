import React from 'react';

// Estilos CSS para impresión
const printStyles = `
  @media print {
    .page-break-before {
      page-break-before: always;
    }
    .page-break-after {
      page-break-after: always;
    }
    .page-break-inside-avoid {
      page-break-inside: avoid;
    }
    .no-break {
      break-inside: avoid;
    }
  }
  
  @page {
    size: A4;
    margin: 15mm;
  }
`;

const InformeTemplate = ({ datos }) => {
  // Función para formatear fecha en formato español
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para formatear rango de fechas
  const formatearRangoFechas = (inicio, fin) => {
    const fechaInicio = formatearFecha(inicio);
    const fechaFin = formatearFecha(fin);
    
    if (fechaInicio === fechaFin) {
      return `${fechaInicio}`;
    }
    return `${fechaInicio} al ${fechaFin}`;
  };

  if (!datos) {
    return (
      <div id="informe-para-imprimir" className="p-8 bg-white">
        <div className="text-center text-gray-500">
          Cargando datos del informe...
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div id="informe-para-imprimir" style={{ 
        padding: '20px', 
        backgroundColor: '#ffffff', 
        fontFamily: 'serif', 
        maxWidth: '210mm', // Ancho A4
        margin: '0 auto',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#1f2937',
        minHeight: '297mm' // Alto A4
      }}>
      {/* Encabezado del Informe */}
      <div style={{ 
        borderBottom: '2px solid #059669', 
        paddingBottom: '24px', 
        marginBottom: '32px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <img 
                src="/logo-sw.png" 
                alt="Santiago Wanderers Logo" 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  objectFit: 'contain' 
                }}
              />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#059669',
                margin: '0 0 4px 0'
              }}>
                Equipo Médico Santiago Wanderers
              </h1>
              <p style={{ color: '#6b7280', margin: '0' }}>Informe de Lesionados</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0' }}>Generado el</p>
            <p style={{ fontWeight: '600', margin: '4px 0 0 0' }}>{formatearFecha(new Date())}</p>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          backgroundColor: '#f0fdf4', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '8px' 
          }}>
            Período del Informe
          </h2>
          <p style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#059669',
            margin: '0'
          }}>
            {formatearRangoFechas(datos.periodo.inicio, datos.periodo.fin)}
          </p>
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#374151', 
          marginBottom: '16px',
          borderLeft: '4px solid #059669',
          paddingLeft: '12px'
        }}>
          Resumen Ejecutivo
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            padding: '16px', 
            borderRadius: '8px', 
            textAlign: 'center', 
            border: '1px solid #bbf7d0' 
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#15803d' 
            }}>
              {datos.resumen.total_nuevas_lesiones}
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a' }}>Nuevas Lesiones</div>
          </div>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            padding: '16px', 
            borderRadius: '8px', 
            textAlign: 'center', 
            border: '1px solid #bfdbfe' 
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1d4ed8' 
            }}>
              {datos.resumen.total_lesiones_finalizadas}
            </div>
            <div style={{ fontSize: '12px', color: '#2563eb' }}>Lesiones Finalizadas</div>
          </div>
          <div style={{ 
            backgroundColor: '#fff7ed', 
            padding: '16px', 
            borderRadius: '8px', 
            textAlign: 'center', 
            border: '1px solid #fed7aa' 
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#c2410c' 
            }}>
              {datos.resumen.total_cambios_diarios}
            </div>
            <div style={{ fontSize: '12px', color: '#ea580c' }}>Cambios de Estado</div>
          </div>
        </div>
      </div>

      {/* Sección de Nuevas Lesiones */}
      {datos.nuevas_lesiones && datos.nuevas_lesiones.length > 0 && (
        <div style={{ marginBottom: '32px' }} className="page-break-inside-avoid">
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#374151', 
            marginBottom: '16px',
            borderLeft: '4px solid #ef4444',
            paddingLeft: '12px'
          }}>
            Nuevas Lesiones Registradas en el Período
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              border: '1px solid #d1d5db' 
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Jugador</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Fecha</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Diagnóstico</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Tipo</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Región</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Gravedad</th>
                </tr>
              </thead>
              <tbody>
                {datos.nuevas_lesiones.map((lesion, index) => (
                  <tr key={lesion.id || index} style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' 
                  }}>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px', 
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      {lesion.jugador_nombre}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {formatearFecha(lesion.fecha_lesion)}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '11px'
                    }}>
                      {lesion.diagnostico_medico}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {lesion.tipo_lesion_display}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {lesion.region_cuerpo_display}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        ...(lesion.gravedad_lesion_display?.includes('Leve') ? 
                          { backgroundColor: '#dcfce7', color: '#166534' } :
                          lesion.gravedad_lesion_display?.includes('Moderada') ? 
                          { backgroundColor: '#fef3c7', color: '#92400e' } :
                          lesion.gravedad_lesion_display?.includes('Grave') ? 
                          { backgroundColor: '#fee2e2', color: '#991b1b' } :
                          { backgroundColor: '#f3f4f6', color: '#374151' })
                      }}>
                        {lesion.gravedad_lesion_display}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección de Lesiones Finalizadas */}
      {datos.lesiones_finalizadas && datos.lesiones_finalizadas.length > 0 && (
        <div style={{ marginBottom: '32px' }} className="page-break-inside-avoid">
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#374151', 
            marginBottom: '16px',
            borderLeft: '4px solid #10b981',
            paddingLeft: '12px'
          }}>
            Lesiones Finalizadas en el Período
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              border: '1px solid #d1d5db' 
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Jugador</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Fecha Fin</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Diagnóstico</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Tipo</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Región</th>
                </tr>
              </thead>
              <tbody>
                {datos.lesiones_finalizadas.map((lesion, index) => (
                  <tr key={lesion.id || index} style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' 
                  }}>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px', 
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      {lesion.jugador_nombre}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {formatearFecha(lesion.fecha_fin)}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '11px'
                    }}>
                      {lesion.diagnostico_medico}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {lesion.tipo_lesion_display}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {lesion.region_cuerpo_display}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección de Actividad y Cambios de Estado Diarios */}
      {datos.cambios_diarios && datos.cambios_diarios.length > 0 && (
        <div style={{ marginBottom: '32px' }} className="page-break-inside-avoid">
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#374151', 
            marginBottom: '16px',
            borderLeft: '4px solid #f59e0b',
            paddingLeft: '12px'
          }}>
            Actividad y Cambios de Estado Diarios
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              border: '1px solid #d1d5db' 
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Fecha</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Jugador</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Lesión</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Nuevo Estado</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Profesional</th>
                  <th style={{ 
                    border: '1px solid #d1d5db', 
                    padding: '8px 16px', 
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.cambios_diarios.map((cambio, index) => (
                  <tr key={cambio.id || index} style={{ 
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' 
                  }}>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {formatearFecha(cambio.fecha)}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px', 
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      {cambio.lesion?.jugador_nombre || 'N/A'}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '11px'
                    }}>
                      {cambio.lesion?.diagnostico_medico || 'N/A'}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '500',
                        ...(cambio.estado_display?.includes('Camilla') ? 
                          { backgroundColor: '#fee2e2', color: '#991b1b' } :
                          cambio.estado_display?.includes('Gimnasio') ? 
                          { backgroundColor: '#fef3c7', color: '#92400e' } :
                          cambio.estado_display?.includes('Reintegro') ? 
                          { backgroundColor: '#dcfce7', color: '#166534' } :
                          { backgroundColor: '#f3f4f6', color: '#374151' })
                      }}>
                        {cambio.estado_display}
                      </span>
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '12px'
                    }}>
                      {cambio.registrado_por_nombre}
                    </td>
                    <td style={{ 
                      border: '1px solid #d1d5db', 
                      padding: '8px 16px',
                      fontSize: '11px'
                    }}>
                      {cambio.observaciones || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pie del informe */}
      <div style={{ 
        marginTop: '48px', 
        paddingTop: '24px', 
        borderTop: '1px solid #d1d5db' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#9ca3af' 
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            Este informe fue generado automáticamente por el Sistema de Gestión Clínica
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            Santiago Wanderers - Equipo Médico
          </p>
          <p style={{ margin: '8px 0 0 0' }}>
            Fecha de generación: {formatearFecha(new Date())} a las {new Date().toLocaleTimeString('es-ES')}
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default InformeTemplate; 