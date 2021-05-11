import db = require('../db')
import { Server, User } from '../types'
import { QueryResult } from 'pg'

const createUser = async(discordId: bigint, leagueUsername?: string): Promise<QueryResult<any>> => {
    const result = db.query(
        'INSERT INTO users(discord_id, league_username) VALUES($1, $2)',
        [discordId, leagueUsername]
    )

    return result
} 

const getUser = async(discordId: bigint):Promise<User|undefined> => {
    const { rows } = await db.query(
        'SELECT * FROM users WHERE discord_id=$1',
        [discordId]
    )

    return rows[0]
}

const addUserToServer = async(discordId: bigint, serverId: bigint): Promise<QueryResult<any>> => {
    const { rows } = await db.query(
        'SELECT * FROM user_servers WHERE discord_id=$1 AND server_id=$2',
        [discordId, serverId]
    )

    if (rows.length > 0) {
        throw Error('User already registered in the server')
    }

    const result = await db.query(
        'INSERT INTO user_servers(discord_id, server_id) VALUES ($1, $2)',
        [discordId, serverId]
    )

    return result
}

const changeUserLeagueName = async(discordId: bigint, leagueName: string): Promise<QueryResult<any>> => {
    const result = db.query(
        'UPDATE users SET league_username=$1 WHERE discord_id=$2',
        [leagueName, discordId]
    )

    return result
}

const setUserTimeLimit = async(discordId: bigint, timeLimit: number) => {
    const result = db.query(
        'UPDATE users SET time_limit=$1 WHERE discord_id=$2',
        [timeLimit, discordId]
    )

    return result
}

const setTimezone = async(discordId: bigint, timezone: string): Promise<QueryResult<any>> => {
    const result = await db.query(
        'UPDATE users SET time_zone=$1 WHERE discord_id=$2',
        [timezone, discordId]
    )

    return result
}

const getUserServers = async(discordId: bigint): Promise<Array<Server>> => {
    const { rows } = await db.query(
        'SELECT servers.server_id, alert_webhook, alert_image_url FROM user_servers INNER JOIN servers ON user_servers.server_id = servers.server_id WHERE discord_id=$1',
        [discordId]
    )

    return rows as unknown as Array<Server>
}

const getAllUsersWithLeagueName = async(): Promise<Array<User>> => {
    const { rows } = await db.query(
        'SELECT * FROM users WHERE league_username IS NOT NULL'
    )

    return rows as unknown as Array<User>
}

export = {
    createUser,
    getUser,
    addUserToServer,
    changeUserLeagueName,
    setUserTimeLimit,
    setTimezone,
    getUserServers,
    getAllUsersWithLeagueName
}
