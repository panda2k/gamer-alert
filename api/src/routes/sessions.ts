import express = require('express')
import SessionManager = require('../services/sessions')

const sessionRouter = express.Router()

sessionRouter.post('', async(req, res) => {
    try {
        await SessionManager.createSession(
            req.body.sessionId,
            BigInt(req.body.discordId),
            BigInt(req.body.startTime)
        )
            .then(() => {
                res.status(201).json({'message': 'Successfully created session'})
            })
            .catch(error => {
                if (error.message.includes('value too long')) {
                    res.status(400).json({'error': `Session id ${req.body.sessionId} is too long. Length must be below 16 characters`})
                } else if (error.message.includes('violates foreign key')) {
                    res.status(404).json({'error': `No user with discord id ${req.body.discordId} found`})
                } else if(error.message.includes('violates unique constraint')) {
                    res.status(400).json({'error': `there already is a session with id ${req.body.sessionId}`})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid discord id or start time`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

sessionRouter.get('/:sessionId', async(req, res) => {
    await SessionManager.getSessionById(req.params.sessionId)
        .then(result => {
            if (!result) {
                res.status(404).json({'error': `No session with id ${req.params.sessionId} found`})
            } else {
                res.json(result)
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        })
})

sessionRouter.post('/:sessionId/end', async(req, res) => {
    try {
        await SessionManager.setSessionEnd(
            req.params.sessionId, 
            BigInt(req.body.endTime)    
        )
            .then((result) => {
                if (result.rowCount == 0) {
                    res.status(404).json({'error': `Session with id ${req.params.sessionId} not found`})
                } else {
                    res.status(200).json({'message': 'Successfully updated session end time'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `endTime ${req.body.endTime} is invalud`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = sessionRouter
