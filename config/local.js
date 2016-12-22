/**
 * Local environment settings
 * For more information, check out:
 * http://sailsjs.org/#!/documentation/anatomy/myApp/config/local.js.html
 */

module.exports = {

  port: process.env.PORT || 8000,
  environment: process.env.NODE_ENV || 'development',

  redis: {
    recheck_interval: 60000, //1 minute
    host: "127.0.0.1",
    port: 6379,
    db: 0
  },

  passport: {  
    facebook: {
      clientId: "770601733096605",
      clientSecret: "9143a828e405f16969f4cdb2e0b7b31c"
    }
  },

  ansible: {
    username: "BXSampleKey",
    password: "BXSampleSecret"
  }

};
