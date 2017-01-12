Date.prototype.yyyymmddhhMM = function() {
  var yyyy = this.getFullYear().toString();
  var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
  var dd  = this.getDate().toString();
  var hh = this.getHours().toString();
  var MM = this.getMinutes().toString();

  return  yyyy + "/" + 
          (mm[1]?mm:"0"+mm[0]) + "/" + 
          (dd[1]?dd:"0"+dd[0]) + " " +
          (hh[1]?hh:"0"+hh[0]) + ":" +
          (MM[1]?MM:"0"+MM[0])
};

function viewResponse(type, status, message) {
  if (type === "success") {
    $(".response-panel").removeClass("response-panel-error");
    $(".response-panel").addClass("response-panel-success");

    $(".response-cancel").removeClass("response-cancel-error");
    $(".response-cancel").addClass("response-cancel-success");

    $(".response-title").text("Success " + status);
  } else {
    $(".response-panel").removeClass("response-panel-success");
    $(".response-panel").addClass("response-panel-error");

    $(".response-cancel").removeClass("response-cancel-success");
    $(".response-cancel").addClass("response-cancel-error");

    $(".response-title").text("Error " + status);
  }
  $(".response-message").text(message);
  $(".response-panel").show();
}

$(document).ready(function() {

  $(".response-panel").hide();

  $(".response-cancel").on("click", function() {
    $(".response-panel").hide();
  });

  //***Send Message***//
  $("#message-submit").on("click", function() {
    var userId = $("#user-info").attr("userId");
    var destination = $("#message-receiver-num").val();
    var newMessage = $("#message-textarea").val();
    var date = new Date();
    var now = date.yyyymmddhhMM();
    var nowTs = Date.now();

    $.ajax({
      type  : "POST",
      url   : "/v1/sms",
      data  : JSON.stringify({
        destination : destination,
        message     : newMessage,
        timestamp   : nowTs,
        userId      : userId
      }),
      contentType       : "json",
      dataType          : "json",
      complete    : function(xhr) {
        var response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          var messageList = $(".message-list")
          $list = $( messageList );
          $list
            .addClass("message-inbox")
            .append(
              $("<div/>")
                .addClass("message-list-member")
                .addClass("message-list-member-composer")
                .append(
                  $("<div/>")
                    .addClass("member-receiver")
                    .text("To: " + destination))
                .append(
                  $("<div/>")
                    .addClass("member-message")
                    .text(newMessage))
                .append(
                  $("<div/>")
                    .addClass("member-timestamp")
                    .text(now)))   
        } else {
          console.log("Encountered error: " + JSON.stringify(response));
          viewResponse("error", xhr.status, response.message);
        }
      }
    });
  });

  $("#reply-submit").on("click", function() {
    var userId = $("#user-info").attr("userId");
    var destination = $("#inbox-content-header").attr("data-receiver");
    var newMessage = $("#reply-textarea").val();
    var date = new Date();
    var nowTs = Date.now();

    // var originalLength = $("#inbox-"+destination).children().length;
    $.ajax({
      type  : "POST",
      url   : "/v1/sms",
      data  : JSON.stringify({
        destination : "+" + destination,
        message     : newMessage,
        timestamp   : nowTs,
        userId      : userId
      }),
      contentType       : "json",
      dataType          : "json",
      complete    : function(xhr) {
        var response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
           var newMessage = $("#reply-textarea").val("");
           // var newLength = $("#inbox-"+destination).children().length;
        } else {
          console.log("Encountered error: " + JSON.stringify(response));
          viewResponse("error", xhr.status, response.message);
        }
      }
    });
  });

  $("#composer").on("click", function() {
    $(".reply-div").addClass("hidden");
  });

});

// $(document).on("click", "a.menu-message", function() {
$(document).on("click", "div.contacts-member", function() {
  var elemId = $(this).attr("id");
  var id = elemId.split("-")[2];

  $(this).addClass("contacts-member-selected");
  $(this).siblings().removeClass("contacts-member-selected");

  $("#inbox-"+id).removeClass("hidden");
  $("#inbox-"+id).siblings().addClass("hidden");

  $(".reply-div").removeClass("hidden");

  $("#inbox-"+id).animate({
    scrollTop: $("#inbox-"+id).get(0).scrollHeight
  });

});