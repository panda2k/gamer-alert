import Router from 'express'
import JobManager = require('../services/jobs')

const jobRouter = Router()

jobRouter.get('/game', async(req, res) => {
    try {
        const jobs = await JobManager.getGameJobs()
        res.json(jobs)

    } catch (error) {
        console.log(error)
        return res.status(500).json({'error': 'Uncaught error'}) 
    }
})

jobRouter.post('/game', async(req, res) => {
    try {
        await JobManager.createGameJob(req.body.id, BigInt(req.body.matchId), req.body.gameId, req.body.leagueName, BigInt(req.body.discordId))
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': `Invalid match id ${req.body.matchId} or discord id ${req.body.discordId}`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }
    
    return res.json({'message': 'Successfully created game job'})
})

jobRouter.delete('/game/:id', async(req, res) => {
    try {
        await JobManager.deleteGameJob(req.params.id)
        res.json({'message': 'Successfully deleted job'})
    } catch (error) {
        console.log(error)
        res.status(500).json({'error': 'Uncaught error'})
    }
})

export = jobRouter
