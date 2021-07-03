import w2g from './w2g'

const commands = {
  w2g: {
    fn: w2g,
    options: '[url?]',
    description: 'Post a link to a watch2gether room, optionally pass a url for a video too',
  },
}

export default commands
