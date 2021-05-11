import express = require('express')
import UserManager = require('../services/users')
import SessionManager = require('../services/sessions')
import GameManager = require('../services/games')
import { User } from '../types'
import { DateTime } from 'luxon'
import DayManager = require('../services/days')

const userRouter = express.Router()

userRouter.post('', async(req, res) => {
    try {
        await UserManager.createUser(
            BigInt(req.body.discordId),
            req.body.leagueUsername
        )
            .then(() => {
                res.status(201).json({'message': 'User created'})
            })
            .catch(error => {
                if (error.message.includes('duplicate key')) {
                    res.status(400).json({'error': `User with Discord id ${req.body.discordId} already exists`})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Discord id ${req.body.discordId} is invalid`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.get('/league-username', async(req, res) => {
    await UserManager.getAllUsersWithLeagueName()
        .then(result => {
            res.json(result)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        })
})

userRouter.get('/:id', async(req, res) => {
    try {
        await UserManager.getUser(BigInt(req.params.id))
            .then(result => {
                if (result) {
                    res.json(result)
                } else {
                    res.status(404).json({'error': `No user with Discord id ${req.params.id} found`})
                }
            })
            .catch(error => {
                console.log(error)
                res.status(500).json({'error': 'Uncaught error'})
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(404).json({'error': `No user with Discord id ${req.params.id} found`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.post('/:id/servers', async(req, res) => {
    try {
        await UserManager.addUserToServer(
            BigInt(req.params.id),
            BigInt(req.body.serverId)
        )
            .then(() => {
                res.status(201).json({'message': `Added user ${req.params.id} to server ${req.body.serverId}`})
            })
            .catch((error) => {
                if (error.message.includes("violates foreign key")) {
                    if (error.detail.includes("users")) {
                        res.status(400).json({'error': `There is no user with discord id ${req.params.id}`})
                    } else if (error.detail.includes("servers")) {
                        res.status(400).json({'error': `There is no server with id ${req.body.serverId}`})
                    } else {
                        console.log(error)
                        res.status(500).json({'error': 'Uncaught error'})
                    }
                } else if (error.message.includes('User already registered')) {
                    res.status(400).json({'error': `User ${req.params.id} is already registered in server ${req.body.serverId}`})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes('Cannot convert')) {
            res.status(400).json({'error': `Invalid server id or discord id`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.get('/:id/servers', async(req, res) => {
    try {
        await UserManager.getUserServers(BigInt(req.params.id))
            .then(result => {
                res.json(result)
            })
    } catch (error) {
        if (error.message.includes('Cannot convert')) {
            res.status(400).json({'error': `Invalid discord id`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.get('/:id/sessions', async(req, res) => {
    try {
        await SessionManager.getUserSessions(BigInt(req.params.id))
            .then(result => {
                res.json(result)
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid discord id ${req.params.id}`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.get('/:id/games', async(req, res) => {
    let requester: User|undefined
    
    try {
        requester = await UserManager.getUser(BigInt(req.query.requesterId))
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid requester id`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
        return
    }

    let targetUser: User|undefined

    try {
        targetUser = await UserManager.getUser(BigInt(req.params.id))
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid discord id`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }

    if (!targetUser) {
        res.status(404).json({'error': `No user with discord id ${req.params.id} found`})
        return
    }

    let timezone: string

    if (requester) {
        timezone = requester.time_zone || targetUser.time_zone || 'Etc/GMT'
    } else {
        timezone = targetUser.time_zone || 'Etc/GMT'
    }

    const now = new Date().getTime()
    const startToday = DateTime.now().setZone(timezone).startOf('day').toMillis()
    
    const timespans = Object({
        "mostrecent": [0, now],
        "today": [startToday, now],
        "yesterday": [startToday - 1000 * 60 * 60 * 24, startToday],
        "week": [now - 1000 * 60 * 60 * 24 * 7, now],
        "month": [now - 1000 * 60 * 60 * 24 * 30, now],
        "all": [0, now]
    })

    if (!timespans[String(req.query.timespan)]) {
        return res.status(400).json({'error': 'Invalid timespan'})
    }

    try {
        await GameManager.getGamesByDiscordId(BigInt(req.params.id), BigInt(timespans[String(req.query.timespan)][0]), BigInt(timespans[String(req.query.timespan)][1]))
            .then(result => {
                if (req.query.timespan == 'mostrecent' && result.length != 0) {
                    res.json({
                        timezone: timezone,
                        games: [result.pop()]
                    })
                } else {
                    res.json({
                        timezone: timezone,
                        games: result
                    })
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid integer`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.post('/:id/league-username', async(req, res) => {
    try {
        await UserManager.changeUserLeagueName(
            BigInt(req.params.id), 
            req.body.leagueName
        )
            .then((result) => {
                if (result.rowCount == 0) {
                    res.status(404).json({'error': `User with discord id ${req.params.id} not found`})
                } else {
                    res.status(200).json({'message': 'Updated league name successfully'})
                }
            })
            .catch(error => {
                if (error.message.includes('duplicate key')) {
                    res.status(400).json({'error': `User with league name ${req.body.leagueName} already exists`})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid discord id ${req.params.id}`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.post('/:id/time-limit', async(req, res) => {
    try {
        await UserManager.setUserTimeLimit(BigInt(req.params.id), req.body.timeLimit)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).json({'error': `User with discord id ${req.params.id} not found`})
                } else {
                    res.json({'message': 'Updated time limit successfully'})
                }
            })
            .catch(error => {
                if (error.message.includes("invalid input syntax")) {
                    res.status(400).json({'error': 'Invalid time limit. Must be an integer'})
                } else {
                    console.log(error)
                    res.status(500).json({'error': 'Uncaught error'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `Invalid discord id ${req.params.id}`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.post('/:id/time-zone', async(req, res) => {
    const zone = DateTime.local().setZone(req.body.timezone)

    if (!zone.isValid) {
        return res.status(400).json({'error': `Invalid timezone ${req.body.timezone}`})
    }

    try {
        await UserManager.setTimezone(BigInt(req.params.id), req.body.timezone)
            .then(result => {
                if (result.rowCount == 0) {
                    res.status(404).json({'error': `User with id ${req.params.id} does not exist`})
                } else {
                    res.json({'message': 'Updated timezone'})
                }
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            res.status(400).json({'error': `User id ${req.params.id} invalid`})
        } else {
            console.log(error)
            res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

userRouter.post('/:id/days/playtime', async(req, res) => {
    let user: User|undefined

    try {
        user = await UserManager.getUser(BigInt(req.params.id))
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': `Discord id ${req.params.id} invalid`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }

    if (!user) {
        return res.status(404).json({'error': `User with discord id ${req.params.id} is not found`})
    }

    const today = DateTime.now().setZone(user.time_zone || 'Etc/GMT').startOf('day').setZone('Etc/GMT').startOf('day').toMillis()

    await DayManager.addPlayTime(BigInt(today), BigInt(req.params.id), req.body.timeToAdd, user.time_limit || 24 * 60)
        .then(() => {
            return res.json({'message': 'Successfully added time'})
        })
        .catch(error => {
            if (error.message.includes('Day not found')) {
                return res.status(404).json({'error': 'No day found for today'})
            } else {
                console.log(error)
                return res.status(500).json({'error': 'Uncaught error'})
            }
        })
})

userRouter.get('/:id/days', async(req, res) => {
    try {
        await DayManager.getUserDays(BigInt(req.params.id))
            .then(result => {
                return res.json(result)
            })
    } catch (error) {
        if (error.message.includes("Cannot convert")) {
            return res.status(400).json({'error': `Discord id ${req.params.id} invalid`})
        } else {
            console.log(error)
            return res.status(500).json({'error': 'Uncaught error'})
        }
    }
})

export = userRouter
