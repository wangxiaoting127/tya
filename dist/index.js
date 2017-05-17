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
const _base_1 = require("./_base");
const lodash_1 = require("lodash");
const post_1 = require("./tianya/post");
let http = require('http');
let b = post_1.default.a();
const initStatus = {
    'post': { next: b.urls.map(x => { return { url: x }; })
    },
    'plate': { next: { default: { page: 1 }, url: 'http://focus.tianya.cn/thread/index.shtml' } },
};
let util = require('util');
function log(x) {
    console.log(util.inspect(x, { showHidden: true, depth: null }));
}
function bulk(bulkBody) {
    return __awaiter(this, void 0, void 0, function* () {
        if (bulkBody.length == 0) {
            return true;
        }
        try {
            bulkBody = JSON.stringify(bulkBody);
            const opts = {
                hostname: '59.110.52.213',
                path: '/stq/api/v1/pa/kejizixun/add',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    'Content-Length': Buffer.byteLength(bulkBody)
                }
            };
            const req = http.request(opts, (res) => {
                console.log(res.statusCode);
            });
            req.write(bulkBody);
        }
        catch (e) {
            console.log(e);
        }
        return false;
    });
}
function getIndecies(crawler, indecies) {
    let urls = indecies.next;
    return crawler.queue(urls || []);
}
function getPosts(crawler, index) {
    let urls = Array.isArray(index) ? lodash_1.flatten(index.map(x => x.urls)) : index.urls;
    return crawler.queue(urls);
}
function saveStatus(site, next) {
    return _base_1.redis.hsetAsync("owl.postsStatus", site, JSON.stringify(next));
}
function loadStatus(site, increment) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = yield _base_1.redis.hgetAsync("tya.postsStatus", site);
        return status && !increment ? JSON.parse(status) : initStatus[site];
    });
}
function savePosts(site, posts) {
    let bulkBody = [];
    posts.map(post => {
        if (!post || !post.title) {
            return;
        }
        let a = lodash_1.pick(post, ["title", "host", "published_at", "clicks_num", "replays_num", "url", "content"]);
        bulkBody.push(a);
    });
    console.log(bulkBody);
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
function crawl(site, increment = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let candidate = yield loadStatus(site, increment);
        let crawler = require("./crawlers/" + site).default;
        let inits;
        let _crawl = function (crawler, candidate) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let index = yield getIndecies(crawler, candidate);
                    if (isNext(index)) {
                        return crawlCompleted(site);
                    }
                    let status = yield saveStatus(site, index);
                    let posts = yield getPosts(crawler, index);
                    let saved = yield savePosts(site, posts);
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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.argv[2] == 'plate') {
            process.argv[3] == "inc";
        }
        crawl(process.argv[2] || 'post', process.argv[3] == "inc");
    });
}
run();
//# sourceMappingURL=index.js.map