"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var utils_1 = require("../utils");
describe('#parseColor', function () {
    it('Should convert colors to RGBA', function () {
        chai_1.expect(utils_1.parseColor('#eb4034')).eql([235, 64, 52, 1]);
        chai_1.expect(utils_1.parseColor('hsl(4,82%,56%)')).eql([235, 63, 51, 1]);
        chai_1.expect(utils_1.parseColor('hsla(4,82%,56%, .3)')).eql([235, 63, 51, .3]);
        chai_1.expect(utils_1.parseColor('rgb(235, 64, 52)')).eql([235, 64, 52, 1]);
        chai_1.expect(utils_1.parseColor('rgba(100, 50, 30, .33)')).eql([100, 50, 30, .33]);
    });
});
