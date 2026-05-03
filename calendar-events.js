import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

export default async function handler(req, res) {
  const data = await redis.get('calendar_events')
  res.json(data ? JSON.parse(data) : [])
}