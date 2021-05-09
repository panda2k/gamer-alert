export interface LeagueQueue { 
    queueId: number, 
    map: string, 
    description: string, 
    notes: string 
}

export interface Champion {
    version: string,
    id: string,
    key: string,
    name: string,
    title: string,
    blurb: string,
    info: { 
        attack: number,
        defense: number,
        magic: number,
        difficulty: number
    },
    image: {
        full: string,
        sprite: string,
        group: string,
        x: number,
        y: number,
        w: number,
        h: number
    },
    tags: Array<string>,
    partype: string,
    stats: {
        hp: number,
        hpperlevel: number,
        mp: number,
        mpperlevel: number,
        movespeed: number,
        armor: number,
        armorperlevel: number,
        spellblock: number,
        spellblockperlevel: number,
        attackrange: number,
        hpregen: number,
        hpregenperlevel: number,
        mpregen: number,
        mpregenperlevel: number,
        crit: number,
        critperlevel: number,
        attackdamage: number,
        attackdamageperlevel: number,
        attackspeedperlevel: number,
        attackspeed: number
    }
}

export interface ChampionList {
    type: string, 
    format: string, 
    version: string, 
    data: {
        [ key: string ]: Champion 
    }
}

export interface Game { // partial interface
    gameId: number, 
    gameCreation: number,
    gameDuration: number,
    queueId: number,
    mapId: number,
    seasonId: number,
    gameMode: string,
    gameType: string,
    teams: Array<{
        teamId: number,
        win: string,
    }>,
    participants: Array<{
        participantId: number,
        teamId: number,
        championId: number,
        stats: {
            participantId: number,
            win: boolean,
            kills: number,
            deaths: number,
            assists: number,
            totalMinionsKilled: number,
            neutralMinionsKilled: number
        }
    }>,
    participantIdentities: Array<{
        participantId: number,
        player: {
            summonerName: string
        }
    }>
}

export interface LiveGame { // partial type again
    gameId: number,
    gameType: string,
    gameStartTime: number,
    mapId: number,
    gameMode: string,
    gameQueueConfigId: number,
    participants: Array<{
        championId: number,
        summonerName: string
    }>
}

export interface Summoner { //  partial type again
    accountId: string,
    name: string,
    id: string,
    puuid: string
}
