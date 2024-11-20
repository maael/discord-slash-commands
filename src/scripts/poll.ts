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

import { SelectMenuBuilder } from '@discordjs/builders'
import { addDays } from 'date-fns/addDays'
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval'
import { format } from 'date-fns/format'
import { Client, Events, GatewayIntentBits, ActionRowBuilder, EmbedBuilder, TextChannel } from 'discord.js'
;(async () => {
  console.info('[start]')
  await sendMessage()
  console.info('[end]')
})().catch((e) => console.error('[error]', e))

function getDays() {
  const current = new Date()
  return eachDayOfInterval({ start: current, end: addDays(current, 13) })
}

async function sendMessage() {
  const client = await getClient()
  const channel = (await client.channels.fetch(process.env.DISCORD_DND_POLL_CHANNEL!)) as TextChannel
  const days = getDays()
  const embedopen = new EmbedBuilder()
    .setTitle(`Dates for ${format(days.at(0)!, 'EEEE dd/MM/yy')} to ${format(days.at(-1)!, 'EEEE dd/MM/yy')}`)
    .setAuthor({ name: 'Hobby Scheduler' })
    .addFields(
      days
        .map((d) => ({ name: `${format(d, 'dd/MM - EEEE')}`, value: `0/5 - :orange_circle:` }))
        .concat([
          { name: 'Voted', value: 'No one' },
          { name: 'Waiting on', value: '<@137678852628545539>' },
        ])
    )
  const _message = await channel.send({
    embeds: [embedopen],
    components: [
      new ActionRowBuilder<SelectMenuBuilder>().addComponents(
        new SelectMenuBuilder({
          custom_id: 'dnd-poll',
          placeholder: 'Select dates',
          max_values: 14,
          min_values: 0,
          options: days.map((d) => ({ label: format(d, 'dd/MM - EEEE'), value: format(d, 'yyyy-MM-dd') })),
        })
      ),
    ],
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
