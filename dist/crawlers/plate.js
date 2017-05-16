"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Epona = require("eponajs");
let epona = Epona.new({ concurrent: 3, rateLimit: 1000 });
epona.on('http://focus.tianya.cn/thread/index.shtml', {
    urls: {
        sels: '#cms_Location_2 div li *',
        nodes: {
            url: 'h3 a::href',
            rank: '.detail a::text()'
        }
    }
})
    .then(function (ret) {
    console.log(ret);
    return epona.queue(ret.urls.map(x => { return { url: x.url, default: { rank: x.rank, url: x.url } }; }));
});
epona.on('bbs.tianya.cn/list-', {
    title: 'div.text::text()|trim',
    postNums: '.data-count span:nth-of-type(1)::title',
    replayNum: '.data-count span:nth-of-type(2)::title',
    moderators: '.moderator a *::text()',
    intro: '.block-intro::text()|trim'
})
    .then(function (ret) {
    console.log(ret);
    return ret;
});
exports.default = epona;
//# sourceMappingURL=plate.js.map