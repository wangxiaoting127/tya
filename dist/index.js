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
const post_1 = require("./crawlers/post");
let http = require('http');
const initStatus = {
    '36kr': { next: { default: { page: 1 }, url: 'http://36kr.com/api/info-flow/main_site/posts?column_id=&b_id=&per_page=20' } },
    'ikanchai': {
        next: { default: { page: 1 }, url: 'http://app.ikanchai.com/roll.php?do=more&sectionid=255&status=1&sort=0&pagesize=5&page=1' }
    }, 'cyzone': {
        next: { default: { page: 1 }, url: 'http://api.cyzone.cn/index.php?m=content&c=index&a=init&tpl=index_page&page=1' }
    }, 'huxiu': {
        next: { default: { page: 2 }, url: 'https://www.huxiu.com/v2_action/article_list?page=2' }
    }, 'geekpark': {
        next: { default: { page: 0 }, url: 'http://www.geekpark.net/articles_list?page=0' }
    }, 'leiphone': {
        next: { default: { page: 1 }, url: 'http://www.leiphone.com/page/1' }
    }, 'tmtpost': {
        next: { default: { page: 0 }, url: 'http://www.tmtpost.com/ajax/common/get?url=/v1/lists/home&data=offset=0&limit=15&post_fields=tags' }
    },
    'techxue': {
        next: { default: { page: 1 }, url: 'index' }
    },
    'qianzhan': {
        next: [
            { default: { page: 1 }, url: 'http://t.qianzhan.com/fengkou/p-1.html' },
            { default: { page: 1 }, url: 'http://t.qianzhan.com/p-1.html' },
            { default: { page: 1 }, url: 'http://t.qianzhan.com/daka/p-1.html' }
        ]
    },
    'pingwest': {
        next: { default: { page: 0 }, url: 'index' }
    }
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
    let urls = Array.isArray(indecies) ? lodash_1.flatten(indecies.map(x => x.next)) : indecies.next;
    return crawler.queue(urls || []);
}
function getArticles(crawler, index) {
    let urls = Array.isArray(index) ? lodash_1.flatten(index.map(x => x.urls)) : index.urls;
    return crawler.queue(urls);
}
function saveStatus(site, next) {
    return _base_1.redis.hsetAsync("owl.articleStatus", site, JSON.stringify(next));
}
function loadStatus(site, increment) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = yield _base_1.redis.hgetAsync("owl.articleStatus", site);
        return status && !increment ? JSON.parse(status) : initStatus[site];
    });
}
function saveArticles(site, articles) {
    let bulkBody = [];
    articles.map(article => {
        if (!article || !article.title) {
            return;
        }
        let a = lodash_1.pick(article, ["title", "content", "published_at", "desc", "pics", "url", "type", "keywords", "supports_num", "collections_num", "comments_num", "views_num", "author_id"]);
        a.index_name = 'tech_news';
        a.type_name = `tech_${site}_articles`;
        a.id = article.id;
        bulkBody.push(a);
    });
    console.log(bulkBody);
    return bulk(bulkBody);
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
        let _crawl = function (crawler, candidate) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    let index = yield getIndecies(crawler, candidate);
                    if (isNext(index)) {
                        return crawlCompleted(site);
                    }
                    let status = yield saveStatus(site, index);
                    let articles = yield getArticles(crawler, index);
                    let saved = yield saveArticles(site, articles);
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
        crawl(process.argv[2] || 'plate', process.argv[3] == "inc");
        yield post_1.default.queue([
            'http://bbs.tianya.cn/post-free-5705844-1.shtml'
        ]);
    });
}
run();
//# sourceMappingURL=index.js.map