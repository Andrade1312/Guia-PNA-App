document.addEventListener('DOMContentLoaded', () => {
    const unidadIngresoSelect = document.getElementById('unidadIngreso');
    const edadGestacionalInput = document.getElementById('edadGestacional');
    const pesoNacimientoInput = document.getElementById('pesoNacimiento');
    const sindromeDownCheckbox = document.getElementById('sindromeDown');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const fechaM1Input = document.getElementById('fechaM1');
    const fechaM2Input = document.getElementById('fechaM2');
    const fechaM3Input = document.getElementById('fechaM3');

    const calcularBtn = document.getElementById('calcularBtn');
    const resultadosDiv = document.getElementById('resultados');

    // Función para sumar días a una fecha (string yyyy-mm-dd)
    function sumarDias(fechaStr, dias) {
        const fecha = new Date(fechaStr);
        fecha.setDate(fecha.getDate() + dias);
        return fecha.toISOString().slice(0, 10);
    }

    calcularBtn.addEventListener('click', () => {
        const unidadIngreso = unidadIngresoSelect.value;
        const edadGestacional = parseInt(edadGestacionalInput.value);
        const pesoNacimiento = parseInt(pesoNacimientoInput.value);
        const tieneSindromeDown = sindromeDownCheckbox.checked;
        const fechaNacimiento = fechaNacimientoInput.value;

        if (!fechaNacimiento) {
            resultadosDiv.textContent = 'Por favor, ingresa la fecha de nacimiento.';
            return;
        }
        if (isNaN(edadGestacional) || isNaN(pesoNacimiento)) {
            resultadosDiv.textContent = 'Por favor, ingresa valores válidos para Edad Gestacional y Peso de Nacimiento.';
            return;
        }

        // Paso 1: Armar la recomendación base según criterios
        let recomendaciones = [];

        if (unidadIngreso === 'cuidados_basicos') {
            recomendaciones.push({
                nombre: 'Muestra 1 (M1)',
                descripcion: 'Entre 40-48 horas de vida.',
                fechaRecomendada: sumarDias(fechaNacimiento, 2) // 2 días ~ 48h
            });

            if (edadGestacional < 37 || pesoNacimiento < 2500) {
                recomendaciones.push({
                    nombre: 'Muestra 2 (M2)',
                    descripcion: 'A los 15 días de vida.',
                    fechaRecomendada: sumarDias(fechaNacimiento, 15)
                });
            }

            if (tieneSindromeDown) {
                recomendaciones.push({
                    nombre: 'Muestra 3 (M3)',
                    descripcion: 'A los 28 días de vida.',
                    fechaRecomendada: sumarDias(fechaNacimiento, 28)
                });
            }
        } else if (unidadIngreso === 'uti_uci') {
            recomendaciones.push({
                nombre: 'Muestra 0 (M0)',
                descripcion: 'Al ingreso a la unidad (antes de medicamentos o nutrición parenteral).',
                fechaRecomendada: fechaNacimiento // al ingreso (día 0)
            });

            recomendaciones.push({
                nombre: 'Muestra 1 (M1)',
                descripcion: 'Entre 40-48 horas de vida si no se tomó M0, o entre 48-72 horas si M0 fue tomada antes de 40 h.',
                fechaRecomendada: sumarDias(fechaNacimiento, 2) // vamos a poner 2 días como referencia
            });

            if (edadGestacional < 37 || pesoNacimiento < 2500) {
                recomendaciones.push({
                    nombre: 'Muestra 2 (M2)',
                    descripcion: 'A los 28 días o al alta (lo que ocurra primero).',
                    fechaRecomendada: sumarDias(fechaNacimiento, 28)
                });
            }

            if (tieneSindromeDown) {
                recomendaciones.push({
                    nombre: 'Muestra 3b (Síndrome de Down)',
                    descripcion: 'A los 28 días de vida si muestra previa fue antes de 21 días.',
                    fechaRecomendada: sumarDias(fechaNacimiento, 28)
                });
            } else {
                recomendaciones.push({
                    nombre: 'Muestra 3a (Casos excepcionales)',
                    descripcion: 'A los 15 días si aplica alguna condición especial.',
                    fechaRecomendada: sumarDias(fechaNacimiento, 15)
                });
            }
        }

        // Paso 2: Verificar qué muestras ya se tomaron (según fechas ingresadas)
        const muestrasTomadas = [];
        if (fechaM1Input.value) muestrasTomadas.push('M1');
        if (fechaM2Input.value) muestrasTomadas.push('M2');
        if (fechaM3Input.value) muestrasTomadas.push('M3');

        // Paso 3: Construir mensaje con resultados y fechas recomendadas
        let textoResultado = 'Recomendaciones de muestras y fechas aproximadas:\n\n';

        recomendaciones.forEach(rec => {
            const muestraCorta = rec.nombre.match(/M[0-9ab]/)[0]; // extraigo M1, M2, M3, M0, M3a, etc
            const tomada = muestrasTomadas.includes(muestraCorta.replace(/[ab]/, '')) ? ' (tomada)' : ' (pendiente)';
            textoResultado += `- ${rec.nombre}${tomada}:\n    Descripción: ${rec.descripcion}\n    Fecha recomendada: ${rec.fechaRecomendada}\n\n`;
        });

        // Paso 4: Mostrar resultado
        resultadosDiv.textContent = textoResultado;
    });
});

