export default {
  'stateit-guess': async (body) => {
    return {
      type: 4,
      data: {
        content: `<@${body.member.user.id}> guessed <@${body.data.values[0]}>!`,
      },
    }
  },
}
