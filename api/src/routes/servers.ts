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
            .then(() => {
                res.status(201).json({'message': `Server with id ${req.body.serverId} created successfully`})
            })
            .catch(error => {
                if (error.message.includes('duplicate key')) {
                    res.status(400).json({'error': `Server with id ${req.body.serverId} already exists`})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid server id ${req.body.serverId}`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

serversRouter.get('/:id', async(req, res) => {
    try {
        await ServerManager.getServer(BigInt(req.params.id))
            .then(result => {
                if (result) {
                    res.json(result)
                } else {
                    res.status(404).json({'error': `Server with id ${req.params.id} not found`})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(404).json({'error': `Server id ${req.params.id} is invalid`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = serversRouter
