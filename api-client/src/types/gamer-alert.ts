export interface Server {
    server_id: number,
    command_prefix: string,
    alert_webhook: string|null,
    alert_image_url: string|null, 
    time_zone: string,
}

export interface User {
    discord_id: number,
    league_username: string,
    daily_time_limit: number|null,
    time_zone: string|null
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
    champion: string,
    champion_picture: string
}

export interface FinishedGame {
    id: string,
    session_id: string,
    match_id: number,
    game_type: string,
    start_time: number,
    end_time: number,
    kills: number,
    deaths: number,
    assists: number,
    cs: number,
    win: boolean,
    champion: string,
    champion_picture: string
}

export interface GameJob {
    id: string,
    game_id: string,
    league_name: string,
    match_id: number,
    discord_id: number
}

export interface FetchedGames {
    timezone: string,
    games: Array<FinishedGame>
}

export interface Day {
    timestamp: string,
    discord_id: string,
    play_time: number,
    time_limit: number,
    time_exceeded: boolean
}
