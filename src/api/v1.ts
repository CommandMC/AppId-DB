import type { Express } from 'express'

import DatabaseClient from '../db/client'

export default function register(app: Express) {
  app.get('/v1/lookup/:platform/:appId', async (req, res) => {
    const id = req.params.appId
    const platform = req.params.platform
    if (!id || !platform) {
      res.status(400).end()
      return
    }

    const match = await DatabaseClient.get().search_id(platform, id)
    if (!match) {
      res.status(404).end()
      return
    }

    res.json(match).end()
  })

  app.get('/v1/all', async (_req, res) => {
    const allEntries = await DatabaseClient.get().get_all()
    allEntries ? res.json(allEntries).end() : res.status(500).end()
  })
}
