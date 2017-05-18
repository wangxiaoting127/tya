import * as Epona from "eponajs"
import { korok } from "korok"
// const initStatus = {
//   'post': { next: {default: { page: 1 },url:a} },
// }
 function a(){

let epona = Epona.new({ concurrent: 3,rateLimit:1000})
epona.queue("http://focus.tianya.cn/thread/index.shtml");
epona.on("http://focus.tianya.cn/thread/index.shtml", {
  urls: '#cms_Location_2 div li h3 a *::href'
})
  .then(function (ret) {
      console.log(ret)
   return ret 
  })
    
}
export default a