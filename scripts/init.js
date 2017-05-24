import { redis, config, mongo } from "../_base"
import { includes, split, pick, flatten, compact } from "lodash"
import * as Epona from "eponajs"
redis.on("error", function (err) {
    console.log("Error " + err);
})
// doc https://www.npmjs.com/package/redis
function usage() {

}

async function getIndex() {
    let ret = await Epona.get("http://bbs.tianya.cn/", {
        urls: '.nav_child_box a *::itemid'
    }, { concurrent: 50 })
    ret.urls = ret.urls.map(x => {
        if (x) {
            return 'http://bbs.tianya.cn/list-' + x + '-1.shtml'
        }
    })
    return ret
}
function getIndecies(crawler, indecies) {
    let urls = Array.isArray(indecies) ? flatten(indecies.filter(x => x).map(x => x.next)) : indecies.next
    // console.log(urls)
    // console.log('11111111111')
    return crawler.queue(urls || [])
}
function saveList(crawler, index) {
    let list = Array.isArray(index) ? flatten(index.filter(x => x).map(x => x.urls)) : index.urls
    list.map(x => { return redis.lpushAsync('tya.posts', `${x}_${Date.now()}`) })
}
function saveStatus(site, next) {
    return redis.hsetAsync("tya.postsStatus"
        , site
        , JSON.stringify(next))
}
async function loadStatus(site, increment, y) {
    let initStatus = {
        'post': { next: y.urls.map(x => { return { default: { page: 1 }, url: x } }) },
        'plate': { next: { default: { page: 1 }, url: 'http://focus.tianya.cn/thread/index.shtml' } }
    }
    // console.log(initStatus)
    let status = await redis.hgetAsync("tya.postsStatus", site)
    return status && !increment ? JSON.parse(status) : initStatus[site]
}

function isNext(index) {
    if (Array.isArray(index)) {
        return index.filter(x => x).length == 0
    } else {
        return !index || index.next.length == 0 || !index.next || !index.urls || !index.urls[0] || !index.urls[0].url || index.urls.length == 0
    }
}

function crawlCompleted(site) {
    console.log(site, 'list  added')
}
async function crawl(site, increment = false) {
    let crawler = require("../crawlers/" + site).default
    let init = await getIndex()
    let candidate = await loadStatus(site, increment, init)
    async function _crawl(crawler, candidate) {
        try {
            let index = await getIndecies(crawler, candidate)
            // console.log(index)
            if (isNext(index)) {
                return crawlCompleted(site)
            }
            let status = await saveStatus(site, index)
            let posts = await saveList(crawler, index)
            candidate = index
            setImmediate(await _crawl(crawler, index))
            // await _crawl(crawler, index) 
        } catch (e) {
            console.log('<<<< error >>>>')
            console.log(candidate, e)
            setImmediate(await _crawl(crawler, index))
            // setImmediate(_crawl, crawler, candidate)
        }
    }
    await _crawl(crawler, candidate)
}

async function topics() {
    let ti = config.MIN_TOPIC_ID
    do {
        await redis.lpushAsync('zhihu.topics', `${ti}_${Date.now()}`)
    } while ((ti += config.ID_PER) < config.MAX_TOPIC_ID)
    console.log('zhihu topics id added')
}

async function index() {
    // craete mongo index
    mongo = await mongo
    const Topic = mongo.collection('topics')
    await Topic.createIndex({ _id: 1 }, { unique: true })
    const topicFollows = mongo.collection('topic_follows')
    await topicFollows.createIndex({ _id: 1 }, { unique: true })
    console.log('created mongo indecies')
    // done
    await mongo.close()
}

async function clear(name) {
    console.log(`clear zhihu ${name}`)
    if (name == 'all') {
        await redis.delAsync('tya.posts')
        await redis.delAsync('tya.posts.pending')
        await redis.delAsync('zhihu.topics')
        await redis.delAsync('zhihu.topics.pending')
    } else if (includes(['post', 'topics'], name)) {
        await redis.delAsync(`tya.${name}`)
        await redis.delAsync(`tya.${name}.pending`)
    } else {
        console.log("unknow keys: " + name)
    }
}

async function run(cmd, increment = false) {
    switch (cmd) {
        case 'post':
            await crawl(cmd, process.argv[3] == "inc")
            break
        case 'topics':
            await topics()
            break
        case 'index':
            await index()
            break
        case 'clear':
            await clear(process.argv[3])
            break
        case 'all':
            await clear()
            await question()
            await topic()
            await index()
            break
        default:
            usage()
    }

    console.log('done!')
    process.exit(0)
}

run(process.argv[2])



