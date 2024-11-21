import fs from 'fs/promises'
import { google } from 'googleapis'
/**
 * For the google.auth.json, just make oauth credentials in google console and download the json file for them
 */
;(async () => {
  console.info('[start]')
  const authInfo = await fs.readFile('./google-auth.json', 'utf-8').then((d) => {
    const data = JSON.parse(d)
    return { ...data.installed, ...(data.tokens || {}) }
  })
  authInfo.code = process.env.CODE
  const client = makeOAuth2Client({ clientId: authInfo.client_id, clientSecret: authInfo.client_secret })
  if (authInfo.tokens) {
    console.info(`Found token: ${authInfo.tokens.refresh_token}`)
    client.setCredentials({ refresh_token: authInfo.tokens.refresh_token })
    const calendarClient = await google.calendar({ version: 'v3', auth: client })
    const { data: calendars, status } = await calendarClient.calendarList.list()
    const calendarId = calendars?.items?.find((i) => i.summary === 'DnD')?.id || ''
    console.info({ calendarId, status })
    const event = {
      summary: 'DnD',
      description: 'A test event created via the Google Calendar API.',
      start: {
        dateTime: '2024-11-22T09:00:00-00:00',
        timeZone: 'Europe/London',
      },
      end: {
        dateTime: '2024-11-22T10:00:00-00:00',
        timeZone: 'Europe/London',
      },
      attendees: [{ email: 'matt.a.elphy@gmail.com' }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    }
    const response = await calendarClient.events.insert({
      calendarId,
      resource: event,
    } as any)
    console.info(response.status)
  } else if (authInfo.code) {
    // Refresh token
    console.info(`Found code: ${authInfo.code}`)
    const token = await client.getToken(authInfo.code)
    console.info(`Got token: ${JSON.stringify(token)}`)
  } else {
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    })
    console.info(`Go to: ${url}`)
  }
  console.info('[end]')
})().catch((e) => console.error(e))

function makeOAuth2Client({ clientId, clientSecret }: { clientId: string; clientSecret: string }) {
  return new google.auth.OAuth2(
    /* YOUR_CLIENT_ID */ clientId,
    /* YOUR_CLIENT_SECRET */ clientSecret,
    /* YOUR_REDIRECT_URL */ 'http://localhost'
  )
}
