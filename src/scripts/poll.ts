/**
 * # What
 * Creates polls on discords for 2 weeks of dates to decide attendence
 *
 * # Interactions
 * dnd-poll--yyyy-MM--dd
 *
 * # Env vars
 * DISCORD_DND_POLL_CHANNEL - channel to post to
 * DISCORD_TOKEN - token for the bot to post as
 */

import { addDays } from 'date-fns/addDays'
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval'
import { format } from 'date-fns/format'
import {
  Client,
  Events,
  GatewayIntentBits,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from 'discord.js'
;(async () => {
  console.info('[start]')
  await sendMessage()
  console.info('[end]')
})().catch((e) => console.error('[error]', e))

function chunkArray<T>(arr: T[], chunkSize: number) {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}

function getDays() {
  const current = new Date()
  return eachDayOfInterval({ start: current, end: addDays(current, 13) })
}

async function sendMessage() {
  const client = await getClient()
  const channel = (await client.channels.fetch(process.env.DISCORD_DND_POLL_CHANNEL!)) as TextChannel
  const days = getDays()
  const buttons = days.map((d) => {
    return new ButtonBuilder()
      .setCustomId(`dnd-poll--${format(d, 'yyyy-MM-dd')}`)
      .setLabel(format(d, 'EEEE dd/MM'))
      .setStyle(ButtonStyle.Primary)
  })
  const embedopen = new EmbedBuilder()
    .setTitle(`Dates for ${format(days.at(0)!, 'EEEE dd/MM/yy')} to ${format(days.at(-1)!, 'EEEE dd/MM/yy')}`)
    .setAuthor({ name: 'Hobby Scheduler' })
    .setDescription(
      `<@&1308871711885885450> click on any you can do, any days we can all do will have an event created!\n\n${chunkArray(
        days.map((d) => `${format(d, 'EEEE dd/MM')}\t - 0 / 5\n`),
        7
      )
        .map((ar) => ar.join(''))
        .join('\n')}

      Voted: No one
      Waiting on: <@137678852628545539>`
    )
  const rows = chunkArray(buttons, 5)
    .map((chunk) => new ActionRowBuilder<ButtonBuilder>().addComponents(...chunk))
    .slice(0, 5)
  const _message = await channel.send({
    embeds: [embedopen],
    components: rows,
  })
  client.destroy()
}

async function getClient() {
  return new Promise<Client<true>>((resolve) => {
    const client = new Client({
      intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    })
    client.once(Events.ClientReady, (readyClient) => {
      console.log(`Ready! Logged in as ${readyClient.user.tag}`)
      resolve(readyClient)
    })
    client.login(process.env.DISCORD_TOKEN)
  })
}
