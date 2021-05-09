export interface Server {
    server_id: number,
    command_prefix: string,
    alert_webhook: string|null,
    alert_image_url: string|null, 
    time_offset: number,
}

export interface User {
    discord_id: number,
    league_username: string
}

export interface Session {
    id: string,
    discord_id: number,
    start_time: number,
    end_time: number|null
}

export interface Game {
    id: string,
    session_id: string,
    match_id: number,
    game_type: string,
    start_time: number,
    end_time: number|null,
    kills: number|null,
    deaths: number|null,
    assists: number|null,
    cs: number|null,
    win: boolean|null,
    chamption: string
}

export interface PopulatedServer {
    server_id: number,
    command_prefix: string,
    alert_webhook: string|null,
    alert_image_url: string|null, 
    time_offset: number,
    members: Array<User>
}

export interface GameJob {
    id: string,
    game_id: string,
    league_name: string,
    match_id: number
}
