"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Epona = require("eponajs");
async;
queue(['http://bbs.tianya.cn/post-free-5705844-1.shtml']);
let epona = Epona.new({ concurrent: 3 });
epona.on('http://focus.tianya.cn/thread/index.shtml', {
    urls: '#cms_Location_2 div li h3 a *::href',
    rank: '.detail a *::text()'
})
    .then(function (ret) {
    return {
        urls: ret.urls.map(x => { return { url: x, default: { id: x } }; }),
    };
});
epona.on('bbs.tianya.cn/list-', {
    title: 'div.text::text()|trim',
    postNums: '.data-count span:nth-of-type(1)::title',
    replayNum: '.data-count span:nth-of-type(2)::title',
    moderators: '.moderator a *::text()',
    urls: '.td-title a *::href ',
    nextid: '.short-pages-2 a:nth-of-type(2)::href',
    intro: '.block-intro::text()|trim'
})
    .then(function (ret) {
    console.log(ret);
    return {
        ret: ret,
        next: {
            default: { pid: ret.nextid },
            url: `http://bbs.tianya.cn/` + ret.nextid
        }
    };
});
exports.default = epona;
//# sourceMappingURL=plate.js.map