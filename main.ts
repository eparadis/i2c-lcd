// Ed Paradis
// TODO
// - use enums for picking the line because there is only a top and bottom line
// - use shadowOptions.toString=true on console-style methods
// - add JSDoc for help tooltips
// NOTES
// Defining blocks: https://makecode.com/defining-blocks
//                  https://learn.adafruit.com/custom-extensions-for-makecode?view=all

namespace LCD {
    //% block
    export function clear(): void {
        initializeLCD() // make sure the LCD is initialized
        lcd_command(/*0x01*/ 0b00000001); // clear display
    }

    //% block
    export function clearLine(line: number): void {
        writeLine(line, "                ") // yep, we just overwrite it with spaces
    }

    //% block
    export function writeLine(line: number, text: string): void {
        if (line == 1) {
            moveCursorToFirstLine()
        }
        if (line == 2) {
            moveCursorToSecondLine()
        }
        writeString(text)
    }

    //% block
    export function log(value: number): void {
        clearCurrentLine()
        moveCursorToStartOfCurrentLine()
        writeString(value.toString())
    }

    //% block
    export function logValue(label: string, value: number): void {
        clearCurrentLine()
        moveCursorToStartOfCurrentLine()
        writeString(`${label}: ${value.toString()}`)
    }

    // ********************* internal methods ******************************** //

    let isInitialized = false
    let isOnFirstLine = true

    function initializeLCD() {
        // NOTE: a better way to do this than a method and a bool is to use an object and a constructor
        if (!isInitialized) {
            lcd_fmsynth_init()
            isInitialized = true
        }
    }

    function moveCursorToFirstLine() {
        initializeLCD()
        lcd_command(0x80 | 0x00) // 0x80 - move cursor, 0x00 - position
    }

    function moveCursorToSecondLine() {
        initializeLCD()
        lcd_command(0x80 | 0x40) // 0x80 - move cursor, 0x40 - position
    }

    function moveCursorToStartOfCurrentLine() {
        if (isOnFirstLine) {
            moveCursorToFirstLine()
        } else {
            moveCursorToSecondLine()
        }
    }

    function clearCurrentLine() {
        moveCursorToStartOfCurrentLine()
        writeString("                ")
    }

    function writeString(str: string) {
        initializeLCD() // make sure the LCD is initialized
        for (let i = 0; i < str.length; i += 1) {
            lcd_write(str.charCodeAt(i))
        }
    }

    // ********************* the ugly guts ******************************** //

    // MCP23008 
    // the backlight is on GP7
    // LCD DB4..DB7 are MCP GP3..GP6 
    // LCD E is GP2 
    // LCD RS is GP1
    // GP0 is unused ?! 

    const mcp_addr = 0x20
    const HIGH = true
    const LOW = false

    const INPUT = true
    const OUTPUT = false

    // the I/O expander pinout
    const _rs_pin = 1;
    const _enable_pin = 2;
    const _pin_db4 = 3
    const _pin_db5 = 4
    const _pin_db6 = 5
    const _pin_db7 = 6
    const _data_pins = [_pin_db4, _pin_db5, _pin_db6, _pin_db7]; // really d4, d5, d6, d7

    function mcp_begin() {
        // sets pins to all inputs AFAICT
        let bufr = pins.createBufferFromArray([0, 0xff, 0, 0, 0, 0, 0, 0])
        pins.i2c().writeBuffer(mcp_addr, bufr, false)
    }
    function mcp_pinMode(pin: number, mode: boolean) {
        // largely from Adafruit_MCP23008.cpp:64
        // only 8 bits!
        if (pin > 7) {
            return;
        }
        let iodir = pins.i2cReadRegister(mcp_addr, 0)
        // set the pin and direction
        if (mode == INPUT) {
            iodir |= 1 << pin;
        } else {
            iodir &= ~(1 << pin);
        }
        // write the new IODIR
        pins.i2cWriteRegister(
            mcp_addr,
            0,
            iodir
        )
    }
    function mcp_digitalWrite(pin: number, level: boolean) {
        // largely from Adafruit_MCP23008.cpp:91 
        // only 8 bits!
        if (pin > 7) {
            return;
        }
        // read the current GPIO output latches
        let gpio = mcp_readGPIO()
        // set the pin and direction
        if (level == HIGH) {
            gpio |= 1 << pin;
        } else {
            gpio &= ~(1 << pin);
        }
        // write the new GPIO
        mcp_writeGPIO(gpio)
    }

    function mcp_readGPIO(): number {
        return pins.i2cReadRegister(mcp_addr, 0x09)
    }

    function mcp_writeGPIO(value: number) {
        pins.i2cWriteRegister(
            mcp_addr,
            9,
            value
        )
    }

    function _BV(bit: number): number {
        return (1 << (bit))
    }

    function lcd_write4bits(value: number) {
        let out = 0;

        out = mcp_readGPIO();

        // speed up for i2c since its sluggish
        for (let i = 0; i < 4; i++) {
            out &= ~_BV(_data_pins[i]);
            out |= ((value >> i) & 0x1) << _data_pins[i];
        }

        // make sure enable is low
        out &= ~_BV(_enable_pin);

        mcp_writeGPIO(out);

        // pulse enable
        control.waitMicros(1) //delayMicroseconds(1);
        out |= _BV(_enable_pin);
        mcp_writeGPIO(out);
        control.waitMicros(1) //delayMicroseconds(1);
        out &= ~_BV(_enable_pin);
        mcp_writeGPIO(out);
        control.waitMicros(100) // delayMicroseconds(100);
    }

    function lcd_send(value: number, mode: boolean) {
        mcp_digitalWrite(_rs_pin, mode);
        lcd_write4bits(value >> 4);
        lcd_write4bits(value);
    }

    function lcd_write(value: number) {
        lcd_send(value, HIGH)
    }

    function lcd_command(value: number) {
        lcd_send(value, LOW)
    }

    function delay(ms: number) {
        control.waitMicros(ms * 1000)
    }

    function lcd_fmsynth_init() {
        // first part was adapted from Adafruit's library
        mcp_begin()
        mcp_pinMode(7, OUTPUT)
        mcp_digitalWrite(7, HIGH)     // turn the backlight on
        for (let i = 0; i < 4; i++)
            mcp_pinMode(_data_pins[i], OUTPUT);
        mcp_pinMode(_rs_pin, OUTPUT);
        mcp_pinMode(_enable_pin, OUTPUT);

        // the rest from here on is adapted from code I wrote for 2-line display on a FM synth prototype
        //mcp.digitalWrite(lcd_rw, false); // not used
        mcp_digitalWrite(_enable_pin, LOW) //mcp.digitalWrite(lcd_e, false); // default enable to low

        // get us into 4bit mode for sure
        delay(200);  // "more than 100ms"
        mcp_digitalWrite(_rs_pin, LOW) // mcp.digitalWrite(lcd_rs, false); // command register
        lcd_half_write(0b00110000);  //0x30);
        delay(6); // "more than 4.1 ms"
        lcd_half_write(0b00110000);  //0x30);
        delay(2); // "more than 100us"
        lcd_half_write(0b00110000);  //0x30);
        delay(2); // "more than 100us"
        lcd_half_write(0b00100000); //0x20); // initial "function set" to change interface to 4bit mode
        delay(2); // "more than 100us"
        lcd_full_write(/*0x28*/ 0b00101000); // N=1, F=0: two logical lines, 5x7 font
        lcd_full_write(/*0x08*/ 0b00001000); // display on/off, "D=C=B=0"
        lcd_full_write(/*0x01*/ 0b00000001); // clear display
        delay(5); // "more than 3ms"
        lcd_full_write(/*0x06*/ 0b00000110); // I/D=1, S=0: move cursor to left, no shifting
        lcd_full_write(/*0x0C*/ 0b00001100); // display on/off, "D=1, C=B=0", display on, cursor off, no blinking
        lcd_full_write(0x80); // "move cursor to beginning of first line"
    }
    function lcd_full_write(data: number) {
        lcd_half_write(data & 0xF0);
        lcd_half_write(data << 4);
    }
    function lcd_half_write(data: number) {
        // we're only writing the high nibble because we've got a 4bit physical interface connected to an LCD in 8bit mode
        // high nibble
        delay(1);
        mcp_digitalWrite(_pin_db4, bitRead(data, 4)) // mcp.digitalWrite(lcd_db4, bitRead(data, 4));
        mcp_digitalWrite(_pin_db5, bitRead(data, 5))// mcp.digitalWrite(lcd_db5, bitRead(data, 5));
        mcp_digitalWrite(_pin_db6, bitRead(data, 6)) // mcp.digitalWrite(lcd_db6, bitRead(data, 6));
        mcp_digitalWrite(_pin_db7, bitRead(data, 7)) // mcp.digitalWrite(lcd_db7, bitRead(data, 7));
        delay(1);
        mcp_digitalWrite(_enable_pin, HIGH) // mcp.digitalWrite(lcd_e, true);
        delay(1);
        mcp_digitalWrite(_enable_pin, LOW) // mcp.digitalWrite(lcd_e, false);  // data read on falling edge
        delay(1);
    }
    function bitRead(value: number, bit: number): boolean {
        return !!(((value) >> (bit)) & 0x01)
    }
}