import db = require('../db')
import { Server, User } from '../types'
import { QueryResult } from 'pg'

const createServer = async(serverId: bigint, alertWebhook?: string, alertImageUrl?: string): Promise<QueryResult<any>> => {
    const result = await db.query(
        'INSERT INTO servers(server_id, alert_webhook, alert_image_url) VALUES($1, $2, $3)', 
        [serverId, alertWebhook, alertImageUrl]
    )

    return result
}

const getServer = async(serverId: bigint):Promise<Server|undefined> => {
    const { rows } = await db.query(
        'SELECT * FROM servers WHERE server_id=$1',
        [serverId]
    )

    return rows[0]
}

const getAllServers = async():Promise<Array<Server>> => {
    const { rows } = await db.query(
        'SELECT * FROM servers'
    )

    return rows
}

export = {
    createServer,
    getServer,
    getAllServers,
}
