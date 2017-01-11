var request = require("request");

module.exports = {
  send: function(req, res) {
    async.auto({
      validate: function(callback) {
        if ( !req.body.destination || !req.body.message 
              || !req.body.timestamp || !req.body.userId ) {
          return callback({
            status: 400,
            error: {
              code: -1,
              message: "Validation error"
            }
          });
        }

        return callback();
      },

      checkToken: function(callback) {
        Cache.client.get("echo:" + req.body.userId, function(err, result) {
          if (err || !result) {
            req.session.destroy(function(err) {});
            return callback({
              status: 401,
              error: {
                code: -2,
                message: "Unauthorized or session expired"
              }
            });
          }

          var tokens = result.split(":");
          var ansibleToken = tokens[0].split("=")[1];
          var refreshToken = tokens[1].split("=")[1];
          var decoded = jwt.decode(ansibleToken, {complete: true});
          var now = Date.now() / 1000;
          
          callback(null, {
            refresh: (now >= decoded.payload.exp) ? true : false,
            ansibleToken: ansibleToken,
            refreshToken: refreshToken,
            userId: decoded.payload.sub
          });
        });
      },

      getToken: ["validate", "checkToken", function(callback, result) {
        if (!result.checkToken.refresh) {
          return callback(null, {
            ansibleToken: result.checkToken.ansibleToken
          });
        }

        var basic = "Basic " + new Buffer(sails.config.ansible.username + ":" + 
          sails.config.ansible.password).toString("base64");
        request.get({
          url: sails.config.url.token,
          headers: {
            authorization: basic,
            "x-jwt": result.checkToken.ansibleToken
          },
          qs: {
            type: "refresh",
            token: result.checkToken.refreshToken
          }
        }, function(err, resp) {
          if (err) {
            return callback({
              status: 503,
              error: {
                code: -1,
                message: "System encountered error"
              }
            });
          }

          if (resp.statusCode !== 200) {
            return callback({
              status: resp.statusCode,
              error: JSON.parse(resp.body)
            }); 
          }

          var response = JSON.parse(resp.body);
          var decoded = jwt.decode(response.api_token, {complete: true});
          // Update token stored in Redis
          var expiry = decoded.payload.exp - decoded.payload.iat - 10;
          var key = "echo:" + req.body.userId;
          var value = "access_token=" + response.api_token + ":refresh_token=" + response.api_refresh_token;
          Cache.client.set(key, value, function(err, result) {});

          return callback(null, {
            ansibleToken: response.api_token
          });
        });
      }],

      toVcm: ["getToken", function(callback, result) {
        request.post({
          url: sails.config.url.sms,
          headers: {
            "Content-Type": "application/json",
            "X-JWT": result.getToken.ansibleToken
          },
          body: JSON.stringify({
            destination: req.body.destination,
            message: req.body.message
          })
        }, function(err, resp) {
          if (err) {
            return callback({
              status: 503,
              error: {
                code: -1,
                message: "System encountered error"
              }
            });
          }

          if (resp.statusCode !== 200) {
            return callback({
              status: resp.statusCode,
              error: JSON.parse(resp.body)
            });
          }

          return callback();
        });
      }],

      toFirebaseQueue: ["getToken", function(callback, result) {
        var userId = result.checkToken.userId;
        var destination = req.body.destination
        FirebaseService.write("messages/ipcs", userId, destination.substr(1), req.body.message, 
          req.body.timestamp);
        return callback();
      }],

      toFirebaseArchive: ["getToken", function(callback, result) {
        var destination = req.body.destination
        var userId = result.checkToken.userId;
        FirebaseService.write("conversations", userId, destination.substr(1), req.body.message, 
          req.body.timestamp);
        return callback();
      }],

      // toFirebaseContacts: ["getToken", function(callback, result) {
      //   var destination = req.body.destination
      //   var userId = result.getToken.userId;
      //   FirebaseService.writeMeta("conversations-meta", userId, destination.substr(1));
      //   return callback();
      // }]

    }, function(error, result) {
      if (error) {
        res.status(error.status)
          .json(error.error);     
      } else {
        res.status(200)
           .json({
              code: 0,
              message: "Operation completed successfully"
           });
      }
    });
  }
}

// https://firebase.google.com/docs/admin/setup
// https://www.vultr.com/docs/installing-node-js-from-source-on-ubuntu-14-04