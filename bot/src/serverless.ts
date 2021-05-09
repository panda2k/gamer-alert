import app = require('./app')
import serverless = require('serverless-http')

module.exports.handler = serverless(app)
