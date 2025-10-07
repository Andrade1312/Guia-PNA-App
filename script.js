document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Obtenemos referencias a todos los elementos HTML ---
    const unidadIngresoSelect = document.getElementById('unidadIngreso');
    const edadGestacionalInput = document.getElementById('edadGestacional');
    const pesoNacimientoInput = document.getElementById('pesoNacimiento');
    const sindromeDownCheckbox = document.getElementById('sindromeDown');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadosDiv = document.getElementById('resultados');

    // Grupos condicionales
    const condicionalesUtiUciDiv = document.getElementById('condicionales-uti-uci');
    const recibioM0Checkbox = document.getElementById('recibioM0');
    const m0TiempoGroupDiv = document.getElementById('m0-tiempo-group');
    const m0Menos40hCheckbox = document.getElementById('m0Menos40h');

    const condicionalesM2UtiUciDiv = document.getElementById('condicionales-m2-uti-uci');
    const transfusionPreviaM1Checkbox = document.getElementById('transfusionPreviaM1');
    const pesquisaDudosaM1Checkbox = document.getElementById('pesquisaDudosaM1');

    const condicionalesM3aDiv = document.getElementById('condicionales-m3a');
    const muestraPreviaAltaMenos10DiasCheckbox = document.getElementById('muestraPreviaAltaMenos10Dias');
    const transfusionMenos7DiasCheckbox = document.getElementById('transfusionMenos7Dias');


    // --- 2. Función que muestra/oculta los grupos condicionales ---
    const actualizarVisibilidadCampos = () => {
        // Siempre ocultamos todo al inicio
        condicionalesUtiUciDiv.style.display = 'none';
        m0TiempoGroupDiv.style.display = 'none';
        condicionalesM2UtiUciDiv.style.display = 'none';
        condicionalesM3aDiv.style.display = 'none';

        // Si el usuario selecciona "UTI-UCI", mostramos los checkboxes
        if (unidadIngresoSelect.value === 'uti_uci') {
            condicionalesUtiUciDiv.style.display = 'block';
            condicionalesM2UtiUciDiv.style.display = 'block';
            condicionalesM3aDiv.style.display = 'block';

            // Si marca “¿Recibió M0?”, mostramos el segundo checkbox
            if (recibioM0Checkbox.checked) {
                m0TiempoGroupDiv.style.display = 'flex';
            }
        } else {
            // Si cambia a otra unidad (Puerperio), limpiamos los valores
            recibioM0Checkbox.checked = false;
            m0Menos40hCheckbox.checked = false;
            transfusionPreviaM1Checkbox.checked = false;
            pesquisaDudosaM1Checkbox.checked = false;
            muestraPreviaAltaMenos10DiasCheckbox.checked = false;
            transfusionMenos7DiasCheckbox.checked = false;
        }
    };


    // --- 3. Escuchamos los cambios para actualizar en tiempo real ---
    unidadIngresoSelect.addEventListener('change', actualizarVisibilidadCampos);
    recibioM0Checkbox.addEventListener('change', actualizarVisibilidadCampos);

    // Estado inicial
    actualizarVisibilidadCampos();


    // --- 4. Cálculo de las recomendaciones ---
    calcularBtn.addEventListener('click', () => {
        const unidadIngreso = unidadIngresoSelect.value;
        const edadGestacional = parseInt(edadGestacionalInput.value);
        const pesoNacimiento = parseInt(pesoNacimientoInput.value);
        const tieneSindromeDown = sindromeDownCheckbox.checked;

        const recibioM0 = recibioM0Checkbox.checked;
        const m0Menos40h = m0Menos40hCheckbox.checked;
        const transfusionPreviaM1 = transfusionPreviaM1Checkbox.checked;
        const pesquisaDudosaM1 = pesquisaDudosaM1Checkbox.checked;
        const muestraPreviaAltaMenos10Dias = muestraPreviaAltaMenos10DiasCheckbox.checked;
        const transfusionMenos7Dias = transfusionMenos7DiasCheckbox.checked;

        let resultadosHTML = '';

        if (isNaN(edadGestacional) || isNaN(pesoNacimiento) || edadGestacional <= 0 || pesoNacimiento <= 0) {
            resultadosDiv.innerHTML = '<p class="error">Por favor, introduce valores válidos para Edad Gestacional y Peso de Nacimiento.</p>';
            return;
        }

        resultadosHTML += '<h2>Recomendaciones para Tomas de Muestra:</h2>';

        if (unidadIngreso === 'cuidados_basicos') {
            resultadosHTML += `
                <div class="recomendacion-grupo">
                    <h3>Unidad: Puerperio/Puericultura/Cuidados Básicos</h3>
                    <ul>
                        <li><strong>Muestra 1 (M1):</strong> Entre 40-48 h de vida. Con leche materna o fórmula e independiente de la edad gestacional.</li>
                        ${(edadGestacional < 37 || pesoNacimiento < 2500)
                            ? '<li><strong>Muestra 2 (M2):</strong> A los 15 días de vida. (Aplica para RN pretérminos &lt;37 semanas y/o bajo peso al nacer &lt;2.500 gr).</li>'
                            : ''}
                        ${tieneSindromeDown
                            ? '<li><strong>Muestra 3 (M3):</strong> A los 28 días de vida. (Aplica para RN con diagnóstico de Síndrome de Down).</li>'
                            : ''}
                    </ul>
                </div>
            `;
        } else if (unidadIngreso === 'uti_uci') {
            resultadosHTML += `
                <div class="recomendacion-grupo">
                    <h3>Unidad: UTI-UCI</h3>
                    <ul>
                        <li><strong>Muestra 0 (M0):</strong> Al ingreso a la unidad. Antes de medicamentos o nutrición parenteral. Incluye todos los neonatos.</li>
                        ${recibioM0 && m0Menos40h
                            ? '<li><strong>Muestra 1 (M1):</strong> Si M0 fue tomada &lt; 40 h de vida, tomar nueva muestra entre 48-72 h.</li>'
                            : !recibioM0
                                ? '<li><strong>Muestra 1 (M1):</strong> Si NO se tomó M0, tomar la primera muestra entre 40-48 h de vida.</li>'
                                : '<li>Si M0 fue tomada &ge; 40 h de vida, NO se requiere M1 adicional.</li>'
                        }
                        ${(edadGestacional < 37 || pesoNacimiento < 2500 || transfusionPreviaM1 || pesquisaDudosaM1)
                            ? '<li><strong>Muestra 2 (M2):</strong> A los 28 días o al alta (lo que ocurra primero).</li>'
                            : ''}
                    </ul>
                    <h3>Casos Excepcionales (Muestra 3):</h3>
                    <ul>
                        ${tieneSindromeDown
                            ? '<li><strong>Muestra 3b (Síndrome de Down):</strong> RN con diagnóstico o sospecha. Si muestra previa fue &lt;21 días, tomar nueva muestra a los 28 días.</li>'
                            : (muestraPreviaAltaMenos10Dias || pesoNacimiento < 2500 || edadGestacional < 37 || transfusionMenos7Dias)
                                ? '<li><strong>Muestra 3a (Casos Excepcionales):</strong> Tomar nueva muestra a los 15 días si aplica alguna condición.</li>'
                                : '<li>No se cumplen los criterios para Muestra 3a o M3b.</li>'
                        }
                    </ul>
                </div>
            `;
        }

        resultadosDiv.innerHTML = resultadosHTML;
    });
});
