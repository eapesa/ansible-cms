var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: sails.config.passport.facebook.clientId,
    clientSecret: sails.config.passport.facebook.clientSecret,
    callbackURL: sails.config.url.facebook,
    enableProof: false
  }, function (accessToken, refreshToken, profile, done) {
    return done(null, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      profile: profile
    });
  }
));