import { NextApiRequest } from 'next'
import fetch from 'isomorphic-fetch'

const DISCORD_API = 'https://discord.com/api/v9'

enum ChannelType {
  Placeholder = 4,
  Text = 0,
  Voice = 2,
}

/**
 * Not possible via the HTTP API
 */

export default async function voicernd(req: NextApiRequest) {
  const { guild_id: guildId } = req.body
  const guildChannelsRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
  })
  const guildChannels = await guildChannelsRes.json()
  const firstVoiceChannel = guildChannels.find((c) => c.type === ChannelType.Voice && c.position === 0)
  const channelInfoRes = await fetch(`${DISCORD_API}/channel/${firstVoiceChannel.id}`, {
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
  })
  const channelInfo = await channelInfoRes.json()
  console.info('[guilds]', channelInfo)
  return {
    type: 4,
    data: {
      content: "This doesn't work",
    },
  }
}
