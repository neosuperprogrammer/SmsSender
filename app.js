var express         = require("express"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser"),
    cookieParser    = require("cookie-parser"),
    session         = require("express-session"),
    methodOverride  = require("method-override"),
    seedDB          = require("./seeds"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    User            = require("./models/user"),
    busboy          = require("connect-busboy"),
    app             = express();

var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var MongoStore = require('connect-mongo')(session);

var indexRoutes   = require("./routes/index"),
    jobRoutes     = require("./routes/job"),
    smsRoutes = require("./routes/sms");

var url = process.env.DATABASEURL || "mongodb://localhost/sms_sender";
mongoose.connect(url);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(busboy());
//app.use(busboy({
//  highWaterMark: 2 * 1024 * 1024,
//  limits: {
//    fileSize: 10 * 1024 * 1024
//  }
//}));

app.use(cookieParser("secret"));
app.use(session({
  secret: "session secret",
  //cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 60 * 60, // = 60 minute
    autoRemove: 'native' // Default
  })
}));

//seedDB();

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//passport.use(new LocalStrategy(
//  function(username, password, done) {
//    console.log('local stratage', username, password);
//    User.findOne({ username: username }, function (err, user) {
//      if (err) { return done(err); }
//      if (!user) {
//        return done(null, false);
//      }
//      hasher({ password: password, salt: user.salt}, function(err, pass, salt, hash){
//        if (user.hash === hash) {
//          //MongoStore.destroy(user.session, function(){
//          //  User.update({_id: result._id}, {$set:{"session" : sid}});
//          //});
//          done(null, user);
//        } else {
//          done(null, false);
//        }
//      });
//    });
//  }
//));

passport.use(new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField : 'username',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, username, password, done) {
    //console.log('local stratage', username, password);
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, req.flash('error', 'user not found'));
      }
      hasher({ password: password, salt: user.salt}, function(err, pass, salt, hash){
        if (user.hash === hash) {
          //MongoStore.destroy(user.session, function(){
          //  User.update({_id: result._id}, {$set:{"session" : sid}});
          //});
          done(null, user);
        } else {
          done(null, false, req.flash('error', 'password is wrong'));
        }
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  //console.log('serializeUser');
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  //console.log('deserializeUser');
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  if (req.session.user) {
    var uid = req.session.user;
    //console.log('user id : ' + uid);
    User.findOne({_id: mongoose.Types.ObjectId(uid)}, function (err, foundUser) {
      if (!err) {
        req.user = foundUser;
      }
      next();
    });
  } else {
    next();
  }
});

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  //console.log(req.session);
  next();
});

app.use("/", indexRoutes);
app.use("/jobs", jobRoutes);
app.use("/jobs/:id/smslist", smsRoutes);

var port = process.env.PORT || 3003;
//app.listen(port, process.env.IP, function(){
//  console.log("server started at http://localhost:" + port);
//});
app.listen(port, 'localhost', function(){
  console.log("server started at http://localhost:" + port);
});
