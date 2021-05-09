import League = require('./utils/league')
import GamerAlert = require('./utils/gameralert')
import { Session } from './interfaces/gamer_alert_interfaces'
import crypto = require('crypto')
import discord = require('./utils/discord')
import { Champion } from './interfaces/league_interfaces'

const log = (processName: string, message: string) => {
    let now = new Date()
    console.log(`${processName}@${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}: ${message}`)
}

const checkProfile = async (leagueName: string, discordId: number, latestSession: Session|undefined) => {
    await League.getLiveGame(leagueName)
        .then(async game => { // found a live game
            if (game.gameStartTime == 0) {
                log('checkProfile', `Game still in loading phase for ${leagueName}`)
                return // game hasn't yet started. players are in loading screen.
            }

            log('checkProfile', `Game in progress for ${leagueName}`)
            let currentTime = new Date().getTime()
            let sessionId: string|undefined

            if (latestSession) {
                const games = (await GamerAlert.getSessionGames(latestSession.id))
                const latestGame = games.pop()

                if (latestGame) {
                    if (latestGame.match_id == game.gameId) { // game detected already
                        log('checkProfile', `Game already detected for ${leagueName}`)
                        return
                    } else if (latestGame.end_time) {
                        if (currentTime - latestGame.end_time <= 1000 * 60 * 15) { // checks if session is stale
                            sessionId = latestSession.id
                            log('checkProfile', 'Appending to session because last game is <15 min old')
                        } else { // end session since it is stale
                            log('checkProfile', 'Ending session because stale')
                            await GamerAlert.endSession(latestSession.id, latestGame.end_time)
                        }
                    } else { // game with no end time
                        if (currentTime - latestGame.start_time <= 60 * 60 * 1000) {
                            sessionId = latestSession.id
                        } else { // end session with current time stamp. should work ok cuz games shouldn't be over an hour
                            log('checkProfile', 'Ending session because last game is over an hour old')
                            await GamerAlert.endSession(latestSession.id, currentTime)
                        }
                    }
                } else { // no latest game so empty session
                    sessionId = latestSession.id
                    log('checkProfile', 'Empty session found')
                }
            }

            if (!sessionId) { // if there was no latestSession or the session was stale  
                log('checkProfile', 'Creating new session')              
                sessionId = crypto.randomBytes(8).toString('hex')
                await GamerAlert.createSession(sessionId, discordId, currentTime)
                    .catch(error => {
                        log('checkProfile', `Error when creating new session for user ${discordId}: ${error.response.body.data}`)
                    })
            }

            const gameMode = await League.getQueueDescription(game.gameQueueConfigId)
            let champion: Champion|undefined

            for (let i = 0; i < game.participants.length; i++) {
                if (game.participants[i].summonerName.toLowerCase() == leagueName.toLowerCase()) {
                    champion = await League.getChampionById(game.participants[i].championId)
                }
            }
            
            const gameId = crypto.randomBytes(8).toString('hex')

            if (!champion) {
                console.log('Champ not found')
                return
            }

            await GamerAlert.createGame(gameId, sessionId, game.gameId, gameMode, game.gameStartTime, champion.name, champion.image.full)
                .then(() => {
                    return GamerAlert.createGameJob(
                        crypto.randomBytes(8).toString('hex'),
                        game.gameId,
                        gameId,
                        leagueName
                    )
                        .then(() => {
                            log('checkProfile', `Added game to task queue`)
                            
                            return GamerAlert.getUserServers(discordId)
                                .then(servers => {
                                    let promises: Array<Promise<any>> = []

                                    for (let i = 0; i < servers.length; i++) {
                                        if (servers[i].alert_webhook) {
                                            promises.push(discord.sendWebhook(servers[i].alert_webhook || '', leagueName, servers[i].alert_image_url)
                                                .catch(error => {
                                                    log('checkProfile', `Error when posting alert to discord webhook. Error: ${error}. Webhook: ${servers[i].alert_webhook}`)
                                                })
                                            )
                                        }
                                    }

                                    return Promise.all(promises)
                                })
                        })
                        .catch(error => {
                            log('checkProfile', `Error when adding game job: ${error.response.body.error}`)
                        })
                })
                .catch(error => {
                    log('checkProfile', `Error when adding game to session ${sessionId}: ${error.response.body.error}`)
                })
        })
        .catch(error => {
            if (error.message.includes(404)) {
                log('checkProfile', `No game in progress for ${leagueName}`)
            } else {
                log('checkProfile', error.stack)
                log('checkProfile', `Unexpected error. ${error.message}`)
                if (error.response) {
                    log('checkProfile', `Response Data: ${error}`)
                }
            }
        })
}

const monitorUsers = async () => {
    const users = await GamerAlert.getAllUsersWithLeagueName()
    const promises: Array<Promise<any>> = []

    for (let i = 0; i < users.length; i++) {
        promises.push(
            GamerAlert.getUserSessions(users[i].discord_id)
                .then((sessions) => {
                    return checkProfile(
                        users[i].league_username,
                        users[i].discord_id,
                        sessions.pop()
                    )
                })
        )
    }

    return Promise.all(promises)
        .then(() => {
            log(`checkProfile`, `finished checking all servers`)
        })
}

export = {
    monitorUsers,
    handler: async() => {
        return monitorUsers()
    }
}
