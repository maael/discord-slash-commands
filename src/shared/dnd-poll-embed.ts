import { format, parse } from 'date-fns'
import { EmbedBuilder } from 'discord.js'

export function getDiscordEmbedFromDbResult(result: any) {
  console.info({ result })
  const voted = new Set(Object.values(result.dates).flat(1))
  const embedopen = new EmbedBuilder()
    .setTitle(
      `Dates for ${format(parseDate(result.from), 'EEEE dd/MM/yy')} to ${format(parseDate(result.to), 'EEEE dd/MM/yy')}`
    )
    .setAuthor({ name: 'Hobby Scheduler' })
    .addFields(
      Object.entries(result.dates)
        .map(([d, v]: any) => ({
          name: `${
            v.length === 0 ? ':red_circle:' : v.length === result.members.length ? ':green_circle:' : ':orange_circle:'
          } ${format(d, 'dd/MM - EEEE')}`,
          value: [`${v.length}/${result.members.length}`, `${v.map((m) => `<@${m}>`).join(', ')}`]
            .filter(Boolean)
            .join(' - '),
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

  return embedopen
}

export function parseDate(str: string) {
  return parse(str, 'yyyy-MM-dd', new Date())
}
