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
          (MM[0]?MM:"0"+MM[0])
};

$(document).ready(function() {

  //***Send Message***//
  $("#message-submit").on("click", function() {
    var newMessage = $("#message-textarea").val();
    // var receiver = "+639473371382";
    var receiver = $("#message-receiver-num").val();
    var date = new Date();
    var now = date.yyyymmddhhMM();

    var messageList = $(".message-list")
    $list = $( messageList );
    $list.append(
      $("<div/>")
        .addClass("message-list-member")
        .append(
          $("<div/>")
            .addClass("member-receiver")
            .text("To: " + receiver))
        .append(
          $("<div/>")
            .addClass("member-message")
            .text(newMessage))
        .append(
          $("<div/>")
            .addClass("member-timestamp")
            .text(now))
    )
  });

});