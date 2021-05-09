require('dotenv').config()
import express = require('express')
import bodyParser = require('body-parser')

import interactionRouter = require('./routes/interactions')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use((req, res, next) => {
    if (req.originalUrl === '/interactions') { // need raw body for discord interaction
        next()
    } else {
        bodyParser.json()(req, res, next)
    }
})

app.use('/interactions', interactionRouter)

export = app
