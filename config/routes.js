/**
 * Route Mappings
 * (sails.config.routes)
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  "GET /auth/facebook"          : "web/AuthController.fbLogin",
  "GET /auth/facebook/callback" : "web/AuthController.fbCallback",
  "GET /logout/facebook"        : "web/AuthController.fbLogout",
  
  "GET /"             : "web/PagesController.login",
  "GET /home"         : "web/PagesController.home",
  "GET /composer"     : "web/PagesController.composer",
  "GET /inbox"        : "web/PagesController.inbox",

  "POST /v1/sms"   : "apis/v1/MessageController.send"
};
