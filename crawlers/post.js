import * as Epona from "eponajs"
import { save } from "../src/utils"
import { es, config } from "../_base"
const moment = require('moment')
moment.locale('zh-cn')

let epona = Epona.new({ concurrent: 3,rateLimit:1000})
epona.queue("http://focus.tianya.cn/thread/index.shtml");
epona.on("http://focus.tianya.cn/thread/index.shtml", {
  urls: '#cms_Location_2 div li h3 a *::href'
})
  .then(function (ret) {
    console.log(ret)
    return a
  })
epona.on("bbs.tianya.cn/list", {
  urls: '.td-title a *::href ',
  nextid: '.short-pages-2 a:nth-last-of-type(1)::href',
})
  .then(function (ret) {
    // console.log(ret)
     return {
      urls: ret.urls.map(x => { return { url: "http://bbs.tianya.cn"+x, default: { id: x } } })
      ,next: {
        url: `http://bbs.tianya.cn`+ret.nextid
      }
    }
  })
epona.on("bbs.tianya.cn/post-", {
  title: '.s_title',
  host: '#post_head .atl-info a:nth-of-type(1)::text()',
  published_at: "#post_head .atl-info span:nth-of-type(2)",
  clicks_num: '#post_head .atl-info span:nth-of-type(3)|numbers',
  replays_num: '#post_head .atl-info span:nth-of-type(4)|numbers',
  content: '.host-item .bbs-content|trim'
})
  .then(function (ret) {
    if (ret.published_at !== null) {
      let time = ret.published_at.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/g).toString();
      ret.published_at = moment(time).add(8, 'hour').toDate()
    }
    console.log(ret)
    return ret
  })
export default epona