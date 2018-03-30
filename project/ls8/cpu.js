/**
 * LS-8 v2.0 emulator skeleton code
 */

const ADD = 0b10101000; // RegA = RegA + RegB
const AND = 0b10110011; // RegA = RegA & RegB
const CALL = 0b01001000; // Reg
const CMP = 0b10100000; // RegA === RegB ? LGE = 1
const DEC = 0b01111001; // Reg--
const DIV = 0b10101011; // RegA = RegA / RegB
const HLT = 0b00000001; // Halt CPU
const INC = 0b01111000; // Reg++
const INT = 0b01001010; // Reg interrupt
const IRET = 0b00001011; // Return from interrupt
const JEQ = 0b01010001; // Reg; If E => Reg.address
const JGT = 0b01010100; // Reg; If G => Reg.address
const JLT = 0b01010011; // Reg; If L => Reg.address
const JMP = 0b01010000; // Reg.address
const JNE = 0b01010010; // Reg; If !E => Reg.address
const LD = 0b10011000; // RegA = RegB.address.value
const LDI = 0b10011001; // Reg = immediate
const MOD = 0b10101100; // RegA = RegA % RegB
const MUL = 0b10101010; // RegA = RegA * RegB
const NOP = 0b00000000; // No Operation
const NOT = 0b01110000; // ~ RegA
const OR = 0b10110001; // RegA = RegA | RegB
const POP = 0b01001100; // Reg = SP[0], SP++
const PRA = 0b01000010; // Reg.value => ASCII character
const PRN = 0b01000011; // Reg.value => Decimal integer
const PUSH = 0b01001101; // Reg = SP, SP--
const RET = 0b00001001; // Return; PC = stack.pop
const ST = 0b10011010; // RegA.address.value = RegB
const SUB = 0b10101001; // RegA = RegA - RegB
const XOR = 0b10110010; // RegA = RegA ^ RegB

let flag_E = 0;
let flag_L = 0;
let flag_G = 0;
/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers R0-R7

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
    this.reg.FL = 0; // Flag

    this.reg[7] = 0xf4;
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    const _this = this;

    this.clock = setInterval(() => {
      _this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
  }

  /**
   * ALU functionality
   *
   * The ALU is responsible for math and comparisons.
   *
   * If you have an instruction that does math, i.e. MUL, the CPU would hand
   * it off to it's internal ALU component to do the actual work.
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    let valA, valB;

    valA = this.reg[regA];
    valB = this.reg[regB];

    switch (op) {
      case 'MUL':
        this.reg[regA] = valA * valB;
        break;
      case 'ADD':
        this.reg[regA] = valA + valB;
        break;
      case 'SUB':
        this.reg[regA] = valA - valB;
        break;
      case 'DIV':
        this.reg[regA] = valA / valB;
        break;
      case 'INC':
        break;
      case 'DEC':
        break;
      case 'CMP':
        if (valA === valB) {
          flag_E = 1;
          flag_L, (flag_G = 0);
          // this.reg.FL |= (1 << flag_E)
          // console.log(this.reg.FL);
        }
        if (valA > valB) {
          flag_G = 1;
          flag_L, (flag_E = 0);
          // this.reg.FL |= (1 << flag_G)
          // console.log(this.reg.FL);
        }
        if (valA < valB) {
          flag_L = 1;
          flag_G, (flag_E = 0);
          // this.reg.FL |= (1 << flag_L)
          // console.log(this.reg.FL);
        }
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the next instruction.)
    const IR = this.ram.read(this.reg.PC);

    // !!! IMPLEMENT ME

    // Debugging output
    // console.log(`${this.reg.PC}: ${IR.toString(2)}`);

    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.
    const operandA = this.ram.read(this.reg.PC + 1);
    const operandB = this.ram.read(this.reg.PC + 2);

    // !!! IMPLEMENT ME

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    switch (IR) {
      case HLT:
        this.stopClock();
        break;
      case LDI:
        this.reg[operandA] = operandB;
        break;
      case PRN:
        console.log(this.reg[operandA]);
        break;
      case MUL:
        this.alu('MUL', operandA, operandB);
        break;
      case ADD:
        this.alu('ADD', operandA, operandB);
        break;
      case PUSH:
        this.reg[7]--;
        this.ram.write(this.reg[7], this.reg[operandA]);
        break;
      case POP:
        this.reg[operandA] = this.ram.read(this.reg[7]);
        this.reg[7]++;
        break;
      // case CALL:
      //   this.reg[7]--;
      //   this.ram.write(this.reg[7], this.reg.PC + 2);
      //   this.reg.PC = this.reg[operandA];
      //   break;
      // case RET:
      //   const subroutine = this.ram.read(this.reg[7]);
      //   this.reg.PC = subroutine;
      //   return subroutine;
      //   break;
      case CMP:
        this.alu('CMP', operandA, operandB);
        break;
      case JEQ:
        if (flag_E === 1) {
          this.reg.PC = this.reg[operandA];
          return this.reg.PC;
          break;
        }
        break;
      case JNE:
        // console.log('REG', this.reg);
        // console.log('OperandA', operandA);
        if (!flag_E || flag_E === 0) {
          this.reg.PC = this.reg[operandA];
          return this.reg.PC;
          break;
        }
        break;
      case JMP:
        this.reg.PC = this.reg[operandA];
        return this.reg.PC;
        break;
      default:
        console.log('Unknown instruction: ' + IR.toString(2));
        this.stopClock();
        break;
    }
    // !!! IMPLEMENT ME

    // Increment the PC register to go to the next instruction. Instructions
    // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
    // instruction byte tells you how many bytes follow the instruction byte
    // for any particular instruction.

    // !!! IMPLEMENT ME
    if (IR !== CALL && IR !== RET) {
      this.reg.PC += (IR >>> 6) + 1;
    }
  }
}

module.exports = CPU;
