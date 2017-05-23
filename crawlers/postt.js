import * as Epona from "eponajs"
const moment = require('moment')
moment.locale('zh-cn')

export default {

    async queue(candidate) {
        if (candidate.url == 'index') {
            let first = await getIndex()
            first.urls = compact(first.urls)
            urls = first.urls.map(x => { return 'http://bbs.tianya.cn/list-' + x + '-1.shtml' })
            // let page = candidate.default.page
            // if (page == 10) { return }
            let src = await getUrls(urls)
            if (src != null) {
                return {
                    urls: src.urls.map(x => { return { url: "http://bbs.tianya.cn" + x, default: { id: x } } })
                    , next: {
                        default: { url:`http://bbs.tianya.cn` + src.nextid },
                        url: 'index'
                    }
                }
            }
        } else {
            let articles = await getArticles(candidate)
            if (articles != null) {
                articles.map(item => {
                    if (item.content != null) {
                        item.content = item.content.toString();
                    }
                    if (item.published_at != null) {
                        let time = item.published_at.match(/\d{4}-\d{1,2}-\d{1,2}\s\d{1,2}:\d{1,2}/g);
                        let t = Date.parse(time)
                        if (t == NaN) {
                            item.published_at = new Date()
                        } else {
                            item.published_at = new Date(t)
                        }
                        // if (time != null) {
                        //   let published_at = time.toString()
                        //   item.published_at = new Date(Date.parse(published_at));
                        // }else{
                        //   item.published_at = new Date()
                        //   console.log( item.published_at)
                        //   console.log('++++++++++++++++++++++++++++++')
                        // }
                    }
                })
                return articles
            }
        }
    }
}

let epona = Epona.new({ concurrent: 3, rateLimit: 1000 })
function getIndex() {
    return Epona.get('http://bbs.tianya.cn/', {
        urls: '.nav_child_box a *::itemid'
    }, {
            concurrent: 50,
        })
}
function getUrls(x) {
    return Epona.get('http://bbs.tianya.cn/list-' + x + '-1.shtml', {
        urls: '.td-title a *::href ',
        nextid: '.short-pages-2 a:nth-last-of-type(1)::href',
    }, {
            // concurrent: 3,
            rateLimit: 1000
        })
}

function getArticles(url) {
    // console.log("文章爬虫")
    return Epona.get("http://bbs.tianya.cn" + url, {
        title: ['.s_title', '.q-title::text()'],
        host: ['#post_head .atl-info a:nth-of-type(1)::text()', '.q-info a::text()'],
        published_at: ["#post_head .atl-info span:nth-of-type(2)",],
        clicks_num: '#post_head .atl-info span:nth-of-type(3)|numbers',
        replays_num: '#post_head .atl-info span:nth-of-type(4)|numbers',
        content: ['.host-item .bbs-content|trim', '.q-content::text()']
    }, {
            // concurrent: 3,
            rateLimit: 1000
        }
    )
}

