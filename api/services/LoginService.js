var passport = require("passport-facebook");

module.exports = {
  initialize: function(req, res) {
    passport.use("facebook", new FacebookStrategy({
      clientID: sails.config.passport.facebook.clientId,
      clientSecret: sails.config.passport.facebook.clientSecret,
      callbackURL: "http://localhost:8000/auth/facebook/callback"
    }), function(accessToken, refreshToken, profile, cb) {
      console.log(accessToken);
      console.log(profile);
      // res.status(200)
      //   .json({
      //     success: "ok"
      //   });
    })
  }
}