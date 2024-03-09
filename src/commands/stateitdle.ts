import { NextApiRequest } from 'next'

export default async function stateitdle(req: NextApiRequest) {
  try {
    console.info('[data]', JSON.stringify(req.body, undefined, 2))
    return {
      type: 4,
      data: {
        content: `Yes`,
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
