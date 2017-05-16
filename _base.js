import * as Redis from 'redis'
import * as Promise from "bluebird"
import * as elasticsearch from 'elasticsearch'
import * as fs from "fs"
import { trim } from "lodash"
export const env = fs.existsSync('./env') ? fs.readFileSync('./env', 'utf8') : 'dev'
export let config = require(`./config/${trim(env)}.js`)
Promise.promisifyAll(Redis.RedisClient.prototype)
Promise.promisifyAll(Redis.Multi.prototype)

export let redis = Redis.createClient(config.redisOpts)

redis.on("error", function (err) {
  console.log("Error " + err);
})

export let es = new elasticsearch.Client(config.esOpts)
