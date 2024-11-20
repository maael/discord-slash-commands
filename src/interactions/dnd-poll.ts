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
  const example = new EmbedBuilder().setTitle(messageTitle).addFields(
    days
      .map((d) => ({
        name: `${format(d, 'dd/MM - EEEE')}`,
        value: `${selectedDates.some((s) => isEqual(d, s)) ? 1 : 0}/5 - :orange_circle:`,
      }))
      .concat([
        { name: 'Voted', value: `<@${body.member.user.id}>` },
        { name: 'Waiting on', value: 'No one' },
      ])
  )
  console.info('updating to', example.toJSON())
  return {
    type: 7,
    data: {
      embeds: [example.toJSON()],
    },
  }
}
