import { redis, es, config, bulk } from "../_base"
import { updateId, log, postUrl } from "./utils"
import { assign, pick,omit } from "lodash"
import crawl from "../crawlers/plate"
import { ObjectID } from "mongodb"
let Plate=global.mongo.collection('plates')
let PlateFollows=global.mongo.collection('plate_follows')

function beginningOfDay(date) {
  date = date || new Date
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(0)
  date.setUTCHours(0)
  return date
}

function yestoday() {
  let date = new Date
  date.setDate(date.getDate() - 1)
  return beginningOfDay(date)
}

// module.exports.mongo = {
//   async getId(){
//     let plate=await Plate.findOneAndUpdate(
//       { },
//       ,{$set:{pengding:true,update_at:new Date}}
//       ,{sort:{update_at:1}}

//     )
//     return [plate.value._id]
//   }
//   ,requeue(){
//     return true
//   }
//   ,crawlCompleted(plate){
//     return Plate.updateOne({_id:plate._id},{$set:omit(plate,'_id')})
//   }
//   ,crawl
//   ,save(plate){
//     let save=[]
//     save.push(Plate.udateOne({_id:plate._id},{$set:omit(plate,'_id')}))
//     save.push(PlateFollows.insertOne({
//        _id: (new ObjectID).str
//       , topic_id: topic._id
//       , follows_num: topic.follows_num
//       , created_at: new Date
//       ,
//     }))
//     return Promise.all(saved)

//   }
// }

module.exports.redis={
   getId() {
      return redis.rpoplpushAsync('tya.plates', 'tya.plates.pending')
  }

  , crawlCompleted(index) {
    return redis.multi()
      .lpush('tya.plates.completed', updateId(index))
      .lrem('tya.plates.pending', 0, index)
      .execAsync()
  }

  , requeue(index) {
    return redis.lpushAsync('tya.plates', updateId(index))
  }

  ,async save(plates) {
    let rplates=plates
      if(rplates.length==0){return true}
      let saved=await Plate.insertMany(rplates,{ordered:false})
      return saved.result.ok==1
    // let bulkBody = []
    // plates.map(post => {
    // if (!post || !post.title) { return }
    // let a = pick(post, ["title", "postNums", "replayNum", "moderators", "intro"])
    // // a.index_name='tech_news'; a.type_name=`tech_${site}_plates`; a.id= post.id 
    // bulkBody.push(a)

  // }
  //  )
  //   console.log(bulkBody)
    // return bulk(bulkBody)
  }

  , crawl(index) {
    return crawl.queue(postUrl(index))
  }
}
