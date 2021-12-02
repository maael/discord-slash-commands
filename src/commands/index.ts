import { NextApiRequest } from 'next'
import w2g from './w2g'
import voicernd from './voicernd'
import ffxivurl from './ffxivurl'

const commands: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: { fn: (req: NextApiRequest) => Promise<any>; options?: string; description: string }
} = {
  w2g: {
    fn: w2g,
    options: '[url?]',
    description: 'Post a link to a watch2gether room, optionally pass a url for a video too',
  },
  voicernd: {
    fn: voicernd,
    description: 'Get a random person in a voice channel',
  },
  ffxivurl: {
    fn: ffxivurl,
    description: 'Get the lodestone link for a user',
  },
}

export default commands
