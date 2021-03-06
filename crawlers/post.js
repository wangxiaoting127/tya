import * as Epona from "eponajs"
import { es, config } from "../_base"
import { replace, compact } from "lodash"
const moment = require('moment')
moment.locale('zh-cn')

let epona = Epona.new({ concurrent: 50 })

epona.on("bbs.tianya.cn/list", {
  urls: '.td-title a *::href ',
  nextid: '.short-pages-2 a:nth-last-of-type(1)::href',
})
  .then(function (ret) {
    // console.log(ret)
    let a = ret.nextid.match(/(\/list)(.*)/g)
    if (a != null) {
      return {
        urls: ret.urls = ret.urls.map(x => {
          let a = x.match(/(\/post)(.*)/g);
          return { url: 'http://bbs.tianya.cn' + a, default: { id: a } }
        }),
        next: {
          url:`http://bbs.tianya.cn` + ret.nextid
        }
      }
    }
  })
epona.on("bbs.tianya.cn/post-", {
  url:'link[media]::href',
  title: ['.s_title', '.q-title::text()'],
  host: ['#post_head .atl-info a:nth-of-type(1)::text()', '.q-info a::text()'],
  published_at: ["#post_head .atl-info span:nth-of-type(2)",],
  clicks_num: '#post_head .atl-info span:nth-of-type(3)|numbers',
  replays_num: '#post_head .atl-info span:nth-of-type(4)|numbers',
  content: ['.host-item .bbs-content|trim', '.q-content::text()'],
  
})
  .then(function (ret) {
    ret.crawled_at=new Date()
    ret.id = ret.url.match(/post(.*)1/g).toString()
    if (ret.published_at !== null) {
      let time = ret.published_at.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/g).toString();
      ret.published_at = moment(time).toDate()
    }
    console.log(ret)
    return ret
  })
// exports.getIndex()
export default epona

// epona.on("http://bbs.tianya.cn/", {
//   urls: '.nav_child_box a *::itemid'
// })
//   .then(function (ret) {
//     // let ret = ret.urls.map(function (x) {
//     //   let s = x.match(/-(.*)-/g);
//     //   let t = s.toString().replace(/-/g,'')
//     //   return t='http://bbs.tianya.cn/list.jsp?item='+t+'&order=1'
//     // })
//     ret.urls = compact(ret.urls)
//     ret.urls=ret.urls.map(x=>{return 'http://bbs.tianya.cn/list-'+x+'-1.shtml'})
//     console.log(ret)
//     return ret
//   })