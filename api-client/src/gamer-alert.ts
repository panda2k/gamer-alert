import got from 'got'
require('dotenv').config()
import types = require('./types/gamer-alert')

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

const setTimeLimit = async(discordId: number, timeLimit: number): Promise<string> => {
    const { body } = await client.post(`users/${discordId}/time-limit`, {
        json: { timeLimit: timeLimit }
    })

    return body
}

const getGames = async(requesterId: number, discordId: number, timerange: string): Promise<types.FetchedGames> => {
    const { body } = await client(`users/${discordId}/games`, {
        searchParams: { timespan: timerange, requesterId: requesterId }
    })

    return body as unknown as types.FetchedGames
}

const updateTimezone = async(discordId: number, timezone: string): Promise<string> => {
    const { body } = await client.post(`users/${discordId}/time-zone`, 
    { json: { timezone: timezone } })

    return body
}

const createServer = async(serverId: number): Promise<string> => {
    const { body } = await client.post('servers', {
        json: { serverId: serverId }
    })

    return body
}

const createUser = async(discordId: number): Promise<string> => {
    const { body } = await client.post('users', {
        json: { discordId: discordId }
    })

    return body
}

const setLeagueUsername = async(discordId: number, leagueName: string): Promise<string> => {
    const { body } = await client.post(`users/${discordId}/league-username`, {
        json: { leagueName: leagueName }
    })

    return body
}

const addUserToServer = async(discordId: number, serverId: number): Promise<string> => {
    const { body } = await client.post(`users/${discordId}/servers`, {
        json: { serverId: serverId }
    })

    return body
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
    getUserServers,
    setTimeLimit,
    getGames,
    updateTimezone,
    createServer,
    createUser,
    setLeagueUsername,
    addUserToServer
}
