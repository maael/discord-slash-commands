import { NextApiRequest } from 'next'
import { APIInteractionResponse } from 'discord-api-types/v10'

// const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function asyncCommand(_req: NextApiRequest): Promise<APIInteractionResponse> {
  // void sendDeferredMessage(req.body)
  console.info('[async] Running')
  return {
    type: 4,
    data: {
      content: 'Something fucked up.',
    },
  }
}

// async function sendDeferredMessage(_body: any) {
//   await wait(2_000)
//   console.info('sending deferred')
// }
