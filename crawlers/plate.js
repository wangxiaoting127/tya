import * as Epona from "eponajs"
import { save } from "../src/utils"
import { es, config } from "../_base"

async queue(['http://bbs.tianya.cn/post-free-5705844-1.shtml']) 
let epona = Epona.new({ concurrent: 3 })
epona.on('http://focus.tianya.cn/thread/index.shtml', {
  urls: '#cms_Location_2 div li h3 a *::href'
  ,rank:'.detail a *::text()'
})
  .then(function (ret) {
    // return epona.queue(ret.urls.map(x => { return { url: x, default: { id: x } } }))
    return {
      urls:ret.urls.map(x => { return { url: x, default: { id: x } } }),
    }
  })
epona.on('bbs.tianya.cn/list-', {
  title: 'div.text::text()|trim',
  postNums: '.data-count span:nth-of-type(1)::title',
  replayNum: '.data-count span:nth-of-type(2)::title',
  moderators: '.moderator a *::text()',
  urls:'.td-title a *::href ',
  nextid:'.short-pages-2 a:nth-of-type(2)::href',
  intro:'.block-intro::text()|trim'
})
  .then(function (ret) {
    console.log(ret)
    return {
      ret: ret
      ,next: {
        default: { pid: ret.nextid }
        , url: `http://bbs.tianya.cn/`+ret.nextid
      }
    }
  })
export default epona
