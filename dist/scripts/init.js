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
const lodash_1 = require("lodash");
_base_1.redis.on("error", function (err) {
    console.log("Error " + err);
});
function usage() {
}
function getIndex(crawler) {
    return __awaiter(this, void 0, void 0, function* () {
        return crawler.queue(['http://bbs.tianya.cn/']);
    });
}
function getIndecies(crawler, indecies) {
    let urls = Array.isArray(indecies) ? flatten(indecies.map(x => x.next)) : indecies.next;
    return crawler.queue(urls || []);
}
function saveList(crawler, index) {
    let urls = Array.isArray(index) ? flatten(index.map(x => x.urls)) : index.urls;
    return _base_1.redis.lpushAsync('tya.posts', `${Date.now()}`);
}
function saveStatus(site, next) {
    return _base_1.redis.hsetAsync("tya.postsStatus", site, JSON.stringify(next));
}
function loadStatus(site, increment, y) {
    return __awaiter(this, void 0, void 0, function* () {
        let initStatus = {
            'post': { next: y[0].map(x => { return { default: { page: 1 }, url: x }; }) },
            'plate': { next: { default: { page: 1 }, url: 'http://focus.tianya.cn/thread/index.shtml' } }
        };
        let status = yield _base_1.redis.hgetAsync("tya.postsStatus", site);
        return status && !increment ? JSON.parse(status) : initStatus[site];
    });
}
function isNext(index) {
    if (Array.isArray(index)) {
        return index.filter(x => x).length == 0;
    }
    else {
        return !index || index.next.length == 0 || !index.next || !index.urls || !index.urls[0] || !index.urls[0].url || index.urls.length == 0;
    }
}
function crawlCompleted(site) {
    console.log(site, 'crawl completed');
}
function questions() {
    return __awaiter(this, void 0, void 0, function* () {
        function crawl(site, increment = false) {
            return __awaiter(this, void 0, void 0, function* () {
                let crawler = require("../crawlers/" + site).default;
                let init = yield getIndex(crawler);
                console.log(init);
                let candidate = yield loadStatus(site, increment, init);
                let _crawl = function (crawler, candidate) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            let index = yield getIndecies(crawler, candidate);
                            if (isNext(index)) {
                                return crawlCompleted(site);
                            }
                            let status = yield saveStatus(site, index);
                            let posts = yield saveList(crawler, index);
                            candidate = index;
                            setImmediate(_crawl, crawler, index);
                        }
                        catch (e) {
                            console.log('<<<< error >>>>');
                            console.log(candidate, e);
                        }
                    });
                };
                _crawl(crawler, candidate);
            });
        }
        crawl(process.argv[2] || 'post', process.argv[3] == "inc");
    });
}
function topics() {
    return __awaiter(this, void 0, void 0, function* () {
        let ti = _base_1.config.MIN_TOPIC_ID;
        do {
            yield _base_1.redis.lpushAsync('tya.topics', `${ti}_${Date.now()}`);
        } while ((ti += _base_1.config.ID_PER) < _base_1.config.MAX_TOPIC_ID);
        console.log('tya topics id added');
    });
}
function index() {
    return __awaiter(this, void 0, void 0, function* () {
        _base_1.mongo = yield _base_1.mongo;
        const Topic = _base_1.mongo.collection('topics');
        yield Topic.createIndex({ _id: 1 }, { unique: true });
        const topicFollows = _base_1.mongo.collection('topic_follows');
        yield topicFollows.createIndex({ _id: 1 }, { unique: true });
        console.log('created mongo indecies');
        yield _base_1.mongo.close();
    });
}
function clear(name) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`clear tya ${name}`);
        if (name == 'all') {
            yield _base_1.redis.delAsync('tya.posts');
            yield _base_1.redis.delAsync('tya.posts.pending');
            yield _base_1.redis.delAsync('tya.topics');
            yield _base_1.redis.delAsync('tya.topics.pending');
        }
        else if (lodash_1.includes(['posts', 'topics'], name)) {
            yield _base_1.redis.delAsync(`tya.${name}`);
            yield _base_1.redis.delAsync(`tya.${name}.pending`);
        }
        else {
            console.log("unknow keys: " + name);
        }
    });
}
function run(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (cmd) {
            case 'post':
                yield questions();
                break;
            case 'topics':
                yield topics();
                break;
            case 'index':
                yield index();
                break;
            case 'clear':
                yield clear(process.argv[3]);
                break;
            case 'all':
                yield clear();
                yield question();
                yield topic();
                yield index();
                break;
            default:
                usage();
        }
        console.log('done!');
        process.exit(0);
    });
}
run(process.argv[2]);
//# sourceMappingURL=init.js.map