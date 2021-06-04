import { NextApiHandler } from 'next'
import fetch from 'isomorphic-fetch'

const handler: NextApiHandler = async (req, res) => {
  const { type } = req.body
  console.info('[received]')
  if (type === 1) {
    return res.json({ type: 1 })
  } else {
    try {
      const response = await fetch('https://w2g.tv/rooms/create.json', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          w2g_api_key: process.env.W2G_KEY,
          share: 'https://www.youtube.com/watch?v=5M_Z0ARqol8',
          bg_color: '#00ff00',
          bg_opacity: '50',
        }),
      })
      const data = await response.json()
      res.send({
        type: 4,
        data: {
          contents: `https://w2g.tv/rooms/${data.streamkey}`,
        },
      })
    } catch {
      res.send({
        type: 4,
        data: {
          contents: 'Something fucked up.',
        },
      })
    }
  }
}

export default handler
