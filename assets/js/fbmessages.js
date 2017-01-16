var db = new Firebase("https://echo-de001.firebaseio.com/");

$(document).ready(function() {
  var fbId = $(".nav-user-info").attr("fbId");
  if (!fbId) {
    return false;
  }

  var contactsMenu = $("#content-body-contacts");
  $contacts = $( contactsMenu );

  var convo = db.child("conversations/" + fbId);
  convo.on("value", function(snapshot) {

    console.log("===Firebase Data===");
    console.log(snapshot.val());
    if (!snapshot.val()) {
      // Show empty
      return false;
    }

    snapshot.forEach(function(data) {
      var partner = data.key();
      if ($contacts.find("div#contacts-member-" + partner).length === 0) {
        $contacts.append(
          $("<div/>")
            .attr("id", "contacts-member-"+partner)
            .addClass("contacts-member")
            .text(partner)
        );

        var messageList = $("#content-body-inbox");
        $list = $( messageList );
        $list.append(
          $("<div/>")
            .attr("id", "inbox-"+partner)
            .addClass("inbox-list")
            .addClass("hidden")
          );

      }

      $inbox = $( $("#inbox-" + partner) );
      var contents = data.val();
      for (var i in contents) {
        var packetId = contents[i].packetId;
        if (packetId && $inbox.find("div#inbox-member"+packetId).length === 0) {
          var dt = new Date(contents[i].timeStamp);
          $inbox.append(
            $("<div/>")
              .addClass("message-list-member")
              .attr("id", "inbox-member"+packetId)
              .append(
                $("<div/>")
                  .addClass("member-message")
                  .text(contents[i].payload))
              .append(
                $("<div/>")
                  .addClass("member-timestamp")
                  .text(dt)));

          if (contents[i].senderId === fbId) {
            $("#inbox-member"+packetId).addClass("message-list-member-me");
          } else {
            $("#inbox-member"+packetId).addClass("message-list-member-partner");
          }

        }
      }
    });
  });

});