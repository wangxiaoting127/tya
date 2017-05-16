import * as Epona from "eponajs"
import { save } from "../src/utils"
import { es, config } from "../_base"


let epona = Epona.new({ concurrent: 3, rateLimit: 1000 })
epona.on("bbs.tianya.cn/post-free-5705844-1", {
  title: '.s_title',
  host:'#post_head .atl-info a:nth-of-type(1)::text()',
  published_at:"#post_head .atl-info span:nth-of-type(2)",
  clicks_num:'#post_head .atl-info span:nth-of-type(3)|numbers',
  replays_num: '#post_head .atl-info span:nth-of-type(4)|numbers',
  content:'.host-item .bbs-content|trim'
})
  .then(function (ret) {
    console.log(ret)
    return ret
  })
export default epona