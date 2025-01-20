import 'dotenv/config'
import express from 'express'

import registerMiddleware from './middleware'
import registerV1Api from './api/v1'

const app = express()

registerMiddleware(app)

registerV1Api(app)

const port = process.env['PORT'] ?? 8000

app.listen(port, () => {
  console.log(`AppId-DB running on port ${port}`)
})
