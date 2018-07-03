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

//Add support for:            012123409354290785280385902805982058035972: 0x12345678 # nop
//           0--sdfkasc0121234093542907852803dfghhjdhgj85902805982058035972:add x0 x0 x0# nop

var Instruction = class Instruction {
  constructor(hex) {
    this.opcode = NaN;
    this.rd = NaN;
    this.rs1 = NaN;
    this.rs2 = NaN;
    this.func3 = NaN;
    this.func7 = NaN;
    this.imm = NaN;
    this.decoded = "";
    this.inst = parseInt(hex);
    this.notvalid = this.inst != hex;
    if (this.notvalid) {
      this.inst = hex;
      if (this.inst == "") {
        this.decoded = "";
      } else {
        this.decoded = "#" + this.inst + " #Unknown Instruction!";
      }
      return;
    }
    //this part actually decodes inst
    this.opcode = decoder.opcode(this);
    var process = decoder.opcodeMap[this.opcode];
    if (!process) {
      this.decoded = decoder.handleUnknownInst(this);
    }
    this.decoded = process(this);
  }
}

decoder.handleUnknownInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst.inst) + " #Unknown Instruction!";
}

decoder.opcode = function (inst) {
    return decoder.extractBits(inst.inst, 0, 6);
}

decoder.func3 = function (inst) {
  return decoder.extractBits(inst.inst, 12, 14);
}

decoder.func7 = function (inst) {
  return decoder.extractBits(inst.inst, 25, 31);
}

decoder.reg = function (r) {
  if (decoder.useSudoRegs) {
    return decoder.sudoRegs[r];
  }
  return "x" + r.toString();
}

decoder.rd = function (inst) {
  r = decoder.extractBits(inst.inst, 7, 11);
  return decoder.reg(r);
}

decoder.rs1 = function (inst) {
  r = decoder.extractBits(inst.inst, 15, 19);
  return decoder.reg(r);
}

decoder.rs2 = function (inst) {
  r = decoder.extractBits(inst.inst, 20, 24);
  return decoder.reg(r);
}

decoder.loadInst = function (inst) {
  rs2 = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  imm = decoder.Immediate(inst.inst, "I");
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
      return decoder.handleUnknownInst(inst);
  }
}

decoder.itypeArithmeticInst = function (inst) {
  func3 = decoder.func3(inst);
  func7 = decoder.func7(inst);
  imm = decoder.Immediate(inst.inst, "I");
  switch(func3) {
      case 0:
        ins = "addi";
        break;
      case 1:
        if (func7 == 0x00) {
            ins = "slli";
            imm = decoder.extractBits(imm, 0, 5);
        } else {
            return decoder.handleUnknownInst(inst);
        }
        break;
      case 2:
        ins = "slti";
        break;
      case 3:
        ins = "sltiu";
        break;
      case 4:
        ins = "xori";
        break;
      case 5:
        switch(func7) {
            case 0x00:
                ins = "srli";
                imm = decoder.extractBits(imm, 0, 5);
                break;
            case 0x20:
                ins = "srai";
                imm = decoder.extractBits(imm, 0, 5);
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 6:
        ins = "ori";
        break;
      case 7:
        ins = "andi";
        break;
      default:
        return decoder.handleUnknownInst(inst);
  }
  rd = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  return decoder.ITYPE_FORMAT.replace("%inst%", ins).replace("%rd%", rd).replace("%rs1%", rs1).replace("%imm%", imm);
}

decoder.uTypeInst = function (inst, mnemonic) {
  rd = decoder.rd(inst);
  imm = decoder.Immediate(inst.inst, "U");
  return decoder.UTYPE_FORMAT.replace("%inst%", mnemonic).replace("%rd%", rd).replace("%imm%", imm);
}

decoder.iWordsInst = function (inst) {
  func3 = decoder.func3(inst);
  func7 = decoder.func7(inst);
  imm = decoder.Immediate(inst.inst, "I");
  switch(func3) {
      case 0:
        ins = "addiw";
        break;
      case 1:
        if (func7 == 0x00) {
            ins = "slliw";
            imm = decoder.extractBits(imm, 0, 5);
        } else {
            return decoder.handleUnknownInst(inst);
        }
        break;
      case 5:
        switch(func7) {
            case 0x00:
                ins = "srliw";
                imm = decoder.extractBits(imm, 0, 5);
                break;
            case 0x20:
                ins = "sraiw";
                imm = decoder.extractBits(imm, 0, 5);
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      default:
        return decoder.handleUnknownInst(inst);
  }
  rd = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  return decoder.ITYPE_FORMAT.replace("%inst%", ins).replace("%rd%", rd).replace("%rs1%", rs1).replace("%imm%", imm);
}

decoder.sTypeInst = function (inst) {
  func3 = decoder.func3(inst);
  switch(func3) {
      case 0:
        ins = "sb";
        break;
      case 1:
        ins = "sh";
        break;
      case 2:
        ins = "sw";
        break;
      case 3:
        ins = "sd";
        break;
      default:
        return decoder.handleUnknownInst(inst);
  }
  imm = decoder.Immediate(inst.inst, "S");
  rs1 = decoder.rs1(inst);
  rs2 = decoder.rs2(inst);
  return decoder.MEM_FORMAT.replace("%inst%", ins).replace("%rs1%", rs1).replace("%rs2%", rs2).replace("%imm%", imm);
}

decoder.rTypeInst = function (inst) {
  func3 = decoder.func3(inst);
  func7 = decoder.func7(inst);
  switch(func3) {
      case 0:
        switch(func7) {
            case 0x00:
                ins = "add";
                break;
            case 0x20:
                ins = "sub";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 1:
        switch(func7) {
            case 0x00:
                ins = "sll";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 2:
        switch(func7) {
            case 0x00:
                ins = "slt";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 3:
        switch(func7) {
            case 0x00:
                ins = "sltu";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 4:
        switch(func7) {
            case 0x00:
                ins = "xor";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 5:
        switch(func7) {
            case 0x00:
                ins = "srl";
                break;
            case 0x20:
                ins = "sra";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 6:
        switch(func7) {
            case 0x00:
                ins = "or";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 7:
        switch(func7) {
            case 0x00:
                ins = "and";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      default:
        return decoder.handleUnknownInst(inst);
  }
  rd = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  rs2 = decoder.rs2(inst);
  return decoder.RTYPE_FORMAT.replace("%inst%", ins).replace("%rs1%", rs1).replace("%rs2%", rs2).replace("%rd%", rd);
}

decoder.rWordsInst = function (inst) {
  func3 = decoder.func3(inst);
  func7 = decoder.func7(inst);
  switch(func3) {
      case 0:
        switch(func7) {
            case 0x00:
                ins = "addw";
                break;
            case 0x20:
                ins = "subw";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 1:
        switch(func7) {
            case 0x00:
                ins = "sllw";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      case 5:
        switch(func7) {
            case 0x00:
                ins = "srlw";
                break;
            case 0x20:
                ins = "sraw";
                break;
            default:
                return decoder.handleUnknownInst(inst);
        }
        break;
      default:
        return decoder.handleUnknownInst(inst);
  }
  rd = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  rs2 = decoder.rs2(inst);
  return decoder.RTYPE_FORMAT.replace("%inst%", ins).replace("%rs1%", rs1).replace("%rs2%", rs2).replace("%rd%", rd);
}

decoder.branchInst = function (inst) {
  func3 = decoder.func3(inst);
  switch(func3) {
    case 0:
        ins = "beq";
        break;
    case 1:
        ins = "bne";
        break;
    case 4:
        ins = "blt";
        break;
    case 5:
        ins = "bge";
        break;
    case 6:
        ins = "bltu";
        break;
    case 7:
        ins = "bgeu";
        break;
    default:
        return decoder.handleUnknownInst(inst);
  }
  imm = decoder.Immediate(inst.inst, "SB");
  rs1 = decoder.rs1(inst);
  rs2 = decoder.rs2(inst);
  return decoder.BRANCH_FORMAT.replace("%inst%", ins).replace("%rs1%", rs1).replace("%rs2%", rs2).replace("%imm%", imm);
}

decoder.jalrInst = function (inst) {
  func3 = decoder.func3(inst);
  imm = decoder.Immediate(inst.inst, "I");
  switch(func3) {
      case 0:
        ins = "jalr";
        break;
      default:
        return decoder.handleUnknownInst(inst);
  }
  rd = decoder.rd(inst);
  rs1 = decoder.rs1(inst);
  return decoder.ITYPE_FORMAT.replace("%inst%", ins).replace("%rd%", rd).replace("%rs1%", rs1).replace("%imm%", imm); 
}

decoder.ujTypeInst = function (inst) {
  ins = "jal";
  imm = decoder.Immediate(inst.inst, "UJ");
  rd = decoder.rd(inst);
  return decoder.UTYPE_FORMAT.replace("%inst%", ins).replace("%rd%", rd).replace("%imm%", imm);
}

decoder.systemInst = function (inst) {
  return "#" + decoder.decimalToHexString(inst.inst) + " #Working on system insts!"; 
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