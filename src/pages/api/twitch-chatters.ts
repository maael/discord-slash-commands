import { NextApiHandler } from 'next'
import { cors } from '../../util'

const handler: NextApiHandler = async (req, res) => {
  const channel = req.query.channel?.toString()
  const chatters = await fetch(`http://tmi.twitch.tv/group/user/${channel}/chatters`).then((res) => res.json())
  res.json(chatters)
}

export default cors(handler)
