import { redis, config } from "../_base"
import { heartbeat } from "./heartbeat"
import { updateQuestionId } from "./utils"
import { includes, split } from "lodash"
let lp
redis.lrangeAsync('tya.posts.pending', 0, -1)
.then(function(ret) {
  lp = ret
  setTimeout(clearList, config.cleartime)
}).catch(function(e){
  console.log(e)
})

heartbeat(true)

async function clearList() {
  let nlp = await redis.lrangeAsync('tya.posts.pending', 0, -1)
  for(let l of nlp) {
    try {
      if(includes(lp, l)) {
        await redis.multi()
                   .lpush('tya.posts', updateQuestionId(l))
                   .lrem('tya.posts.pending', 0, l)
                   .execAsync()
        console.log(`clear & requeue expired item ${l}`)
      }
    } catch (e) {
      console.log(e)
    }
  }
  lp = await redis.lrangeAsync('tya.posts.pending', 0, -1)
}

async function clearNode() {

}
