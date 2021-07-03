import { NextApiRequest } from 'next'
import fetch from 'isomorphic-fetch'

const DISCORD_API = 'https://discord.com/api/v9'

export default async function voicernd(req: NextApiRequest) {
  const { guild_id: guildId, token } = req.body
  const guildChannels = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    headers: {
      Authorization: `Bot ${token}`,
    },
  })
  console.info('[guilds]', guildChannels)
  return {
    type: 4,
    data: {
      content: 'Test',
    },
  }
}
