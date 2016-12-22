var path = require("path");
var firebase = require("firebase-admin");
var database;

module.exports = {
  initialize: function() {
    var serviceAccount = require(path.join(__dirname, "../../priv/serviceAccountKey.json"));

    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: "https://echo-de001.firebaseio.com"
    });

    database = firebase.database();
  },

  write: function(userid, destination, message) {
    var tsNow = Date.now();
    var newPostKey = firebase.database().ref().child("messages").push().key;
    var url = "messages/ipcs/" + userid + "/" + destination + "/" + newPostKey;
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