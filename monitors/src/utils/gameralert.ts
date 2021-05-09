import got from 'got'
require('dotenv').config()
import types = require('../interfaces/gamer_alert_interfaces')

const BASE_URL = process.env.API_URL || 'http://localhost:8888'

const client = got.extend({
    prefixUrl: BASE_URL,
    headers: {
        API_KEY: process.env.GAMER_ALERT_API_KEY
    },
    responseType: 'json'
})

const getUserSessions = async(discordId: number): Promise<Array<types.Session>> => {
    return (await client(`users/${discordId}/sessions`)).body as unknown as Array<types.Session>
}

const getSessionGames = async(sessionId: string): Promise<Array<types.Game>> => {
    return (await client(`games`, { searchParams: { sessionId: sessionId } })).body as unknown as Array<types.Game>
}

const createSession = async(sessionId: string, discordId: number, startTime: number): Promise<Object> => {
    const { body } = await client.post('sessions', {
        json: {
            sessionId: sessionId,
            startTime: startTime,
            discordId: discordId
        }
    })

    return body
}

const createGame = async(gameId: string, sessionId: string, matchId: number, gameType: string, startTime: number, champion: string, championImage: string): Promise<Object> => {
    const { body } = await client.post('games', {
        json: {
            sessionId: sessionId,
            matchId: matchId,
            gameType: gameType,
            startTime: startTime,
            champion: champion,
            gameId: gameId,
            championPicture: championImage
        }
    })

    return body
}

const createGameJob = async(id: string, matchId: number, gameId: string, leagueName: string): Promise<Object> => {
    const { body } = await client.post('jobs/game', {
        json: {
            gameId: gameId,
            leagueName: leagueName,
            id: id,
            matchId: matchId
        }
    })

    return body
}

const getGameJobs = async(): Promise<Array<types.GameJob>> => {
    const jobs = (await client('jobs/game')).body as unknown as Array<types.GameJob>

    return jobs
}

const updateGame = async(gameId: string, endTime: number, kills: number, deaths: number, assists: number, cs: number, win: boolean): Promise<string> => {
    const { body } = await client.post(`games/${gameId}`, {
        json: {
            endTime: endTime,
            kills: kills,
            deaths: deaths,
            assists: assists,
            cs: cs,
            win: win
        }
    })

    return body
}

const deleteGameJob = async(id: string): Promise<string> => {
    const { body } = await client.delete(`jobs/game/${id}`)

    return body
}

const endSession = async(id: string, endTime: number): Promise<string> => {
    const { body } = await client.post(`sessions/${id}/end`, {
        json: { endTime: endTime }
    })

    return body
}

const getAllUsersWithLeagueName = async(): Promise<Array<types.User>> => {
    const { body } = await client('users/league-username')

    return body as unknown as Array<types.User>
}

const getUserServers = async(discordId: number): Promise<Array<types.Server>> => {
    const { body } = await client(`users/${discordId}/servers`)

    return body as unknown as Array<types.Server>
}

export = {
    getUserSessions,
    getSessionGames,
    createSession,
    createGame,
    createGameJob,
    getGameJobs,
    updateGame,
    deleteGameJob,
    endSession,
    getAllUsersWithLeagueName,
    getUserServers
}
