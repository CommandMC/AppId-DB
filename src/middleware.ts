import { existsSync } from 'fs'
import { join } from 'path'

import favicon from 'serve-favicon'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import type { Express } from 'express'

export default function registerMiddleware(app: Express) {
  const faviconPath = join('public', 'favicon.ico')
  if (existsSync(faviconPath)) app.use(favicon(faviconPath))

  app.use(
    rateLimit({
      skip: (req) => req.url.startsWith('/favicon'),
    }),
  )

  app.use(morgan('dev'))
}
