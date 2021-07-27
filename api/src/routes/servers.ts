import express = require('express')
import ServerManager = require('../services/servers')

const serversRouter = express.Router()

serversRouter.post('', async(req, res) => {
    try {
        await ServerManager.createServer(
            BigInt(req.body.serverId), 
            req.body.alertWebhook,
            req.body.alertImageUrl,
        )
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': `Invalid server id ${req.body.serverId}`})
        } else if (error.message.includes('duplicate key')) {
            return res.status(400).json({'error': `Server with id ${req.body.serverId} already exists`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }

    return res.status(201).json({'message': `Server with id ${req.body.serverId} created successfully`})
})

serversRouter.get('/:id', async(req, res) => {
    try {
        const result = await ServerManager.getServer(BigInt(req.params.id))
        
        if (result) {
            return res.json(result)
        } else {
            return res.status(404).json({'error': `Server with id ${req.params.id} not found`})
        }
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(404).json({'error': `Server id ${req.params.id} is invalid`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = serversRouter
