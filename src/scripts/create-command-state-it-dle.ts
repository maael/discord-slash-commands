import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v10/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'stateitdle',
      description: 'Get your state-it-dle stats',
      type: 1,
      default_permission: true,
      options: [
        {
          name: 'time',
          description: 'When to get stats for, defaults to last month',
          type: 3,
          required: false,
        },
      ],
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
 {
  "id": "1215995434359586826",
  "application_id": "850402324421279774",
  "version": "1215995434359586827",
  "default_member_permissions": null,
  "type": 1,
  "name": "stateitdle",
  "name_localizations": null,
  "description": "Get your state-it-dle stats",
  "description_localizations": null,
  "dm_permission": true,
  "contexts": null,
  "integration_types": [
    0
  ],
  "options": [
    {
      "type": 3,
      "name": "time",
      "name_localizations": null,
      "description": "When to get stats for, defaults to last month",
      "description_localizations": null
    }
  ],
  "nsfw": false
}
 */
