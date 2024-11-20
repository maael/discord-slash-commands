import { MongoClient } from 'mongodb'
import { format } from 'date-fns/format'
import { StateItGuess } from './types'
import { handleDndPoll } from './interactions/dnd-poll'

export default {
  'stateit-guess': async (body) => {
    const gameDay = format(new Date(body.message.timestamp), 'dd/MM/yy')
    console.info('[interaction][stateit-guess]', { gameDay, member: body.member, values: body.data.values })
    let client: MongoClient | null = null
    try {
      client = new MongoClient(process.env.MONGODB_URI!)
      const database = client.db('discord')
      const stateItGuesses = database.collection<StateItGuess>('state-it-guesses')
      await stateItGuesses.updateOne(
        { day: gameDay },
        { $set: { [`guesses.${body?.member?.user?.id}`]: `${body.data.values[0]}` } }
      )
    } catch (e) {
      console.error('[interaction][stateit-guess][mongo][error]', e)
    } finally {
      if (client) await client.close()
    }
    return {
      type: 4,
      data: {
        content: `${body?.member?.user?.id ? `<@${body?.member?.user?.id}>` : 'You'} guessed <@${
          body.data.values[0]
        }>!`,
      },
    }
  },
  'dnd-poll': handleDndPoll,
}
