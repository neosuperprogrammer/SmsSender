var express   = require("express"),
    passport  = require("passport"),
    User      = require("../models/user"),
    router    = express.Router();

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var middleware = require("../middleware");

router.get("/", function(req, res){
  res.render("landing");
});

router.get("/register", function(req, res){
  res.render("register");
});

router.post("/register", function(req, res){
  var username = req.body.username;
  var password = req.body.password;

  hasher({password: password}, function(err, pass, salt, hash){
    var newUser = new User({
      username: username,
      hash: hash,
      salt: salt
    });

    User.findOne({ username: username }, function (err, user) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/register");
      }
      if (user) {
        req.flash("error", 'user already exists');
        return res.redirect("/register");
      }
      User.create(newUser, function(err, newlyCreated) {
        if (err) {
          console.log(err);
          req.flash("error", err.message);
          return res.redirect("/register");
        } else {
          req.flash("success", "Successfully Signed Up! Nice to meet you " + username);
          passport.authenticate('local')(req, res, function () {
            res.redirect("/jobs");
          })
        }
      });
    });
  });
});

router.get("/login", function(req, res){
  //console.log("get login");
  res.render("login");
});

router.post("/login", function(req, res, next){
  //console.log('login');
  if (middleware.acceptJson(req)) {
    return middleware.authenticate(req, res, function() {
      var username = req.body.username;
      var password = req.body.password;
      var sid = req.sessionID;
      console.log("username : " + username + ", password : " + password);
      res.send({
        result: 'success'
      });
    });
  } else {
    return passport.authenticate("local",
      {
        successRedirect: "/jobs",
        failureRedirect: "/login",
        failureFlash : true // allow flash messages
      })(req, res);
  }
});

router.get("/logout", function(req, res){
  if (middleware.acceptJson(req)) {
    req['user'] = null;
    if (req.session) {
      delete req.session.user;
    }
    res.send({
      result: 'success'
    });
  } else {
    req.logout();
    req.flash("Logged You Out!");
    res.redirect("/");
  }
});

module.exports = router;
