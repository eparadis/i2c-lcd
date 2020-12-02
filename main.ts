// Ed Paradis
// TODO
// - use enums for picking the line because there is only a top and bottom line
// - use shadowOptions.toString=true on console-style methods
// - add JSDoc for help tooltips
// NOTES
// Defining blocks: https://makecode.com/defining-blocks
// 


//% groups=['lcd backpack']
namespace LCD {
    //% block
    export function clear(): void {

    }

    //% block
    //% line.min=1 line.max=2 line.defl=1
    export function clearLine(line: number): void {

    }

    //% block
    export function writeLine(line: number, text: string): void {

    }

    //% block
    export function log(value: number): void {

    }

    //% block
    export function logValue( label: string, value: number): void {

    }
}