import { redis, es, config, bulk } from "../_base"
import { updateId, log, postUrl } from "./utils"
import { assign, pick } from "lodash"
import crawl from "../crawlers/plate"

export default {

    getId() {
      return redis.rpoplpushAsync('tya.plates', 'tya.plates.pending')
  }

  , crawlCompleted(index) {
    return redis.multi()
      .lpush('tya.plates.completed', updateId(index))
      .lrem('tya.plates.pending', 0, index)
      .execAsync()
  }

  , requeue(index) {
    return redis.lpushAsync('tya.plates', updateId(index))
  }

  , save(plates) {
    // save to elasticsearch
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
    let bulkBody = []
    plates.map(post => {
    if (!post || !post.title) { return }
    let a = pick(post, ["title", "postNums", "replayNum", "moderators", "intro"])
    // a.index_name='tech_news'; a.type_name=`tech_${site}_plates`; a.id= post.id 
    bulkBody.push(a)

  }
   )
    console.log(bulkBody)
    // return bulk(bulkBody)
  }

  , crawl(index) {
    return crawl.queue(postUrl(index))
  }
}