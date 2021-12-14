import { NextApiHandler } from 'next'
import { cors } from '../../util'

const TWITCH_TOKEN = process.env.TWITCH_TOKEN

async function getYoutubeLive(channel: string) {
  const channelLink = `https://www.youtube.com/c/${encodeURIComponent(channel)}`
  const result = await fetch(channelLink).then((r) => r.text())
  const data = result.match(/var ytInitialData = (?<data>{[\s\S]+?)<\/script>/)
  const obj = data?.groups?.data?.slice(0, -1)
  let resultData: any = null
  try {
    let liveItem: any = null
    JSON.parse(obj || '{}').contents?.twoColumnBrowseResultsRenderer?.tabs?.some((t) =>
      t.tabRenderer?.content?.sectionListRenderer?.contents?.some((c1) =>
        c1.itemSectionRenderer?.contents?.some(
          (c2) =>
            c2.channelFeaturedContentRenderer &&
            c2.channelFeaturedContentRenderer.items.some((i) => {
              const result = i.videoRenderer.thumbnailOverlays.some(
                (to) => to.thumbnailOverlayTimeStatusRenderer.style === 'LIVE'
              )
              if (result) liveItem = i.videoRenderer
              return result
            })
        )
      )
    )
    const isLive = !!liveItem
    if (isLive) {
      const title = liveItem.title.runs.map((r) => r.text).join('')
      const viewCount = liveItem.viewCountText.runs.map((r) => r.text).join('')
      const thumbnail = liveItem.thumbnail.thumbnails[0].url
      const description = liveItem.descriptionSnippet.runs.map((r) => r.text).join('')
      const url = `https://youtube.com${liveItem.navigationEndpoint.commandMetadata.webCommandMetadata.url}`
      resultData = { title, viewCount, thumbnail, description, channel, url }
    }
  } catch (e) {
    // Do nothing
    console.info('[e]', channel, e)
  }
  return {
    channel,
    isLive: !!resultData,
    type: 'youtube',
    link: channelLink,
    data: resultData,
  }
}

async function getTwitchLive(users: string[]) {
  const result = await fetch(`https://api.twitch.tv/helix/streams?${users.map((u) => `user_login=${u}`).join('&')}`, {
    headers: {
      Authorization: `Bearer ${TWITCH_TOKEN}`,
      'Client-Id': 'vb8ha1dif8a1c9j82rj1npd78gex9j',
    },
  })
    .then((r) => r.json())
    .then((r) => r.data)
  if (typeof result !== 'object' || !Array.isArray(result)) {
    console.error('Got:', result)
    return []
  }
  return users.map((u) => {
    const data = result.find((r) => r.user_login === u && r.type === 'live')
    let resultData: any = null
    if (data) {
      resultData = {
        title: data.title,
        viewCount: `${data.viewer_count} watching`,
        thumbnail: data.thumbnail_url.replace('{width}', 168).replace('{height}', 94),
        description: '',
        channel: u,
        url: `https://twitch.tv/${u}`,
        game: data.game_name,
      }
    }
    return {
      channel: u,
      type: 'twitch',
      isLive: !!data,
      link: `https://twitch.tv/${u}`,
      data: resultData,
    }
  })
}

const handler: NextApiHandler = async (req, res) => {
  const youtubeChannels = (req.query.youtube || '')
    .toString()
    .split(',')
    .map((i) => decodeURIComponent(i.trim()))
    .filter(Boolean)
  const twitchUsers = (req.query.twitch || '')
    .toString()
    .split(',')
    .map((i) => decodeURIComponent(i.trim()))
    .filter(Boolean)
  const [youtube, twitch] = await Promise.all([
    Promise.all(youtubeChannels.map(getYoutubeLive)),
    getTwitchLive(twitchUsers),
  ])
  res.json({ result: youtube.concat(twitch) })
}

export default cors(handler)
