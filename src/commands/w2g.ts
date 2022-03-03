import { NextApiRequest } from 'next'

const defaultVideos = [
  'https://www.youtube.com/watch?v=Xw2L11Owuhs',
  'https://www.youtube.com/watch?v=IUhIY4GcL2w',
  'https://www.youtube.com/watch?v=abTRxOM81Bc',
  'https://www.youtube.com/watch?v=cEN00wMFB2A',
  'https://www.youtube.com/watch?v=xD-IQaxHcE4',
  'https://www.youtube.com/watch?v=hmyO0MJTjp0',
  'https://www.youtube.com/watch?v=MJ3e9EIr3f8',
  'https://www.youtube.com/watch?v=D-UmfqFjpl0',
]

export default async function w2gCommand(req: NextApiRequest) {
  try {
    let share =
      defaultVideos[Math.floor(Math.random() * defaultVideos.length)] || 'https://www.youtube.com/watch?v=D-UmfqFjpl0'
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
