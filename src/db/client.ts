import mysql, { type PoolConnection, type Pool, type MysqlError } from 'mysql'
import type { t_games, t_platform_ids, t_platforms } from './types'

interface Game {
  title: string
  platforms: Record<string, string[]>
}

export default class DatabaseClient {
  static #instance: DatabaseClient | null = null
  #connectionPool: Pool

  private constructor() {
    this.#connectionPool = mysql.createPool({
      host: process.env['DB_HOST'] ?? 'localhost',
      user: process.env['DB_USER'] ?? 'appid_db_user',
      password: process.env['DB_PASSWORD'] ?? '',
      database: process.env['DB_DATABASE'] ?? 'appid_db',
    })
  }

  public static get(): DatabaseClient {
    if (DatabaseClient.#instance === null)
      DatabaseClient.#instance = new DatabaseClient()
    return DatabaseClient.#instance
  }

  public async search_id(
    platform: string,
    id_on_platform: string,
  ): Promise<Game | null> {
    const connectionOrError = await this.#get_connection()
    if (connectionOrError instanceof Error) {
      console.error(connectionOrError)
      return null
    }
    const connection = connectionOrError

    const internalGameOrError = await new Promise<
      MysqlError | (Pick<t_platform_ids, 'game_id'> & Pick<t_games, 'title'>)[]
    >((res) =>
      connection.query(
        {
          sql: `SELECT game_id, title FROM t_platform_ids
                INNER JOIN t_platforms ON platform_id = t_platforms.id AND slug = ?
                INNER JOIN t_games ON game_id = t_games.id
                WHERE id_on_platform = ?`,
        },
        [platform, id_on_platform],
        (err, results) => res(err ?? results),
      ),
    )
    if (internalGameOrError instanceof Error) {
      console.error(internalGameOrError)
      return null
    }
    const firstMatch = internalGameOrError[0]
    if (!firstMatch) return null

    const otherIdsOrError = await new Promise<
      | MysqlError
      | (Pick<t_platform_ids, 'id_on_platform'> & Pick<t_platforms, 'slug'>)[]
    >((res) =>
      connection.query(
        {
          sql: `SELECT id_on_platform, slug
                FROM t_platform_ids
                INNER JOIN t_platforms ON t_platforms.id = t_platform_ids.platform_id
                WHERE game_id = ?`,
        },
        [firstMatch.game_id],
        (err, results) => res(err ?? results),
      ),
    )
    if (otherIdsOrError instanceof Error) {
      console.error(otherIdsOrError)
      return null
    }

    const game: Game = {
      title: firstMatch.title,
      platforms: {},
    }
    for (const id of otherIdsOrError) {
      game.platforms[id.slug] ??= []
      game.platforms[id.slug]!.push(id.id_on_platform)
    }
    return game
  }

  public async get_all(): Promise<Game[] | null> {
    const connectionOrError = await this.#get_connection()
    if (connectionOrError instanceof Error) {
      console.error(connectionOrError)
      return null
    }

    const allIds = await new Promise<
      | MysqlError
      | (Pick<t_games, 'title'> &
          Pick<t_platforms, 'slug'> &
          Pick<t_platform_ids, 'game_id' | 'id_on_platform'>)[]
    >((res) =>
      connectionOrError.query(
        {
          sql: `SELECT game_id, id_on_platform, slug, title
              FROM t_platform_ids
              INNER JOIN t_platforms ON t_platforms.id = platform_id
              INNER JOIN t_games ON t_games.id = game_id`,
        },
        (err, results) => res(err ?? results),
      ),
    )

    if (allIds instanceof Error) {
      console.error(allIds)
      return null
    }

    const grouped = Object.groupBy(allIds, (id) => id.game_id)
    const games: Game[] = []
    for (const entriesForSingleGame of Object.values(grouped)) {
      if (!entriesForSingleGame) continue
      const game: Game = {
        title: entriesForSingleGame[0]!.title,
        platforms: {},
      }
      for (const entry of entriesForSingleGame) {
        game.platforms[entry.slug] ??= []
        game.platforms[entry.slug]!.push(entry.id_on_platform)
      }
      games.push(game)
    }
    return games
  }

  async #get_connection(): Promise<PoolConnection | MysqlError> {
    return new Promise((res) =>
      this.#connectionPool.getConnection((err, connection) =>
        res(err ?? connection),
      ),
    )
  }
}
