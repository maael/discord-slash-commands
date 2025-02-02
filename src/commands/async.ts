import { NextApiRequest } from 'next'
import { APIInteractionResponse, InteractionResponseType } from 'discord-api-types/v10'

// const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function async(_req: NextApiRequest): Promise<APIInteractionResponse> {
  // void sendDeferredMessage(req.body)
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Testing async',
    },
  }
}

// async function sendDeferredMessage(_body: any) {
//   await wait(2_000)
//   console.info('sending deferred')
// }
