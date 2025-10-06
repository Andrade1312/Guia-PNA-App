document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos referencias a los elementos HTML
    const unidadIngresoSelect = document.getElementById('unidadIngreso');
    const edadGestacionalInput = document.getElementById('edadGestacional');
    const pesoNacimientoInput = document.getElementById('pesoNacimiento');
    const sindromeDownCheckbox = document.getElementById('sindromeDown');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadosDiv = document.getElementById('resultados');

    // Elementos condicionales para UTI-UCI
    const condicionalesUtiUciDiv = document.getElementById('condicionales-uti-uci');
    const recibioM0Checkbox = document.getElementById('recibioM0');
    const m0TiempoGroupDiv = document.getElementById('m0-tiempo-group');
    const m0Menos40hCheckbox = document.getElementById('m0Menos40h');

    // Elementos condicionales para M2 en UTI-UCI
    const condicionalesM2UtiUciDiv = document.getElementById('condicionales-m2-uti-uci');
    const transfusionPreviaM1Checkbox = document.getElementById('transfusionPreviaM1');
    const pesquisaDudosaM1Checkbox = document.getElementById('pesquisaDudosaM1');

    // Elementos condicionales para M3a (Casos Excepcionales)
    const condicionalesM3aDiv = document.getElementById('condicionales-m3a');
    const muestraPreviaAltaMenos10DiasCheckbox = document.getElementById('muestraPreviaAltaMenos10Dias');
    const transfusionMenos7DiasCheckbox = document.getElementById('transfusionMenos7Dias');


    // Función para manejar la visibilidad de los campos según la unidad de ingreso y otras condiciones
    const actualizarVisibilidadCampos = () => {
        // Reiniciar visibilidad de todos los grupos condicionales
        condicionalesUtiUciDiv.style.display = 'none';
        m0TiempoGroupDiv.style.display = 'none';
        condicionalesM2UtiUciDiv.style.display = 'none';
        condicionalesM3aDiv.style.display = 'none';

        // Reiniciar estados de los checkboxes ocultos para evitar lógica errónea
        recibioM0Checkbox.checked = false;
        m0Menos40hCheckbox.checked = false;
        transfusionPreviaM1Checkbox.checked = false;
        pesquisaDudosaM1Checkbox.checked = false;
        muestraPreviaAltaMenos10DiasCheckbox.checked = false;
        transfusionMenos7DiasCheckbox.checked = false;


        if (unidadIngresoSelect.value === 'uti_uci') {
            condicionalesUtiUciDiv.style.display = 'block';
            condicionalesM2UtiUciDiv.style.display = 'block'; // Muestra las condiciones para M2 en UTI-UCI
            condicionalesM3aDiv.style.display = 'block'; // Muestra las condiciones para M3a en UTI-UCI (Casos Excepcionales)

            if (recibioM0Checkbox.checked) {
                m0TiempoGroupDiv.style.display = 'flex'; // Usar 'flex' si el CSS lo define así
            }
        }
    };

    // Event Listeners para cambios en los selectores y checkboxes
    unidadIngresoSelect.addEventListener('change', actualizarVisibilidadCampos);
    recibioM0Checkbox.addEventListener('change', actualizarVisibilidadCampos);

    // Llamar una vez al cargar la página para establecer el estado inicial
    actualizarVisibilidadCampos();


    // --- Lógica principal del cálculo de PNA ---
    calcularBtn.addEventListener('click', () => {
        // 1. Recopilar datos de la interfaz
        const unidadIngreso = unidadIngresoSelect.value;
        const edadGestacional = parseInt(edadGestacionalInput.value);
        const pesoNacimiento = parseInt(pesoNacimientoInput.value);
        const tieneSindromeDown = sindromeDownCheckbox.checked;

        // Datos específicos de UTI-UCI
        const recibioM0 = recibioM0Checkbox.checked;
        const m0Menos40h = m0Menos40hCheckbox.checked;
        const transfusionPreviaM1 = transfusionPreviaM1Checkbox.checked;
        const pesquisaDudosaM1 = pesquisaDudosaM1Checkbox.checked;

        // Datos específicos de M3a
        const muestraPreviaAltaMenos10Dias = muestraPreviaAltaMenos10DiasCheckbox.checked;
        const transfusionMenos7Dias = transfusionMenos7DiasCheckbox.checked;

        let resultadosHTML = '';

        // 2. Validaciones básicas de los inputs
        if (isNaN(edadGestacional) || isNaN(pesoNacimiento) || edadGestacional <= 0 || pesoNacimiento <= 0) {
            resultadosHTML = '<p class="error">Por favor, introduce valores válidos para Edad Gestacional y Peso de Nacimiento.</p>';
            resultadosDiv.innerHTML = resultadosHTML;
            return;
        }

        // 3. Aplicar la lógica del flujograma
        resultadosHTML += '<h2>Recomendaciones para Tomas de Muestra:</h2>';

        if (unidadIngreso === 'cuidados_basicos') {
            resultadosHTML += '<div class="recomendacion-grupo">';
            resultadosHTML += '<h3>Unidad: Puerperio/Puericultura/Cuidados Básicos</h3>';
            resultadosHTML += '<p><strong>Muestra 1 (M1):</strong> Entre 40-48 h de vida. Con leche materna o fórmula e independiente de la edad gestacional.</p>';

            const esPreterminoOBajoPeso = (edadGestacional < 37) || (pesoNacimiento < 2500);
            if (esPreterminoOBajoPeso) {
                resultadosHTML += '<p><strong>Muestra 2 (M2):</strong> A los 15 días de vida. (Aplica para RN pretérminos &lt;37 semanas y/o bajo peso al nacer &lt;2.500 gr).</p>';
            }

            if (tieneSindromeDown) {
                resultadosHTML += '<p><strong>Muestra 3 (M3):</strong> A los 28 días de vida. (Aplica para RN con diagnóstico de Síndrome de Down).</p>';
            }
            resultadosHTML += '</div>';

        } else if (unidadIngreso === 'uti_uci') {
            resultadosHTML += '<div class="recomendacion-grupo">';
            resultadosHTML += '<h3>Unidad: UTI-UCI</h3>';
            resultadosHTML += '<p><strong>Muestra 0 (M0):</strong> Al ingreso a la unidad. Antes de medicamentos o nutrición parenteral. Incluye todos los neonatos. Independiente de edad gestacional o estado alimentario.</p>';

            // Lógica para Muestra 1 (M1) en UTI-UCI
            if (recibioM0 && m0Menos40h) {
                resultadosHTML += '<p><strong>Muestra 1 (M1):</strong> Si M0 fue tomada &lt; 40 h de vida, tomar nueva muestra entre 48-72 h.</p>';
            } else if (!recibioM0) {
                resultadosHTML += '<p><strong>Muestra 1 (M1):</strong> Si NO se tomó M0, tomar la primera muestra entre 40-48 h de vida (considerar protocolo general si no hay otra indicación).</p>';
            } else if (recibioM0 && !m0Menos40h) {
                resultadosHTML += '<p>Si M0 fue tomada &ge; 40 h de vida, NO se requiere M1 adicional según este flujograma (M0 actuaría como la primera muestra de pesquisa).</p>';
            }

            // Lógica para Muestra 2 (M2) en UTI-UCI
            const esPreterminoOBajoPesoUTI = (edadGestacional < 37) || (pesoNacimiento < 2500);
            if (esPreterminoOBajoPesoUTI || transfusionPreviaM1 || pesquisaDudosaM1) {
                resultadosHTML += '<p><strong>Muestra 2 (M2):</strong> A los 28 días o al alta (lo que ocurra primero). Aplica para RN pretérminos (&lt;37 semanas), bajo peso (&lt;2.500 gr), con transfusión previa a M1 o pesquisa dudosa en M1.</p>';
            }

            // Lógica para Muestra 3 (M3) - Casos Excepcionales
            resultadosHTML += '<h3>Casos Excepcionales (Muestra 3):</h3>';
            if (tieneSindromeDown) {
                resultadosHTML += '<p><strong>Muestra 3b (Síndrome de Down):</strong> RN con diagnóstico o sospecha de Síndrome de Down. Si muestra previa al alta fue &lt;21 días de vida, tomar nueva muestra a los 28 días.</p>';
            } else {
                const condicionesM3aCumplidas = (muestraPreviaAltaMenos10Dias) ||
                                                ((pesoNacimiento < 2500) && unidadIngreso === 'uti_uci') || // Bajo peso si está en UTI-UCI
                                                ((edadGestacional < 37) && unidadIngreso === 'uti_uci') ||   // Pretérmino si está en UTI-UCI
                                                (transfusionMenos7Dias);

                if (condicionesM3aCumplidas) {
                     resultadosHTML += '<p><strong>Muestra 3a (Casos Excepcionales):</strong> Tomar nueva muestra a los 15 días si aplica alguna de las siguientes condiciones: Muestra previa al alta &lt;10 días de vida, Bajo peso (&lt;2.500 gr), Pretérmino (&lt;37 semanas), o Transfusión &lt;7 días desde muestra previa.</p>';
                } else {
                    resultadosHTML += '<p>No se cumplen los criterios para Muestra 3a o M3b (Síndrome de Down).</p>';
                }
            }
            resultadosHTML += '</div>';
        }

        // 4. Mostrar resultados en la interfaz
        resultadosDiv.innerHTML = resultadosHTML;
    });
});