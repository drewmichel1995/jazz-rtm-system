"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var delaunator_1 = __importDefault(require("delaunator"));
var color_interpolate_1 = __importDefault(require("color-interpolate"));
// I guess there is an issue with rollup and we need to specify the '.ts'
// @ts-ignore
var utils_ts_1 = require("./utils.ts");
var defaultSettings = {
    triangleSize: 130,
    bleed: 120,
    noise: 60,
    colors: ['rgba(11,135,147,1)', 'rgba(54,0,51,1)'],
    pointVariationX: 20,
    pointVariationY: 35,
    pointAnimationSpeed: 7500,
    image: undefined,
    imageOpacity: .4,
};
/**
 * @description Use static method 'create' to create a thpace instance.
 * @example Thpace.create(canvas, settings});
 * @classdesc This is the main Thpace class. Used to create a thpace instance on a given canvas.
 */
var Thpace = /** @class */ (function () {
    function Thpace(canvas, settings) {
        this.canvas = canvas;
        this.settings = settings;
        if (settings.color1 && settings.color2 && typeof settings.color1 === 'string' && typeof settings.color2 === 'string') {
            this.settings.colors = [getRGBA(settings.color1), getRGBA(settings.color2)];
        }
        else if (this.settings.colors) {
            this.settings.colors = this.settings.colors.map(function (color) { return getRGBA(color); });
        }
        this.ctx = canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.delta = performance.now();
        this.lastUpdate = performance.now();
        this.triangles = [];
        this.particles = [];
        this.coordinateTable = {};
        this.baseCoordinateTable = {};
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
        this.animate();
    }
    /**
     * Create an instance of thpace on your page.
     * @param canvas - The canvas to turn into a thpace instance.
     * @param settings - Optional object with settings to control the thpace instance
     */
    Thpace.create = function (canvas, settings) {
        if (!canvas) {
            console.warn('Need a valid canvas element!');
            return;
        }
        return new Thpace(canvas, Object.assign({}, defaultSettings, settings));
    };
    Thpace.prototype.resize = function () {
        var p = this.canvas.parentElement;
        if (p) {
            this.canvas.width = p.clientWidth;
            this.canvas.height = p.clientHeight;
        }
        if (this.width !== this.canvas.width || this.height !== this.canvas.height) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.generateTriangles();
            this.generateParticles();
        }
    };
    Thpace.prototype.remove = function () {
        window.removeEventListener('resize', this.resize.bind(this));
    };
    Thpace.prototype.generateTriangles = function () {
        var _this = this;
        var points = [];
        var coordinateTable = {};
        points.push([0, 0]);
        points.push([0, this.height]);
        points.push([this.width, 0]);
        points.push([this.width, this.height]);
        var bleed = this.settings.bleed;
        var size = this.settings.triangleSize;
        var noise = this.settings.noise;
        var colors = this.settings.colors;
        for (var i = 0 - bleed; i < this.width + bleed; i += size) {
            for (var j = 0 - bleed; j < this.height + bleed; j += size) {
                var x = i + getRandomInt(0, noise);
                var y = j + getRandomInt(0, noise);
                points.push([x, y]);
            }
        }
        var delaunay = delaunator_1.default.from(points);
        var triangleList = delaunay.triangles;
        var coordinates = [];
        for (var i = 0; i < triangleList.length; i += 3) {
            var t = [
                points[triangleList[i]],
                points[triangleList[i + 1]],
                points[triangleList[i + 2]],
            ];
            var coords = [];
            coords.push({ x: t[0][0], y: t[0][1] });
            coords.push({ x: t[1][0], y: t[1][1] });
            coords.push({ x: t[2][0], y: t[2][1] });
            t.push(gradient(getCenter(coords), this.width, this.height, colors));
            coordinates.push(t);
        }
        var baseCoordinateTable = {};
        coordinates.forEach(function (t) {
            t.forEach(function (p) {
                var x = p[0];
                var y = p[1];
                if (!coordinateTable[x]) {
                    coordinateTable[x] = {};
                }
                var per = x / _this.width;
                coordinateTable[x][y] = 0;
                if (!baseCoordinateTable[x]) {
                    baseCoordinateTable[x] = {};
                }
                baseCoordinateTable[x][y] = per * 2 * Math.PI;
            });
        });
        this.triangles = coordinates;
        this.coordinateTable = coordinateTable;
        this.baseCoordinateTable = baseCoordinateTable;
    };
    Thpace.prototype.generateParticles = function () {
        var particles = [];
        for (var i = 0; i < 250; i++) {
            var pSet = {
                ctx: this.ctx,
                width: this.width,
                height: this.height
            };
            particles.push(new Particle(pSet));
        }
        this.particles = particles;
    };
    Thpace.prototype.animate = function () {
        var _this = this;
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        this.triangles.forEach(function (t) {
            ctx.beginPath();
            var coords = [];
            coords.push({ x: t[0][0], y: t[0][1] });
            coords.push({ x: t[1][0], y: t[1][1] });
            coords.push({ x: t[2][0], y: t[2][1] });
            var color = t[3];
            var style = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
            ctx.fillStyle = style;
            ctx.strokeStyle = style;
            ctx.globalAlpha = color[3];
            var dp = [0, 1, 2, 0];
            dp.forEach(function (el, ind) {
                if (_this.coordinateTable[coords[el].x] && _this.coordinateTable[coords[el].x][coords[el].y] != undefined) {
                    var c = { x: coords[el].x, y: coords[el].y };
                    var change = _this.coordinateTable[coords[el].x][coords[el].y];
                    if (ind == 0) {
                        ctx.moveTo(c.x + change.x, c.y + change.y);
                    }
                    else {
                        ctx.lineTo(c.x + change.x, c.y + change.y);
                    }
                }
            });
            ctx.fill();
            ctx.stroke();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        });
        this.particles.forEach(function (p) {
            p.update();
        });
        this.particles.forEach(function (p) {
            p.draw();
        });
        if (this.settings.image) {
            var imageOpacity = this.settings.imageOpacity || 0;
            var pat = ctx.createPattern(this.settings.image, 'repeat');
            if (pat) {
                ctx.globalAlpha = imageOpacity;
                ctx.fillStyle = pat;
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.globalAlpha = 1;
            }
        }
        this.animateCoordinateTable();
        this.delta = performance.now() - this.lastUpdate;
        this.lastUpdate = performance.now();
        requestAnimationFrame(this.animate.bind(this));
    };
    Thpace.prototype.animateCoordinateTable = function () {
        var _this = this;
        var pointAnimationSpeed = this.settings.pointAnimationSpeed || 0;
        var pointVariationX = this.settings.pointVariationX || 0;
        var pointVariationY = this.settings.pointVariationY || 0;
        Object.keys(this.coordinateTable).forEach(function (x) {
            Object.keys(_this.coordinateTable[x]).forEach(function (y) {
                _this.baseCoordinateTable[x][y] += _this.delta / (pointAnimationSpeed / 1.5) * 4; // Don't ask
                var changeX = (Math.cos(_this.baseCoordinateTable[x][y]) * pointVariationX);
                var changeY = (Math.sin(_this.baseCoordinateTable[x][y]) * pointVariationY);
                _this.coordinateTable[x][y] = {
                    x: changeX,
                    y: changeY
                };
            });
        });
    };
    return Thpace;
}());
exports.default = Thpace;
var Particle = /** @class */ (function () {
    function Particle(settings) {
        this.ctx = settings.ctx;
        this.x = getRandomInt(0, settings.width);
        this.y = getRandomInt(0, settings.height);
        this.ox = this.x;
        this.oy = this.y;
        this.interval = getRandomInt(1000, 5000);
        this.limit = getRandomInt(5, 15);
        this.opacity = getRandomFloat(0.1, 0.7);
        this.r = getRandomFloat(1, 2);
    }
    Particle.prototype.update = function () {
        this.x = this.ox + (Math.cos(performance.now() / this.interval) * this.limit);
        this.y = this.oy + ((Math.sin(performance.now() / this.interval) * this.limit) / 2);
    };
    Particle.prototype.draw = function () {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255, ' + this.opacity + ')';
        this.ctx.fill();
    };
    return Particle;
}());
var rgb = /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/;
var rgba = /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}|.*)\)/;
function gradient(coords, width, height, colors) {
    var x = coords.x;
    var y = coords.y;
    var per = 0;
    per = (x / width);
    var per2 = 0;
    per2 = (y / height);
    per = (per2 + per) / 2;
    if (per > 1) {
        per = 1;
    }
    else if (per < 0) {
        per = 0;
    }
    var color = color_interpolate_1.default(colors)(per);
    var match;
    if (color.match(rgb)) {
        match = color.match(rgb).slice(1, 4).map(function (num) { return parseInt(num); });
        return [match[0], match[1], match[2], 1];
    }
    else if (color.match(rgba)) {
        match = color.match(rgba).slice(1, 5).map(function (num) { return parseFloat(num); });
        return [match[0], match[1], match[2], match[3]];
    }
    else {
        return [0, 0, 0, 0];
    }
}
function getCenter(coords) {
    var sumX = 0;
    var sumY = 0;
    coords.forEach(function (p) {
        sumX += p.x;
        sumY += p.y;
    });
    return { x: sumX / coords.length, y: sumY / coords.length };
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomFloat(min, max) {
    return (Math.random() * (max - min) + min);
}
function getRGBA(color) {
    if (!color) {
        console.warn("Incorrect color: " + color);
        return 'rgba(0,0,0,0)';
    }
    return "rgba(" + utils_ts_1.parseColor(color).join(',') + ")";
}
