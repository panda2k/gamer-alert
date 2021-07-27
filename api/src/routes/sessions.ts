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
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': `Invalid discord id or start time`})
        } else if (error.message.includes('value too long')) {
            return res.status(400).json({'error': `Session id ${req.body.sessionId} is too long. Length must be below 16 characters`})
        } else if (error.message.includes('violates foreign key')) {
            return res.status(404).json({'error': `No user with discord id ${req.body.discordId} found`})
        } else if(error.message.includes('violates unique constraint')) {
            return res.status(400).json({'error': `there already is a session with id ${req.body.sessionId}`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }

    return res.status(201).json({'message': 'Successfully created session'})
})

sessionRouter.get('/:sessionId', async(req, res) => {
    try {
        const result = await SessionManager.getSessionById(req.params.sessionId)

        if (!result) {
            return res.status(404).json({'error': `No session with id ${req.params.sessionId} found`})
        } else {
            return res.json(result)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({'error': 'Uncaught error'})   
    }
})

sessionRouter.post('/:sessionId/end', async(req, res) => {
    try {
        const result = await SessionManager.setSessionEnd(
            req.params.sessionId, 
            BigInt(req.body.endTime)    
        )
        
        if (result.rowCount == 0) {
            return res.status(404).json({'error': `Session with id ${req.params.sessionId} not found`})
        } else {
            return res.status(200).json({'message': 'Successfully updated session end time'})
        }
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': `endTime ${req.body.endTime} is invalud`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = sessionRouter
