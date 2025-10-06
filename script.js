document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos referencias a los elementos HTML
    const unidadIngresoSelect = document.getElementById('unidadIngreso');
    const edadGestacionalInput = document.getElementById('edadGestacional');
    const pesoNacimientoInput = document.getElementById('pesoNacimiento');
    const sindromeDownCheckbox = document.getElementById('sindromeDown');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadosDiv = document.getElementById('resultados');

    // Elementos condicionales para UTI-UCI (contenedor principal de estas condiciones)
    const condicionalesUtiUciDiv = document.getElementById('condicionales-uti-uci');
    const recibioM0Checkbox = document.getElementById('recibioM0'); // Checkbox para "¿Recibió Muestra 0 (M0)?"
    const m0TiempoGroupDiv = document.getElementById('m0-tiempo-group'); // Grupo que contiene "¿Muestra M0 fue tomada < 40h de vida?"
    const m0Menos40hCheckbox = document.getElementById('m0Menos40h');

    // Elementos condicionales para M2 en UTI-UCI
    const condicionalesM2UtiUciDiv = document.getElementById('condicionales-m2-uti-uci');
    const transfusionPreviaM1Checkbox = document.getElementById('transfusionPreviaM1');
    const pesquisaDudosaM1Checkbox = document.getElementById('pesquisaDudosaM1');

    // Elementos condicionales para M3a (Casos Excepcionales)
    const condicionalesM3aDiv = document.getElementById('condicionales-m3a');
    const muestraPreviaAltaMenos10DiasCheckbox = document.getElementById('muestraPreviaAltaMenos10Dias');
    const transfusionMenos7DiasCheckbox = document.getElementById('transfusionMenos7Dias');


    // --- Función para manejar la visibilidad de los campos condicionales ---
    const actualizarVisibilidadCampos = () => {
        // 1. Ocultar todos los grupos condicionales por defecto
        // Esto asegura que cada vez que hay un cambio, reiniciamos el estado visual
        condicionalesUtiUciDiv.style.display = 'none';
        m0TiempoGroupDiv.style.display = 'none'; // Aseguramos que este se oculta por defecto también
        condicionalesM2UtiUciDiv.style.display = 'none';
        condicionalesM3aDiv.style.display = 'none';

        // 2. Resetear el estado de todos los checkboxes relacionados con grupos ocultos
        // Esto es CRUCIAL para evitar que la lógica use valores de checkboxes que el usuario no ve
        recibioM0Checkbox.checked = false;
        m0Menos40hCheckbox.checked = false;
        transfusionPreviaM1Checkbox.checked = false;
        pesquisaDudosaM1Checkbox.checked = false;
        muestraPreviaAltaMenos10DiasCheckbox.checked = false;
        transfusionMenos7DiasCheckbox.checked = false;


        // 3. Mostrar campos según la unidad de ingreso
        if (unidadIngresoSelect.value === 'uti_uci') {
            condicionalesUtiUciDiv.style.display = 'block'; // Muestra el checkbox de 'Recibió M0?'
            condicionalesM2UtiUciDiv.style.display = 'block'; // Muestra condiciones de M2 en UTI-UCI
            condicionalesM3aDiv.style.display = 'block'; // Muestra condiciones de M3a

            // SOLO si 'Recibió M0?' está marcado, entonces mostrar la opción de tiempo de M0
            if (recibioM0Checkbox.checked) {
                m0TiempoGroupDiv.style.display = 'flex';
            }
        }
    };

    // --- Event Listeners para cambios en los selectores y checkboxes ---
    unidadIngresoSelect.addEventListener('change', actualizarVisibilidadCampos);
    // Este event listener es el que va a permitir interactuar con el checkbox de M0
    recibioM0Checkbox.addEventListener('change', actualizarVisibilidadCampos); 

    // Llamar una vez al cargar la página para establecer el estado inicial de los campos
    actualizarVisibilidadCampos();


    // --- Lógica principal del cálculo de PNA al hacer click ---
    calcularBtn.addEventListener('click', () => {
        // 1. Recopilar todos los datos de la interfaz
        const unidadIngreso = unidadIngresoSelect.value;
        const edadGestacional = parseInt(edadGestacionalInput.value);
        const pesoNacimiento = parseInt(pesoNacimientoInput.value);
        const tieneSindromeDown = sindromeDownCheckbox.checked;

        // Datos específicos de UTI-UCI
        const recibioM0 = recibioM0Checkbox.checked;
        const m0Menos40h = m0Menos40hCheckbox.checked; // Solo relevante si recibioM0 es true

        // Datos específicos de M2 en UTI-UCI
        const transfusionPreviaM1 = transfusionPreviaM1Checkbox.checked;
        const pesquisaDudosaM1 = pesquisaDudosaM1Checkbox.checked;

        // Datos específicos de M3a
        const muestraPreviaAltaMenos10Dias = muestraPreviaAltaMenos10DiasCheckbox.checked;
        const transfusionMenos7Dias = transfusionMenos7DiasCheckbox.checked;


        let resultadosHTML = '';

        // 2. Validaciones básicas de los inputs numéricos
        if (isNaN(edadGestacional) || isNaN(pesoNacimiento) || edadGestacional <= 0 || pesoNacimiento <= 0) {
            resultadosHTML = '<p class="error">Por favor, introduce valores válidos para Edad Gestacional y Peso de Nacimiento.</p>';
            resultadosDiv.innerHTML = resultadosHTML;
            return; // Detiene la ejecución si hay errores
        }

        // 3. Aplicar la lógica del flujograma (dividido por unidad de ingreso)
        resultadosHTML += '<h2>Recomendaciones para Tomas de Muestra:</h2>';

        if (unidadIngreso === 'cuidados_basicos') {
            resultadosHTML += '<div class="recomendacion-grupo">';
            resultadosHTML += '<h3>Unidad: Puerperio/Puericultura/Cuidados Básicos</h3>';
            resultadosHTML += '<ul>'; // Lista para mejor legibilidad

            resultadosHTML += '<li><strong>Muestra 1 (M1):</strong> Entre 40-48 h de vida. Con leche materna o fórmula e independiente de la edad gestacional.</li>';

            const esPreterminoOBajoPeso = (edadGestacional < 37) || (pesoNacimiento < 2500);
            if (esPreterminoOBajoPeso) {
                resultadosHTML += '<li><strong>Muestra 2 (M2):</strong> A los 15 días de vida. (Aplica para RN pretérminos &lt;37 semanas y/o bajo peso al nacer &lt;2.500 gr).</li>';
            }

            if (tieneSindromeDown) {
                resultadosHTML += '<li><strong>Muestra 3 (M3):</strong> A los 28 días de vida. (Aplica para RN con diagnóstico de Síndrome de Down).</li>';
            }
            resultadosHTML += '</ul>';
            resultadosHTML += '</div>';

        } else if (unidadIngreso === 'uti_uci') {
            resultadosHTML += '<div class="recomendacion-grupo">';
            resultadosHTML += '<h3>Unidad: UTI-UCI</h3>';
            resultadosHTML += '<ul>'; // Lista para mejor legibilidad

            resultadosHTML += '<li><strong>Muestra 0 (M0):</strong> Al ingreso a la unidad. Antes de medicamentos o nutrición parenteral. Incluye todos los neonatos. Independiente de edad gestacional o estado alimentario.</li>';

            // Lógica para Muestra 1 (M1) en UTI-UCI
            if (recibioM0 && m0Menos40h) {
                resultadosHTML += '<li><strong>Muestra 1 (M1):</strong> Si M0 fue tomada &lt; 40 h de vida, tomar nueva muestra entre 48-72 h.</li>';
            } else if (!recibioM0) {
                resultadosHTML += '<li><strong>Muestra 1 (M1):</strong> Si NO se tomó M0, tomar la primera muestra entre 40-48 h de vida (considerar protocolo general si no hay otra indicación).</li>';
            } else if (recibioM0 && !m0Menos40h) {
                resultadosHTML += '<li>Si M0 fue tomada &ge; 40 h de vida, NO se requiere M1 adicional según este flujograma (M0 actuaría como la primera muestra de pesquisa).</li>';
            }

            // Lógica para Muestra 2 (M2) en UTI-UCI
            const esPreterminoOBajoPesoUTI = (edadGestacional < 37) || (pesoNacimiento < 2500);
            if (esPreterminoOBajoPesoUTI || transfusionPreviaM1 || pesquisaDudosaM1) {
                resultadosHTML += '<li><strong>Muestra 2 (M2):</strong> A los 28 días o al alta (lo que ocurra primero). Aplica para RN pretérminos (&lt;37 semanas), bajo peso (&lt;2.500 gr), con transfusión previa a M1 o pesquisa dudosa en M1.</li>';
            }

            resultadosHTML += '</ul>'; // Cierra la lista principal de UTI-UCI

            // Lógica para Muestra 3 (M3) - Casos Excepcionales
            resultadosHTML += '<h3>Casos Excepcionales (Muestra 3):</h3>';
            resultadosHTML += '<ul>';
            if (tieneSindromeDown) {
                resultadosHTML += '<li><strong>Muestra 3b (Síndrome de Down):</strong> RN con diagnóstico o sospecha de Síndrome de Down. Si muestra previa al alta fue &lt;21 días de vida, tomar nueva muestra a los 28 días.</li>';
            } else {
                // Condiciones para Muestra 3a
                const condicionesM3aCumplidas = (muestraPreviaAltaMenos10Dias) ||
                                                (pesoNacimiento < 2500) || // Bajo peso, si aplica en este contexto
                                                (edadGestacional < 37) ||   // Pretérmino, si aplica en este contexto
                                                (transfusionMenos7Dias);

                if (condicionesM3aCumplidas) {
                     resultadosHTML += '<li><strong>Muestra 3a (Casos Excepcionales):</strong> Tomar nueva muestra a los 15 días si aplica alguna de las siguientes condiciones: Muestra previa al alta &lt;10 días de vida, Bajo peso (&lt;2.500 gr), Pretérmino (&lt;37 semanas), o Transfusión &lt;7 días desde muestra previa.</li>';
                } else {
                    resultadosHTML += '<li>No se cumplen los criterios para Muestra 3a o M3b (Síndrome de Down) en este momento.</li>';
                }
            }
            resultadosHTML += '</ul>';
            resultadosHTML += '</div>'; // Cierra recomendacion-grupo de UTI-UCI
        }

        // 4. Mostrar resultados en la interfaz
        resultadosDiv.innerHTML = resultadosHTML;
    });
});