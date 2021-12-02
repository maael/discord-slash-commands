import { NextApiRequest } from 'next'

const MAPPINGS = {
  205029003436883969: 'https://eu.finalfantasyxiv.com/lodestone/character/12321845/', // Az
  185741150714331136: 'https://eu.finalfantasyxiv.com/lodestone/character/14879062/', // Luke
  200609450858381312: 'https://eu.finalfantasyxiv.com/lodestone/character/8341320/', // Sarah
  176823052468748288: 'https://eu.finalfantasyxiv.com/lodestone/character/13394859/', // Connor
  124130336685686784: 'https://eu.finalfantasyxiv.com/lodestone/character/11800637/', // Jack
  185735063860805632: 'https://eu.finalfantasyxiv.com/lodestone/character/14881515/', // Ben W
  272791476340260865: 'https://eu.finalfantasyxiv.com/lodestone/character/35179190/', // Duncan
  454633594590068736: 'https://eu.finalfantasyxiv.com/lodestone/character/14898879/', // Ben A
  137678852628545539: 'https://eu.finalfantasyxiv.com/lodestone/character/14985627/', // Matt
}

export default async function ffxivurl(req: NextApiRequest) {
  let requestor
  let requested
  let requestedName
  try {
    console.info('[data]', JSON.stringify({ data: req.body.data, member: req.body.member }, undefined, 2))
    requestor = Number(req.body.member.user.id)
    requested = Number(req.body.data.target_id)
    requestedName = Object.values<any>(req.body.data.resolved.users)[0].username
  } catch (e) {
    console.error('[error]', e)
    // Do nothing
  }

  console.info('[ffxiv:url]', { requestor, requested, url: MAPPINGS[requested], requestedName })

  if (MAPPINGS[requested]) {
    return {
      type: 4,
      flags: 64,
      data: {
        content: `${requestedName}: ${MAPPINGS[requested]}`,
      },
    }
  } else {
    return {
      type: 4,
      flags: 64,
      data: {
        content: "Couldn't find the a character for the user",
      },
    }
  }
}
