import { NextApiRequest } from 'next'

export default async function dalle(req: NextApiRequest) {
  try {
    console.info('[data]', JSON.stringify({ data: req.body }, undefined, 2))
  } catch (e) {
    console.error('[error]', e)
    // Do nothing
  }
  return {
    type: 4,
    data: {
      content: `Dalle`,
    },
  }
}
