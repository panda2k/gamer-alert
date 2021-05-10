import Router from 'express'
import nacl = require('tweetnacl')
import bodyParser = require('body-parser')
import gameralert = require('../../../api-client/src/gamer-alert')
import { FinishedGame } from '../../../api-client/src/types/gamer-alert'
import league = require('../../../league-client/src/league')
import { DateTime } from 'luxon'
import discord = require('../../../discord-client/src/discord')

const PUBLIC_KEY = String(process.env.APPLICATION_PUBLIC_KEY)

const interactionRouter = Router()

const prettyTime = (time: number) => {
    const days = Math.floor(time / (1000 * 60 * 60 * 24))
    const hours = Math.floor(time / (1000 * 60 * 60) % 24)
    const minutes = Math.floor(time / (1000 * 60) % 60)

    return (days != 0 ? days.toString() + ' days' : '') + (days != 0 ? ', ' : '') + (hours != 0 ? hours.toString() + ' hours' : '') + (hours != 0 || days != 0 ? ' and ' : '') + minutes.toString() + ' minutes'
}

const createGameEmbed = (game: FinishedGame, dataDragonVersion: string, timezone: string) => {
    let gameResult: string 

    if (game.win) {
        gameResult = 'Win'
    } else {
        gameResult = 'Loss'
    }

    const gameTime = game.end_time - game.start_time
    const elapsedMinutes = Math.floor(gameTime / (1000 * 60))
    const elapsedSeconds = Math.floor(gameTime % (1000 * 60) / 1000)

    return {
        title: `Game Stats as ${game.champion} in ${game.game_type}`,
        description: `Date: ${DateTime.fromMillis(Number(game.start_time), { zone: timezone }).toLocaleString(DateTime.DATETIME_FULL)}
        Game Result: ${gameResult}
        Elapsed Time: ${elapsedMinutes}:${('0' + elapsedSeconds).slice(-2)}\n
        CS/min: ${(game.cs / (elapsedMinutes + elapsedSeconds / 60)).toFixed(2)}
        KDA: ${((game.kills + game.assists) / (game.deaths == 0 ? 1 : game.deaths)).toFixed(2)}
        Kills: ${game.kills}
        Deaths: ${game.deaths}
        Assists: ${game.assists}`,
        url: `https://www.leagueofgraphs.com/match/na/${game.match_id}`,
        thumbnail: {
            url: `http://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${game.champion_picture}`
        }
    }
}

interactionRouter.post('', bodyParser.raw({type: 'application/json'}), async(req, res) => {
    const signature = String(req.headers['x-signature-ed25519'])
    const timestamp = req.headers['x-signature-timestamp']
    const rawBody = req.body

    const verification = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(PUBLIC_KEY, 'hex')
    )

    if (!verification) { // needed for verification
        console.log('Failed verification')
        return res.status(401).json({'error': 'Invalid request signature'})
    }

    const data = JSON.parse(rawBody.toString())

    //console.log(JSON.stringify(data)) // optional log statement

    if (data.type == 1) { // needed for verification
        return res.json({type: 1})
    } else if (data.data.name == 'help') {
        await discord.respondToInteraction(data.id, data.token, {
            content: "View a list of commands by typing / and clicking the FBI badge on the left side of the popup"
        })

        return res.status(200)
    } else if (data.data.name == 'gamestats') {
        await discord.respondToInteraction(data.id, data.token, { // ack a response as games are processed
            content: ''
        }, 5)

        await gameralert.getGames(data.member.user.id, data.data.options[0].value, data.data.options[1].value)
            .then(async (result) => {
                if (result.games.length == 0) {
                    return await discord.updateInteractionMessage(data.application_id, data.token, {
                        content: "They've logged no games in the specified time period"
                    })
                }

                let embeds: Array<Object> = []

                const dataDragonVersion = await league.getLatestDataDragonVersion()

                for (let i = 0; i < result.games.length; i++) {
                    embeds.push(createGameEmbed(result.games[i], dataDragonVersion, result.timezone))
                }

                await discord.updateInteractionMessage(data.application_id, data.token, {
                    embeds: embeds.slice(0, 10)
                })

                if (embeds.length >= 10) {
                    for (let i = 1; i < Math.ceil(embeds.length / 10); i++) {
                        await discord.createFollowupMessage(data.application_id, data.token, {
                            embeds: embeds.slice(10 * i, 10 * (i + 1))
                        })
                    }
                }
            })
            .catch(async error => {
                if (error.response) {
                    if (error.response.statusCode == 404) {
                        await discord.respondToInteraction(data.id, data.token, {
                            content: 'They have no recorded games because they have not registered with Gamer Alert yet'
                        })
                        return
                    } else {
                        console.log(error.response.body)
                    }
                } else {
                    console.log(error)
                }

                await discord.respondToInteraction(data.id, data.token, {
                    content: 'Error when getting game data. Try again in a few seconds'
                })
            })
    } else if (data.data.name == 'timezone') {
        await gameralert.updateTimezone(data.member.user.id, data.data.options[0].value)
            .then(async() => {
                await discord.respondToInteraction(data.id, data.token, {
                    content: `Updated server timezone to ${data.data.options[0].value}`
                })
            })
            .catch(async() => {
                await discord.respondToInteraction(data.id, data.token, {
                    content: `Invalid timezone. Check here for a list of timezone: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`
                })
            })
    } else if (data.data.name == 'register') {
        await gameralert.createServer(data.guild_id)
            .catch(error => {
                if (error.response) {
                    if (error.response.body.error.includes("already exists")) {
                        return true
                    } else {
                        return false
                    }
                }
                return false
            })
            .then(async(result) => {
                if (result) {
                    const discordId = data.data.options[1] ? data.data.options[1].value : data.member.user.id
                    await gameralert.createUser((discordId))
                    .then(() => {
                        return true
                    }) 
                    .catch(error => {
                        if (error.response) {
                            if (error.response.body.error.includes('User with Discord id')) {
                                return true
                            } else {
                                return false
                            }
                        } else {
                            return false
                        }
                    })
                    .then(async result => {
                        if (result) {
                            await gameralert.setLeagueUsername(discordId, data.data.options[0].value)
                            .then(async() => {
                                await gameralert.addUserToServer(discordId, data.guild_id)
                                    .then(async() => {
                                        await discord.respondToInteraction(data.id, data.token, {
                                            content: `Successfully registered <@${discordId}>`
                                        })
                                    })
                                    .catch(async error => {
                                        if (error.response) {
                                            if (error.response.body.error.includes('already registered')) {
                                                return await discord.respondToInteraction(data.id, data.token, {
                                                    content: `<@${discordId}> is already registered in this server. However, their league name was still set to ${data.data.options[0].value}`
                                                })
                                            }
                                        }
                                        console.log(error)
                                        await discord.respondToInteraction(data.id, data.token, {
                                            content: 'Error when registering user'
                                        })
                                    })
                            })
                            .catch(async error => {
                                if (error.response) {
                                    await discord.respondToInteraction(data.id, data.token, {
                                        content: `Error: ${error.response.body.error}`
                                    })
                                } else {
                                    console.log(error)
                                    await discord.respondToInteraction(data.id, data.token, {
                                        content: 'Error when setting league username'
                                    })
                                }
                            })
                        } else {
                            await discord.respondToInteraction(data.id, data.token, {
                                content: 'Error when creating user'
                            })
                        }
                    })
                } else {
                    await discord.respondToInteraction(data.id, data.token, {
                        content: 'Error when creating server'
                    })
                }
            })
    } else if (data.data.name == "timelimit") {
        await gameralert.setTimeLimit(data.member.user.id, data.data.options[0].value)
            .then(async() => {
                await discord.respondToInteraction(data.id, data.token, {
                    content: 'Successfully changed time limit'
                })
            })
            .catch(async error => {
                console.log(error)
                await discord.respondToInteraction(data.id, data.token, {
                    content: 'Error when updating time limit'
                })
            })
    } else if (data.data.name == "playtime") {
        await gameralert.getGames(data.member.user.id, data.data.options[0].value, data.data.options[1].value)
            .then(async result => {
                let playTime = 0

                for (let i = 0; i < result.games.length; i++) {
                    playTime += (result.games[i].end_time - result.games[i].start_time)
                }

                const timeString = prettyTime(playTime)

                await discord.respondToInteraction(data.id, data.token, {
                    content: `They've played ${timeString} of League in the specified time period`
                })
            })
            .catch(async error => {
                if (error.response) {
                    if (error.response.statusCode == 404) {
                        await discord.respondToInteraction(data.id, data.token, {
                            content: 'No play time logged because they have not yet registered for Gamer Alert'
                        })
                    } else {
                        console.log(error.response.body.erro)
                        await discord.respondToInteraction(data.id, data.token, {
                            content: 'Error when fetching playtime'
                        })
                    }
                } else {
                    console.log(error)
                    await discord.respondToInteraction(data.id, data.token, {
                        content: 'Error when fetching playtime'
                    })
                }
            })
    }
})

export = interactionRouter
