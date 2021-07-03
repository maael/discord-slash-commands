import { NextApiRequest } from 'next'
import fetch from 'isomorphic-fetch'

const DISCORD_API = 'https://discord.com/api/v9'

export default async function voicernd(req: NextApiRequest) {
  const { guild_id: guildId } = req.body
  const guildChannelsRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
  })
  const guildChannels = await guildChannelsRes.json()
  console.info('[guilds]', guildChannels)
  return {
    type: 4,
    data: {
      content: 'Test',
    },
  }
}
