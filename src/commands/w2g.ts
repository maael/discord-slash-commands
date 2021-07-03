import { NextApiRequest } from 'next'

export default async function w2gCommand(req: NextApiRequest) {
  try {
    let share = 'https://www.youtube.com/watch?v=5M_Z0ARqol8'
    try {
      share = req.body.data.options[0].value
    } catch {
      // Do nothing
    }
    console.info('[share]', { share })
    const response = await fetch('https://w2g.tv/rooms/create.json', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        w2g_api_key: process.env.W2G_KEY,
        share,
        bg_color: '#36393f',
        bg_opacity: '0',
      }),
    })
    const data = await response.json()
    const result = {
      type: 4,
      data: {
        content: `https://w2g.tv/rooms/${data.streamkey}`,
      },
    }
    console.info('[response:2]', result)
    return result
  } catch {
    const result = {
      type: 4,
      data: {
        content: 'Something fucked up.',
      },
    }
    console.info('[response:3]', result)
    return result
  }
}
