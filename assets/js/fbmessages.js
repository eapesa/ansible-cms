var db = new Firebase("https://echo-de001.firebaseio.com/");

$(document).ready(function() {
  var fbId = $(".nav-user-info").attr("fbId");
  if (!fbId) {
    return false;
  }

  var contactsMenu = $(".nav-menu-rows");
  $contacts = $( contactsMenu );

  var convo = db.child("conversations/" + fbId);
  convo.on("value", function(snapshot) {

    if (!snapshot.val()) {
      return false;
    }

    snapshot.forEach(function(data) {
      var partner = data.key();
      if ($contacts.find("a#menu-" + partner).length === 0) {
        $contacts.append(
        $("<a/>")
          .attr("id", "menu-" + partner)
          .addClass("menu-message")
          .append(
            $("<div/>")
              .addClass("nav-submenu-row")
              .append(
                $("<div/>")
                  .addClass("nav-submenu-label")
                  .text(partner)
              )
          )
        )

        if ($("#inbox").attr("data-state") === "false") {
          $("#menu-"+partner).addClass("hidden");
        } else {
          $("#menu-"+partner).removeClass("hidden");
        }

        var messageList = $("#content-body-inbox");
        $list = $( messageList );
        $list
          .append(
            $("<div/>")
              .addClass("message-list")
              .addClass("inbox-list")
              .addClass("hidden")
              .attr("id", "inbox-"+partner)
          );

      }

      var contents = data.val();
      $inbox = $( $("#inbox-" + partner) );

      for (var i in contents) {
        var packetId = contents[i].packetId;
        if (packetId && $inbox.find("div#inbox-member"+packetId).length === 0) {
          var dt = new Date(contents[i].timeStamp);
          $inbox.append(
            $("<div/>")
              .addClass("message-list-member")
              .attr("id", "inbox-member"+packetId)
              // .append(
              //   $("<div/>")
              //     .addClass("arrow"))
              // .append(
              //   $("<div/>")
              //     .addClass("member-receiver")
              //     .text("From: " + contents[i].senderId))
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