import Cors from 'micro-cors'

export const cors = Cors({
  allowedMethods: ['GET', 'HEAD'],
})
