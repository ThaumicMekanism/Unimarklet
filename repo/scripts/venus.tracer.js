/*
    Created by Stephan Kaminsky
*/
var debug = false;
var newlinechar = "\n";
var Step = class Step {
  constructor(string) {
    this.stringPattern = string;
    this.r = [];
    for (var i = 0; i < 32; i++) {
      this.r[i] = "Unset";
    }
    this.line = "Unset";
    this.pc = "Unset";
    this.inst = "Unset";
  }
  
  set(index, value) {
    if (index >= 0 && index < 32) {
      this.stringPattern = this.stringPattern.replace(RegExp("%" + index + "%","g"), value);
      this.r[index] = value;
      return true;
    }
    switch(index) {
      case "line":
        this.stringPattern = this.stringPattern.replace(RegExp("%line%","g"), value);
        this.line = value;
        break;
      case "pc":
        this.pc = value;
        this.stringPattern = this.stringPattern.replace(RegExp("%pc%","g"), value);
        break;
      case "inst":
        this.inst = value;
        this.stringPattern = this.stringPattern.replace(RegExp("%inst%","g"), value);
        break;
      default:
        return false;
    }
    return true;
  }

  get(index) {
    if (index >=0 && index < 32) {
      return this.r[index];
    }
    switch(index) {
      case "line":
        return this.line;
      case "pc":
        return this.pc;
      case "inst":
        return this.inst;
      default:
        return false;
    }
  }

  toString() {
    return this.stringPattern;
  }
}
function getVal(i) {
//     var id = "reg-" + i + "-val";
//     var el = document.getElementById(id);
//     driver.saveRegister(el, i);
//     return el.value;
  return registerInteract(i, "r");
}
function extendZeros(s) {
  var z = 8-s.length;
  for (var k = 0; k < z; k++) {
    s = "0" + s;
  }
  return s;
}
function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}
function decimalToHexString(number)
{
    if (number < 0)
    {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase().substring(0,8);
}
function numToBase(n, length, base, signextend) {
    var amount = Math.pow(2, length);
    length = getBaseLog(curNumBase, amount);
    var num = 0;
    if (signextend) {
      num = parseInt(parseInt(n, base).toString(10), 10);
      num = parseInt(decimalToHexString(num), 16).toString(curNumBase);
    } else {
      num = parseInt(n, base).toString(curNumBase);
    }
    if (length - num.length > 0) {
      num = "0".repeat(length - num.length) + num;
    }
    snum = "";
    if (curNumBase == 2) {
      for (var i = 0; i < length; i++) {
          if (i % 4 == 0 && i != 0) {
              snum += " ";
          }
          snum += num[i];
      }
    } else {
      snum = num;
    }
  return snum;
}
//var regs = [0, 1, 2, 5, 6, 7, 8, 9, 10];
var regs = [];
for (var i = 0; i < 32; i++) {
   regs.push(i);
}
var lin = 0;
var extra = 0;
var baseString = "%0%\t%1%\t%2%\t%3%\t%4%\t%5%\t%6%\t%7%\t%8%\t%9%\t%10%\t%11%\t%12%\t%13%\t%14%\t%15%\t%16%\t%17%\t%18%\t%19%\t%20%\t%21%\t%22%\t%23%\t%24%\t%25%\t%26%\t%27%\t%28%\t%29%\t%30%\t%31%\t%line%\t%pc%\t%inst%";
function getOneTrace(additional, final) {
    //var res = "";
    //var vals = [];
    var stepdetails = new Step(baseString);
    if (additional != true) {
      driver.undo();
    }
    for (var j in regs) {
        i = regs[j];
        var s = getVal(i);
//        if (s.length == 0) {
//             s = "00000000";
//         } else {
//             s = s.substring(2);
//             if (i == 2 && false) {
//               s = (parseInt(s, 16)-parseInt("7ffffff0", 16)).toString(16);
//               s = extendZeros(s);
//             }
//         }
        
        //res += numToBase(s, 32, 16, true) + "\t";
        stepdetails.set(j, numToBase(s, 32, 16, true));
    }
    var bpc = Math.floor(driver.sim.state_0.pc / 4);
    if (additional == true) {
      bpc += extra;
      extra++;
    }
    
    var line = numToBase(lin, 16, 10, false);
    var pc = numToBase(bpc, 32, 10, false);
    var inst = "0x00000000";
    if (additional != true || final == true) {
      var prevpc = 0;
      var prevcommand = "";
      if (instfirst) {
        prevpc = driver.sim.preInstruction_0.array_9xgyxj$_0;
        prevpc = Math.floor(prevpc[prevpc.length - 1]["pc"] / 4);
        //prevcommand = document.getElementById("instruction-" + Math.floor(prevpc[prevpc.length - 1]["pc"] / 4));
      } else {
        driver.undo();
        prevpc = driver.sim.state_0.pc;
        try{
          driver.step();
        } catch(e) {

        }
        prevpc = Math.floor(prevpc / 4);
        //prevcommand = document.getElementById("instruction-" + Math.floor(prevpc / 4));
      }
      var instmem = driver.sim.linkedProgram.prog.insts.array_9xgyxj$_0;
      inst = instmem[prevpc]["encoding_0"];
//       if (prevcommand != null) {
//         var basecode = prevcommand.getElementsByTagName("td")[0].innerHTML;
//         if (basecode != null) {
//             //inst
//             inst = basecode;
//         }
//       }
      
    }
    if (additional != true) {
      driver.step();
    }
    //res += line + "\t" + pc + "\t" + numToBase(inst, 32, 10, true);
    stepdetails.set("line", line);
    stepdetails.set("pc", pc);
    stepdetails.set("inst", numToBase(inst, 32, 10, true));
    lin++;
    //return res + newlinechar;
    return stepdetails.toString() + newlinechar;
}

async function generateTrace() {
    lin = 0;
    extra = 0;
    driver.reset();
    if (document.getElementById("spzero").value == "true") {
//       var ell = document.getElementById("reg-2-val");
//       ell.value = "0x00000000";
//       driver.saveRegister(ell, 2);
         registerInteract(2, 0);
         registerInteract(3, 0);
    }
    var res = [];
    var runNextTrace = 1;
    try {
        var ecallExit = 0;
        var getecall = 0;
        if (!instfirst) {
          driver.step();
        }
      while(canProceed(lin)) {
       driver.step();
        var selected = document.getElementsByClassName("is-selected")[0];
        if (selected != null && selected.id != null && selected.id.indexOf("instruction-") != -1) {
            var basecode = selected.getElementsByTagName("td")[1].innerHTML;
            if (basecode != null) {
                if(basecode == "ecall") {
                    var r10 = parseInt(getVal(10));
                    if (r10 == 10) {
                        ecallExit = -2;
                    } else {
                        getecall = -2;
                    }
                }
            }
        }
        getecall++;
        if (!getecall) {
            var consOut = document.getElementById("console-output");
            if (consOut != null) {
              if (debug) {
                console.log(consOut.value);
              }
                res.push(consOut.value);
                consOut.value = "";
            }
        } else {
            getecall = (getecall == -1) ? -1 : 0;
        }
        ecallExit++;
        if (!ecallExit) {
            res = res.join("");
            res += "exiting the simulator";
            break;
        } else {
            ecallExit = (ecallExit == -1) ? -1 : 0;
        }
        res.push(getOneTrace(false, false));
        if (debug) {
          console.log(res);
        }
     }
    } catch (e) { 
      if (debug) {
        console.log(e);
      }
    }
    if (!instfirst) {
      res.push(getOneTrace(true, true));
    }
    try {
      var ii = 0;
      if (instfirst) {
        ii = -1;
      }
      for (var i = ii;((i < numBlankCommands || (((i - 1) < totalCommands) && totalCommands > 0)) && canProceed(lin)); i++) {
       res.push(getOneTrace(true, false));
       if (debug) {
        console.log(res);
       }
     }
    }
    catch(e) {
      if (debug) {
        console.log(e);
      }
    }
    setAlert("Trace done! Finishing up...");
    //res.push(newlinechar);
    //document.write(res.join(""));
    //document.close();
    document.getElementById("trace-output").value = res.join("");
    //driver.dump();
    //document.getElementById("trace-dump").value = document.getElementById("console-output").value;
    ddump();
    openTrace();
    tracing = false;
    setAlert("");
    //return res;
};
function canProceed(n) {
  return (totalCommands <= 0) || (!(totalCommands <= 0) && (n - 1) < totalCommands);
}
var numBlankCommands = 0;
var totalCommands = -1;
var instfirst = false;
var tracing = false;
function genTraceMain() {
    tracing = true;
    var tracebut = document.getElementById("trace-trace");
    baseString = document.getElementById("regPattern").value;
    tracebut.classList.add("is-loading");
    instfirst = document.getElementById("inst-first").value == "true";
    //setAlert("Generating trace...<br>(WARNING! Large traces may take a while!)");
    setTimeout(function(){
      curNumBase = document.getElementById("numbase").value;
      if (curNumBase < 2 || curNumBase == "") {
        curNumBase = 2;
      }
      if (curNumBase > 32) {
        curNumBase = 32;
      }
      closeTrace();
      numBlankCommands = document.getElementById("numextra").value;
      if (numBlankCommands == "") {
        numBlankCommands = 0;
      }
      totalCommands = document.getElementById("numtot").value;
      if (totalCommands < 0) {

      }
      codeMirror.save(); 
      driver.openSimulator();
      openTrace();
      setTimeout(function(){generateTrace(); tracebut.classList.remove("is-loading"); loadRegisters();}, 50);
    }, 50);

};
function registerInteract(r, v) {
  var dregs = driver.sim.state_0.regs_0;
  if (v == "r") {
    return dregs[r].toString(16);
  }
  dregs[r] = parseInt(v);
}
var registers = new Array(32);
var saveRegs = false;
function saveRegisters() {
  for (var i = 0; i < 32; i++) {
//     var id = "reg-" + i + "-val";
//     var el = document.getElementById(id);
//     registers[i] = el.value;
       registers[i] = registerInteract(i, "r");
  }
}
function loadRegisters() {
  for (var i = 0; i < 32; i++) {
//     var id = "reg-" + i + "-val";
//     var el = document.getElementById(id);
//     if (registers[i] != "") {
//       el.value = registers[i];
//       driver.saveRegister(el, i);
//     }
    registerInteract(i, registers[i]);
  }
}
function resetRegisters() {
  var sst = saveRegs;
  tracing = true;
  saveRegs = false;
  driver.openSimulator();
  openTrace();
  saveRegisters();
  tracing = false;
  saveRegs = sst;
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
function clearTrace() {
  document.getElementById("trace-output").value = "";
  document.getElementById("trace-dump-output").value = "";
}
function openTrace() {
  var editortab = document.getElementById("editor-tab");
  var simulatortab = document.getElementById("simulator-tab");
  var tracetab = document.getElementById("trace-tab");
  var trace = document.getElementById("trace-tab-view");
  var simulator = document.getElementById("simulator-tab-view");
  
  codeMirror.save(); 
  driver.openSimulator();
  if (simulatortab.classList.contains("is-active")) {
    simulatortab.setAttribute("class", "");
    tracetab.setAttribute("class", "is-active");
    simulator.style.display = "none";
    trace.style.display = "block";
  }
}
function closeTrace() {
  var tracetab = document.getElementById("trace-tab");
  var trace = document.getElementById("trace-tab-view");
  
  trace.style.display = "none";
  tracetab.setAttribute("class", "");
}
function ddump() {
  //setAlert("Dumping...<br>(WARNING! Large dumps may take a while!)");
  var walert = window.alert;
  window.alert = function(){
    if (debug) {
      console.log("alert")
    }
  };
  var dumpbut = document.getElementById("trace-dump");
  dumpbut.classList.add("is-loading");
  setTimeout(function(){
    closeTrace();
    codeMirror.save(); 
    driver.openSimulator();
    driver.dump();
    var trace = document.getElementById("console-output").value;
    document.getElementById("trace-dump-output").value = "v2.0 raw\n" + trace;
    openTrace();
    dumpbut.classList.remove("is-loading");
    setAlert("");
    window.alert = walert;
  }, 50);
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
function downloadtrace(id, filename, custom_name) {
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

function tracer() {
  var lielem = document.createElement('li');
  var aelem = document.createElement('a');
  //aelem.setAttribute("onclick", "genTraceMain()");
  aelem.setAttribute("onclick", "openTrace()");
  lielem.setAttribute("id", "trace-tab");
  var secelem = document.createElement('section');
  secelem.setAttribute("class", "section");
  secelem.setAttribute("id", "trace-tab-view");
  secelem.style.display = "none";
  secelem.innerHTML = `<div class="tile is-ancestor">
  <div class="tile is-vertical">
    <div class="tile">
      <div class="tile is-parent">
          <article class="tile is-child is-primary" align="center">
            <font size="6px">Trace Generator v1.1.0</font><br>
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
              <button id="trace-trace" class="button is-primary" onclick="genTraceMain()">Trace</button>
            </div>
            <div class="control">
              <button id="trace-dump" class="button" onclick="ddump()">Dump</button>
            </div>
            <div class="control">
              <button id="trace-clear" class="button" onclick="clearTrace()">Clear</button>
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
                  <th><center>Number of extra lines<br>after code is done:</center></th>
                  <th><center>Total number of commands:<br>(Negative means ignored)</center></th>
                  <th><center>Output Number's Base<br>(2-32)</center></th>
                </tr>
              </thead>
                <tr>
                  <th><center><input id="numextra" type="number" class="input is-small" style="width:180px;" onblur="" value=0 spellcheck="false"></center></th>
                  <th><center><input id="numtot" type="number" class="input is-small" style="width:180px;" onblur="" value=-1 spellcheck="false"></center></th>
                  <th><center><input id="numbase" type="number" class="input is-small" style="width:180px;" onblur="validateBase(this);" onkeyup="validateBase(this);" value=2 spellcheck="false"></center></th>
                </tr>
            </table><br>
            <h3>Registers Pattern:</h3>
            <small>To add tabs, type '\\t'. The current valid symbols to add are:<br><b>%0% through %31%</b> which represent the registers<br><b>%line%</b> is the current line which it is on<br><b>%pc%</b> represents the pc at the current instruction.<br><b>%inst%</b> represents the current instruction.</small>
            <br>
            <textarea id="regPattern" class="textarea" placeholder="Please type in the format of the output you want.">` + baseString + `</textarea>
            </center>
            <center>
            <font size="2px" color="green">(&dArr; Green = True; White = false &dArr;)</font>
            <table id="options2" class="table" style="width:50%; margin-bottom: 0;">
              <thead>
                <tr>
                  <th><center>Set SP & GP to 0<br>before the trace?*</center></th>
                  <th><center>Save Registers?**<br><a onclick="resetRegisters();">Click to reset</a></center></th>
                  <th><center>Instruction first?***</center></th>
                </tr>
              </thead>
                <tr>
                  <th><center>
                    <button id="spzero" class="button is-primary" onclick="toggleThis(this)" value="true">0 SP & GP</button>
                  </center></th>
                  <th><center><button id="save-regs" class="button" onclick="toggleThis(this)" value="false" disabled>Save</button></center></th>
                  <th><center><button id="inst-first" class="button is-primary" onclick="toggleThis(this)" value="true">Inst First</button></center></th>
                </tr>
            </table>
            <font size="2px">Notes:</font>
            <font size="1px">
              <p>*This is because Venus already sets the SP before a run.</p>
              <p>**Venus resets the registers before a run. This will allow you to preset register values and then run with those changes.</p>
              <p>***This will print the register values BEFORE this instruction if true.<br>If false, it will print the register values at the same 'place' as the instruction.</p>
            </font>
            </center>
         </article>
       </div>
     </div>
     <div class="tile is-parent">
      <article class="tile is-child">
        Trace:&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="CopyToClipboard('trace-output')">Copy!</a>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="downloadtrace('trace-output', 'trace.out', true)">Download!</a>
        <br>
        <font size="2px">If you have issues with tabs not copying, you should click the download button instead. For some reason, tabs are not always copying for me.</font>
        <br>
        <textarea id="trace-output" class="textarea" placeholder="trace output" readonly=""></textarea>
      </article>
    </div>
    <div class="tile is-parent">
      <article class="tile is-child">
        Trace Dump:&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="CopyToClipboard('trace-dump-output')">Copy!</a>&nbsp;&nbsp;&nbsp;&nbsp;<a onclick="downloadtrace('trace-dump-output', 'dump.hex', true)">Download!</a>
        <br>
        <textarea id="trace-dump-output" class="textarea" placeholder="trace dump output" readonly=""></textarea>
      </article>
    </div>
   </div>
  </div>`;
  aelem.innerHTML = "Trace Generator";
  lielem.appendChild(aelem);
  document.getElementsByClassName('tabs')[0].children[0].appendChild(lielem);
  insertAfter(secelem, document.getElementById("simulator-tab-view"));

  var editortab = document.getElementById("editor-tab");
  var simulatortab = document.getElementById("simulator-tab");
  editortab.setAttribute("onclick", editortab.getAttribute("onclick") + "; closeTrace();")
  simulatortab.setAttribute("onclick", simulatortab.getAttribute("onclick") + "; closeTrace();")
  

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
  saveRegisters();
  hijackFunctions();
}

function addTabs(text) {
  var tab = RegExp("\\t", "g");
  text.replace(tab,'\t');
}

function hijackFunctions() {
  driver.os = driver.openSimulator;
  setTimeout(function(){
  driver.openSimulator = function(){
    saveRegs = document.getElementById("save-regs").value;
    if (!tracing) {
      saveRegisters();
    }
    driver.os();
    if(saveRegs == "true") {
      loadRegisters();
    }
  };}, 10);
}
var curNumBase = 2;
function removeTracer() {
  document.getElementById("trace-tab").remove();
  document.getElementById("alertsDiv").remove();
  document.getElementById("trace-tab-view").remove();
  driver.openSimulator = driver.os;
}

function mainTrace() {
  var tracetab = document.getElementById("trace-tab");
  if (typeof traceIsLoaded == "undefined" || !tracetab) {
    console.log("Loading trace...");
     tracer();
  } else {
    console.log("Reloading trace...");
    var wasactive = false;
    if (tracetab.getAttribute("class") == "is-active") {
      wasactive = true;
    }
    removeTracer();
    tracer();
    if (wasactive) {
      openTrace();
    }
  }
  
}
mainTrace();
var traceIsLoaded = true;