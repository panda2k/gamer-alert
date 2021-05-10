import got from 'got'

const PROFILE_PIC_URL = 'https://i.imgur.com/2uDC1k5.png'

const sendWebhook = async(webhookUrl: string, leagueName: string, webhookImageUrl: string|null) => {
    const result = await got.post(webhookUrl, {
        json: {
            content: null,
            username: 'Gamer Alert V2',
            "avatar_url": PROFILE_PIC_URL,
            embeds: [
                {
                    title: `${leagueName} has started a new League of Legends game`,
                    color: 16711680,
                    image: {
                        url: webhookImageUrl
                    }
                }
            ]
        }
    })

    return result
}

const respondToInteraction = async(interactionId: string, interactionToken: string, data: Object, responseType?: number) => {
    const { body } = await got.post(`https://discord.com/api/v8/interactions/${interactionId}/${interactionToken}/callback`, {
        json: {
            type: responseType || 4,
            data: data
        }
    })

    return body
}

const updateInteractionMessage = async(appId: string, interactionToken: string, data: Object) => {
    const { body } = await got.patch(`https://discord.com/api/v8/webhooks/${appId}/${interactionToken}/messages/@original`, {
        json: data
    })

    return body
}

const createFollowupMessage = async(appId: string, interactionToken: string, data: Object) => {
    const { body } = await got.post(`https://discord.com/api/v8/webhooks/${appId}/${interactionToken}`, {
        json: data
    })

    return body
}

export = {
    sendWebhook,
    respondToInteraction,
    createFollowupMessage,
    updateInteractionMessage
}
