"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_ID_PER = 50;
exports.MIN_QUESTION_ID = 19550225;
exports.MAX_QUESTION_ID = 60000000;
exports.beattime = 1000 * 30;
exports.cleartime = 1000 * 60 * 10;
exports.redisOpts = {
    host: '101.201.37.28',
    port: '6379',
    password: 'Abc123456'
};
exports.esOpts = {
    hosts: ["http://zhihu:zhihu@123456@59.110.52.213/zhihu "],
    requestTimeout: 300000,
    log: 'error'
};
//# sourceMappingURL=production.js.map