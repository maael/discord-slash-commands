import { NextApiRequest } from 'next'
import { InteractionResponseType } from 'discord-api-types/v10'

const wait = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function async(req: NextApiRequest) {
  void sendDeferredMessage(req.body)
  return {
    type: InteractionResponseType.DeferredChannelMessageWithSource,
  }
}

async function sendDeferredMessage(_body: any) {
  await wait(2_000)
  console.info('sending deferred')
}
