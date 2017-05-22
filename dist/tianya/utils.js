"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const _base_1 = require("../_base");
const expand = require("expand-range");
let util = require('util');
function updateId(i) {
    let s = lodash_1.split(i, '_', 1);
    return `${Number(s)}_${Date.now()}`;
}
exports.updateId = updateId;
function log(x) {
    console.log(util.inspect(x, { showHidden: true, depth: null }));
}
exports.log = log;
function expandIds(index) {
    let s = lodash_1.split(index, '_', 1);
    let ind = Number(s);
    return expand(`${ind}..${ind + _base_1.config.ID_PER - 1}`);
}
exports.expandIds = expandIds;
//# sourceMappingURL=utils.js.map