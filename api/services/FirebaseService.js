var path = require("path");
var firebase = require("firebase-admin");
var database;

module.exports = {
  initialize: function() {
    var serviceAccount = require(path.join(__dirname, "../../priv/serviceAccountKey.json"));

    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: sails.config.url.firebase
    });

    database = firebase.database();
  },

  write: function(parentPath, userid, destination, message, tsNow) {
    var newPostKey = firebase.database().ref().child(parentPath).push().key;
    var url = parentPath + "/" + userid + "/" + destination + "/" + newPostKey;
    database.ref(url).set({
      packetId: newPostKey,
      packetType: "simple",
      payload: message,
      senderId: userid,
      timeStamp: tsNow
    });
  },

  writeMeta: function(parentPath, userid, destination) {
    var newPostKey = firebase.database().ref().child(parentPath).push().key;
    var url = parentPath + "/" + userid + "/" + destination;
    database.ref(url).set({
      packetId: newPostKey
    });
  }

}

// https://github.com/firebase/quickstart-nodejs/blob/master/database/index.js