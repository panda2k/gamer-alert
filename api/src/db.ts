import { Pool } from 'pg'
require('dotenv').config()

let pool: Pool

if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
} else {
    pool = new Pool()
}

export = {
    query: (text: string, params?: Array<string|number|boolean|bigint|undefined>) => pool.query(text, params),
}
