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
    Buffer.from(timestamp + body) as any,
    Buffer.from(signature, 'hex') as any,
    Buffer.from(process.env.CLIENT_PUBLIC_KEY || '', 'hex') as any
  )

  return isVerified
}

const handler: NextApiHandler = async (req, res) => {
  console.info('[start]')
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
    query: req.query,
  })
  const isValidRequest = verify(req)
  if (!isValidRequest) {
    console.info('[response:0][invalid]', { signature, timestamp, key: process.env.CLIENT_PUBLIC_KEY })
    res.status(401).end('Bad request signature')
    return
  }
  const { type } = req.body
  try {
    if (type === 1) {
      console.info('[response:1]', { type: 1 })
      res.json({ type: 1 })
      return
    } else if (type === 3) {
      const interactionName = req.body.data.custom_id.split('--').at(0)
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
        console.info('[command][slash][start]', type, req.body.data.name)
        const result = await command.fn(req)
        console.info('[command][slash][end]', type, req.body.data.name, { result })
        res.json(result)
        return
      } else {
        console.warn('[command:missing]', req.body.data.name, 'not in', Object.keys(commands))
        res.status(406)
        return
      }
    }
  } catch (e) {
    console.error('[command][error]', e)
    res.json({ type: 4, data: { content: 'Something went wrong, please try again' } })
  }
}

export default handler
