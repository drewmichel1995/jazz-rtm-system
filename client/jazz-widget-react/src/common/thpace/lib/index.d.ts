interface Settings {
    /**
     * @default 130
     * @description Triangle size (px).
     * */
    triangleSize?: number;
    /**
     * @default 120
     * @description Bleed amount over edges (px).*/
    bleed?: number;
    /**
     * @default 60
     * @description Noise used when calculating points (px). */
    noise?: number;
    /**
     * @deprecated Use 'colors' setting.
     * @default undefined
     * @description Color in top left of screen (Hex code).
     * */
    color1?: string | Array<number>;
    /**
     * @deprecated Use 'colors' setting
     * @default undefined
     * @description Color in bottom Right of screen (Hex code).
     * */
    color2?: string | Array<number>;
    /**
     * @default ['rgba(11,135,147,1)', 'rgba(54,0,51,1)']
     * @description Array of colors to use for the gradient. */
    colors?: Array<string>;
    /**
     * @default 20
     * @description How much the points should shift on the x-axis (px). */
    pointVariationX?: number;
    /** @default 35
     * @description How much the points should shift on the y-axis (px). */
    pointVariationY?: number;
    /**
     * @default 7500
     * @description How fast the points should complete a loop (ms). */
    pointAnimationSpeed?: number;
    /**
     * @default undefined
     * @description Overlay image (adds a nice texture). */
    image?: HTMLImageElement | undefined;
    /**
     * @default .4
     * @description Overlay image opacity. */
    imageOpacity?: number;
}
/**
 * @description Use static method 'create' to create a thpace instance.
 * @example Thpace.create(canvas, settings});
 * @classdesc This is the main Thpace class. Used to create a thpace instance on a given canvas.
 */
export default class Thpace {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    settings: Settings;
    width: number;
    height: number;
    triangles: Array<Array<any>>;
    particles: Array<Particle>;
    coordinateTable: {
        [key: string]: any;
    };
    baseCoordinateTable: {
        [key: string]: any;
    };
    delta: number;
    lastUpdate: number;
    /**
     * Create an instance of thpace on your page.
     * @param canvas - The canvas to turn into a thpace instance.
     * @param settings - Optional object with settings to control the thpace instance
     */
    static create(canvas: HTMLCanvasElement, settings?: Settings): Thpace | undefined;
    constructor(canvas: HTMLCanvasElement, settings: Settings);
    resize(): void;
    remove(): void;
    generateTriangles(): void;
    generateParticles(): void;
    animate(): void;
    animateCoordinateTable(): void;
}
interface ParticleSettings {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
}
declare class Particle {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    ox: number;
    oy: number;
    interval: number;
    limit: number;
    opacity: number;
    r: number;
    constructor(settings: ParticleSettings);
    update(): void;
    draw(): void;
}
export {};
