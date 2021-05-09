import League = require('../../league-client/src/league')
import GamerAlert = require('../../api-client/src/gamer-alert')

const log = (processName: string, message: string) => {
    let now = new Date()
    console.log(`${processName}@${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}: ${message}`)
}

const monitorGames = async () => {
    await GamerAlert.getGameJobs()
        .then(async jobs => {
            log(`checkGame`, `Checking a total of ${jobs.length} games`)

            for (let i = 0; i < jobs.length; i++) {
                console.log(`${i}/${jobs.length}`)
                const currentJob = jobs[i]
                log(`checkGame`, String(currentJob))
        
                log('checkGame', `checking ${currentJob.league_name}'s game`)
                await League.getGame(currentJob.match_id)
                    .then(async game => {
                        let participantId: number|undefined
            
                        for (i = 0; i < game.participantIdentities.length; i++) {
                            if (game.participantIdentities[i].player.summonerName.toLowerCase() == currentJob.league_name.toLowerCase()) {
                                participantId = game.participantIdentities[i].participantId
                            }
                        }
                        
                        if (!participantId) {
                            log(`checkGame`, 'Participant not found')
                            return
                        }
            
                        const teamId = game.participants[participantId - 1].teamId

                        await GamerAlert.updateGame(
                            currentJob.game_id,
                            game.gameCreation + game.gameDuration * 1000,
                            game.participants[participantId - 1].stats.kills,
                            game.participants[participantId - 1].stats.deaths,
                            game.participants[participantId - 1].stats.assists,
                            game.participants[participantId - 1].stats.totalMinionsKilled + game.participants[participantId - 1].stats.neutralMinionsKilled,
                            game.teams[(teamId / 100) - 1].win != 'Fail'
                        )
                            .catch(error => {
                                log('checkGame', `Error when updating game. ${error.response.body.error}`)
                            })
                        
                        await GamerAlert.deleteGameJob(currentJob.id)
                            .catch(error => {
                                log('checkGame', `Error when deleting game with id ${currentJob.game_id}. Error: ${error}`)
                            })
                    })
                    .catch (error => {
                        if (error.message.includes(404)) { // game not finished
                            log('checkGame', `game not finished for ${currentJob.league_name}`)
                        } else {
                            log('checkGame', `Unexpected error: ${error}`)
                            if (error.response) {
                                log('checkGame', error.response.body)
                            }
                        }
                    })
                log('checkGame', `finished checking ${currentJob.league_name}'s game`)
            }
        })
        .catch(error => {
            log('checkGame', error)
        })
    
    log('checkGame', `Finished checking all games`)
}

export = {
    monitorGames,
    handler: async(): Promise<Promise<void>> => {
        return monitorGames()
    }
}
