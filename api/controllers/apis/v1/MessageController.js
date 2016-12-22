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

      toVcm: ["validate", function(callback, result) {
        // Create library to generate JWT for Notification API
        request.post({
          url: "http://runic.voyager.ph/v1/notification/sms",
          headers: {
            "Content-Type": "application/json",
            "X-JWT": req.body.token
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
            })
          }

          return callback();
        });
      }],

      toFirebase: ["validate", function(callback, result) {
        // var userId = req.body.userId;
        var userId = "141";

        // Timestamp to follow must be from the front end.
        FirebaseService.write("141", req.body.destination, req.body.message);
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