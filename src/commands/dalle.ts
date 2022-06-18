import { NextApiRequest } from 'next'
import fetch from 'isomorphic-fetch'

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function dalle(req: NextApiRequest) {
  try {
    console.info('[data]', JSON.stringify(req.body, undefined, 2))
    const { prompt: input, hide = false } = req.body.data.options.reduce(
      (acc, ob) => ({ ...acc, [ob.name]: ob.value }),
      {}
    )
    console.info('[input]', input)
    console.info('[url]', process.env.DALLE_URL)
    await Promise.race([
      fetch(`https://${req.headers.host}/api/dalle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: req.body.token,
          id: req.body.id,
          text: input,
          images: 1,
          hide,
        }),
      }),
      wait(2_000),
    ])
    console.info('[requested]', `https://${req.headers.host}/api/dalle`)
    return {
      type: 5,
      data: {
        content: `🎨 Generating 🎨`,
      },
    }
  } catch (e) {
    console.error('[error]', e)
    // Do nothing
    return {
      type: 4,
      data: {
        content: `[error]: ${e.message}`,
      },
    }
  }
}
