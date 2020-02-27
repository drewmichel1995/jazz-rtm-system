"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var cssColors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    "indianred ": "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgrey: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370d8",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#d87093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};
var rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/;
var rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}|.*)\)/;
var hsla = /hsla\((\d{1,3}),\s*(\d{1,3})\%,\s*(\d{1,3})\%,\s*(\d{1,3}|.*)\)/;
var hsl = /hsl\((\d{1,3}),\s*(\d{1,3})\%,\s*(\d{1,3})\%\)/;
var hex = /^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$/;
/**
 * @param color - Color to parse
 * @example parseColor('rgba(255,15,50,.2)')
 * parseColor('rgb(50,60,20)')
 * parseColor('pink')
 * parseColor('hsla(120,100%,50%,0.3)')
 * @description Helper function that will parse colors for RGBA color space
 * @returns Array length 4 where each value corresponds to RGBA
 */
function parseColor(color) {
    var match;
    if (color.match(rgb)) {
        match = color
            .match(rgb)
            .slice(1, 4)
            .map(function (num) { return parseInt(num); });
        return [match[0], match[1], match[2], 1];
    }
    else if (color.match(rgba)) {
        match = color
            .match(rgba)
            .slice(1, 5)
            .map(function (num) { return parseFloat(num); });
        return [match[0], match[1], match[2], match[3]];
    }
    else if (color.match(hsl)) {
        match = color
            .match(hsl)
            .slice(1, 4)
            .map(function (num) { return parseInt(num); });
        return __spreadArrays(hslToRgb(match[0], match[1], match[2]), [1]);
    }
    else if (color.match(hsla)) {
        match = color
            .match(hsla)
            .slice(1, 5)
            .map(function (num) { return parseFloat(num); });
        return __spreadArrays(hslToRgb(match[0], match[1], match[2]), [match[3]]);
    }
    else if (color.match(hex)) {
        return __spreadArrays(hexToRgb(color), [1]);
    }
    else if (typeof color === 'string') {
        var css = cssColors[color];
        if (css !== undefined) {
            return __spreadArrays(hexToRgb(css), [1]);
        }
        else {
            return [0, 0, 0, 0];
        }
    }
    else {
        console.warn("I have no idea what \"" + color + " is.\"");
        return [0, 0, 0, 0];
    }
}
exports.parseColor = parseColor;
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
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    // Achromatic
    if (s === 0)
        return [l, l, l];
    else {
        var hueToRgb = function (p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        h /= 360;
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        return [
            Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
            Math.round(hueToRgb(p, q, h) * 255),
            Math.round(hueToRgb(p, q, h - 1 / 3) * 255)
        ];
    }
}
exports.hslToRgb = hslToRgb;
/**
 *
 * @description Converts a given hex color to RGB
 * @param color - The hex color
 * @return The RGB representation
 */
function hexToRgb(color) {
    var result = hex.exec(color);
    if (result) {
        return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ];
    }
    else {
        console.warn("Invalid hex used: " + color);
        return [0, 0, 0];
    }
}
exports.hexToRgb = hexToRgb;
