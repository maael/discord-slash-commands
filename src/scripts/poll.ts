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
import { parse } from 'date-fns'
import { addDays } from 'date-fns/addDays'
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval'
import { format } from 'date-fns/format'
import { Client, Events, GatewayIntentBits, ActionRowBuilder, EmbedBuilder, TextChannel } from 'discord.js'
import { MongoClient } from 'mongodb'
;(async () => {
  console.info('[start]')
  await sendMessage()
  console.info('[end]')
})().catch((e) => console.error('[error]', e))

function getDays() {
  const current = new Date()
  return eachDayOfInterval({ start: current, end: addDays(current, 13) })
}

function parseDate(str: string) {
  return parse(str, 'yyyy-MM-dd', new Date())
}

async function sendMessage() {
  const client = await getClient()
  const channel = (await client.channels.fetch(process.env.DISCORD_DND_POLL_CHANNEL!)) as TextChannel
  const days = getDays()
  const result = await createDbRecord(days)
  const voted = new Set(Object.values(result.dates).flat(1))
  const embedopen = new EmbedBuilder()
    .setTitle(
      `Dates for ${format(parseDate(result.from), 'EEEE dd/MM/yy')} to ${format(parseDate(result.to), 'EEEE dd/MM/yy')}`
    )
    .setAuthor({ name: 'Hobby Scheduler' })
    .addFields(
      Object.entries(result.dates)
        .map(([d, v]: any) => ({
          name: `${format(d, 'dd/MM - EEEE')}`,
          value: `${
            v.length === 0 ? ':red_circle:' : v.length === result.members.length ? ':green_circle:' : ':orange_circle:'
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
  console.info({ result })
  await client.destroy()
}

async function createDbRecord(days: Date[]) {
  const from = format(days.at(0)!, 'yyyy-MM-dd')
  const to = format(days.at(-1)!, 'yyyy-MM-dd')
  const client = new MongoClient(process.env.MONGODB_URI!)
  const database = client.db('discord')
  const scheduling = database.collection<any>('hobby-scheduling')
  const result = await scheduling.findOneAndUpdate(
    { from, to },
    {
      $set: {
        from,
        to,
        dates: days.reduce((acc, d) => ({ ...acc, [format(d, 'yyyy-MM-dd')]: [] })),
        members: ['137678852628545539', '185741150714331136', '217741486115127297'],
      },
    },
    { upsert: true }
  )
  await client.close()
  return result
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
