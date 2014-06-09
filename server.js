var Remander = require('remander')

module.exports.createServer = function(){
  var server = new Remander()

  //Add Router
  server.extend(require('./router.js'))
  return server
}
