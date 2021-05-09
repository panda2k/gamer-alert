import gamemonitor = require('./league_game_monitor')
import usermonitor = require('./league_user_monitor')

const main = async() => {
    await usermonitor.monitorUsers()
    await gamemonitor.monitorGames()
}

(async() => {
    main()
    setInterval(main, 60000)
})()
