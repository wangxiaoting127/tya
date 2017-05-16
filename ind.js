import { redis, es, config } from "./_base"
import { split, pick, flatten } from "lodash"
import { heartbeat } from "./src/heartbeat"
import plate from './crawlers/plate'
import post from './crawlers/post'

async function run() {
//    crawl(process.argv[2] || 'plate', process.argv[3] == "inc")
//   await plate.queue([
//     'http://focus.tianya.cn/thread/index.shtml'
//   ])
  await post.queue([
    'http://bbs.tianya.cn/list-funinfo-1.shtml'
  ])
}
run()