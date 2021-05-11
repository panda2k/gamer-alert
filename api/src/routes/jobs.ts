import Router from 'express'
import JobManager = require('../services/jobs')

const jobRouter = Router()

jobRouter.get('/game', async(req, res) => {
    await JobManager.getGameJobs()
        .then(jobs => {
            res.json(jobs)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        })
})

jobRouter.post('/game', async(req, res) => {
    try {
        await JobManager.createGameJob(req.body.id, BigInt(req.body.matchId), req.body.gameId, req.body.leagueName, BigInt(req.body.discordId))
            .then(() => {
                res.json({'message': 'Successfully created game job'})
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid match id ${req.body.matchId} or discord id ${req.body.discordId}`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

jobRouter.delete('/game/:id', async(req, res) => {
    await JobManager.deleteGameJob(req.params.id)
        .then(() => {
            res.json({'message': 'Successfully deleted job'})
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        })
})

export = jobRouter
