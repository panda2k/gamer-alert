import League = require('../../league-client/src/league')
import GamerAlert = require('../../api-client/src/gamer-alert')
import { Day, Game, Session } from '../../api-client/src/types/gamer-alert'
import crypto = require('crypto')
import discord = require('../../discord-client/src/discord')
import { Champion, LiveGame } from '../../league-client/src/types/league'

const checkProfile = async(leagueName: string, discordId: number, latestSession: Session | undefined) => {
    let liveGame: LiveGame

    try {
        liveGame = await League.getLiveGame(leagueName)
    } catch (error) {
        if (error.message.includes(404)) {
            console.log(`No game in progress for ${leagueName}`)
        } else {
            console.log(error.stack)
            console.log(`Unexpected error. ${error.message}`)
            if (error.response) {
                console.log(`Response data: ${error.response.data}`)
            }
        }
        return
    }

    if (liveGame.gameStartTime == 0) {
        return
    }

    const currentTime = new Date().getTime()
    let sessionId: string | undefined

    if (latestSession) {
        let games: Array<Game>

        try {
            games = await GamerAlert.getSessionGames(latestSession.id)
        } catch (error) {
            console.log('Error when getting session games')
            return
        }

        const latestGame = games.pop()

        if (latestGame) {
            if (latestGame.match_id == liveGame.gameId) { // game detected already
                console.log(`Game already detected for ${leagueName}`)
                return
            } else if (latestGame.end_time) {
                if (currentTime - latestGame.end_time <= 1000 * 60 * 15) { // checks if session is stale
                    sessionId = latestSession.id
                    console.log('Appending to session because last game is <15 min old')
                } else { // end session since it is stale
                    console.log('Ending session because stale')
                    await GamerAlert.endSession(latestSession.id, latestGame.end_time)
                }
            } else { // game with no end time
                if (currentTime - latestGame.start_time <= 60 * 60 * 1000) {
                    sessionId = latestSession.id
                } else { // end session with current time stamp. should work ok cuz games shouldn't be over an hour
                    console.log('Ending session because last game is over an hour old')
                    await GamerAlert.endSession(latestSession.id, currentTime)
                }
            }
        } else { // no latest game so empty session
            sessionId = latestSession.id
            console.log('Empty session found')
        }
    }

    if (!sessionId) {
        console.log('Creating new session')
        sessionId = crypto.randomBytes(8).toString('hex')

        try {
            GamerAlert.createSession(sessionId, discordId, currentTime)
        } catch (error) {
            console.log(`Error when creating new session for user ${discordId}: ${error.response.body.data}`)
            return
        }
    }

    const gameMode = await League.getQueueDescription(liveGame.gameQueueConfigId)
    let champion: Champion|undefined

    for (let i = 0; i < liveGame.participants.length; i++) {
        if (liveGame.participants[i].summonerName.toLowerCase() == leagueName.toLowerCase()) {
            champion = await League.getChampionById(liveGame.participants[i].championId)
        }
    }
    
    const gameId = crypto.randomBytes(8).toString('hex')

    if (!champion) {
        console.log('Champ not found')
        return
    }


    try {
        await GamerAlert.createGame(gameId, sessionId, liveGame.gameId, gameMode, liveGame.gameStartTime, champion.name, champion.image.full)
    } catch (error) {
        console.log(`Error when adding game to session ${sessionId}: ${error.response.body.error}`)
        return    
    }

    try {
        await GamerAlert.createGameJob(
            crypto.randomBytes(8).toString('hex'),
            liveGame.gameId,
            gameId,
            leagueName,
            discordId
        )
    } catch (error) {
        console.log(`Error when adding game job: ${error.response.body.error}`)
    }

    let days: Array<Day>

    try {
        days = await GamerAlert.getUserDays(discordId)
    } catch (error) {
        console.log(`Error when fetching user days. ${discordId}`)
        return
    }

    let streak = 0

    for (let i = days.length - 2; i >= 0; i--) { // don't count latest day
        if (!days[i].time_exceeded) {
            streak++
        } else {
            break
        }
    }

    const latestDay = days.pop()
    let extraMessage: string|undefined

    if (latestDay) {
        if(latestDay.play_time > latestDay.time_limit && !latestDay.time_exceeded) {
            extraMessage = `. This breaks their daily time limit. `
            if (streak > 0) {
                extraMessage += `Before this, they had a time limit streak of ${streak} days`
            }
        }
    }

    try {
        const servers = await GamerAlert.getUserServers(discordId)

        return Promise.all(servers.map(async server => {
            if (server.alert_webhook) {
                return discord.sendWebhook(server.alert_webhook || '', leagueName, server.alert_image_url, extraMessage)
                    .catch(error => {
                        console.log(`Error when posting alert to discord webhook. Error: ${error}. Webhook: ${server.alert_webhook}`)
                    })
            }
        }))
    } catch (error) {
        console.log('Error fetching user servers')
    }

}

const monitorUsers = async () => {
    try {
        const users = await GamerAlert.getAllUsersWithLeagueName()
        return Promise.all(users.map(async user => {
            const sessions = await GamerAlert.getUserSessions(user.discord_id)
            return checkProfile(
                user.league_username,
                user.discord_id,
                sessions.pop()
            )
        }))
    } catch (error) {
        console.log('Error when fetching users')
    }
}

export = {
    monitorUsers,
    handler: async() => {
        return monitorUsers()
    }
}
