"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _base_1 = require("../_base");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const post_1 = require("../crawlers/post");
exports.default = {
    getId() {
        return _base_1.redis.rpoplpushAsync('tya.posts', 'tya.posts.pending');
    },
    crawlCompleted(index) {
        return _base_1.redis.multi()
            .lpush('tya.posts.completed', utils_1.updateId(index))
            .lrem('tya.posts.pending', 0, index)
            .execAsync();
    },
    requeue(index) {
        return _base_1.redis.lpushAsync('tya.posts', utils_1.updateId(index));
    },
    save(questions) {
        let bulkBody = [];
        questions.map(x => {
            if (!x || !x.title) {
                return;
            }
            bulkBody.push({ index: { _index: 'tya_posts', type: 'tya_posts', _id: x._id } });
            lodash_1.assign(x, x.data);
            bulkBody.push(lodash_1.pick(x, ["title", "host", "published_at", "clicks_num", "replays_num", "url", "content"]));
        });
        console.log(bulkBody);
    },
    crawl(index) {
        return post_1.default(utils_1.expandIds(index));
    }
};
//# sourceMappingURL=post.js.map