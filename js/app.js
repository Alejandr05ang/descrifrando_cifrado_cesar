/* =========================================
   CONFIGURACIÓN Y ESTADO GLOBAL
   ========================================= */
// Cargar el shift oculto desde localStorage o usar 3 por defecto
let currentShift = parseInt(localStorage.getItem('caesarShift')) || 3;

let isProcessing = false;

// Mensaje de reposo en la caja de entrada
const INPUT_IDLE_MSG = '-';

// Pistas pedagógicas progresivas
const hints = [
    "1. Observa detenidamente cómo cambian las letras antes y después de pasar por la máquina.",
    "2. Observa que cada letra se mueve un número fijo de posiciones en el abecedario.",
    "3. Piensa en el alfabeto como un ciclo: si llegas a la 'Z', la siguiente letra vuelve a ser la 'A'.",
    "4. Cada letra se mueve un número fijo de posiciones en el abecedario.",
    "5. Intenta ingresar la letra 'A'. ¿Qué letra sale? Luego intenta con la 'B'.",
    "6. ¡Felicidades! Este método histórico se conoce como el 'Cifrado César'."
];
let currentHintIndex = parseInt(localStorage.getItem('currentHintIndex')) || 0;

/* =========================================
   REFERENCIAS AL DOM
   ========================================= */
const form = document.getElementById('cipherForm');
const input = document.getElementById('textInput');
const submitBtn = document.getElementById('submitBtn');
const stage = document.getElementById('stage');
const blackBox = document.getElementById('blackBox');
const machineStatus = document.getElementById('machineStatus');
const historyList = document.getElementById('historyList');
const hintsContainer = document.getElementById('hintsContainer');
const hintBtn = document.getElementById('hintBtn');
const clearBtn = document.getElementById('clearBtn');
const appTitle = document.getElementById('app-title');
// Cajas laterales
const inputDisplay = document.getElementById('inputDisplay');
const inputDisplayText = document.getElementById('inputDisplayText');
const inputLabel = document.getElementById('inputLabel');
const outputDisplay = document.getElementById('outputDisplay');
const outputDisplayText = document.getElementById('outputDisplayText');

/* =========================================
   INICIALIZACIÓN
   ========================================= */
// Cargar historial previo (opcional, aquí iniciamos vacío pero restauramos pistas)
function init() {
    // Inicializar caja de entrada con el mensaje en reposo
    inputDisplayText.textContent = INPUT_IDLE_MSG;
    // Restaurar pistas visibles si se recarga la página
    for (let i = 0; i < currentHintIndex; i++) {
        renderHint(hints[i]);
    }
    updateHintButton();
}

/* =========================================
   LÓGICA DEL CIFRADO CÉSAR
   ========================================= */
function applyCaesarCipher(str, shift) {
    // Normalizar el shift para asegurar que sea positivo y entre 0-25
    const normalizedShift = ((shift % 26) + 26) % 26;

    return str.replace(/[a-zA-Z]/g, function (char) {
        // Determinar si es mayúscula o minúscula para la base ASCII
        const base = char <= 'Z' ? 65 : 97;
        // Aplicar rotación y envolver
        return String.fromCharCode(((char.charCodeAt(0) - base + normalizedShift) % 26) + base);
    });
}

/* =========================================
   ORQUESTADOR DE ANIMACIÓN
   ========================================= */
async function processEncryption(text) {
    if (isProcessing || text.trim() === '') return;

    isProcessing = true;
    submitBtn.disabled = true;
    input.value = ''; // Limpiar input para la siguiente entrada

    const encryptedText = applyCaesarCipher(text, currentShift);

    // 1. Mostrar texto original en la caja izquierda con efecto de análisis (azul)
    inputDisplayText.textContent = text;
    inputDisplayText.classList.add('active');
    inputDisplay.classList.add('analyzing');
    inputLabel.textContent = 'Analizando';
    // Limpiar resultado anterior de la caja derecha mientras procesamos
    outputDisplay.classList.remove('has-result');
    outputDisplayText.classList.remove('active');
    outputDisplayText.textContent = '...';

    // Mantener el efecto de análisis 2 segundos para que el alumno vea el texto
    await sleep(2000);

    // Quitar efecto y soltar la caja justo cuando el texto vuela hacia la máquina
    inputDisplay.classList.remove('analyzing');
    inputLabel.textContent = 'Entrada';
    inputDisplayText.textContent = INPUT_IDLE_MSG;
    inputDisplayText.classList.remove('active');

    // 2. Animación: texto sale de la caja izquierda hacia la máquina
    const elIn = document.createElement('div');
    elIn.className = 'moving-text text-in';
    elIn.innerText = text;
    stage.appendChild(elIn);
    await sleep(1000);
    elIn.remove();

    // 3. Efecto de procesamiento en la máquina
    blackBox.classList.add('processing');
    machineStatus.innerText = 'Procesando...';
    await sleep(3000);
    blackBox.classList.remove('processing');
    machineStatus.innerText = '¡Completado!';

    // 4. Animación: texto cifrado sale de la máquina hacia la caja derecha
    const elOut = document.createElement('div');
    elOut.className = 'moving-text text-out';
    elOut.innerText = encryptedText;
    stage.appendChild(elOut);
    await sleep(1000);
    elOut.remove();

    // 5. Mostrar resultado cifrado en la caja derecha (permanece)
    outputDisplayText.textContent = encryptedText;
    outputDisplayText.classList.add('active');
    outputDisplay.classList.add('has-result');

    // 6. Volver a mostrar el texto original en la caja izquierda para comparar visualmente
    inputLabel.textContent = 'Entrada';
    inputDisplayText.textContent = text;
    inputDisplayText.classList.add('active');

    // Restaurar estado de máquina
    machineStatus.innerText = 'En espera';

    // 7. Agregar al registro visual
    addToHistory(text, encryptedText);

    isProcessing = false;
    submitBtn.disabled = false;
    input.focus();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* =========================================
   MANEJO DE HISTORIAL Y UI
   ========================================= */
function addToHistory(original, result) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
        <span class="original-text">${escapeHTML(original)}</span>
        <span class="history-arrow">➔</span>
        <span class="result-text">${escapeHTML(result)}</span>
    `;
    // Insertar al principio para ver el más reciente arriba
    historyList.insertBefore(li, historyList.firstChild);
}

clearBtn.addEventListener('click', () => {
    historyList.innerHTML = '';
    input.focus();
});

// Prevenir inyección de HTML básico
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* =========================================
   SISTEMA DE PISTAS (DESCUBRIMIENTO)
   ========================================= */
function renderHint(text) {
    const div = document.createElement('div');
    div.className = 'hint-card';
    div.innerText = text;
    hintsContainer.appendChild(div);
}

function updateHintButton() {
    if (currentHintIndex >= hints.length) {
        hintBtn.style.display = 'none';
        localStorage.setItem('currentHintIndex', currentHintIndex);
    }
}

hintBtn.addEventListener('click', () => {
    if (currentHintIndex < hints.length) {
        renderHint(hints[currentHintIndex]);
        currentHintIndex++;
        localStorage.setItem('currentHintIndex', currentHintIndex);
        updateHintButton();

        // Auto-scroll al fondo del contenedor de pistas
        hintsContainer.scrollTop = hintsContainer.scrollHeight;
    }
});

/* =========================================
   EVENTOS PRINCIPALES
   ========================================= */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    processEncryption(text);
});

/* =========================================
   CONFIGURACIÓN OCULTA (PROFESORES)
   ========================================= */

// Función para cambiar el desplazamiento
function triggerHiddenConfig() {
    const userInput = prompt(` MODO PROFESOR \nConfiguración actual del desplazamiento: ${currentShift}\n\nIngresa un nuevo número para cambiar el patrón (ej: 5 para desplazar 5 letras):`);

    if (userInput !== null && userInput.trim() !== '') {
        const parsed = parseInt(userInput);
        if (!isNaN(parsed)) {
            currentShift = parsed;
            localStorage.setItem('caesarShift', currentShift);

            // Reiniciar pistas e historial al cambiar el patrón para no confundir
            currentHintIndex = 0;
            localStorage.setItem('currentHintIndex', 0);
            hintsContainer.innerHTML = '';
            historyList.innerHTML = '';
            hintBtn.style.display = 'block';

            alert(` Desplazamiento actualizado exitosamente a: ${currentShift}\nEl historial y las pistas han sido reiniciados.`);
        } else {
            alert("  Error: Debes ingresar un número válido.");
        }
    }
}

// Método oculto 1: Combinación de teclas (Ctrl + Shift + S)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        triggerHiddenConfig();
    }
});

// Método oculto 2: 5 Clics rápidos en el título principal
let clickCount = 0;
let clickTimer;

appTitle.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);

    // Si no se hace el siguiente clic en 800ms, se reinicia el contador
    clickTimer = setTimeout(() => {
        clickCount = 0;
    }, 800);

    if (clickCount >= 5) {
        triggerHiddenConfig();
        clickCount = 0; // Resetear después de activar
    }
});

// Arrancar la app
init();
