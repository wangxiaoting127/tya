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
const heartbeat_1 = require("./tianya/heartbeat");
heartbeat_1.heartbeat();
const POSTS = 'post', TOPIC = 'topics';
function minutes(n) {
    return 1000 * 60 * n;
}
function crawlAllCompleted(name) {
    setTimeout(run, minutes(3), name);
}
function dispatch(crawler) {
    return __awaiter(this, void 0, void 0, function* () {
        let index = yield crawler.getId();
        console.log('==========');
        console.log(index);
        if (index === 'nil') {
            crawlAllCompleted();
        }
        yield crawler.crawl(index)
            .then(function (ret) {
            return __awaiter(this, void 0, void 0, function* () {
                if (yield crawler.save(ret)) {
                    yield crawler.crawlCompleted(index);
                }
                else {
                    console.log(`crawl ${index} error`);
                    yield crawler.requeue(index);
                }
                setImmediate(dispatch, crawler);
            });
        })
            .catch(function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(err);
                yield crawler.requeue(index);
                setImmediate(dispatch, crawler);
            });
        });
    });
}
function usage() {
    console.log(`
    
  `);
}
function run(name) {
    if (!name) {
        return usage();
    }
    let [file, mod] = name.split('-');
    let crawler = require(`./tianya/${file}`)[mod || 'default'];
    console.log(name);
    dispatch(crawler);
}
run(process.argv[2] || POSTS);
//# sourceMappingURL=ind.js.map