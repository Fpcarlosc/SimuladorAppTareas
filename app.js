
const $ = id => document.getElementById(id);

// --------------------------------------------------
// 1. ESTADO INICIAL DE LA APLICACIÓN
// --------------------------------------------------

const state = {
    title: "",
    description: "",
    module: "AD",
    urgent: false,
    tasks: [
        {
            module: "PMDM",
            title: "Ejercicio 1",
            description: "Implementar el ejercicio 1",
            urgent: true
        },
        {
            module: "DI",
            title: "Login",
            description: "Acabar pantalla de Login",
            urgent: false
        },
        {
            module: "AD",
            title: "Tarea Json",
            description: "Realizar la tarea de json",
            urgent: true
        }
    ]
};

let lastEvent = null;
let animationId = 0;

const nodeOrder = [
    "ui", "vm", "local", "copy",
    "state", "collect", "render"
];

// --------------------------------------------------
// 2. CONFIGURACIÓN DE CADA FLUJO
// --------------------------------------------------

const flows = {

    title: {
        title: "Flujo: actualización del título",
        description: "El usuario escribe en el campo Título. El ViewModel recibe el texto y publica una nueva tarea.",
        method: "actualizarTitulo()",

        nodes: [
            ["1 · UI", "Evento del usuario", "onValueChange(it)", "El usuario escribe el título."],
            ["2 · VIEWMODEL", "Método actualizarTitulo()", "actualizarTitulo(it)", "Recibe el nuevo texto."],
            ["3 · VIEWMODEL", "Propiedad local", "titulo = titulo_ui", "Actualiza la variable interna."],
            ["4 · MODELO", "Copia de Tarea", "tarea = tarea.copy()", "Se modifica tarea.titulo."],
            ["5 · UISTATE", "MutableStateFlow.update", "estadoActual.copy(tarea = tarea)", "Publica el nuevo TareaUIState."],
            ["6 · COMPOSE", "collectAsState()", "val uIState by ...", "Compose recibe el nuevo estado."],
            ["7 · UI", "La pantalla se actualiza", "value = uIState.tarea.titulo", "El campo muestra el nuevo título."]
        ],

        code: `// UI
OutlinedTextField(
    value = uIState.tarea.titulo,
    onValueChange = {
        tareaViewModel.actualizarTitulo(it)
    }
)

// VIEWMODEL
fun actualizarTitulo(titulo_ui: String) {
    titulo = titulo_ui

    val tarea = _tareaUIState.value.tarea.copy()
    tarea.titulo = titulo

    _tareaUIState.update { estadoActual ->
        estadoActual.copy(tarea = tarea)
    }
}`
    },

    description: {
        title: "Flujo: actualización de la descripción",
        description: "El usuario escribe en Descripción. El ViewModel actualiza el campo descripcion de la tarea.",
        method: "actualizarDescripcion()",

        nodes: [
            ["1 · UI", "Evento del usuario", "onValueChange(it)", "El usuario escribe la descripción."],
            ["2 · VIEWMODEL", "Método actualizarDescripcion()", "actualizarDescripcion(it)", "Recibe la nueva descripción."],
            ["3 · VIEWMODEL", "Propiedad local", "descripcion = desc_ui", "Actualiza la variable interna."],
            ["4 · MODELO", "Copia de Tarea", "tarea = tarea.copy()", "Se modifica tarea.descripcion."],
            ["5 · UISTATE", "MutableStateFlow.update", "estadoActual.copy(tarea = tarea)", "Publica el nuevo TareaUIState."],
            ["6 · COMPOSE", "collectAsState()", "val uIState by ...", "Compose recibe el nuevo estado."],
            ["7 · UI", "La pantalla se actualiza", "value = uIState.tarea.descripcion", "El campo muestra la descripción."]
        ],

        code: `// UI
OutlinedTextField(
    value = uIState.tarea.descripcion,
    onValueChange = {
        tareaViewModel.actualizarDescripcion(it)
    }
)

// VIEWMODEL
fun actualizarDescripcion(desc_ui: String) {
    descripcion = desc_ui

    val tarea = _tareaUIState.value.tarea.copy()
    tarea.descripcion = descripcion

    _tareaUIState.update { estadoActual ->
        estadoActual.copy(tarea = tarea)
    }
}`
    },

    module: {
        title: "Flujo: selección del módulo",
        description: "El RadioButton modifica eleccModulo en Compose y llama a actualizarModulo() en el ViewModel.",
        method: "actualizarModulo()",

        nodes: [
            ["1 · UI", "RadioButton", "onClick { ... }", "El usuario selecciona AD, DI o PMDM."],
            ["2 · COMPOSE", "Estado local remember", "eleccModulo = modulo", "Se actualiza el RadioButton seleccionado."],
            ["3 · VIEWMODEL", "Método actualizarModulo()", "actualizarModulo(modulo)", "Recibe el módulo elegido."],
            ["4 · VIEWMODEL", "Propiedad local", "modulo = modulo_ui", "Actualiza la variable interna."],
            ["5 · MODELO / UISTATE", "Copia de Tarea y update", "tarea.modulo = modulo", "Publica la tarea con el nuevo módulo."],
            ["6 · COMPOSE", "collectAsState()", "val uIState by ...", "Compose recibe el nuevo UiState."],
            ["7 · UI", "RadioButton y modelo", "eleccModulo / uIState.tarea.modulo", "Se refleja la selección y el módulo guardado."]
        ],

        code: `// UI
var eleccModulo by remember {
    mutableStateOf("AD")
}

onClick = {
    eleccModulo = modulo
    tareaViewModel.actualizarModulo(modulo)
}

// VIEWMODEL
fun actualizarModulo(modulo_ui: String) {
    modulo = modulo_ui

    val tarea = _tareaUIState.value.tarea.copy()
    tarea.modulo = modulo

    _tareaUIState.update { estadoActual ->
        estadoActual.copy(tarea = tarea)
    }
}`
    },

    urgent: {
        title: "Flujo: actualización de la urgencia",
        description: "El usuario activa o desactiva el Switch. El ViewModel recibe un valor Boolean.",
        method: "actualizarUrgente()",

        nodes: [
            ["1 · UI", "Switch", "onCheckedChange(it)", "El usuario cambia el interruptor."],
            ["2 · VIEWMODEL", "Método actualizarUrgente()", "actualizarUrgente(it)", "Recibe true o false."],
            ["3 · VIEWMODEL", "Propiedad local", "urgente = urgente_ui", "Actualiza la variable interna."],
            ["4 · MODELO", "Copia de Tarea", "tarea = tarea.copy()", "Se modifica tarea.urgente."],
            ["5 · UISTATE", "MutableStateFlow.update", "estadoActual.copy(tarea = tarea)", "Publica el nuevo TareaUIState."],
            ["6 · COMPOSE", "collectAsState()", "val uIState by ...", "Compose recibe el nuevo estado."],
            ["7 · UI", "Switch actualizado", "checked = uIState.tarea.urgente", "El interruptor refleja el valor."]
        ],

        code: `// UI
Switch(
    checked = uIState.tarea.urgente,
    onCheckedChange = {
        tareaViewModel.actualizarUrgente(it)
    }
)

// VIEWMODEL
fun actualizarUrgente(urgente_ui: Boolean) {
    urgente = urgente_ui

    val tarea = _tareaUIState.value.tarea.copy()
    tarea.urgente = urgente

    _tareaUIState.update { estadoActual ->
        estadoActual.copy(tarea = tarea)
    }
}`
    },

    insert: {
        title: "Flujo: insertar una tarea",
        description: "El botón solicita al ViewModel que añada la tarea actual a la lista y cree una tarea vacía.",
        method: "insertarTarea()",

        nodes: [
            ["1 · UI", "Botón Insertar", "onClick { insertarTarea() }", "El usuario pulsa el botón."],
            ["2 · VIEWMODEL", "Método insertarTarea()", "insertarTarea()", "El ViewModel recibe la petición."],
            ["3 · UISTATE", "Estado actual", "estadoActual.tarea", "Recupera la tarea que se está editando."],
            ["4 · MODELO", "Añadir a la lista", "listaTareas + estadoActual.tarea", "Se incorpora la tarea a la lista."],
            ["5 · UISTATE", "Crear tarea vacía", "tarea = Tarea()", "El formulario vuelve a su estado inicial."],
            ["6 · COMPOSE", "collectAsState()", "val uIState by ...", "Compose recibe la lista actualizada."],
            ["7 · UI", "Recomposición", "items(uIState.listaTareas)", "Aparece la nueva tarea y se limpia el formulario."]
        ],

        code: `// UI
Button(
    onClick = {
        tareaViewModel.insertarTarea()
    }
)

// VIEWMODEL
fun insertarTarea() {
    _tareaUIState.update { estadoActual ->
        estadoActual.copy(
            tarea = Tarea(),
            listaTareas = estadoActual.listaTareas +
                estadoActual.tarea
        )
    }
}`
    }
};

// --------------------------------------------------
// 3. ACTUALIZAR EL DIAGRAMA
// --------------------------------------------------

function renderFlow(eventKey) {

    const flow = flows[eventKey];

    if (!flow) return;

    lastEvent = eventKey;
    const currentAnimation = ++animationId;

    $("eventTitle").textContent = flow.title;
    $("eventDescription").textContent = flow.description;
    $("eventStatus").textContent = "FLUJO ACTIVO";

    $("codeSnippet").textContent = flow.code;

    const diagram = $("flowDiagram");

    const nodes = diagram.querySelectorAll(".flow-node");
    const arrows = diagram.querySelectorAll(".arrow");

    // Cambiar el contenido de los siete nodos
    nodes.forEach((node, index) => {

        const data = flow.nodes[index];

        if (!data) return;

        node.querySelector(".node-tag").textContent = data[0];
        node.querySelector("b").textContent = data[1];
        node.querySelector("code").textContent = data[2];
        node.querySelector("small").textContent = data[3];

        node.classList.remove("active");
    });

    // Personalizar las flechas según el flujo
    const arrowTexts = [
        "↓ evento / dato",
        "↓ asignación",
        "↓ modifica la tarea",
        "↓ publica un nuevo estado",
        "↓ StateFlow emite",
        "↓ recomposición"
    ];

    arrows.forEach((arrow, index) => {
        if (arrowTexts[index]) {
            arrow.querySelector("span").textContent = arrowTexts[index];
        }
    });

    // Animar los nodos progresivamente
    let index = 0;

    function activateNext() {

        if (currentAnimation !== animationId) return;

        if (index < nodes.length) {

            nodes[index].classList.add("active");

            index++;

            setTimeout(activateNext, 300);

        } else {

            $("eventStatus").textContent = "ESTADO EMITIDO";

            log(
                flow.title + " → " +
                flow.method +
                " → StateFlow emite → Compose recompone"
            );
        }
    }

    activateNext();
}

// --------------------------------------------------
// 4. ACTUALIZAR EL INSPECTOR
// --------------------------------------------------

function renderInspector() {

    $("vTitle").textContent = JSON.stringify(state.title);
    $("vDesc").textContent = JSON.stringify(state.description);
    $("vModule").textContent = JSON.stringify(state.module);
    $("vUrgent").textContent = String(state.urgent);
    $("vCount").textContent = state.tasks.length;
}

// --------------------------------------------------
// 5. DIBUJAR LA LISTA DE TAREAS
// --------------------------------------------------

function esc(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function renderTasks() {

    $("taskList").innerHTML = state.tasks.map(task => `
        <article class="task">
            <small>${esc(task.module)}</small>
            <div>
                <b>${esc(task.title)}</b>
                <p>${esc(task.description)}</p>
            </div>
            ${task.urgent
                ? '<span class="urgent-mark">⌃</span>'
                : ''
            }
        </article>
    `).join("");
}

// --------------------------------------------------
// 6. REGISTRO DE EVENTOS
// --------------------------------------------------

function log(message) {

    const list = $("logList");

    if (list.querySelector(".muted")) {
        list.innerHTML = "";
    }

    const item = document.createElement("li");

    item.textContent = message;

    list.prepend(item);
}

// --------------------------------------------------
// 7. EVENTO: TÍTULO
// --------------------------------------------------

$("titleInput").addEventListener("input", event => {

    state.title = event.target.value;

    renderInspector();
    renderFlow("title");
});

// --------------------------------------------------
// 8. EVENTO: DESCRIPCIÓN
// --------------------------------------------------

$("descInput").addEventListener("input", event => {

    state.description = event.target.value;

    renderInspector();
    renderFlow("description");
});

// --------------------------------------------------
// 9. EVENTO: MÓDULO
// --------------------------------------------------

document.querySelectorAll('input[name="module"]').forEach(radio => {

    radio.addEventListener("change", event => {

        state.module = event.target.value;

        renderInspector();
        renderFlow("module");
    });
});

// --------------------------------------------------
// 10. EVENTO: URGENTE
// --------------------------------------------------

$("urgentInput").addEventListener("change", event => {

    state.urgent = event.target.checked;

    renderInspector();
    renderFlow("urgent");
});

// --------------------------------------------------
// 11. EVENTO: INSERTAR TAREA
// --------------------------------------------------

$("insertBtn").addEventListener("click", () => {

    if (!state.title.trim() && !state.description.trim()) {

        $("eventTitle").textContent = "No hay tarea que insertar";

        $("eventDescription").textContent =
            "Escribe al menos un título o una descripción para observar la inserción.";

        $("eventStatus").textContent = "EN ESPERA";

        return;
    }

    // Guardar una copia de la tarea actual
    const added = {
        module: state.module,
        title: state.title,
        description: state.description,
        urgent: state.urgent
    };

    // Añadir la tarea a la lista
    state.tasks.unshift(added);

    // Reiniciar el formulario
    state.title = "";
    state.description = "";
    state.module = "AD";
    state.urgent = false;

    $("titleInput").value = "";
    $("descInput").value = "";
    $("urgentInput").checked = false;

    document.querySelector(
        'input[name="module"][value="AD"]'
    ).checked = true;

    // Actualizar la pantalla
    renderTasks();
    renderInspector();

    // Mostrar el flujo de inserción
    renderFlow("insert");

    log(
        `Insertada «${added.title || "(sin título)"}» en listaTareas.`
    );

    $("titleInput").focus();
});

// --------------------------------------------------
// 12. BOTÓN REPETIR FLUJO
// --------------------------------------------------

$("replayBtn").addEventListener("click", () => {

    if (lastEvent) {
        renderFlow(lastEvent);
    }
});

// --------------------------------------------------
// 13. LIMPIAR TRAZA
// --------------------------------------------------

$("clearBtn").addEventListener("click", () => {

    animationId++;

    document.querySelectorAll(".flow-node").forEach(node => {
        node.classList.remove("active");
    });

    $("eventStatus").textContent = "EN ESPERA";
});

// --------------------------------------------------
// 14. BORRAR REGISTRO
// --------------------------------------------------

$("clearLog").addEventListener("click", () => {

    $("logList").innerHTML =
        '<li class="muted">Registro borrado.</li>';
});

// --------------------------------------------------
// 15. CAMBIAR TEMA
// --------------------------------------------------

$("themeBtn").addEventListener("click", () => {

    document.body.classList.toggle("dark");
});

// --------------------------------------------------
// 16. INICIALIZACIÓN
// --------------------------------------------------

renderInspector();
renderTasks();
