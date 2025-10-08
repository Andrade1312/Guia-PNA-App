document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const unidadIngresoSelect = document.getElementById('unidadIngreso');
    const edadGestacionalInput = document.getElementById('edadGestacional');
    const pesoNacimientoInput = document.getElementById('pesoNacimiento');
    const sindromeDownCheckbox = document.getElementById('sindromeDown');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadosDiv = document.getElementById('resultados');

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

    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const fechaM1Input = document.getElementById('fechaM1');
    const fechaM2Input = document.getElementById('fechaM2');
    const fechaM3Input = document.getElementById('fechaM3');

    // Mostrar u ocultar campos según unidad seleccionada
    function actualizarVisibilidadCampos() {
        condicionalesUtiUciDiv.style.display = 'none';
        m0TiempoGroupDiv.style.display = 'none';
        condicionalesM2UtiUciDiv.style.display = 'none';
        condicionalesM3aDiv.style.display = 'none';

        if (unidadIngresoSelect.value === 'uti_uci') {
            condicionalesUtiUciDiv.style.display = 'block';
            condicionalesM2UtiUciDiv.style.display = 'block';
            condicionalesM3aDiv.style.display = 'block';

            if (recibioM0Checkbox.checked) {
                m0TiempoGroupDiv.style.display = 'flex';
            }
        } else {
            // Limpiar checkboxes no aplicables
            recibioM0Checkbox.checked = false;
            m0Menos40hCheckbox.checked = false;
            transfusionPreviaM1Checkbox.checked = false;
            pesquisaDudosaM1Checkbox.checked = false;
            muestraPreviaAltaMenos10DiasCheckbox.checked = false;
            transfusionMenos7DiasCheckbox.checked = false;
        }
    }

    unidadIngresoSelect.addEventListener('change', actualizarVisibilidadCampos);
    recibioM0Checkbox.addEventListener('change', actualizarVisibilidadCampos);
    actualizarVisibilidadCampos();

    // Suma días a una fecha (string) y devuelve Date
    function sumarDias(fechaStr, dias) {
        if (!fechaStr) return null;
        const fecha = new Date(fechaStr);
        fecha.setDate(fecha.getDate() + dias);
        return fecha;
    }

    // Formatea fecha a dd/mm/yyyy
    function formatFecha(date) {
        if (!date) return 'N/A';
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }

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

        const fechaNacimientoStr = fechaNacimientoInput.value;
        const fechaM1Str = fechaM1Input.value;
        const fechaM2Str = fechaM2Input.value;
        const fechaM3Str = fechaM3Input.value;

        // Validaciones básicas
        if (!fechaNacimientoStr) {
            resultadosDiv.innerHTML = '<p class="error">Por favor, ingresa la fecha de nacimiento.</p>';
            return;
        }
        if (isNaN(edadGestacional) || isNaN(pesoNacimiento) || edadGestacional <= 0 || pesoNacimiento <= 0) {
            resultadosDiv.innerHTML = '<p class="error">Por favor, introduce valores válidos para Edad Gestacional y Peso de Nacimiento.</p>';
            return;
        }

        // Construcción de texto con recomendaciones según unidad y condiciones
        let recomendaciones = '';
        if (unidadIngreso === 'cuidados_basicos') {
            recomendaciones += 'Unidad: Puerperio/Puericultura/Cuidados Básicos\n';
            recomendaciones += '- Muestra 1 (M1): Entre 40-48 h de vida.\n';
            if (edadGestacional < 37 || pesoNacimiento < 2500) {
                recomendaciones += '- Muestra 2 (M2): A los 15 días de vida.\n';
            }
            if (tieneSindromeDown) {
                recomendaciones += '- Muestra 3 (M3): A los 28 días de vida.\n';
            }
        } else if (unidadIngreso === 'uti_uci') {
            recomendaciones += 'Unidad: UTI-UCI\n';
            recomendaciones += '- Muestra 0 (M0): Al ingreso a la unidad (antes de medicamentos o nutrición parenteral).\n';

            if (recibioM0 && m0Menos40h) {
                recomendaciones += '- Muestra 1 (M1): Si M0 fue tomada < 40 h de vida, tomar nueva muestra entre 48-72 h.\n';
            } else if (!recibioM0) {
                recomendaciones += '- Muestra 1 (M1): Si NO se tomó M0, tomar la primera muestra entre 40-48 h de vida.\n';
            } else {
                recomendaciones += '- Si M0 fue tomada ≥ 40 h de vida, NO se requiere M1 adicional.\n';
            }

            if (edadGestacional < 37 || pesoNacimiento < 2500 || transfusionPreviaM1 || pesquisaDudosaM1) {
                recomendaciones += '- Muestra 2 (M2): A los 28 días o al alta (lo que ocurra primero).\n';
            }

            recomendaciones += '\nCasos Excepcionales (Muestra 3):\n';
            if (tieneSindromeDown) {
                recomendaciones += '- Muestra 3b (Síndrome de Down): Tomar nueva muestra a los 28 días si muestra previa fue < 21 días.\n';
            } else if (muestraPreviaAltaMenos10Dias || pesoNacimiento < 2500 || edadGestacional < 37 || transfusionMenos7Dias) {
                recomendaciones += '- Muestra 3a (Casos Excepcionales): Tomar nueva muestra a los 15 días si aplica alguna condición.\n';
            } else {
                recomendaciones += '- No se cumplen los criterios para Muestra 3a o M3b.\n';
            }
        }

        // Convertimos fecha de nacimiento a Date
        const fechaNac = new Date(fechaNacimientoStr);

        // Funciones auxiliares para calcular fechas recomendadas
        function fechaDesdeDias(dias) {
            const f = new Date(fechaNac);
            f.setDate(f.getDate() + dias);
            return f;
        }

        // Guardamos fechas recomendadas
        let fechaRecM1 = null;
        let fechaRecM1_rango = null;
        let fechaRecM2 = null;
        let fechaRecM3 = null;

        if (unidadIngreso === 'cuidados_basicos') {
            fechaRecM1_rango = { min: fechaDesdeDias(2), max: fechaDesdeDias(2) }; // 40-48 h ~ 2 días
            if (edadGestacional < 37 || pesoNacimiento < 2500) {
                fechaRecM2 = fechaDesdeDias(15);
            }
            if (tieneSindromeDown) {
                fechaRecM3 = fechaDesdeDias(28);
            }
        } else if (unidadIngreso === 'uti_uci') {
            if (recibioM0 && m0Menos40h) {
                fechaRecM1_rango = { min: fechaDesdeDias(2), max: fechaDesdeDias(3) }; // 48-72 h
            } else if (!recibioM0) {
                fechaRecM1_rango = { min: fechaDesdeDias(2), max: fechaDesdeDias(2) }; // 40-48 h ~ 2 días
            } else {
                fechaRecM1_rango = null;
            }
            if (edadGestacional < 37 || pesoNacimiento < 2500 || transfusionPreviaM1 || pesquisaDudosaM1) {
                fechaRecM2 = fechaDesdeDias(28);
            }
            if (tieneSindromeDown) {
                fechaRecM3 = fechaDesdeDias(28);
            } else if (muestraPreviaAltaMenos10Dias || pesoNacimiento < 2500 || edadGestacional < 37 || transfusionMenos7Dias) {
                fechaRecM3 = fechaDesdeDias(15);
            }
        }

        // Estado de las muestras basado en fechas ingresadas
        let estadoMuestras = '\nEstado de las muestras basadas en fechas ingresadas:\n';

        // Parsear fechas de muestras si fueron ingresadas
        let fM1 = fechaM1Str ? new Date(fechaM1Str) : null;
        let fM2 = fechaM2Str ? new Date(fechaM2Str) : null;
        let fM3 = fechaM3Str ? new Date(fechaM3Str) : null;

        // Función para mostrar estado de cada muestra
        function verificarMuestra(n, fechaReal, fechaRecomendada, rango = false) {
            if (fechaReal) {
                return `- Muestra ${n} tomada el ${formatFecha(fechaReal)}.\n`;
            } else if (fechaRecomendada) {
                if (rango) {
                    return `- Muestra ${n} pendiente, recomendada entre ${formatFecha(fechaRecomendada.min)} y ${formatFecha(fechaRecomendada.max)}.\n`;
                } else {
                    return `- Muestra ${n} pendiente, recomendada el ${formatFecha(fechaRecomendada)}.\n`;
                }
            } else {
                return `- Muestra ${n} no aplicable o no recomendada.\n`;
            }
        }

        estadoMuestras += verificarMuestra(1, fM1, fechaRecM1_rango ? fechaRecM1_rango : fechaRecM1, fechaRecM1_rango !== null);
        estadoMuestras += verificarMuestra(2, fM2, fechaRecM2);
        estadoMuestras += verificarMuestra(3, fM3, fechaRecM3);

        // Mostrar resultados en el div
        resultadosDiv.textContent = recomendaciones + estadoMuestras;
    });
});

