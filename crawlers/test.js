import * as Epona from "eponajs"
const moment = require('moment')
moment.locale('zh-cn')

export default {
    async queue(candidate) {
        if (candidate.url == 'index') {
            let page = candidate.default.page
            // if (page == 5) { return }
            let src = await getUrls(page)
            if (src.urls != null) {
                return {
                    urls: src.urls.map(x => {
                        return {
                            default: { desc: x.desc, id: x.url }
                            , url: x.url
                        }
                    })
                    , next: { default: { page: page + 1 }, url: 'index' }
                }
            }
        } else {
            let articles = await getArticles(candidate)
            return {
                ret: ret
                , next: {
                    default: { pid: ret.nextid }
                    , url: `http://bbs.tianya.cn/` + ret.nextid
                }
            }
        }
    }
}

function getUrls(x) {
    return Epona
        .get('http://bbs.tianya.cn/post-free-5705844-1.shtml', {
            urls: '#cms_Location_2 div li h3 a *::href'
            , rank: '.detail a *::text()'
        },
        {
            // concurrent: 3,
            rateLimit: 1000
        })
}

function getArticles(url) {
    return Epona.get(url, {
        title: 'div.text::text()|trim',
        postNums: '.data-count span:nth-of-type(1)::title',
        replayNum: '.data-count span:nth-of-type(2)::title',
        moderators: '.moderator a *::text()',
        urls: '.td-title a *::href ',
        nextid: '.short-pages-2 a:nth-of-type(2)::href',
        intro: '.block-intro::text()|trim'
    }, {
            // concurrent: 3,
            rateLimit: 1000
        }
    )
}
