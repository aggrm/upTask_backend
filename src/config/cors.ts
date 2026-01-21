import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const whiteList = [process.env.FRONTEND_URL]

    // Postman, tests, backend-to-backend
    if (!origin) {
      return callback(null, true)
    }

    if (whiteList.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
}