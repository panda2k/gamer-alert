import { QueryResult } from 'pg'
import db = require('../db')
import { Game, Session } from '../types'

const createGame = async(id: string, sessionId: string, matchId: bigint, gameType: string, startTime: bigint, champion: string, championPicture: string): Promise<QueryResult<any>> => {
    const result = await db.query(
        'INSERT INTO games(id, session_id, match_id, game_type, start_time, champion, champion_picture) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [id, sessionId, matchId, gameType, startTime, champion, championPicture]
    )

    return result
}

const getGamesBySessionId = async(sessionId: string): Promise<Array<Game>> => {
    const { rows } = await db.query(
        'SELECT * FROM games WHERE session_id=$1',
        [sessionId]
    )

    return rows
}

const updateGame = async(id: string, endTime: bigint, kills: number, deaths: number, assists: number, cs: number, win: boolean): Promise<QueryResult<any>> => {
    const result = await db.query(
        'UPDATE games SET end_time=$1, kills=$2, deaths=$3, assists=$4, cs=$5, win=$6 WHERE id=$7',
        [endTime, kills, deaths, assists, cs, win, id]
    )

    return result
}

const getGamesByDiscordId = async(discordId: bigint, startTime: bigint, endTime: bigint): Promise<Array<Game>> => {
    let games: Array<Game> = []
    let sessions: Array<Session> = []

    if (startTime != 0n) {
        sessions = (await db.query(
            'SELECT * FROM sessions WHERE discord_id=$1 AND start_time<=$2 AND start_time>=$3',
            [discordId, endTime, startTime]
        )).rows
    } else {
        sessions = (await db.query(
            'SELECT * FROM sessions WHERE discord_id=$1 ORDER BY start_time DESC LIMIT 1',
            [discordId]
        )).rows
    }

    for (let i = 0; i < sessions.length; i++) {
        console.log(`Fetching games from session ${i}`)
        const { rows } = await db.query(
            'SELECT * FROM games WHERE session_id=$1 AND win IS NOT NULL',
            [sessions[i].id]
        )
        games = games.concat(rows)
    }

    return games
}

export = {
    createGame,
    getGamesBySessionId,
    updateGame,
    getGamesByDiscordId
}
