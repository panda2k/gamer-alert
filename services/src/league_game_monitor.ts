import League = require('../../league-client/src/league')
import GamerAlert = require('../../api-client/src/gamer-alert')
import { Game } from '../../league-client/src/types/league'

const monitorGames = async() => {
    const gameJobs = await GamerAlert.getGameJobs()

        console.log(`Checking a total of ${gameJobs.length} games`)

    for (let i = 0; i < gameJobs.length; i++) {
        console.log(`checking ${gameJobs[i].league_name}'s game`)

        let game: Game

        try {
            game = await League.getGame(gameJobs[i].match_id)
        } catch (error) {
            if (error.message.includes(404)) { // game not finished
                console.log(`game not finished for ${gameJobs[i].league_name}`)
            } else {
                console.log(`Unexpected error: ${error}`)
                if (error.response) {
                    console.log(error.response.body)
                }
            }
            continue
        }

        let participantId: number | undefined 

        for (let j = 0; j < game.participantIdentities.length; j++) {
            if (game.participantIdentities[j].player.summonerName.toLowerCase() == gameJobs[i].league_name.toLowerCase()) {
                participantId = game.participantIdentities[j].participantId
                break
            }
        }

        if (!participantId) {
            console.log('Participant not found')
            continue 
        }

        const teamId = game.participants[participantId - 1].teamId

        try {
            await GamerAlert.updateGame(
                gameJobs[i].game_id,
                game.gameCreation + game.gameDuration * 1000,
                game.participants[participantId - 1].stats.kills,
                game.participants[participantId - 1].stats.deaths,
                game.participants[participantId - 1].stats.assists,
                game.participants[participantId - 1].stats.totalMinionsKilled + game.participants[participantId - 1].stats.neutralMinionsKilled,
                game.teams[(teamId / 100) - 1].win != 'Fail'
            )
        } catch (error) {
            console.log(`Error when updating game ${error.response.body.error}`)
            continue
        }

        try {
            await GamerAlert.addTimeToDay(gameJobs[i].discord_id, parseInt((game.gameDuration / 60).toString()))
        } catch (error) {
            console.log(`Error when adding time to day ${error.response.body.error}`)
            continue
        }

        try {
            await GamerAlert.deleteGameJob(gameJobs[i].id)
        } catch (error) {
            console.log(`Error when deleting game with id ${gameJobs[i].game_id}`)
            continue
        }
    }
}

export = {
    monitorGames, 
    handler: async(): Promise<Promise<void>> => {
        return monitorGames()
    }
}
