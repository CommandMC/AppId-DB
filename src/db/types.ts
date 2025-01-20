interface t_platform_ids {
  game_id: number
  platform_id: number
  id_on_platform: string
}

interface t_games {
  id: number
  title: string
}

interface t_platforms {
  id: number
  slug: string
  name: string
}

export type { t_platform_ids, t_games, t_platforms }
