export default {
  'stateit-guess': async (body) => {
    console.info('[interaction][stateit-guess]', { member: body.member, values: body.data.values })
    return {
      type: 4,
      data: {
        content: `${body?.member?.user?.id ? `<@${body?.member?.user?.id}>` : 'You'} guessed <@${
          body.data.values[0]
        }>!`,
      },
    }
  },
}
