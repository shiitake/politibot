var Redis = require("ioredis")

var state = {
  db: null,
}

exports.connect = function(mode) {
  console.log('creating redis connection.');
  state.db = new Redis({
  	port: 6379,
  	host: 'redis-server'  	
  }); 
}

exports.client = function() {
  return state.db
}