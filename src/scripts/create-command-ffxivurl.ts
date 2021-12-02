import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'ffxivurl',
      type: 2, // User command
      default_permission: true,
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
  "id": "915772213523783690",
  "application_id": "850402324421279774",
  "version": "915772213523783691",
  "default_permission": true,
  "default_member_permissions": null,
  "type": 2,
  "name": "ffxivurl",
  "name_localizations": null,
  "description": "",
  "description_localizations": null,
  "dm_permission": null
}
 */
