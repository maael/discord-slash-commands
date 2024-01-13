import { NextApiHandler, NextApiRequest } from 'next'
import nacl from 'tweetnacl'
import commands from '../../commands'
import interactions from '../../interactions'

function verify(req: NextApiRequest) {
  const signature = req.headers['x-signature-ed25519']?.toString() || ''
  const timestamp = req.headers['x-signature-timestamp']?.toString() || ''
  const body = JSON.stringify(req.body || {})

  const isVerified = nacl.sign.detached.verify(
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(process.env.CLIENT_PUBLIC_KEY || '', 'hex')
  )

  return isVerified
}

const handler: NextApiHandler = async (req, res) => {
  const signature = req.headers['x-signature-ed25519']?.toString()
  const timestamp = req.headers['x-signature-timestamp']?.toString()
  let bodyToLog = req.body
  try {
    bodyToLog = JSON.stringify(req.body)
  } catch {
    console.error('Error logging body')
  }
  console.info('[received]', {
    method: req.method,
    body: bodyToLog,
    type: req.body?.type,
    bodyType: typeof req.body,
  })
  console.info('[headers]', req.headers)
  const isValidRequest = verify(req)
  if (!isValidRequest) {
    console.info('[response:0][invalid]', { signature, timestamp, key: process.env.CLIENT_PUBLIC_KEY })
    res.status(401).end('Bad request signature')
    return
  }
  const { type } = req.body
  if (type === 1) {
    console.info('[response:1]', { type: 1 })
    res.json({ type: 1 })
    return
  } else if (type === 3) {
    const interactionName = req.body.data.custom_id
    const interaction = interactions[interactionName]
    console.info('[command][interaction]', { type, interactionName, hasAction: !!interaction })
    if (interaction) {
      const result = await interaction(req.body)
      res.json(result)
      return
    } else {
      console.warn('[command][interaction][missing]', interactionName)
      res.status(406)
    }
  } else if (type === 2) {
    const command = commands[req.body.data.name]
    if (command) {
      console.info('[command][slash]', type, req.body.data.name)
      const result = await command.fn(req)
      res.json(result)
      return
    } else {
      console.warn('[command:missing]', req.body.data.name)
      res.status(406)
      return
    }
  }
}

export default handler
