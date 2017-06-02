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
async function getIndecies(crawler, indecies) {
    let urls = Array.isArray(indecies) ? flatten(indecies.filter(x => x).map(x => x.next)) : indecies.next
    return crawler.queue(urls || [])
}

//save posturl
async function saveList(crawler, index) {
    let list = flatten(index.map(x => x.urls))
    let allList = compact(list)
    let urlList = allList.map(x => x.url)
    return urlList.map(async function (x) {
        if (x) {
            return redis.lpushAsync('tya.posts', `${x}_${Date.now()}`)
        }
    })
}

//保存当前爬取文章列表和下一页的url
async function saveStatus(site, next) {
    return redis.hsetAsync("tya.postsStatus"
        , site
        , JSON.stringify(next))
}
async function loadStatus(site, increment, init) {
    let channel = compact(init.urls)
    let initStatus = {
        'post': { next: channel.map(x => { return { url: x } }) },
        'plate': { next: { default: { page: 1 }, url: 'http://focus.tianya.cn/thread/index.shtml' } }
    }
    let status = await redis.hgetAsync("tya.postsStatus", site)
    return status && !increment ? JSON.parse(status) : initStatus[site]
}

async function lastUrl(index) {
    //爬取时间到20160101
    index = index.filter(x => x).map(x => {
        let time = x.next.url.match(/\d{13}/g)
        if (time > 1451577600000) {
            return x
        } else {
            return x.next.url = ''
        }
    })
    return index
}


async function add(index) {
    //每日爬取
    let dd=new Date()
    let time=dd.setDate(dd.getDate()-1)
    index=index.filter(x=>x).map(x=>{
        let nextTime=x.next.url.match(/\d{13}/g)
        if(nextTime>time){
            return x
        }else{
            console.log('=======postList ready========')
            return x.next.url=''
        }
    })
    return index

}

function isntNext(index) {
    if (Array.isArray(index)) {
        return index.filter(x => x).length == 0
    } else {
        return !index || index.next.length == 0 || !index.next || !index.urls || !index.urls[0] || !index.urls[0].url || index.urls.length == 0
    }
}

function crawlCompleted(site) {
    console.log(site, 'list added')
}
async function posts(site, increment = false) {
    let crawler = require("../crawlers/" + site).default
    let init = await getIndex()
    let candidate = await loadStatus(site, increment, init)
    async function _crawl(crawler, candidate) {
        try {
            let findex = await getIndecies(crawler, candidate)
            // let index = await lastUrl(findex)
            let index = await add(findex)
            if (isntNext(index)) {
                return crawlCompleted(site)
            }
            let status = await saveStatus(site, index)
            let posts = await saveList(crawler, index)
            candidate = index
            setImmediate(_crawl, crawler, index)
        } catch (e) {
            console.log('<<<< error >>>>')
            console.log(e)
            // setImmediate(await _crawl(crawler, index))
            // setImmediate(_crawl, crawler, candidate)
        }
    }
    await _crawl(crawler, candidate)
}

async function plates() {
    let init = await getIndex()
    let list = compact(init.urls)
    return Promise.all(list.map(x => {
        if (x) {
            return redis.lpushAsync('tya.plates', `${x}_${Date.now()}`)
        }
    }))

    // console.log('tya plates id added')
}

// async function index() {
//     // craete mongo index
//     mongo = await mongo
//     const Plate = mongo.collection('plates')
//     await Plate.createIndex({ "_id": 1 }, { "unique": true })
//     // const PlateFollows = mongo.collection('plates_follows')
//     // await PlateFollows.createIndex({ _id: 1 }, { unique: true })
//     console.log('created mongo indecies')
//     // done
//     await mongo.close()
// }

async function clear(name) {
    console.log(`clear tya ${name}`)
    if (name == 'all') {
        await redis.delAsync('tya.posts')
        await redis.delAsync('tya.posts.pending')
        await redis.delAsync('tya.topics')
        await redis.delAsync('tya.topics.pending')
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
            await posts(cmd, process.argv[3] == "inc")
            break
        case 'plate':
            await plates()
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
    // process.exit(0)
}

run(process.argv[2])



