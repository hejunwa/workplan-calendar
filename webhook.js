import { Redis } from '@upstash/redis'
const redis = Redis.fromEnv()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const e = req.body.entry

    // ✅ 字段精确映射（按你提供的 API Code）
    const event = {
      id: e.id,
      title: `${e['field_2']?.join(' / ') || ''} - ${e['field_1']}`,
      start: e['field_3'],      // 计划起始日期
      end: e['field_4'],        // 计划完成日期
      extendedProps: {
        deptAndOwner: e['field_2'], // 部门及负责人
        taskType: e['field_9'],     // 工作任务属性
        status: e['field_6'],       // 完成状态
        summary: e['field_8'],      // 工作小结
        remark: e['field_7'],       // 备注
        attachments: e['field_5']   // 相关资料
      }
    }

    const key = 'calendar_events'
    const existing = await redis.get(key)
    const events = existing ? JSON.parse(existing) : []

    events.push(event)

    await redis.set(key, JSON.stringify(events), { ex: 604800 })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'server error' })
  }
}