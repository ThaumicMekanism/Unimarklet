decoder = {};
decoder.RTYPE_FORMAT = "%inst%\t%rd%, %rs1%, %rs2%";
decoder.ITYPE_FORMAT = "%inst%\t%rd%, %rs1%, %imm%";
decoder.MEM_FORMAT = "%inst%\t%rs2%, %imm%(%rs1%)";
decoder.UTYPE_FORMAT = "%inst%\t%rd%, %imm%";
decoder.BRANCH_FORMAT = "%inst%\t%rs1%, %rs2%, %imm%";
decoder.INST_FORMAT = "%inst%";
decoder.sudoRegs = ["zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2", "s0", "s1", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "t3", "t4", "t5", "t6"];
decoder.useSudoRegs = true;

decoder.getRegString = function(i) {
  i = Math.round(i);
  if (i < 0 || i > 31) {
    return null;
  }
  if (useSudoRegs) {
    return sudoRegs[i];
  }
  return "x" + i;
}

var Instruction = class Instruction {
  constructor(hex) {
    this.inst = parseInt(hex);
    this.notvalid = this.inst != hex;
    if (this.notvalid) {
      this.inst = hex;
    }
  }

  decode() {
    if (this.notvalid) {
      if (this.inst == "") {
        return "";
      }
      return "#" + this.inst + " #Unknown Instruction!";
    }
    //this part actually decodes inst
    var op = decoder.opcode(this.inst);
    var process = decoder.opcodeMap[op];
    if (!process) {
      return decoder.handleUnknownInst(this.inst);
    }
    return process(this.inst);
  }
  
  

}

decoder.handleUnknownInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Unknown Instruction!";
}

decoder.opcode = function (inst) {
    return decoder.extractBits(inst, 0, 6);
}

decoder.func3 = function (inst) {
  return decoder.extractBits(inst, 12, 14);
}

decoder.func7 = function (inst) {
  return decoder.extractBits(inst, 25, 31);
}

decoder.reg = function (r) {
  if (decoder.useSudoRegs) {
    return decoder.sudoRegs[r];
  }
  return "x" + r.toString();
}

decoder.rd = function (inst) {
  r = decoder.extractBits(inst, 7, 11);
  return decoder.reg(r);
}

decoder.rs1 = function (inst) {
  r = decoder.extractBits(inst, 15, 19);
  return decoder.reg(r);
}

decoder.rs2 = function (inst) {
  r = decoder.extractBits(inst, 20, 24);
  return decoder.reg(r);
}

decoder.loadInst = function (inst) {
  rs2 = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  imm = decoder.Immediate(inst, "I");
  func3 = decoder.func3(inst);
  switch(func3) {
    case 0:
      ins = "lb";
      break;
    case 1:
      ins = "lh";
      break;
    case 2:
      ins = "lw";
      break;
    case 3:
      ins = "ld";
      break;
    case 4:
      ins = "lbu";
      break;
    case 5:
      ins = "lhu";
      break;
    case 6:
      ins = "lwu";
      break;
    default:
      return decoder.handleUnknownInst(inst);
  }
  return decoder.MEM_FORMAT.replace("%inst%", ins).replace("%rs2%", rs2).replace("%rs1%", rs1).replace("%imm%", imm);
}

decoder.fenceInst = function (inst) {
  func3 = decoder.func3(inst);
  switch(func3) {
    case 0:
      return INST_FORMAT.replace("%inst%", "fence");
    case 1:
      return INST_FORMAT.replace("%inst%", "fence.i");
    default:
      return handleUnknownInst(inst);
  }
}

decoder.itypeArithmeticInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on itype arithmetic insts!";
}

decoder.uTypeInst = function (inst, mnemonic) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on utype insts! " + mnemonic;
}

decoder.iWordsInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on itype word arithmetic insts!"; 
}

decoder.sTypeInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on sType inst!"; 
}

decoder.rTypeInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on rtype inst!"; 
}

decoder.rWordsInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on r words inst!"; 
}

decoder.branchInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on branch inst!"; 
}

decoder.jalrInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on jalr inst!"; 
}

decoder.ujTypeInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on jal inst!"; 
}

decoder.systemInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst) + " #Working on system insts!"; 
}

decoder.opcodeMap = {
  0x03 : decoder.loadInst,
  0x0F : decoder.fenceInst,
  0x13 : decoder.itypeArithmeticInst,
  0x17 : function(inst){
            return decoder.uTypeInst(inst, "auipc");
          },
  0x1B : decoder.iWordsInst,
  0x23 : decoder.sTypeInst,
  0x33 : decoder.rTypeInst,
  0x37 : function(inst){
            return decoder.uTypeInst(inst, "lui");
          },
  0x3B : decoder.rWordsInst,
  0x63 : decoder.branchInst,
  0x67 : decoder.jalrInst,
  0x6F : decoder.ujTypeInst,
  0x73 : decoder.systemInst,
}

decoder.Immediate = function (inst, type) {
  switch(type.toUpperCase()) {
    case "I":
      imm = decoder.extractBits(inst, 20, 31);
      imm = decoder.parseTwos(imm, 12);
      return imm;
    case "S":
      imm40 = decoder.extractBits(inst, 7, 11).toString(2);
      imm115 = decoder.extractBits(inst, 25, 31).toString(2);
      imm = "0".repeat(7 - imm115.length) + imm115 + "0".repeat(5 - imm40.length) + imm40;
      imm = decoder.parseTwos(parseInt(imm, 2), imm.length);
      return imm;
    case "SB":
      imm11 = decoder.extractBits(inst, 7, 7).toString(2);
      imm41 = decoder.extractBits(inst, 8, 11).toString(2);
      imm105 = decoder.extractBits(inst, 25, 30).toString(2);
      imm12 = decoder.extractBits(inst, 31, 31).toString(2);
      imm = imm12 + imm11 + "0".repeat(6 - imm105.length) + imm105 + "0".repeat(4 - imm41.length) + imm41 + "0";
      imm = decoder.parseTwos(parseInt(imm, 2), imm.length);
      return imm;
    case "U":
      imm = decoder.extractBits(inst, 12, 31);
      //Utype is not twos complement!
      //imm = decoder.parseTwos(imm, 20);
      return imm;
    case "UJ":
      imm1912 = decoder.extractBits(inst, 12, 19).toString(2);
      imm11 = decoder.extractBits(inst, 20, 20).toString(2);
      imm101 = decoder.extractBits(inst, 21, 30).toString(2);
      imm20 = decoder.extractBits(inst, 31, 31).toString(2);
      imm = imm20 + "0".repeat(8 - imm1912.length) + imm1912 + imm11 + "0".repeat(10 - imm101.length) + imm101 + "0";
      imm = decoder.parseTwos(parseInt(imm, 2), imm.length);
      return imm;
  }
  console.log("Unknown inst type! Cannot parse immediate.");
  return null;
}

/*
  Takes in decimal number and number of bits and converts it into twos complement number.
*/
decoder.parseTwos = function(number,  nbits) {
  nbits--;
  sign = decoder.extractBits(number, nbits, nbits);
  val = sign * (-(2**(nbits)));
  return val + decoder.extractBits(number, 0, nbits - 1);
}

/*
    This extracts bits inclusively. 
    Ex: extractBits(0b011101010, 1, 5) == 0b10101
*/
decoder.extractBits = function (word, start, end) {
  return (word >> start) & ~(~0 << (end - start + 1));
}

decoder.extendZeros = function (s) {
  var z = 8-s.length;
  for (var k = 0; k < z; k++) {
    s = "0" + s;
  }
  return s;
}

decoder.getBaseLog = function (x, y) {
  return Math.log(y) / Math.log(x);
}

decoder.decimalToHexString = function (number)
{
    if (number < 0)
    {
        number = 0xFFFFFFFF + number + 1;
    }
    n = number.toString(16).toUpperCase().substring(0,8);
    if (n.length < 8) {
      n = "0".repeat(8 - n.length) + n;
    }
    n = "0x" + n;
    return n;
}
console.log("Decoder Loaded!");