import { redis, es, config, bulk } from "../_base"
import { updateId, log, postUrl } from "./utils"
import { assign, pick } from "lodash"
import crawl from "../crawlers/post"

export default {

    getId() {
      return redis.rpoplpushAsync('tya.posts', 'tya.posts.pending')
  }

  , crawlCompleted(index) {
    return redis.multi()
      .lpush('tya.posts.completed', updateId(index))
      .lrem('tya.posts.pending', 0, index)
      .execAsync()
  }

  , requeue(index) {
    return redis.lpushAsync('tya.posts', updateId(index))
  }

  , save(posts) {
    // save to elasticsearch
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
    let bulkBody = []
    posts.map(post => {
    if (!post || !post.title) { return }
    let a = pick(post, ["title", "host", "published_at", "clicks_num", "replays_num", "url","content","crawled_at"])
    a.index_name='tianya_news'; a.type_name=`tianya_news`; a.id= post.id 
    bulkBody.push(a)

  }
   )
    console.log(bulkBody)
    return bulk(bulkBody)
  }

  , crawl(index) {
    return crawl.queue(postUrl(index))
  }
}