import { parse, format, eachDayOfInterval, isEqual } from 'date-fns'
import { EmbedBuilder } from 'discord.js'
import { MongoClient, ReturnDocument } from 'mongodb'

function getRangeFromTitle(title: string) {
  const [from, to] = title
    .replace(' to ', '-')
    .replace(/[a-zA-Z ]/g, '')
    .trim()
    .split('-')
    .map((i) => parse(i, 'dd/MM/yy', new Date()))
  return { from, to }
}

function parseDate(str: string) {
  return parse(str, 'yyyy-MM-dd', new Date())
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
    const example = new EmbedBuilder()
      .setTitle(
        `Dates for ${format(parseDate(result.from), 'EEEE dd/MM/yy')} to ${format(
          parseDate(result.to),
          'EEEE dd/MM/yy'
        )}`
      )
      .setAuthor({ name: 'Hobby Scheduler' })
      .addFields(
        Object.entries(result.dates)
          .map(([d, v]: any) => ({
            name: `${format(d, 'dd/MM - EEEE')}`,
            value: `${
              v.length === 0
                ? ':red_circle:'
                : v.length === result.members.length
                ? ':green_circle:'
                : ':orange_circle:'
            } - ${v.length}/${result.members.length}`,
          }))
          .concat([
            {
              name: 'Voted',
              value: [...voted].map((m) => `<@${m}>`).join(', ') || 'No one',
            },
            {
              name: 'Waiting on',
              value:
                result.members
                  .filter((m) => !voted.has(m))
                  .map((m) => `<@${m}>`)
                  .join(', ') || 'No one',
            },
          ])
      )
    console.info('updating to', example.toJSON())
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
