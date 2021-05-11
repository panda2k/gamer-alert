import { QueryResult } from 'pg'
import db = require('../db')
import { Day } from '../types'

const createDay = async(timestamp: bigint, discordId: bigint, playTime: number, timeLimit: number): Promise<QueryResult<any>> => {
    const result = await db.query(
        'INSERT INTO days(timestamp, discord_id, play_time, time_limit) VALUES($1, $2, $3, $4)', 
        [timestamp, discordId, playTime, timeLimit]
    )

    return result
}

const addPlayTime = async(timestamp: bigint, discordId: bigint, timeToAdd: number, timeLimit: number): Promise<QueryResult<any>> => {    
    let day = (await db.query(
        'SELECT * from days WHERE timestamp=$1 AND discord_id=$2',
        [timestamp, discordId]
    )).rows[0] as Day|undefined

    if (!day) {
        await createDay(timestamp, discordId, 0, timeLimit)
        day = {
            play_time: 0,
            time_limit: timeLimit,
            time_exceeded: false,
            timestamp: timestamp,
            discord_id: discordId
        }
    }
    
    if (day.play_time > day.time_limit && !day.time_exceeded) {
        await db.query(
            'UPDATE days SET time_exceeded=true WHERE timestamp=$1 AND discord_id=$2',
            [timestamp, discordId]
        )
    }

    const result = await db.query(
        'UPDATE days SET play_time = play_time + $1 WHERE timestamp=$2 AND discord_id=$3',
        [timeToAdd, timestamp, discordId]
    )

    return result
}

const getUserDays = async(discordId: bigint): Promise<Array<Day>> => {
    const { rows } = await db.query(
        'SELECT * FROM days WHERE discord_id=$1',
        [discordId]
    )

    return rows as unknown as Array<Day>
}

export = {
    createDay,
    addPlayTime,
    getUserDays
}
