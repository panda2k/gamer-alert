import express = require('express')
import bodyParser = require('body-parser')

import auth = require('./middleware/auth')

import serverRouter = require('./routes/servers')
import userRouter = require('./routes/users')
import sessionRouter = require('./routes/sessions')
import gameRouter = require('./routes/games')
import jobRouter = require('./routes/jobs')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(auth)

app.use('/servers', serverRouter)
app.use('/users', userRouter)
app.use('/sessions', sessionRouter)
app.use('/games', gameRouter)
app.use('/jobs', jobRouter)

export = app
