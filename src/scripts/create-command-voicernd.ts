import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'voicernd',
      description: 'Get a random person in a voice channel',
      type: 1,
      default_permission: true,
      options: [],
    }),
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  console.info('[result]', JSON.stringify(await res.json(), undefined, 2))
})().catch((e) => console.error(e))

/**
 * Command:
[result] {
  "id": "860842388884946976",
  "application_id": "850402324421279774",
  "name": "voicernd",
  "description": "Get a random person in a voice channel",
  "version": "860842388884946977",
  "default_permission": true,
  "type": 1
}
 */
