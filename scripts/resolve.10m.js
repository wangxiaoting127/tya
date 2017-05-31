import { redis, config, mongo } from "../_base"
import { includes } from "lodash"
import { updateId, log, postUrl } from "./utils"

redis.on("error", function (err) {
  console.log("Error " + err);
})
// doc https://www.npmjs.com/package/redis
function usage() {

}

async function plates() {
  // let ti = config.MIN_TOPIC_ID
  let ti = await redis.llenAsync('tya.plates.pending')
  while(ti - 5 > 0) {
    let index = await redis.rpoplpushAsync('tya.plates.pending', 'tya.plates.pending')
    let [id, time] = index.split('_')
    if((new Date).getTime() - parseInt(time) > 10 * 60 * 1000) {
      console.log('requeued:', id)
      await redis.lremAsync('tya.plates.pending', 0, index)
      await redis.lpushAsync('tya.plates', updateId(index))
    }
  }
  console.log('tya plates id requeued')
}

async function run(cmd) {
  switch(cmd) {
    case 'posts':
      await posts()
      break
    case 'plate':
      await plates()
      break    
    case 'all':
      await question()
      await topic()
      break    
    default:
      usage()
  }

  console.log('done!')
  process.exit(0)
}

run(process.argv[2])