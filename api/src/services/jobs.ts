import db = require('../db')
import { GameJob } from '../types'

const createGameJob = async(id: string, matchId: bigint, gameId: string, leagueName: string) => {
    const result = await db.query(
        'INSERT INTO game_jobs(id, game_id, league_name, match_id) VALUES($1, $2, $3, $4)',
        [id, gameId,  leagueName, matchId]
    )

    return result
}

const getGameJobs = async(): Promise<Array<GameJob>> => {
    const { rows } = await db.query(
        'SELECT * FROM game_jobs'
    )

    return rows as Array<GameJob>
}

const deleteGameJob = async(id: string) => {
    const result = await db.query(
        'DELETE FROM game_jobs WHERE id=$1',
        [id]
    )
}

export = {
    createGameJob,
    getGameJobs,
    deleteGameJob
}
