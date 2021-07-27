import got from 'got'
require('dotenv').config()

const BASE_URL = `https://discord.com/api/v8/applications/${process.env.APPLICATION_ID}/commands`

const commands = [
    {
        "name": "help",
        "description": "View a list of Gamer Alert commands"
    },
    {
        name: "gamestats",
        description: "View the gamestats of a person within a specified time range",
        options: [
            {
                name: "target_user",
                description: "The user whose stats you want to display",
                type: 6,
                required: true
            },
            {
                name: "timespan",
                description: "Show all games within this time range",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Most Recent Game",
                        value: "mostrecent"
                    },
                    {
                        name: "Today",
                        value: "today"
                    },
                    {
                        name: "Yesterday",
                        value: "yesterday"
                    },
                    {
                        name: "Last 7 Days",
                        value: "week"
                    },
                    {
                        name: "Last 30 Days",
                        value: "month"
                    },
                ]
            }
        ]
    },
    {
        name: "timezone",
        description: "Set the timezone of the server. Must be an IANA timezone",
        options: [
            {
                name: "timezone",
                description: "The IANA timezone",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "register",
        description: "Register someone with Gamer Alert. People is only monitored in server's they're registered in.",
        options: [
            {
                name: "leaguename",
                description: "The target's league username. Case insensitive",
                type: 3,
                required: true
            },
            {
                name: "target_user",
                description: "The user you want to register. Leave this blank if you are registering yourself.",
                type: 6,
                required: false
            },
        ]
    },
    {
        name: "timelimit",
        description: "Set a goal for the max amount of time you want to spend playing league everyday.",
        options: [
            {
                name: "timelimit",
                description: "A daily time limit in minutes",
                type: 4,
                required: true
            }
        ]
    },
    {
        name: "playtime",
        description: "View the total play time of a person within a specified time range",
        options: [
            {
                name: "target_user",
                description: "The user whose play time you want to fetch",
                type: 6,
                required: true
            },
            {
                name: "timespan",
                description: "Calculate playtime from all games within this range",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "Today",
                        value: "today"
                    },
                    {
                        name: "Yesterday",
                        value: "yesterday"
                    },
                    {
                        name: "Last 7 Days",
                        value: "week"
                    },
                    {
                        name: "Last 30 Days",
                        value: "month"
                    },
                    {
                        name: "All Games",
                        value: "all"
                    }
                ]
            }
        ]
    },
];


(async() => {
    for (let i = 0; i < commands.length; i++) {
        await got.post(BASE_URL, {
            json: commands[i],
            responseType: 'json',
            headers: { 'Authorization': `Bot ${process.env.BOT_TOKEN}` }
        })
            .then(res => {
                console.log(res.body)
            })
            .catch(error => {
                console.log(JSON.stringify(error.response.body))
            })
        
        await new Promise(resolve => setTimeout(resolve, 7500))
    }
})()
