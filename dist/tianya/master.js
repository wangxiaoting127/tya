"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _base_1 = require("../_base");
const heartbeat_1 = require("./heartbeat");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
let lp;
_base_1.redis.lrangeAsync('zhihu.questions.pending', 0, -1)
    .then(function (ret) {
    lp = ret;
    setTimeout(clearList, _base_1.config.cleartime);
}).catch(function (e) {
    console.log(e);
});
heartbeat_1.heartbeat(true);
function clearList() {
    return __awaiter(this, void 0, void 0, function* () {
        let nlp = yield _base_1.redis.lrangeAsync('zhihu.questions.pending', 0, -1);
        for (let l of nlp) {
            try {
                if (lodash_1.includes(lp, l)) {
                    yield _base_1.redis.multi()
                        .lpush('zhihu.questions', utils_1.updateQuestionId(l))
                        .lrem('zhihu.questions.pending', 0, l)
                        .execAsync();
                    console.log(`clear & requeue expired item ${l}`);
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        lp = yield _base_1.redis.lrangeAsync('zhihu.questions.pending', 0, -1);
    });
}
function clearNode() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
//# sourceMappingURL=master.js.map