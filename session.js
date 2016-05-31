/**
 * Created by neox on 5/14/16.
 */

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
//var fileStore = require('session-file-store')(session);
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);

var url = process.env.DATABASEURL || "mongodb://localhost/sms_sender";
mongoose.connect(url);

var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended : true }));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  //cookie: { maxAge: 60000 },
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 60, // = 1 minute
    autoRemove: 'native' // Default
  })
}));

app.get('/count', function(req, res){
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }
  res.send('>> count : ' + req.session.count);
});

app.get('/login', function(req, res){
  res.render('login2');

  //var output = `
  //  <form action="/login" method="post">
  //    <div>
  //      <input type="text" name="username" placeholder="username">
  //    </div>
  //    <div>
  //      <input type="password" name="password" placeholder="password">
  //    </div>
  //    <div>
  //      <input type="submit">
  //    </div>
  //  </form>
  //`;
  //res.send(output);
});

app.post('/login', function(req, res){
  var user = {
    username: 'test',
    password: 'test',
    displayName: 'Test'
  };
  var username = req.body.username;
  var password = req.body.password;
  if(username == user.username && password == user.password) {
    req.session.displayName = user.displayName;
    req.session.save(function(){
      res.redirect('/welcome');
    });
  }
  else {
    res.send('who are you <a href="/login">login</a>');
  }
});

app.get('/welcome', function(req, res){
  if (req.session.displayName) {
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/logout">Logout</a>
    `);
  }
  else {
    res.send(`
      <h1>Welcome</h1>
      <a href="/login">Login</a>
    `);
  }
});

app.get('/logout', function(req, res){
  delete req.session.displayName;
  req.session.save(function(){
    res.redirect('/welcome');
  });
});

app.listen(3003, function(){
  console.log('server started at http://localhost:3003/count');
});