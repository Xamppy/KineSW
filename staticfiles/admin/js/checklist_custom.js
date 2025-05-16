/**
 * JavaScript personalizado para ChecklistPostPartido
 */
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const dolorCheckbox = document.getElementById('id_dolor_molestia');
    const intensidadFieldset = document.querySelector('fieldset.module:nth-of-type(3)');
    const zonasFieldset = document.querySelector('fieldset.module:nth-of-type(4)');
    const mecanismoFieldset = document.querySelector('fieldset.module:nth-of-type(5)');
    const momentoFieldset = document.querySelector('fieldset.module:nth-of-type(6)');
    
    // Referencias a checkboxes de intensidad
    const intensidadLeve = document.getElementById('id_intensidad_leve');
    const intensidadModerada = document.getElementById('id_intensidad_moderada');
    const intensidadSevera = document.getElementById('id_intensidad_severa');
    
    /**
     * Función para alternar la visibilidad de los campos relacionados con el dolor
     */
    function toggleDolorFields() {
        if (!dolorCheckbox) return;
        
        const showFields = dolorCheckbox.checked;
        
        // Mostrar u ocultar fieldsets según sea necesario
        const fieldsets = [intensidadFieldset, zonasFieldset, mecanismoFieldset, momentoFieldset];
        fieldsets.forEach(fieldset => {
            if (fieldset) {
                fieldset.style.display = showFields ? 'block' : 'none';
            }
        });
        
        // Si se oculta, limpiar los valores para evitar datos inconsistentes
        if (!showFields) {
            clearRelatedFields();
        }
    }
    
    /**
     * Función para limpiar campos relacionados con el dolor cuando se desmarca
     * el checkbox principal de dolor_molestia
     */
    function clearRelatedFields() {
        // Limpiar intensidad
        if (intensidadLeve) intensidadLeve.checked = false;
        if (intensidadModerada) intensidadModerada.checked = false;
        if (intensidadSevera) intensidadSevera.checked = false;
        
        // Limpiar zonas anatómicas
        const zonasSelect = document.getElementById('id_zonas_anatomicas');
        if (zonasSelect) {
            for (let i = 0; i < zonasSelect.options.length; i++) {
                zonasSelect.options[i].selected = false;
            }
        }
        
        // Limpiar mecanismos
        const mecanismoFields = [
            'id_mecanismo_sobrecarga', 'id_mecanismo_traumatismo', 
            'id_mecanismo_contacto', 'id_mecanismo_gesto_tecnico', 'id_mecanismo_indeterminado'
        ];
        mecanismoFields.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
        
        // Limpiar momentos
        const momentoFields = [
            'id_momento_primer_tiempo', 'id_momento_segundo_tiempo',
            'id_momento_calentamiento', 'id_momento_post_partido'
        ];
        momentoFields.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = false;
        });
    }
    
    /**
     * Función para gestionar los checkboxes de intensidad (selección única)
     */
    function handleIntensidadCheckboxes(event) {
        if (!event.target.checked) return; // No hacer nada si se desmarca
        
        const checkboxes = [intensidadLeve, intensidadModerada, intensidadSevera].filter(Boolean);
        
        checkboxes.forEach(checkbox => {
            if (checkbox !== event.target) {
                checkbox.checked = false;
            }
        });
    }
    
    // Añadir listeners de eventos
    if (dolorCheckbox) {
        // Inicializar estado
        toggleDolorFields();
        
        // Escuchar cambios en el checkbox de dolor
        dolorCheckbox.addEventListener('change', toggleDolorFields);
    }
    
    // Listener para checkboxes de intensidad (comportamiento de radio buttons)
    [intensidadLeve, intensidadModerada, intensidadSevera].filter(Boolean).forEach(checkbox => {
        checkbox.addEventListener('change', handleIntensidadCheckboxes);
    });
    
    // Realizar una validación antes de enviar el formulario
    const form = document.querySelector('form#checklist_postpartido_form');
    if (form) {
        form.addEventListener('submit', function(e) {
            if (dolorCheckbox.checked) {
                const intensidadSeleccionada = intensidadLeve.checked || intensidadModerada.checked || intensidadSevera.checked;
                const zonasSelect = document.getElementById('id_zonas_anatomicas');
                const zonasSeleccionadas = Array.from(zonasSelect.options).some(option => option.selected);
                
                if (!intensidadSeleccionada || !zonasSeleccionadas) {
                    e.preventDefault();
                    alert('Por favor, seleccione la intensidad del dolor y al menos una zona anatómica afectada.');
                }
            }
        });
    }
}); 