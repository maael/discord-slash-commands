import { NextApiHandler } from 'next'
import { cors } from '../../util'

const TWITCH_TOKEN = process.env.TWITCH_TOKEN

async function getYoutubeLive(channel: string) {
  const channelLink = `https://www.youtube.com/c/${channel}`
  const result = await fetch(channelLink).then((r) => r.text())
  return { channel, isLive: result.includes('live streams'), type: 'youtube', link: channelLink }
}

async function getTwitchLive(users: string[]) {
  const result = await fetch(`https://api.twitch.tv/helix/streams?${users.map((u) => `user_login=${u}`).join('&')}`, {
    headers: {
      Authorization: `Bearer ${TWITCH_TOKEN}`,
      'Client-Id': 'vb8ha1dif8a1c9j82rj1npd78gex9j',
    },
  })
    .then((r) => r.json())
    .then((r) => r.data)
  if (typeof result !== 'object' || !Array.isArray(result)) {
    console.error('Got:', result)
    return []
  }
  return users.map((u) => ({
    channel: u,
    type: 'twitch',
    isLive: result.some((r) => r.user_login === u && r.type === 'live'),
    link: `https://twitch.tv/${u}`,
  }))
}

const handler: NextApiHandler = async (req, res) => {
  const youtubeChannels = (req.query.youtube || '')
    .toString()
    .split(',')
    .map((i) => i.trim())
  const twitchUsers = (req.query.twitch || '')
    .toString()
    .split(',')
    .map((i) => i.trim())
  const [youtube, twitch] = await Promise.all([
    Promise.all(youtubeChannels.map(getYoutubeLive)),
    getTwitchLive(twitchUsers),
  ])
  res.json({ result: youtube.concat(twitch) })
}

export default cors(handler)
