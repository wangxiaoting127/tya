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
const Epona = require("eponajs");
const moment = require('moment');
moment.locale('zh-cn');
exports.default = {
    queue(candidate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (candidate.url == 'index') {
                let page = candidate.default.page;
                let src = yield getUrls(page);
                if (src.urls != null) {
                    return {
                        urls: src.urls.map(x => {
                            return {
                                default: { desc: x.desc, id: x.url },
                                url: x.url
                            };
                        }),
                        next: { default: { page: page + 1 }, url: 'index' }
                    };
                }
            }
            else {
                let articles = yield getArticles(candidate);
                return {
                    ret: ret,
                    next: {
                        default: { pid: ret.nextid },
                        url: `http://bbs.tianya.cn/` + ret.nextid
                    }
                };
            }
        });
    }
};
function getUrls(x) {
    return Epona
        .get('http://bbs.tianya.cn/post-free-5705844-1.shtml', {
        urls: '#cms_Location_2 div li h3 a *::href',
        rank: '.detail a *::text()'
    }, {
        rateLimit: 1000
    });
}
function getArticles(url) {
    return Epona.get(url, {
        title: 'div.text::text()|trim',
        postNums: '.data-count span:nth-of-type(1)::title',
        replayNum: '.data-count span:nth-of-type(2)::title',
        moderators: '.moderator a *::text()',
        urls: '.td-title a *::href ',
        nextid: '.short-pages-2 a:nth-of-type(2)::href',
        intro: '.block-intro::text()|trim'
    }, {
        rateLimit: 1000
    });
}
//# sourceMappingURL=test.js.map