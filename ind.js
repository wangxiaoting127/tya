// https://www.tya.com/topic/19668741/newest
import { redis, es, config, mongo } from "./_base"
import { split, pick } from "lodash"
import { heartbeat } from "./tianya/heartbeat"

heartbeat()
const POSTS = 'post', PLATES = 'plate'

function minutes(n) {
  return 1000 * 60 * n
}

function crawlAllCompleted(name) {
  setTimeout(run, minutes(3), name)
}

async function dispatch(crawler) {
  let index = await crawler.getId()
  console.log('==========')
  console.log(index)
  
  if (index ==='nil') { crawlAllCompleted() }
  await crawler.crawl(index)
    .then(async function (ret) {
      if (await crawler.save(ret)) {
        await crawler.crawlCompleted(index)
      } else {
        console.log(`crawl ${index} error`)
        await crawler.requeue(index)
      }
      setImmediate(dispatch, crawler)
    })
    .catch(async function (err) {
      console.log(err)
      await crawler.requeue(index)
      setImmediate(dispatch, crawler)
    })
}

function usage() {
  console.log(`
    
  `)
}

function run(name) {
  if (!name) { return usage() }
  let [file, mod] = name.split('-')
  let crawler = require(`./tianya/${file}`)[mod || 'default']
  console.log(name)
  dispatch(crawler)
}
// mongo.then(x=>{
//   global.mongo = x 
run(process.argv[2] || POSTS)
// }).catch(x=>{
//   console.log(x)
// })


