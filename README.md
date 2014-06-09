Eqi
======
Eqi is a hapi inspired web framework for nodejs.

## Overview
Create a server
```js
var Eqi = require('eqi')
var server = Eqi.createServer()
```

Extend the server with "Extensions".
```js
//Session and Cookie Support
server.extend(require('eqstock').session, {keys: ['key1', 'key2']})
//Session based Authentication
server.extend(require('eqauth'), {key: 'user'})
```

Setup plugins.
```js
server.plugin(require('./plugins/user'))
server.plugin(require('./plugins/about'))
```

Start server.
```js
server.port(4002).tls('default').start(function(){
  console.log('server started')
})
```

## Application Structure
Recommended structure:
app/app.js
```js
var server = require('./server/server.js')

server.plugin(require('./plugins/user'))

server.port(4002).start(function(){
  console.log('server started')
})
```

app/server/server.js
```js
var Eqi = require('eqi')
var server = Eqi.createServer()

server.extend(require('eqauth'), {key: 'user'})

module.exports = server
```

app/plugins/user/plugin.js
```js
exports.plugin = function(plugin, options, next) {
  //Setup
  next();
};

exports.route = function(plugin, options, next){  
  plugin.route({
    path: '/admin',
    method: "GET",
    auth: 'required',
    handler: function(request, reply) {
      reply("Hello Eqi");
    }
  })
  next()
}
```

## API

###Remands
The term remands is overloaded in eqi.  A remand is a function that looks as follows
```js
function(request, remand){
  //...
  remand(results)
}
```
A remand is intended to be used in a remand chain.  Anywhere in eqi that requires a remand will take it in the following format:
```js
//as an array (run in series)
[{key: remand}, {key2: remand2}]
//twice deep array (run in parallel)
[[{key: remand}, {key2: remand2}]]
//an object
{key: remand}
```
When the remand chain is run, the result of each remand is stored on an object under the specified key.
```js
var chain = [{first: remand1}, [{parallelA: remandA}, {parallelB: remandB}]]
//... results in:
{
  first: (result from remand1)
  parallelA: (result from remandA)
  parallelB: (result from remandB)
}
```
Note that the result is flattened, and that keys must be unique.

###Pipeline
The pipeline is a remand chain that every request is passed through.  It allows various extensions and plugins to register remands with the proper order of execution.  Pipelines have "pipepoints", i.e. handlers that act as checkpoints which remands can be placed before or after.
For example to add a remand at the beginning of every request:
```js
server.pipeline('postRequest', {example: function(request, remand){
    remand('example')
  }
})
```

###Route
Much like the server pipeline, routes have their own remand chain with the following predefined "pipepoints":
*postDispatch* - Run immediately after dispatching (i.e. path is parsed) the route
*preHandler* - Run preceding the route handler
*postHandler* - Run after the route handler

```js
server.route({
  path: 'user/:id',
  postDispatch: [...]
  preHandler: [...]
  postHandler: [...]
  handler: function(request, reply){ ... }
})
```

###Request Object
As with many frameworks eqi defines its own request object.
```js
request.raw.request //vanilla node request
request.raw.response //vanilla node response
request.reply //equipt reply object
request.pre //remand chain results are stored on this object
```

###Services
Services are basically shared methods or values.  Eqi will throw an error if you try to register the same service name on two seperate plugins.
```js
plugin.service('myModel', Model)
```

##Goals
Configuration oriented
Extensible, composable servers

###Thoughts on remands:
This is an experimental concept.  It is something like express middleware, except results are always mapped onto the specified key, and there is no error argument
