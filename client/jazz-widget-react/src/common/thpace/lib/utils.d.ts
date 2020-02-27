/**
 * @description Interface for a simple 2d coordinate
 * */
export interface Coords {
    /** x coordinate */
    x: number;
    /** y coordinate */
    y: number;
}
/**
 * @param color - Color to parse
 * @example parseColor('rgba(255,15,50,.2)')
 * parseColor('rgb(50,60,20)')
 * parseColor('pink')
 * parseColor('hsla(120,100%,50%,0.3)')
 * @description Helper function that will parse colors for RGBA color space
 * @returns Array length 4 where each value corresponds to RGBA
 */
export declare function parseColor(color: string): Array<number>;
/**
 * @description Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 * @param h - The hue
 * @param s - The saturation (percentage)
 * @param l - The lightness (percentage)
 * @return The RGB representation
 */
export declare function hslToRgb(h: number, s: number, l: number): Array<number>;
/**
 *
 * @description Converts a given hex color to RGB
 * @param color - The hex color
 * @return The RGB representation
 */
export declare function hexToRgb(color: string): Array<number>;
