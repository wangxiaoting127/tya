"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Epona = require("eponajs");
const moment = require('moment');
moment.locale('zh-cn');
let epona = Epona.new({ concurrent: 3, rateLimit: 1000 });
epona.on("http://bbs.tianya.cn/", {
    urls: '.nav_child_box a *::href'
})
    .then(function (ret) {
    ret.urls = ret.urls.map(x => { return 'http://bbs.tianya.cn' + x; });
    console.log(ret);
    return ret;
});
epona.on("bbs.tianya.cn/list", {
    urls: '.td-title a *::href ',
    nextid: '.short-pages-2 a:nth-last-of-type(1)::href',
})
    .then(function (ret) {
    return {
        urls: ret.urls.map(x => { return { url: "http://bbs.tianya.cn" + x, default: { id: x } }; }),
        next: {
            url: `http://bbs.tianya.cn` + ret.nextid
        }
    };
});
epona.on("bbs.tianya.cn/post-", {
    title: ['.s_title', '.q-title::text()'],
    host: ['#post_head .atl-info a:nth-of-type(1)::text()', '.q-info a::text()'],
    published_at: ["#post_head .atl-info span:nth-of-type(2)",],
    clicks_num: '#post_head .atl-info span:nth-of-type(3)|numbers',
    replays_num: '#post_head .atl-info span:nth-of-type(4)|numbers',
    content: ['.host-item .bbs-content|trim', '.q-content::text()']
})
    .then(function (ret) {
    if (ret.published_at !== null) {
        let time = ret.published_at.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/g).toString();
        ret.published_at = moment(time).toDate();
    }
    console.log(ret);
    return ret;
});
exports.default = epona;
//# sourceMappingURL=post.js.map