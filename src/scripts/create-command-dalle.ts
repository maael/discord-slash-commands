import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'dalle',
      description: 'Create AI generated art with prompt',
      type: 1,
      default_permission: true,
      options: [
        {
          name: 'prompt',
          description: 'The prompt.',
          type: 3,
          required: true,
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
[result] {
  "id": "987798111911043083",
  "application_id": "850402324421279774",
  "version": "987799040626397254",
  "default_permission": true,
  "default_member_permissions": null,
  "type": 1,
  "name": "dalle",
  "name_localizations": null,
  "description": "Create AI generated art with prompt",
  "description_localizations": null,
  "dm_permission": true,
  "options": [
    {
      "type": 3,
      "name": "prompt",
      "name_localizations": null,
      "description": "The prompt.",
      "description_localizations": null,
      "required": true
    }
  ]
}
*/
