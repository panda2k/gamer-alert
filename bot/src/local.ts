import express = require('express')
import app = require('./app')
import fs = require('fs')
import http = require('http')
import https = require('https')

const port = process.env.PORT || 80
const privateKey = fs.readFileSync('/etc/letsencrypt/live/bot.gameralert.lol/privkey.pem', 'utf-8')
const certificate = fs.readFileSync('/etc/letsencrypt/live/bot.gameralert.lol/cert.pem', 'utf-8')
const ca = fs.readFileSync('/etc/letsencrypt/live/bot.gameralert.lol/chain.pem', 'utf-8')

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
}

const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

httpServer.listen(80, () => {
    console.log('HTTP server running on port 80')
})

httpsServer.listen(443, () => {
    console.log('HTTPS server running on port 443')
})
