import express = require('express')
require('dotenv').config()



export = (req: express.Request, res: express.Response, next: Function) => {
    if (process.env.API_KEYS) {
        const API_KEYS = process.env.API_KEYS.split(',')
        if (req.headers['api_key']) {
            if (API_KEYS.includes(req.headers['api_key'].toString())) {
                next()
            } else {
                res.status(401).json({'error': 'Invalid API key'})
            }
        } else {
            res.status(401).json({'error': 'No API key detected'})
        }
    } else {
        throw new Error('No API keys detected!')
    }
}
