import { NextApiHandler } from 'next'
import FormData from 'form-data'

/**
 * @param req Test Dall-E:
 * curl http://localhost:3000/api/dalle -H "Content-Type: application/json" -X POST -d '{"text":"coffee","images": 1,"token": "aW50ZXJhY3Rpb246OTg3ODk3MDY2MzY3ODg5NDQ4Ojdxa0lYYk1qSzBUQ0pITGQ5UWoxbVZBWUYwYnZlM2p1VnoyUXVRYW9CTjFJVThqVzhFTTN3RllpZGtudnJrd3RCY1V1ejgzTm1UM2s3UzY0QnJBcGVnTFJ1TXpYYmJNTmtBRnJvOEdlRVdhUXF0RWlHREZzeUZlR05JaVZlTnlo","id":"987897066367889448"}'
 */

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    console.info('[raw]', req.body)
    console.info('[dalle raw]', typeof req.body, req.body)
    const body = req.body
    console.info('[dalle parsed]', typeof body, body, `${process.env.DALLE_URL}/dalle`)
    const ackUrl = `https://discord.com/api/v10/webhooks/850402324421279774/${body.token}/messages/@original`
    try {
      const data = await fetch(`${process.env.DALLE_URL}/dalle`, {
        method: 'POST',
        body: JSON.stringify({
          text: body.text,
          num_images: body.images,
        }),
      }).then((res) => res.json())
      console.info('[result]', typeof data, data.length)
      console.info('[result:string]', JSON.stringify(data).substring(0, 200))
      if (typeof data === 'number' && data === 404) {
        console.error('dalle down')
        await fetch(ackUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'Dall-E service is down!',
          }),
        })
        res.status(500).json({ err: 'Dall-E service down' })
        return
      }
      const image = `data:image/png;base64,${data.generatedImgs[0]}`
      // console.info('[image]', image)
      const imageBuf = Buffer.from(data.generatedImgs[0], 'base64')
      const form = new FormData()
      const filename = `${(Math.random() * 100000).toFixed(0)}.png`
      form.append('files[0]', imageBuf, filename)
      const payload = JSON.stringify({
        content: body.hide ? 'Art:' : body.text,
      })
      form.append('payload_json', payload)

      // console.info('[form]', form.getBuffer().toString('utf-8'))

      console.info('[payload]', payload)

      console.info('[headers]')
      console.info(form.getHeaders())
      console.info('[start req]')
      const fetchRes = await fetch(ackUrl, {
        method: 'PATCH',
        headers: {
          ...form.getHeaders(),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: form.getBuffer(),
      })
      console.info('[end req]')
      if (!fetchRes.ok) {
        const err = await fetchRes.json()
        console.info('[error]', fetchRes.status, err, JSON.stringify(err, undefined, 2))
        await fetch(ackUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'Something went wrong!',
          }),
        })
        res.status(500).json({ image, err })
      } else {
        console.info(`[ack]`, ackUrl)
        res.status(200).json({ image })
      }
    } catch (e) {
      console.error('[error]', e)
      try {
        await fetch(ackUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'Something went wrong!',
          }),
        })
      } finally {
        res.status(500).json({ error: e.message })
      }
    }
  } else {
    res.status(401).json({ error: 'Not implemented' })
  }
}

export default handler
