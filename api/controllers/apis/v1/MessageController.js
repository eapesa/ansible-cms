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

      getToken: function(callback) {
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

          var tokenDetails = result.split(":")[0];
          var token = tokenDetails.split("=")[1];
          callback(null, {
            ansibleToken: token
          });
        });
      },

      toVcm: ["validate", "getToken", function(callback, result) {
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

      toFirebaseQueue: ["validate", "getToken", function(callback, result) {
        var decoded = jwt.decode(result.getToken.ansibleToken, {complete: true});
        var userId = decoded.payload.sub;
        var destination = req.body.destination
        FirebaseService.write("messages/ipcs", userId, destination.substr(1), req.body.message, 
          req.body.timestamp);
        return callback();
      }],

      toFirebaseArchive: ["validate", "getToken", function(callback, result) {
        var decoded = jwt.decode(result.getToken.ansibleToken, {complete: true});
        var userId = decoded.payload.sub;
        var destination = req.body.destination
        FirebaseService.write("conversations", userId, destination.substr(1), req.body.message, 
          req.body.timestamp);
        return callback();
      }]

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