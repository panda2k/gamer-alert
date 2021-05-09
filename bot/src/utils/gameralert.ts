import got from 'got'
require('dotenv').config()
import types = require('../types/gamer_alert_interfaces')

const BASE_URL = process.env.BASE_URL

const client = got.extend({
    prefixUrl: BASE_URL,
    headers: {
        API_KEY: process.env.GAMER_ALERT_API_KEY
    },
    responseType: 'json'
})

const createServer = async(serverId: number): Promise<string> => {
    const { body } = await client.post('servers', {
        json: { serverId: serverId }
    })

    return body
}

const getFullServers = async(): Promise<Array<types.PopulatedServer>> => {
    return (await client('servers/full')).body as unknown as Array<types.PopulatedServer>
}

const getServer = async(serverId: number): Promise<types.Server> => {
    return (await client(`servers/${serverId}`)).body as unknown as types.Server
}

const getUserSessions = async(discordId: number): Promise<Array<types.Session>> => {
    return (await client(`users/${discordId}/sessions`)).body as unknown as Array<types.Session>
}

const getSessionGames = async(sessionId: string): Promise<Array<types.Game>> => {
    return (await client(`games`, { searchParams: { sessionId: sessionId } })).body as unknown as Array<types.Game>
}

const createSession = async(sessionId: string, discordId: number): Promise<Object> => {
    const { body } = await client.post('sessions', {
        json: {
            sessionId: sessionId,
            startTime: new Date().getTime(),
            discordId: discordId
        }
    })

    return body
}

const createGame = async(gameId: string, sessionId: string, matchId: number, gameType: string, startTime: number, champion: string): Promise<Object> => {
    const { body } = await client.post('games', {
        json: {
            sessionId: sessionId,
            matchId: matchId,
            gameType: gameType,
            startTime: startTime,
            champion: champion,
            gameId: gameId
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

const createUser = async(discordId: number): Promise<string> => {
    const { body } = await client.post('users', {
        json: { discordId: discordId }
    })

    return body
}

const setTimeLimit = async(discordId: number, timeLimit: number): Promise<string> => {
    const { body } = await client.post(`users/${discordId}/time-limit`, {
        json: { timeLimit: timeLimit }
    })

    return body
}

const getUser = async(discordId: number): Promise<types.User> => {
    const { body } = await client.get(`users/${discordId}`)

    return body as unknown as types.User
}

export = {
    getFullServers,
    getUserSessions,
    getSessionGames,
    createSession,
    createGame,
    createGameJob,
    getGameJobs,
    updateGame,
    deleteGameJob,
    getGames,
    updateTimezone,
    getServer,
    setLeagueUsername,
    addUserToServer,
    createUser,
    setTimeLimit,
    createServer,
    getUser
}
