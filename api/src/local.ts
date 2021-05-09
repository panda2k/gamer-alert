const server = require('./app')
const port = process.env.PORT || 8888

server.listen(port, () => {
    console.log(`Now listening on port ${port}`)
})

