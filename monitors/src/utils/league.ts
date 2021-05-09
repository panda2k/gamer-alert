import got from 'got'
import league = require('../interfaces/league_interfaces')
require('dotenv').config()

const BASE_URL = 'https://na1.api.riotgames.com/lol'
const RIOT_TOKEN = process.env.RIOT_TOKEN

const client = got.extend({
    prefixUrl: BASE_URL,
    headers: {
        'X-Riot-Token': RIOT_TOKEN
    },
    responseType: 'json'
})

const getSummoner = async (summonerName: string): Promise<league.Summoner> => Object(await client(`summoner/v4/summoners/by-name/${summonerName}`)).body

const getLiveGame = async (summonerName: string): Promise<league.LiveGame> => {
    return await getSummoner(summonerName)
        .then(result => {
            return (client.get(`spectator/v4/active-games/by-summoner/${result.id}`))
                .then(result => {
                    return Object(result).body
                })
        })
}

const getGame = async (gameId: number): Promise<league.Game> => {
    const result = await client(`match/v4/matches/${gameId}`)

    const game = Object(result.body) as league.Game

    return game
}

const getLatestDataDragonVersion = async (): Promise<string> => {
    const versions = (await got('https://ddragon.leagueoflegends.com/api/versions.json', { responseType: 'json' })).body as Array<string>

    return versions[0]
}

const getChampionById = async (championId: number): Promise<league.Champion> => {
    let latestDataDragonVersion = await getLatestDataDragonVersion()

    const result = await got(
        `http://ddragon.leagueoflegends.com/cdn/${latestDataDragonVersion}/data/en_US/champion.json`,
        {
            responseType: 'json'
        }
    )

    const champions = result.body as league.ChampionList

    let championData: league.Champion|undefined
    
    Object.keys(champions.data).forEach(key => {
        if (Number(champions.data[key].key) == championId) {
            championData = champions.data[key]
        }
    })
    
    if (championData) {
        return championData as league.Champion
    } else {
        throw Error('Champion not found')
    }
}

const getQueueDescription = async (queueId: number): Promise<string> => {
    const result = await got('http://static.developer.riotgames.com/docs/lol/queues.json', { responseType: 'json' })
    
    const body = result.body as Array<league.LeagueQueue>
    
    if (queueId == 0) {
        return 'Custom Game'
    }

    for (let i = 0; i < body.length; i++) {
        if (body[i].queueId == queueId) {
            return body[i].description
        }
    }

    throw Error('Invalid queueId')
}

export = {
    getSummoner,
    getLiveGame,
    getGame,
    getChampionById,
    getQueueDescription
}
