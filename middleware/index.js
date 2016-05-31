var Sms = require("../models/sms");
var Job = require("../models/job");
var path = require("path");
var fs = require("fs");
var User = require("../models/user");
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var contents = {
  acceptJson: function (req) {
    return req.get('Accept') == "application/json";
  },
  isLoggedIn: function (req, res, next) {
    if (req.isAuthenticated()) {
      next();
    }
    else {
      if (contents.acceptJson(req)) {
        res.send({
          result: 'fail',
          message: 'You must be signed in to do that'
        });
      }
      else {
        req.flash("error", "You must be signed in to do that");
        res.redirect("/login");
      }
    }
  },
  checkUserJob: function (req, res, next) {
    if (req.isAuthenticated()) {
      Job.findById(req.params.id, function (err, job) {
        if (job.author.id.equals(req.user._id)) {
          next();
        } else {
          if (contents.acceptJson(req)) {
            res.send({
              result: 'fail',
              message: "You don't have permission to do that!"
            });
          } else {
            req.flash("error", "You don't have permission to do that!");
            res.redirect("/jobs/");
          }
        }
      });
    } else {
      if (contents.acceptJson(req)) {
        res.send({
          result: 'fail',
          message: "You need to be signed in to do that!"
        });
      } else {
        req.flash("error", "You need to be signed in to do that!");
        res.redirect("/login");
      }
    }
  },
  checkUserSms: function (req, res, next) {
    if (req.isAuthenticated()) {
      Sms.findById(req.params.smsId, function (err, sms) {
        if (err) {
          if (contents.acceptJson(req)) {
            res.send({
              result: 'fail',
              message: err.message
            });
          } else {
            req.flash("error", err.message);
            res.redirect("/jobs/" + req.params.id);
          }
          return;
        }
        if (sms.author.id.equals(req.user._id)) {
          next();
        } else {
          if (contents.acceptJson(req)) {
            res.send({
              result: 'fail',
              message: "You don't have permission to do that!"
            });
          } else {
            req.flash("error", "You don't have permission to do that!");
            res.redirect("/jobs/" + req.params.id);
          }
        }

      });
    } else {
      if (contents.acceptJson(req)) {
        res.send({
          result: 'fail',
          message: "You need to be signed in to do that!"
        });
      } else {
        req.flash("error", "You need to be signed in to do that!");
        res.redirect("/login");
      }
    }
  },
  fileUpload: function (req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
      if (filename.length < 1) {
        req.flash("error", "file is not selected");
        res.redirect("/jobs/new");
        return;
      }
      filename = Date.now() + "-" + filename;
      console.log("Uploading: " + filename);

      //Path where image will be uploaded
      var filepath = path.join(__dirname, '../public/upload/' + filename);
      fstream = fs.createWriteStream(filepath);
      file.pipe(fstream);
      fstream.on('close', function () {
        console.log("******** Upload Finished of " + filename);
        req.body.uploadFilePath = filepath;
        next();
      });
    });
    req.busboy.on('field', function (key, value, keyTruncated, valueTruncated) {
      //console.log(key + " : " + value);
      req.body[key] = value;
    });
    req.busboy.on('error', function () {
      req.flash("error", "file upload failed");
      res.redirect("/jobs");
    });
  },
  authenticate: function (req, res, next) {
    //console.log('authenticate');
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username}, function (err, user) {
      if (err) {
        res.send({
          result: 'fail',
          message: err.message
        });
      }
      if (!user) {
        res.send({
          result: 'fail',
          message: 'user does not exist'
        });
      }
      hasher({password: password, salt: user.salt}, function (err, pass, salt, hash) {
        if (user.hash === hash) {
          req.session.user = user._id;
          next();
        } else {
          res.send({
            result: 'fail',
            message: 'password is wrong'
          });
        }
      });
    });
  }
};

var exports = module.exports = contents;
