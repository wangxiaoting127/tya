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
const utils_1 = require("./utils");
_base_1.redis.on("error", function (err) {
    console.log("Error " + err);
});
function usage() {
}
function questions() {
    return __awaiter(this, void 0, void 0, function* () {
        let qi = _base_1.config.MAX_QUESTION_ID;
        do {
            yield _base_1.redis.lpushAsync('zhihu.questions', `${qi}_${Date.now()}`);
        } while ((qi -= _base_1.config.ID_PER) > _base_1.config.MIN_QUESTION_ID);
        console.log('zhihu questions id added');
    });
}
function topics() {
    return __awaiter(this, void 0, void 0, function* () {
        let ti = yield _base_1.redis.llenAsync('zhihu.topics.pending');
        while (ti - 5 > 0) {
            let index = yield _base_1.redis.rpoplpushAsync('zhihu.topics.pending', 'zhihu.topics.pending');
            let [id, time] = index.split('_');
            if ((new Date).getTime() - parseInt(time) > 10 * 60 * 1000) {
                console.log('requeued:', id);
                yield _base_1.redis.lremAsync('zhihu.topics.pending', 0, index);
                yield _base_1.redis.lpushAsync('zhihu.topics', utils_1.updateId(index));
            }
        }
        console.log('zhihu topics id requeued');
    });
}
function run(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (cmd) {
            case 'questions':
                yield questions();
                break;
            case 'topics':
                yield topics();
                break;
            case 'all':
                yield question();
                yield topic();
                break;
            default:
                usage();
        }
        console.log('done!');
        process.exit(0);
    });
}
run(process.argv[2]);
//# sourceMappingURL=resolve.10m.js.map