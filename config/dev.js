export const ID_PER = 5
export const MIN_QUESTION_ID = 19550225
export const MAX_QUESTION_ID = 20005000
export const MIN_TOPIC_ID = 19550225
export const MAX_TOPIC_ID = 20005000
export const beattime = 1000 * 30
export const cleartime = 1000 * 60 * 3
export const redisOpts = { }
export const esOpts = {
    hosts: ["http://zhihu:zhihu@123456@59.110.52.213/zhihu"]
  , requestTimeout: 300000
  , log: 'error'
}

export const mongoUrl = "mongodb://zhihu:joke123098@101.201.37.28:3718/zhihu-dev"