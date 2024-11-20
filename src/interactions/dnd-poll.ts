import { eachDayOfInterval, parse, format, isEqual } from 'date-fns'
import { EmbedBuilder } from 'discord.js'

function getRangeFromTitle(title: string) {
  const [from, to] = title
    .replace(' to ', '-')
    .replace(/[a-zA-Z ]/g, '')
    .trim()
    .split('-')
  return { from, to }
}

function chunkArray<T>(arr: T[], chunkSize: number) {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}

export async function handleDndPoll(body) {
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
  const selectedDates = body.data.values.map((v) => parse(v, 'yyyy-MM-dd', new Date()))
  const days = eachDayOfInterval({
    start: parse(messageDateRange.from, 'dd/MM/yy', new Date()),
    end: parse(messageDateRange.to, 'dd/MM/yy', new Date()),
  })
  const updatedDescription = `<@&1308871711885885450> click on any you can do, any days we can all do will have an event created!\n\n${chunkArray(
    days.map(
      (d) => `${format(d, 'dd/MM - EEE')} - ${selectedDates.some((s) => isEqual(d, s)) ? 1 : 0}/5 - :orange_circle:\n`
    ),
    7
  )
    .map((ar) => ar.join(''))
    .join('\n')}

      Voted: <@${body.member.user.id}>
      Waiting on: No one`
  const example = new EmbedBuilder().setTitle(messageTitle).setDescription(updatedDescription)
  console.info('updating to', example.toJSON())
  return {
    type: 7,
    data: {
      embeds: [example.toJSON()],
    },
  }
}
