/*
    Created by Stephan Kaminsky
*/
var debug = false;
if (typeof decoder === "undefined") {
  decoder = {};
}
function CopyToClipboard(containerid) {
  var copyText = document.getElementById(containerid);

  /* Select the text field */
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand("Copy");
  return
}
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function openDecoder() {
  var editortab = document.getElementById("editor-tab");
  var simulatortab = document.getElementById("simulator-tab");
  var decodertab = document.getElementById("decoder-tab");
  var decodertv = document.getElementById("decoder-tab-view");
  var simulator = document.getElementById("simulator-tab-view");
  
  codeMirror.save(); 
  driver.openSimulator();
  if (simulatortab.classList.contains("is-active")) {
    simulatortab.setAttribute("class", "");
    decodertab.setAttribute("class", "is-active");
    simulator.style.display = "none";
    decodertv.style.display = "block";
  }
}
function closeDecoder() {
  var decodertab = document.getElementById("decoder-tab");
  var decodertv = document.getElementById("decoder-tab-view");
  
  decodertv.style.display = "none";
  decodertab.setAttribute("class", "");
}
function toggleThis(e) {
  if (e.value == "true") {
    e.classList.remove("is-primary");
    e.value = "false";
  } else {
    e.classList.add("is-primary");
    e.value = "true";
  }
}
function validateBase(e) {
  if (e.value == "") {
    return;
  }
  if (e.value < 1) {
    e.value = 2;
  }
  if (e.value > 32) {
    e.value = 32;
  }
}
function downloadDecoded(id, filename, custom_name) {
  var cusN = prompt("Please enter a name for the file. Leave blank for default.");
  if (cusN != "") {
    if (cusN == null) {
      return;
    }
     if (cusN.split('.').pop() != filename.split('.').pop()) {
      cusN = cusN + "." + filename.split('.').pop();
    }
    filename = cusN;
  }
  var text = document.getElementById(id).value;
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
function setAlert(m) {
  document.getElementById("alerts").innerHTML = m;
}

function decode() {
    var decodebut = document.getElementById("decoder-decode");
    decoder.useSudoRegs = document.getElementById("sudoRegID").value == "true";
    decodebut.classList.add("is-loading");
    //This function will go line by line and attempt to decode instrucitons.
    program = document.getElementById("hex-inst").value;
    decoded = [];
    if (program) {
      program = program.split('\n');
      for (line of program) {
        inst = new Instruction(line);
        decoded.push(inst.decode());
      }
    }
    decoded.push("");
    document.getElementById("decoded-inst").value = decoded.join("\n");
    decodebut.classList.remove("is-loading")
}

function clearDecoder() {
  document.getElementById("decoded-inst").value = "";
  program = document.getElementById("hex-inst").value = "";
}

function venusdecoder() {
  var lielem = document.createElement('li');
  var aelem = document.createElement('a');
  //aelem.setAttribute("onclick", "genTraceMain()");
  aelem.setAttribute("onclick", "openDecoder()");
  lielem.setAttribute("id", "decoder-tab");
  var secelem = document.createElement('section');
  secelem.setAttribute("class", "section");
  secelem.setAttribute("id", "decoder-tab-view");
  secelem.style.display = "none";
  secelem.innerHTML = `<div class="tile is-ancestor">
  <div class="tile is-vertical">
    <div class="tile">
      <div class="tile is-parent">
          <article class="tile is-child is-primary" align="center">
            <font size="6px">Instruction Decoder v1.0.0</font><br>
            <font size="4px">Created by Stephan Kaminsky.</font>
          </article>
        </center>
      </div>
    </div>
    <div class="tile">
      <div class="tile is-parent">
        <article class="tile is-child is-primary" id="simulator-controls-container">
          <div class="field is-grouped is-grouped-centered">
            <div class="control">
              <button id="decoder-decode" class="button is-primary" onclick="decode()">Decode</button>
            </div>
            <div class="control">
              <button id="decoder-clear" class="button" onclick="clearDecoder()">Clear</button>
            </div>
           </div>
         </article>
       </div>
     </div>
     <div class="tile">
       <div class="tile is-parent">
         <article class="tile is-child is-primary" align="center">
            Options!
            <center>
            <table id="options" class="table" style="width:50%; margin-bottom: 0;">
              <thead>
                <tr>
                  <th><center>Use Registers Sudo-names</center></th>
                </tr>
              </thead>
                <tr>
                  <th><center><button id="sudoRegID" class="button is-primary" onclick="toggleThis(this)" value="true">Sudo RegID</button></center></th>
                </tr>
            </table><br>
            </center>
         </article>
       </div>
     </div>
     <div class="tile is-parent">
      <article class="tile is-child">
        Instruction Hex:&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="CopyToClipboard('hex-inst')">Copy!</a>
        <br>
        <font size="2px">Make sure your instructions are in the correct hex format: Ex. 0xFFFFFFFF. Make sure instrucitons are separated just by a new line. Unknown instruction will not be decoded.</font>
        <br>
        <textarea id="hex-inst" class="textarea" placeholder="Input Instruction Hex"></textarea>
      </article>
    </div>
    <div class="tile is-parent">
      <article class="tile is-child">
        Decoded Instructions:&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="CopyToClipboard('decoded-inst')">Copy!</a>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="downloadtrace('decoded-inst', 'decoded.hex', true)">Download!</a>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="loadToEditor();">Load to Editor!</a>
        <br>
        <textarea id="decoded-inst" class="textarea" placeholder="trace dump output" readonly=""></textarea>
      </article>
    </div>
   </div>
  </div>`;
  aelem.innerHTML = "RISC-V Instruction Decoder";
  lielem.appendChild(aelem);
  document.getElementsByClassName('tabs')[0].children[0].appendChild(lielem);
  insertAfter(secelem, document.getElementById("simulator-tab-view"));

  var editortab = document.getElementById("editor-tab");
  var simulatortab = document.getElementById("simulator-tab");
  var editoronclick = editortab.getAttribute("onclick");
  var simulatoronclick = simulatortab.getAttribute("onclick");

  if (typeof editoronclick === "string" && !editoronclick.includes("closeDecoder();")) {
    editortab.setAttribute("onclick", editoronclick + "closeDecoder();")
  }
  if (typeof simulatoronclick === "string" && !simulatoronclick.includes("closeDecoder();")) {
    simulatortab.setAttribute("onclick", simulatoronclick + "closeDecoder();")
  }
  

  var noticelm = document.createElement("div");
  noticelm.setAttribute("id", "alertsDiv");
  noticelm.innerHTML = `
    <center>
      <div id="alerts">
      </div>
    </center>
  `;
  document.body.insertBefore(noticelm, document.body.children[0]);
  codeMirror.save();
  driver.openSimulator();
  driver.openEditor();
  dhijackFunctions();
}

function dhijackFunctions() {
    if (typeof driver.os === "undefined") {
        driver.os = driver.openSimulator;
    }
    if (typeof driver.oe === "undefined") {
      driver.oe = driver.openEditor;
      driver.openEditor = function(){
        driver.openSimulator();
        driver.oe();
      }
    }
    if (typeof driver.dos === "undefined") {
      driver.dos = driver.openSimulator;
      setTimeout(function(){
      driver.openSimulator = function(){
        closeDecoder();
        driver.dos();
      };
      }, 10);
    }
}

function addTabs(text) {
  var tab = RegExp("\\t", "g");
  text.replace(tab,'\t');
}

function loadToEditor() {
  val = document.getElementById("decoded-inst").value;
  if (codeMirror.getValue()) {
    if (!confirm("There was some code already in your editor! Do you want to override that code?")) {
      return;
    }
  }
  driver.openEditor();
  codeMirror.setValue(val);
  codeMirror.refresh();
}

var curNumBase = 2;
function removeDecoder() {
  document.getElementById("decoder-tab").remove();
  document.getElementById("alertsDiv").remove();
  document.getElementById("decoder-tab-view").remove();
  return;
  if (typeof driver.tos === "undefined") {
      driver.openSimulator = driver.os;
  } else {
      driver.openSimulator = driver.tos;
  }
  
}

function mainDecoder() {

  if (typeof decoderIsLoaded == "undefined") {
    console.log("Loading decoder...");
     venusdecoder();
  } else {
    console.log("Reloading decoder...");
    var decodertab = document.getElementById("decoder-tab");
    var wasactive = false;
    if (decodertab.getAttribute("class") == "is-active") {
      wasactive = true;
    }
    removeDecoder();
    venusdecoder();
    if (wasactive) {
      openDecoder();
    }
  }
  
}
mainDecoder();
var decoderIsLoaded = true;