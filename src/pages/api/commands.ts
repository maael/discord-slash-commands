import { NextApiHandler, NextApiRequest } from 'next'
import fetch from 'isomorphic-fetch'
import nacl from 'tweetnacl'

function verify(req: NextApiRequest) {
  const signature = req.headers['x-signature-ed25519']?.toString() || ''
  const timestamp = req.headers['x-signature-timestamp']?.toString() || ''
  const body = JSON.stringify(req.body || '{}')

  const isVerified = nacl.sign.detached.verify(
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.CLIENT_PUBLIC_KEY!, 'hex')
  )

  return isVerified
}

const handler: NextApiHandler = async (req, res) => {
  const signature = req.headers['x-signature-ed25519']?.toString()
  const timestamp = req.headers['x-signature-timestamp']?.toString()
  let bodyToLog = req.body
  try {
    bodyToLog = JSON.stringify(req.body, undefined, 2)
  } catch {
    console.error('Error logging body')
  }
  console.info('[received]', { method: req.method, body: bodyToLog, bodyType: typeof req.body, headers: req.headers })
  const isValidRequest = verify(req)
  if (!isValidRequest) {
    console.info('[response:0]', { signature, timestamp, key: process.env.CLIENT_PUBLIC_KEY })
    return res.status(401).end('Bad request signature')
  }
  const { type } = req.body
  if (type === 1) {
    console.info('[response:1]', { type: 1 })
    return res.json({ type: 1 })
  } else {
    // if data.name === 'w2g'
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
          bg_opacity: '50',
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
      res.send(result)
    } catch {
      const result = {
        type: 4,
        data: {
          content: 'Something fucked up.',
        },
      }
      console.info('[response:3]', result)
      res.send(result)
    }
  }
}

export default handler
