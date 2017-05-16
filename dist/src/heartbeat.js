"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const _base_1 = require("../_base");
const os = require("os");
function heartbeat(isMaster) {
    let crawlerKey;
    let filename = `./crawlerkeys/${isMaster ? 'master' : 'node'}.txt`;
    if (fs.existsSync(filename)) {
        crawlerKey = fs.readFileSync(filename, 'utf8');
    }
    if (!fs.existsSync('./crawlerkeys')) {
        fs.mkdir('./crawlerkeys');
    }
    if (!crawlerKey || crawlerKey.length == 0) {
        crawlerKey = isMaster
            ? `node_master`
            : `node_${Math.floor(Math.random() * 10000000)}`;
        fs.writeFileSync(filename, crawlerKey, 'utf8');
    }
    console.log('crawler init:', crawlerKey);
    function _bh() {
        _base_1.redis.hsetAsync("zhihu.clients", crawlerKey, `${os.hostname()}_${Date.now()}`)
            .then(function () {
            console.log(`[${new Date}] heartbeat:`, crawlerKey);
            setTimeout(_bh, _base_1.config.beattime);
        })
            .catch(function (e) {
            console.log("[${new Date}] heartbeat error:", e);
            setTimeout(_bh, _base_1.config.beattime);
        });
    }
    _bh();
}
exports.heartbeat = heartbeat;
//# sourceMappingURL=heartbeat.js.map