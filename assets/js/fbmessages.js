// FIX THIS!
// Multi-partners! 

var db = new Firebase("https://echo-de001.firebaseio.com/");
$(document).ready(function() {
  var fbId = $(".nav-user-info").attr("fbId");
  if (!fbId) {
    return false;
  }

  var contactsMenu = $(".nav-menu-rows");
  $contacts = $( contactsMenu );

  var csip = db.child("messages/csip/" + fbId);
  csip.on("value", function(snapshot) {
    if (!snapshot.val()) {
      return false;
    }

    snapshot.forEach(function(data) {
      var partner = data.key();

      if ($contacts.find("a#menu-" + partner).length === 0) {
        $contacts.append(
        $("<a/>")
          .attr("href", "/inbox")
          .attr("id", "menu-" + partner)
          .addClass("menu-message")
          .append(
            $("<div/>")
              .addClass("nav-menu-row")
              .append(
                $("<div/>")
                  .addClass("nav-submenu-label")
                  .text(partner)
              )
          )
        )
      }

      var messageList = $("#content-body-inbox");
      $list = $( messageList );
      $list
        .append(
          $("<div/>")
            .addClass("message-list")
            .attr("id", "inbox-"+partner)
        );

      var contents = data.val();
      $inbox = $( $("#inbox-" + partner) );

      for (var i in contents) {
        $inbox.append(
          $("<div/>")
            .addClass("message-list-member")
            .append(
              $("<div/>")
                .addClass("member-receiver")
                .text("From: " + contents[i].senderId))
            .append(
              $("<div/>")
                .addClass("member-message")
                .text(contents[i].payload))
            .append(
              $("<div/>")
                .addClass("member-timestamp")
                .text(contents[i].timeStamp)))
      }


    });
  });
});