import { redis, es, config } from "./_base"
import { split, pick, flatten } from "lodash"
import { heartbeat } from "./src/heartbeat"
import plate from './crawlers/plate'
import post from './crawlers/post'
let http = require('http')
// import q36kr from "./crawlers/q36kr"
// heartbeat()
// let q36 = rangeArray(14100, 14102, 1).map((x) => {
//   return { url: `http://36kr.com/api/info-flow/newsflash_columns/newsflashes?b_id=${x}&per_page=1` }
// })
const initStatus = {
  '36kr': { next: {default: { page: 1 },url:'http://36kr.com/api/info-flow/main_site/posts?column_id=&b_id=&per_page=20'} }
  , 'ikanchai': {
    next: { default: { page: 1 }, url: 'http://app.ikanchai.com/roll.php?do=more&sectionid=255&status=1&sort=0&pagesize=5&page=1' }
  }, 'cyzone': {
    next: { default: { page: 1 }, url: 'http://api.cyzone.cn/index.php?m=content&c=index&a=init&tpl=index_page&page=1' }
  }, 'huxiu': {
    next: { default: { page: 2 }, url: 'https://www.huxiu.com/v2_action/article_list?page=2' }
  }, 'geekpark': {
    next: { default: { page: 0 }, url: 'http://www.geekpark.net/articles_list?page=0' }
  }, 'leiphone': {
    next: { default: { page: 1 }, url: 'http://www.leiphone.com/page/1' }
  }, 'tmtpost': {
    next: { default: { page: 0 }, url: 'http://www.tmtpost.com/ajax/common/get?url=/v1/lists/home&data=offset=0&limit=15&post_fields=tags' }
  },
  'techxue': {
    next: { default: { page: 1 }, url: 'index' }
  },
  'qianzhan': {
    next: [
      { default: { page: 1 }, url: 'http://t.qianzhan.com/fengkou/p-1.html' }
      , { default: { page: 1 }, url: 'http://t.qianzhan.com/p-1.html' }
      , { default: { page: 1 }, url: 'http://t.qianzhan.com/daka/p-1.html' }
    ]
  },
  'pingwest': {
    next: { default: { page: 0 }, url: 'index' }
  }
}

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

function getIndecies(crawler, indecies) {
  let urls = Array.isArray(indecies) ? flatten(indecies.map(x => x.next)) : indecies.next
  return crawler.queue(urls || [])
}

function getArticles(crawler, index) {
  let urls = Array.isArray(index) ? flatten(index.map(x => x.urls)) : index.urls
  return crawler.queue(urls)
}

function saveStatus(site, next) {
  return redis.hsetAsync("owl.articleStatus"
    , site
    , JSON.stringify(next))
}

async function loadStatus(site, increment) {
  let status = await redis.hgetAsync("owl.articleStatus", site)
  return status && !increment ? JSON.parse(status) : initStatus[site]
}

function saveArticles(site, articles) {
  let bulkBody = []
  articles.map(article => {
    if (!article || !article.title) { return }
    let a = pick(article, ["title", "content", "published_at", "desc", "pics", "url", "type", "keywords", "supports_num", "collections_num", "comments_num", "views_num", "author_id"])
    a.index_name='tech_news'; a.type_name=`tech_${site}_articles`; a.id= article.id 
    bulkBody.push(a)

  })
  console.log(bulkBody)

  // real save
  return bulk(bulkBody)
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
  let candidate = await loadStatus(site, increment)
  let crawler = require("./crawlers/" + site).default
  let _crawl = async function (crawler, candidate) {
    try {
      let index = await getIndecies(crawler, candidate)
      if (isNext(index)) {
        return crawlCompleted(site)
      }
      let status = await saveStatus(site, index)
      let articles = await getArticles(crawler, index)
      let saved = await saveArticles(site, articles)
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
   crawl(process.argv[2] || 'plate', process.argv[3] == "inc")
  // await plate.queue([
  //   'http://focus.tianya.cn/thread/index.shtml'
  // ])
  await post.queue([
    'http://bbs.tianya.cn/post-free-5705844-1.shtml'
  ])
}
run()