var request = require("request");
var passport = require("passport");

module.exports = {
  fbLogin: function(req, res, next) {
    passport.authenticate("facebook", { scope: ["email", "user_about_me"]},
      function (err, authDetails) {
          req.logIn(user, function (err) {
          if (err) {
            req.session = {
              id: false,
              code: -1,
              message: "System encountered error"
            };
            res.redirect("/");
          } else {
            ansibleAuth(authDetails, function(session) {
              req.session.user = session;
              res.redirect("/home");
            });
          }
        });
    })(req, res, next);
  },

  fbCallback: function(req, res, next) {
    passport.authenticate("facebook",
      function (err, authDetails) {
        if (err) {
          console.log("[AUTH ERROR - passport] " + JSON.stringify(err));
          req.session.user = {
            id: false,
            code: -2,
            message: "System encountered error"
          };
          res.redirect("/");
        }

        if (!authDetails) {
          console.log("[AUTH ERROR - no auth details]");
          req.session.user = {
            id: false,
            code: -2,
            message: "System encountered error"
          };
          res.redirect("/");
        }

        ansibleAuth(authDetails, function(session) {
          req.session.user = session;
          res.redirect("/home");
        });     
    })(req, res, next);
  },

  fbLogout: function(req, res) {
    if (!req.session || !req.session.user) {
      res.redirect("/");
    } else {
      Cache.client.del("echo:" + req.session.user.profile_id, function() {});
      req.session.destroy(function(err) {
        res.redirect("/");
      });
    }
  }
}

ansibleAuth = function(authDetails, callback) {
  var basic = "Basic " + new Buffer(sails.config.ansible.username + ":" + 
    sails.config.ansible.password).toString("base64");
  request.get({
    url: sails.config.url.token,
    headers: {
      authorization: basic
    },
    qs: {
      type: "facebook",
      access_token: authDetails.accessToken
    }
  }, function(err, resp) {
    if (err) {
      console.log("[AUTH ERROR - ansible API connection error] " + JSON.stringify(err));
      return callback({
        id: false,
        code: -2,
        message: "System encountered error"
      });
    }

    if (resp.statusCode !== 200) {
      console.log("[AUTH ERROR - ansible API returned error] " + resp.statusCode + " :: " + 
        JSON.stringify(resp.body));
      return callback({
        id: false,
        code: -2,
        message: "System encountered error"
      });
    }

    var response = JSON.parse(resp.body);
    var decoded = jwt.decode(response.api_token, {complete: true});
    var expiry = decoded.payload.exp - decoded.payload.iat - 10;
    var key = "echo:" + authDetails.profile.id;
    var value = "access_token=" + response.api_token + ":refresh_token=" + response.api_refresh_token;
    Cache.client.set(key, value, function(err, result) {});

    callback({
      ansible_id: decoded.payload.sub,
      profile_id: authDetails.profile.id,
      displayName: authDetails.profile.displayName,
      code: 0
    });
  });
}