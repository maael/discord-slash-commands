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
  })
  const example = new EmbedBuilder().setTitle(messageTitle).setDescription(`${messageDescription}\nUpdated!`)
  console.info('updating to', JSON.stringify(body.message.embeds.at(0)), example.toJSON())
  return {
    type: 7,
    data: {
      embeds: [example.toJSON()],
    },
  }
}
