module.exports = {
  login: function (req, res) {
    req.session.message = false;
    return res.view("login.ejs", {title: "Login"});
  },

  home: function (req, res) {
    req.session.message = false;
    return res.view("home.ejs", {title: "Home"});
  },

  messages: function(req, res) {
    req.session.message = false;
    return res.view("messages.ejs", {title: "Message"});
  }
}