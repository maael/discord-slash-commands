import { NextApiHandler, NextApiRequest } from 'next'
import fetch from 'isomorphic-fetch'
import nacl from 'tweetnacl'
import commands from '../../commands'

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
    const command = commands[req.body.data.name]
    if (command) {
      console.info('[command]', req.body.data.name)
      const result = await command.fn(req)
      res.json(result)
    } else {
      console.warn('[command:missing]', req.body.data.name)
    }
  }
}

export default handler
