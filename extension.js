var url = require('url')
var Router = require('routes')
var router = new Router()
var _ = require('lodash')

module.exports.setup = function(server){
  server.router = router

  server.pipePoint('Route', function(request, remand){
    var parsed = url.parse(request.raw.request.url)
    var pathname = parsed.pathname

    var match = server.router.match(pathname)
    if(!match){
      //@TODO fix 404 handling
      request.reply('404')
      remand('404')
    }
    else{
      request.route = match
      match.fn(request, remand)
    }
  })

  server.route = function(route, plugin){
    var self = this
    route.pre = route.pre || []
    route.post = route.post || []

    var handler = route.handler
    console.log('p', plugin)
    if(plugin){
      route.pre = plugin._pre.concat(route.pre)
      route.post = route.post.concat(plugin._post)
    }

    var handlerRemand = function(request, remand){
      route.handler(request, request.reply.remand(remand))
    }
    //@TODO put remand array creation in a seperate module/method
    var handle = {'_handleRoute': handlerRemand}

    var remands = route.pre.concat(handle).concat(route.post)
    remands = _.chain(remands).flatten(true).without(null, undefined).value()

    router.addRoute(route.path, compileRouteFn(server, remands, handler))
  }

  //@TODO figure out more elegent plugin extending
  server.Plugin.prototype.route = function(route){
    this.server.route(route, this)
  }
}

/**
  * Compiles a route handler given a route object (path and equip handler).
  * Returns closure to capture the prerequisites and equip handler
  **/
function compileRouteFn(server, remands, handler){
  //@TODO is it efficient to recreate the chain every request?
  return function(request, remand){
    var chain = new server.RemandChain(request, remands, function(err){
      remand(null)
    })
    chain.run()
  }
}
