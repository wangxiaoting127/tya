import { redis, es, config, bulk } from "../_base"
import { updateId, log, expandIds } from "./utils"
import { assign, pick } from "lodash"
import crawl from "../crawlers/question"

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

  , save(questions) {
    // save to elasticsearch
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
    let bulkBody = []
    questions.map(x => {
        if(!x || !x.title) { return }
        bulkBody.push({ index: { _index: 'tya_posts', type: 'tya_posts', _id: x._id } })
        assign(x, x.data)
        bulkBody.push(pick(x,  ["title", "host", "published_at", "clicks_num", "replays_num", "url", "content"]))
        // TODO: save answers
        // x.answers.map(a => {
        //   bulkBody.push({ index: { _index: 'zhihu_answers', _type: 'zhihu_answers', _id: answer.answersId } })
        //   bulkBody.push(pick(answer, ["name", "links", "content", "time", "voteUp", "voteDown"]))
        // })
    })
    console.log(bulkBody)
    return bulk(bulkBody)
  }

  , crawl(index) {
    return crawl(expandIds(index))
  }
}