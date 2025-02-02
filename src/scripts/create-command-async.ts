import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'async',
      description: 'Testing async deferred responses',
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

// [result] {
//   "id": "1335567294499131495",
//   "application_id": "850402324421279774",
//   "version": "1335567294499131496",
//   "default_member_permissions": null,
//   "type": 1,
//   "name": "async",
//   "name_localizations": null,
//   "description": "Testing async deferred responses",
//   "description_localizations": null,
//   "dm_permission": true,
//   "contexts": null,
//   "integration_types": [
//     0
//   ],
//   "nsfw": false
// }
