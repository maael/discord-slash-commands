import { MongoClient } from 'mongodb'
import { NextApiRequest } from 'next'
import { StateItGuess } from '../types'
import { format } from 'date-fns/format'
import { subMonths } from 'date-fns/subMonths'

function getUserEntry(acc, user) {
  acc[user] = acc[user] || {
    guesses: 0,
    correct: 0,
    highestStreak: 0,
    lastGuessDay: '',
    highestCorrectStreak: 0,
    lastCorrectGuessDay: '',
    timesGuessedByOthers: 0,
    timesGuessedSelf: 0,
    timesGuessedSelfCorrectly: 0,
    timesGuessedSelfIncorrectly: 0,
  }
  return acc[user]
}

function capitalize(str) {
  return `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`
}

export default async function stateitdle(req: NextApiRequest) {
  try {
    const user = req.body.member.user.id
    const time = req.body.data.options?.at(0)?.value
    console.info('[data]', user, time)
    let client: MongoClient | null = null
    try {
      client = new MongoClient(process.env.MONGODB_URI!)
      const database = client.db('discord')
      const stateItGuesses = database.collection<StateItGuess>('state-it-guesses')
      const monthDayString = format(subMonths(new Date(), 1), '/MM/yy')
      const result = await stateItGuesses.find({ day: { $regex: new RegExp(`..${monthDayString}`) } }).toArray()
      const stats = result.reduce((acc, day) => {
        Object.entries(day.guesses).forEach(([user, guess]) => {
          acc[user] = getUserEntry(acc, user)

          acc[user].guesses += 1

          const wasCorrect = day.answer === guess
          const currentGuessDay = day.day.split('/')[0]

          if (wasCorrect) {
            acc[user].correct += 1
            if (!acc[user].lastGuessDay) {
              acc[user].highestCorrectStreak = 1
            } else if (Number(currentGuessDay) - Number(acc[user].lastCorrectGuessDay) === 1) {
              acc[user].highestCorrectStreak += 1
            }
            acc[user].lastCorrectGuessDay = currentGuessDay
          }

          if (!acc[user].lastGuessDay) {
            acc[user].highestStreak = 1
          } else if (Number(currentGuessDay) - Number(acc[user].lastGuessDay) === 1) {
            acc[user].highestStreak += 1
          }

          if (user === guess) {
            acc[user].timesGuessedSelf += 1
            if (wasCorrect) {
              acc[user].timesGuessedSelfCorrectly += 1
            } else {
              acc[user].timesGuessedSelfIncorrectly += 1
            }
          } else {
            const guessedUser = getUserEntry(acc, guess)
            guessedUser.timesGuessedByOthers += 1
          }

          acc[user].lastGuessDay = currentGuessDay
        })
        return acc
      }, {})

      const embellishedStats = Object.fromEntries(
        Object.entries<any>(stats).map(([k, v]) => [
          k,
          { ...v, correctRate: v.guesses < 4 ? 0 : (v.correct / v.guesses) * 100 },
        ])
      )
      console.info('stats', embellishedStats)
      return {
        type: 4,
        data: {
          embeds: [
            {
              title: 'State-it-dle Stats',
              fields: [{ name: capitalize('exampleField'), value: 'Value', inline: true }],
            },
          ],
        },
      }
    } catch (e) {
      console.error('[interaction][stateit-guess][mongo][error]', e)
      throw new Error('Error with database')
    } finally {
      if (client) await client.close()
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
