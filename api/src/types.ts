export interface Server {
    server_id: bigint,
    alert_webhook: string|null,
    alert_image_url: string|null, 
    members?: Array<User>
}

export interface User {
    discord_id: bigint,
    league_username: string,
    time_zone: string|null,
    time_limit: number|null
}

export interface Session {
    id: string,
    discord_id: bigint,
    start_time: bigint,
    end_time: bigint|null
}

export interface Game {
    id: string,
    session_id: string,
    match_id: bigint,
    game_type: string,
    start_time: bigint,
    end_time: bigint|null,
    kills: number|null,
    deaths: number|null,
    assists: number|null,
    cs: number|null,
    win: boolean|null,
    champion: string,
    champion_picture: string
}

export interface GameJob {
    id: string,
    game_id: bigint,
    league_name: string,
    discord_id: bigint
}

export interface Day {
    timestamp: bigint,
    discord_id: bigint,
    play_time: number,
    time_limit: number,
    time_exceeded: boolean
}
