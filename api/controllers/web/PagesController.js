module.exports = {
  login: function (req, res) {
    req.session.message = false;
    return res.view("login.ejs", {title: "Login"});
  },

  home: function (req, res) {
    req.session.message = false;
    return res.view("home.ejs", {title: "Home"});
  },

  composer: function(req, res) {
    req.session.message = false;
    return res.view("composer.ejs", {title: "Send SMS"});
  },

  inbox: function(req, res) {
    req.session.message = false;
    return res.view("inbox.ejs", {title: "Inbox"});
  }
}