import { parse, format, eachDayOfInterval, isEqual } from 'date-fns'
import { google } from 'googleapis'
import { MongoClient, ReturnDocument } from 'mongodb'
import { getDiscordEmbedFromDbResult, parseDate } from '../shared/dnd-poll-embed'

function getRangeFromTitle(title: string) {
  const [from, to] = title
    .replace(' to ', '-')
    .replace(/[a-zA-Z ]/g, '')
    .trim()
    .split('-')
    .map((i) => parse(i, 'dd/MM/yy', new Date()))
  return { from, to }
}

function getDays(start, end) {
  return eachDayOfInterval({ start, end })
}

export async function handleDndPoll(body) {
  try {
    const messageTitle = body.message.embeds.at(0).title
    const messageDateRange = getRangeFromTitle(messageTitle)
    const messageDescription = body.message.embeds.at(0).description
    console.info('dnd-poll', {
      channel: body.message.channel_id,
      message: body.message.id,
      username: body.member.user.username,
      userId: body.member.user.id,
      messageTitle,
      messageDateRange,
      messageDescription,
      values: body.data.values,
      api: {
        id: body.id,
        token: body.token,
      },
    })
    const result = await updateAndGetScheduling(
      messageDateRange.from,
      messageDateRange.to,
      body.member.user.id,
      body.data.values
    )
    if (!result) {
      throw new Error('Missing schedule')
    }
    const voted = new Set(Object.values(result.dates).flat(1))
    const example = getDiscordEmbedFromDbResult(result)
    console.info('updating to', example.toJSON())
    if (voted.size === result.members.length) {
      console.info('creating event')
      try {
        const client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          'http://localhost'
        )
        client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
        const calendarClient = await google.calendar({ version: 'v3', auth: client })
        const dndCalendarId =
          '59e6458ee4e5125d656a4213870ef723a2a69e4b7fa14bed34cdb4039c99801e@group.calendar.google.com'
        const event = {
          summary: 'DnD',
          description: 'Time to roll some dice.',
          start: {
            dateTime: '2024-11-22T19:00:00-00:00',
            timeZone: 'Europe/London',
          },
          end: {
            dateTime: '2024-11-22T22:00:00-00:00',
            timeZone: 'Europe/London',
          },
          // TODO: Add everyone's emails
          attendees: [{ email: 'matt.a.elphy@gmail.com' }],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 60 },
            ],
          },
        }
        const response = await calendarClient.events.insert({
          calendarId: dndCalendarId,
          resource: event,
        } as any)
        if (response.status !== 200) {
          throw new Error(`Unexpected status: ${response.status}`)
        }
      } catch (e) {
        console.error('Failed to create event', e)
      }
    }
    return {
      type: 7,
      data: {
        embeds: [example.toJSON()],
      },
    }
  } catch (e: unknown) {
    return {
      type: 4,
      data: {
        content: `An error occurred: ${(e as Error).message}`,
      },
    }
  }
}

function toUpdateObject(keys: Date[], value: string | string[]) {
  return keys.reduce((acc, k) => ({ ...acc, [`dates.${format(k, 'yyyy-MM-dd')}`]: value }), {})
}

async function updateAndGetScheduling(from, to, userId, values) {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!)
    const database = client.db('discord')
    const scheduling = database.collection<any>('hobby-scheduling')
    const allDays = getDays(from, to)
    const votedFor = values.map(parseDate)
    const notVotedFor = allDays.filter((d) => !votedFor.some((v) => isEqual(v, d)))
    console.info('votes', { votedFor, notVotedFor })
    const update = {
      $addToSet: toUpdateObject(votedFor, userId),
      $pullAll: toUpdateObject(notVotedFor, [userId]),
    }
    console.info('update', JSON.stringify({ update }))
    const result = await scheduling.findOneAndUpdate(
      { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') },
      update,
      { upsert: true, returnDocument: ReturnDocument.AFTER }
    )
    console.info('result', JSON.stringify({ result }))
    await client.close()
    return result
  } catch (e) {
    console.error(e)
    return null
  }
}
