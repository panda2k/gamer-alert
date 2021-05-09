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

export = {
    sendWebhook
}
