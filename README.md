# AppId-DB

API for mapping game/app IDs between PC gaming storefronts.

TLDR: If you have a Steam AppID / Epic AppName / etc., this API helps you find the same game on other platforms.

## Public instance

This repository includes the source code to host your own instance of this API. It does not include App IDs itself. We
(the Heroic Games Launcher project) plan on hosting a public instance of this API soon.

# API Documentation

## Rate-limits

Any client (IP address) may not submit more than 5 requests per minute

> [!TIP]
> This rate limit is experimental and might be increased in the future.

## v1

### Endpoints

#### `/v1/lookup/<platform>/<appId>`

Look up a game ID in the database.  
Returns a `Game` object.

Example: Looking up Counter-Strike:  
`/v1/lookup/steam/10`  
⬇️

```json
{
  "title": "Counter-Strike",
  "platforms": {
    "steam": [
      "10"
    ]
  }
}
```

#### `/v1/all`

Returns all games in the database as a `Game[]`

Example:
```json
[
  {
    "title": "Counter-Strike",
    "platforms": {
      "steam": [
        "10"
      ]
    }
  }
]
```

### Types

#### `Game`

```ts
interface Game {
    title: string
    platforms: Record<string, string[]>
}
```
Note: Platform slugs (keys for the `platforms` record property) are not detailed here as they're defined by the database of
the instance. Contact your instance hoster for details on which platforms they support.

## Administration

### First-time setup

1. Make sure `pnpm` is installed & a MySQL server is running
2. Clone the repo
3. Run `pnpm install`
4. If you want to use a custom DB configuration, copy `.env.example` to `.env` and edit it
5. Execute `meta/create_db.sql` on your server to create the tables accessed by this API  
   Note: While this script has to be run with write permissions, the DB user used by the API only needs to be able to
   read the respective tables.
6. Run `pnpm start` to start the server

### Adding platforms

To add a new platform, add a row to the `t_platforms` table.
- `slug` should be a unique identifier for the platform (e.g. `steam`/`epic`/`gog`)
- `name` should be a descriptive name of the platform.  
  Note: `name` is currently unused, although a "Look up all platforms" endpoint might be implemented soon

### Adding games

To add a new game, add a row to the `t_games` table.
- `title` should be a recognizable title of the game. If a game has multiple titles, you might want to use the
  most generic/recognizable one.

### Adding game IDs

To add IDs for a previously added game & platform combo, add a row to the `t_platform_ids` table.
- `game_id` and `platform_id` are IDs of the respective game & platform in the tables detailed above
- `id_on_platform` should be a platform-specific unique ID of the game on the respective platform.  
  Note: What exactly qualifies as a "platform-specific unique ID" is up to you.
