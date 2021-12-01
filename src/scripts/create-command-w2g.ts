import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'w2g',
      description: 'Create a Watch2Gether room',
      type: 1,
      default_permission: true,
      options: [
        {
          name: 'initial',
          description: 'The initial video for the room.',
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
  "id": "850410940565815336",
  "application_id": "850402324421279774",
  "name": "w2g",
  "description": "Create a Watch2Gether room",
  "version": "850410940565815337",
  "default_permission": true,
  "options": [
    {
      "type": 3,
      "name": "initial",
      "description": "The initial video for the room."
    }
  ]
}
 */
