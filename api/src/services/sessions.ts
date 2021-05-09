import db = require('../db')
import { Session } from '../types'
import { QueryResult } from 'pg'

const createSession = async(id: string, discordId: bigint, startTime: bigint): Promise<QueryResult<any>> => {
    const result = await db.query(
        'INSERT INTO sessions(id, discord_id, start_time) VALUES ($1, $2, $3)',
        [id, discordId, startTime]
    )

    return result
}

const getSessionById = async(id: string):Promise<Session|undefined> => {
    const { rows } = await db.query(
        'SELECT * FROM sessions WHERE id=$1',
        [id]
    )

    return rows[0]
}

const setSessionEnd = async(id: string, endTime: bigint): Promise<QueryResult<any>> => {
    const result = await db.query(
        'UPDATE sessions SET end_time=$1 WHERE id=$2',
        [endTime, id]
    )

    return result
}

const getUserSessions = async(discordId: bigint): Promise<Array<Session>> => {
    const { rows } = await db.query(
        'SELECT * FROM sessions WHERE discord_id=$1',
        [discordId]
    )

    return rows
}

export = {
    createSession,
    getSessionById,
    setSessionEnd,
    getUserSessions
}
