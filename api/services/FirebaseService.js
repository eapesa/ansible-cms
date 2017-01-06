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
    var newPostKey = firebase.database().ref().child("messages").push().key;
    // var url = "messages/ipcs/" + userid + "/" + destination + "/" + newPostKey;
    // var url = "conversations/threads/" + userid + "/" + destination + "/" + newPostKey;
    var url = parentPath + "/" + userid + "/" + destination + "/" + newPostKey;
    database.ref(url).set({
      packetId: newPostKey,
      packetType: "simple",
      payload: message,
      senderId: userid,
      timestamp: tsNow
    });
  }

}

// https://github.com/firebase/quickstart-nodejs/blob/master/database/index.js