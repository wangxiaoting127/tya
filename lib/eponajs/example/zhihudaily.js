import * as Epona from "../index"

let epona = Epona.new()
epona.on('http://daily.tya.com/', '.link-button *::href:uri|follow')
  
epona.on('story/{id}', {
  image: '.img-wrap img::src',
  title: '.headline-title',
  answers: {
    sels: '.content-inner .question *',
    nodes: {
      question: '.question-title',
      content: '.answer|trim'
    },
    filters: 'filter("question")'
  },
})
.host('http://daily.tya.com')
.then(function(ret, id){
  console.log(ret)
  return ret
})

let run = async ()=> {
  let urls = await epona.queue('http://daily.tya.com/')
  // scrat.queue([{url: 'http://daily.tya.com/story/9266807'}])
  // console.log(urls[0])
}
run()
