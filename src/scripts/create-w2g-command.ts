import fetch from 'isomorphic-fetch'

const APP_ID = '850402324421279774'

;(async () => {
  const res = await fetch(`https://discord.com/api/v8/applications/${APP_ID}/commands`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'w2g',
      description: 'Create a Watch2Gether room',
      options: [
        {
          name: 'Initial video',
          description: 'The initial video for the room.',
          type: 3,
          required: false,
        },
      ],
    }),
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
  })

  console.info(await res.json())
})().catch((e) => console.error(e))
