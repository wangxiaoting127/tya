import { redis, es, config } from "./_base"
import { split, pick, flatten } from "lodash"
import { heartbeat } from "./src/heartbeat"

let http = require('http')

// const initStatus = {
//   // 'post': { next: {default: { page: 1 },url:'http://bbs.tianya.cn/list-funinfo-1.shtml'} },
//   'post': { next: {default: { page: 1 },url:init} },

//    'plate': { next: {default: { page: 1 },url:'http://focus.tianya.cn/thread/index.shtml'} }
// }


let util = require('util')
function log(x) {
  console.log(util.inspect(x, { showHidden: true, depth: null }))
}
// async function bulk(bulkBody) {
//   if (bulkBody.length == 0) { return true }
//   try {
//     let bulked = await es.bulk({ body: bulkBody })
//     if (bulked.errors == true) {
//       log(bulked)
//       return false
//     } else {
//       console.log(`bulked ${bulked.items.length} items`)
//       return true
//     }
//   } catch (e) {
//     console.log(e)
//     // TODO: retry
//   }
//   return false
// }

async function bulk(bulkBody) {
  if (bulkBody.length == 0) { return true }
  try {
    bulkBody = JSON.stringify(bulkBody);
    const opts = {
      hostname: '59.110.52.213',
      path: '/stq/api/v1/pa/kejizixun/add',
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'Content-Length': Buffer.byteLength(bulkBody)
      }
    };
    const req = http.request(opts, (res) => {
      console.log(res.statusCode);
    });
    req.write(bulkBody);
  } catch (e) {
    console.log(e)
    // TODO: retry
  }
  return false
}
async function getIndex(crawler) {
  return crawler.queue(['http://focus.tianya.cn/thread/index.shtml'])
}
// function getIndex(crawler, index) {
//   let urls = Array.isArray(index) ? flatten(index.map(x => x.urls)) : index.urls
//   return crawler.queue(urls)}
// function saveInit(site, next) {
//   return redis.hsetAsync("owl.postsInit"
//     , site
//     , JSON.stringify(next))
// }
function getIndecies(crawler, indecies) {
  let urls = Array.isArray(indecies) ? flatten(indecies.map(x => x.next)) : indecies.next
  return crawler.queue(urls || [])
}
function getPosts(crawler, index) {
  let urls = Array.isArray(index) ? flatten(index.map(x => x.urls)) : index.urls
  return crawler.queue(urls)
}
function saveStatus(site, next) {
  return redis.hsetAsync("tya.postsStatus"
    , site
    , JSON.stringify(next))
}
async function loadStatus(site, increment, y) {
  console.log('+++++=======+++++++')

  let initStatus = {
    'post': { next: y[0].urls.map(x => { return { default: { page: 1 }, url: x } }) },
    'plate': { next: { default: { page: 1 }, url: 'http://focus.tianya.cn/thread/index.shtml' } }
  }
  console.log(initStatus)
   let status = await redis.hgetAsync("tya.postsStatus", site)
  return status && !increment ? JSON.parse(status) : initStatus[site]
}
function savePosts(site, posts) {
  let bulkBody = []
  posts.map(post => {
    if (!post || !post.title) { return }
    let a = pick(post, ["title", "host", "published_at", "clicks_num", "replays_num", "url", "content"])
    // a.index_name='tech_news'; a.type_name=`tech_${site}_posts`; a.id= post.id 
    bulkBody.push(a)

  })
  console.log(bulkBody)

  // real save
  // return bulk(bulkBody)
}

function isNext(index) {
  if (Array.isArray(index)) {
    // qianzhan 
    return index.filter(x => x).length == 0
  } else {
    return !index || index.next.length == 0 || !index.next || !index.urls || !index.urls[0] || !index.urls[0].url || index.urls.length == 0
  }
}

function crawlCompleted(site) {
  console.log(site, 'crawl completed')
}
async function crawl(site, increment = false) {
  let crawler = require("./crawlers/" + site).default
  let init = await getIndex(crawler)
  console.log(init)
  let candidate = await loadStatus(site, increment, init)
  let _crawl = async function (crawler, candidate) {
    try {
      let index = await getIndecies(crawler, candidate)
      if (isNext(index)) {
        return crawlCompleted(site)
      }
      let status = await saveStatus(site, index)
      let posts = await getPosts(crawler, index)
      let saved = await savePosts(site, posts)
      candidate = index
      setImmediate(_crawl, crawler, index)
    } catch (e) {
      console.log('<<<< error >>>>')
      console.log(candidate, e)
      // setImmediate(_crawl, crawler, candidate)
    }
  }
  _crawl(crawler, candidate)
}
async function run() {
  if (process.argv[2] == 'plate') { process.argv[3] == "inc" }
  crawl(process.argv[2] || 'post', process.argv[3] == "inc")
  // await plate.queue([
  //   'http://focus.tianya.cn/thread/index.shtml'
  // ])
  // await post.queue([
  //   'http://bbs.tianya.cn/post-free-5705844-1.shtml'
  // ])
}
run()