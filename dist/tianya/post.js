"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Epona = require("eponajs");
let epona = Epona.new({ concurrent: 3, rateLimit: 1000 });
epona.queue("http://focus.tianya.cn/thread/index.shtml");
epona.on("http://focus.tianya.cn/thread/index.shtml", {
    urls: '#cms_Location_2 div li h3 a *::href'
})
    .then(function (ret) {
    return ret;
});
//# sourceMappingURL=post.js.map