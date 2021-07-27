import express = require('express')
import GameManager = require('../services/games')

const gameRouter = express.Router()

gameRouter.post('', async(req, res) => {
    try {
        await GameManager.createGame(
            req.body.gameId,
            req.body.sessionId,
            BigInt(req.body.matchId),
            req.body.gameType,
            BigInt(req.body.startTime),
            req.body.champion,
            req.body.championPicture
        )
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'message': 'Invalid match id or start time'})
        } else if (error.detail.includes('is not present')) {
            return res.status(400).json({'error': `Session with id ${req.body.sessionId} does not exist`})
        } else if (error.message.includes('duplicate key')) {
            return res.status(400).json({'error': `There already exists a game with id ${req.body.gameId}`})
        } else if (error.message.includes('violates not-null')) {
            return res.status(400).json({'error': `${error.column} cannot be ${error.dataType}`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }

    return res.status(201).json({'message': 'Successfully created game'})
})

gameRouter.get('', async(req, res) => {
    try {
        const result = await GameManager.getGamesBySessionId(String(req.query.sessionId))
        res.json(result)

    } catch (error) {
        console.log(error)
        res.status(500).json({'error': 'Uncaught error'})
    }
})

gameRouter.post('/:gameId', async(req, res) => {
    try {
        const result = await GameManager.updateGame(
            req.params.gameId,
            BigInt(req.body.endTime),
            parseInt(req.body.kills),
            parseInt(req.body.deaths),
            parseInt(req.body.assists),
            parseInt(req.body.cs),
            req.body.win == true
        )
        if (result.rowCount == 0) {
            return res.status(404).json({'error': `Game with id ${req.params.gameId} does not exist`})
        } else {
            return res.status(200).json({'message': 'Updated game'})
        }
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': 'Invalid end time'})
        } else if (error.message.includes('NaN')) {
            return res.status(400).json({'error': 'Make sure kills, deaths, assists, and cs are valid numbers'})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = gameRouter
