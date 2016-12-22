var redis = require('redis');
var client;

var cache = {
  initialize: function() {
    sails.log.info("Initializing Redis");
    client = redis.createClient(sails.config.redis.port, sails.config.redis.host);
    client.on('connect', function() {
      sails.log.debug('Connected to redis cache');
      cache.client = client;
    });

    client.on('error', function(err) {
      sails.log.error(err);
    });
  },
}

module.exports = cache;