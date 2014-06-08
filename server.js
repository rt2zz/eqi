var Remander = require('remander')

module.exports.createServer = createServer

function createServer(){
  var server = Remander.createServer()
  //Add Router
  server.extend(require('./router.js'))
  return server
}
