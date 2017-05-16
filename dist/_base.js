"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("redis");
const Promise = require("bluebird");
const elasticsearch = require("elasticsearch");
const fs = require("fs");
const lodash_1 = require("lodash");
exports.env = fs.existsSync('./env') ? fs.readFileSync('./env', 'utf8') : 'dev';
exports.config = require(`./config/${lodash_1.trim(exports.env)}.js`);
Promise.promisifyAll(Redis.RedisClient.prototype);
Promise.promisifyAll(Redis.Multi.prototype);
exports.redis = Redis.createClient(exports.config.redisOpts);
exports.redis.on("error", function (err) {
    console.log("Error " + err);
});
exports.es = new elasticsearch.Client(exports.config.esOpts);
//# sourceMappingURL=_base.js.map