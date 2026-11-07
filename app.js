const $=id=>document.getElementById(id);
const state={title:"",description:"",module:"AD",urgent:false,tasks:[
 {module:"PMDM",title:"Ejercicio 1",description:"Implementar el ejercicio 1",urgent:true},
 {module:"DI",title:"Login",description:"Acabar pantalla de Login",urgent:false},
 {module:"AD",title:"Tarea Json",description:"Realizar la tarea de json",urgent:true}
]};
let lastFlow=[],lastEvent=null;
const nodeOrder=["ui","vm","local","copy","state","collect","render"];
const snippets={
 title:`onValueChange = {\\n    tareaViewModel.actualizarTitulo(it)\\n}\\n\\nfun actualizarTitulo(titulo_ui: String) {\\n    titulo = titulo_ui\\n    val tarea = _tareaUIState.value.tarea.copy()\\n    tarea.titulo = titulo\\n    _tareaUIState.update { estadoActual ->\\n        estadoActual.copy(tarea = tarea)\\n    }\\n}`,
 description:`onValueChange = {\\n    tareaViewModel.actualizarDescripcion(it)\\n}\\n\\nfun actualizarDescripcion(desc_ui: String) {\\n    descripcion = desc_ui\\n    val tarea = _tareaUIState.value.tarea.copy()\\n    tarea.descripcion = descripcion\\n    _tareaUIState.update { estadoActual ->\\n        estadoActual.copy(tarea = tarea)\\n    }\\n}`,
 module:`onClick = {\\n    eleccModulo = modulo\\n    tareaViewModel.actualizarModulo(modulo)\\n}\\n\\nfun actualizarModulo(modulo_ui: String) {\\n    modulo = modulo_ui\\n    val tarea = _tareaUIState.value.tarea.copy()\\n    tarea.modulo = modulo\\n    _tareaUIState.update { estadoActual ->\\n        estadoActual.copy(tarea = tarea)\\n    }\\n}`,
 urgent:`onCheckedChange = {\\n    tareaViewModel.actualizarUrgente(it)\\n}\\n\\nfun actualizarUrgente(urgente_ui: Boolean) {\\n    urgente = urgente_ui\\n    val tarea = _tareaUIState.value.tarea.copy()\\n    tarea.urgente = urgente\\n    _tareaUIState.update { estadoActual ->\\n        estadoActual.copy(tarea = tarea)\\n    }\\n}`,
 insert:`onClick = { tareaViewModel.insertarTarea() }\\n\\n_tareaUIState.update { estadoActual ->\\n    estadoActual.copy(\\n        tarea = Tarea(),\\n        listaTareas = estadoActual.listaTareas + estadoActual.tarea\\n    )\\n}`
};
const descriptions={
 title:["Escribir título","La UI entrega el texto nuevo mediante onValueChange(it).","actualizarTitulo(titulo_ui)"],
 description:["Escribir descripción","El callback onValueChange envía la descripción al ViewModel.","actualizarDescripcion(desc_ui)"],
 module:["Seleccionar módulo","El RadioButton actualiza eleccModulo (remember) y llama al ViewModel.","actualizarModulo(modulo_ui)"],
 urgent:["Cambiar urgencia","Switch envía el booleano nuevo con onCheckedChange(it).","actualizarUrgente(urgente_ui)"],
 insert:["Insertar tarea","El botón no envía un campo: solicita al ViewModel guardar la tarea que ya está en UiState.","insertarTarea()"]
};
function renderTasks(){ $("taskList").innerHTML=state.tasks.map(t=>`<article class="task"><small>${esc(t.module)}</small><div><b>${esc(t.title)}</b><p>${esc(t.description)}</p></div>${t.urgent?'<span class="urgent-mark">⌃</span>':''}</article>`).join("");}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderInspector(){ $("vTitle").textContent=JSON.stringify(state.title);$("vDesc").textContent=JSON.stringify(state.description);$("vModule").textContent=JSON.stringify(state.module);$("vUrgent").textContent=String(state.urgent);$("vCount").textContent=state.tasks.length;}
function log(msg){const ol=$("logList");if(ol.querySelector(".muted"))ol.innerHTML="";const li=document.createElement("li");li.textContent=msg;ol.prepend(li);}
function activate(nodes){document.querySelectorAll(".flow-node").forEach(n=>n.classList.toggle("active",nodes.includes(n.dataset.node)));}
async function playFlow(eventKey){lastEvent=eventKey;lastFlow=nodeOrder.slice();const d=descriptions[eventKey];$("eventTitle").textContent=d[0];$("eventDescription").textContent=d[1]+" Método: "+d[2];$("eventStatus").textContent="FLUJO ACTIVO";$("codeSnippet").textContent=snippets[eventKey];activate([]);for(let i=0;i<nodeOrder.length;i++){activate(nodeOrder.slice(0,i+1));await new Promise(r=>setTimeout(r,240));} $("eventStatus").textContent="ESTADO EMITIDO";log(`${d[0]} → ${d[2]} → StateFlow emite → Compose recompone`);}
function updateField(key,value){state[key]=value;const map={title:"title",description:"description",module:"module",urgent:"urgent"};renderInspector();playFlow(map[key]);}
$("titleInput").addEventListener("input",e=>{state.title=e.target.value;updateField("title",e.target.value);});
$("descInput").addEventListener("input",e=>{state.description=e.target.value;updateField("description",e.target.value);});
document.querySelectorAll('input[name="module"]').forEach(r=>r.addEventListener("change",e=>{state.module=e.target.value;updateField("module",e.target.value);}));
$("urgentInput").addEventListener("change",e=>{state.urgent=e.target.checked;updateField("urgent",e.target.checked);});
$("insertBtn").addEventListener("click",()=>{if(!state.title.trim()&&!state.description.trim()){ $("eventTitle").textContent="No hay tarea que insertar";$("eventDescription").textContent="Escribe al menos un título o una descripción para observar la inserción.";return;}const added={module:state.module,title:state.title,description:state.description,urgent:state.urgent};state.tasks.unshift(added);state.title="";state.description="";state.module="AD";state.urgent=false;$("titleInput").value="";$("descInput").value="";$("urgentInput").checked=false;document.querySelector('input[name="module"][value="AD"]').checked=true;renderTasks();renderInspector();playFlow("insert");log(`Insertada «${added.title||"(sin título)"}» en listaTareas. La tarea de edición vuelve a Tarea().`);$("titleInput").focus();});
$("replayBtn").addEventListener("click",()=>{if(lastEvent)playFlow(lastEvent);});
$("clearBtn").addEventListener("click",()=>{activate([]);$("eventStatus").textContent="EN ESPERA";});
$("clearLog").addEventListener("click",()=>{$("logList").innerHTML='<li class="muted">Registro borrado.</li>';});
$("themeBtn").addEventListener("click",()=>document.body.classList.toggle("dark"));
renderInspector();
