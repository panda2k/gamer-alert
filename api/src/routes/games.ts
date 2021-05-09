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
            .then(() => {
                res.status(201).json({'message': 'Successfully created game'})
            })
            .catch(error => {
                if (error.detail.includes('is not present')) {
                    res.status(400).json({'error': `Session with id ${req.body.sessionId} does not exist`})
                } else if (error.message.includes('duplicate key')) {
                    res.status(400).json({'error': `There already exists a game with id ${req.body.gameId}`})
                } else if (error.message.includes('violates not-null')) {
                    res.status(400).json({'error': `${error.column} cannot be ${error.dataType}`})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'message': 'Invalid match id or start time'})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

gameRouter.get('', async(req, res) => {
    await GameManager.getGamesBySessionId(String(req.query.sessionId))
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        })
})

gameRouter.post('/:gameId', async(req, res) => {
    try {
        await GameManager.updateGame(
            req.params.gameId,
            BigInt(req.body.endTime),
            parseInt(req.body.kills),
            parseInt(req.body.deaths),
            parseInt(req.body.assists),
            parseInt(req.body.cs),
            req.body.win == true
        )
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).json({'error': `Game with id ${req.params.gameId} does not exist`})
                } else {
                    res.status(200).json({'message': 'Updated game'})
                }
            })
            .catch(error => {
                if (error.message.includes('NaN')) {
                    res.status(400).json({'error': 'Make sure kills, deaths, assists, and cs are valid numbers'})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            }) 
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': 'Invalid end time'})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = gameRouter
