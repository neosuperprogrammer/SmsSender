var express = require("express");
var mongoose = require("mongoose");
var router = express.Router({mergeParams: true});
var Job = require("../models/job");
var Sms = require("../models/sms");
var middleware = require("../middleware");
var fs = require("fs");
var path = require("path");
var dbHandler = require("../dbhandler");

//router.get("/", middleware.isLoggedIn, function (req, res) {
//  //req.flash("error", "test error");
//  Job.find({'author.id': mongoose.Types.ObjectId(req.user._id)}, function (err, allJobs) {
//    if (err) {
//      console.log(err);
//      req.flash("error", err.message);
//      res.redirect("back");
//    } else {
//      res.render("job/index", {jobs: allJobs});
//    }
//  });
//});

router.get("/", middleware.isLoggedIn, function (req, res) {
  //console.log(req.get('Accept'));

  var itemPerPage = 10;
  var currentPage = 1;
  Job.find({'author.id': mongoose.Types.ObjectId(req.user._id)})
    //.skip(itemPerPage * (currentPage - 1))
    //.limit(itemPerPage)
    .sort({created: 'desc'})
    .exec(function (err, allJobs) {
      if (err) {
        console.log(err);
        if (middleware.acceptJson(req)) {
          res.send({
            result: 'fail',
            message: err.message
          });
        } else {
          req.flash("error", err.message);
          res.redirect("back");
        }
      } else {
        var total = allJobs.length;
        var start = itemPerPage * (currentPage - 1);
        var end = start + itemPerPage;
        var subList = allJobs.slice(start, end);
        var result = {
          result: 'success',
          jobs: subList,
          totalJobCount:total,
          itemPerPage: itemPerPage,
          currentPage: currentPage
        };
        if (middleware.acceptJson(req)) {
          res.send(result);
        } else {
          res.render("job/index", result);
        }
      }
    });
});

router.get("/page/:page", middleware.isLoggedIn, function (req, res) {
  //req.flash("error", "test error");
  var itemPerPage = 10;
  var currentPage = req.params.page;
  Job.find({'author.id': mongoose.Types.ObjectId(req.user._id)})
    //.skip(itemPerPage * (currentPage - 1))
    //.limit(itemPerPage)
    .sort({created: 'desc'})
    .exec(function (err, allJobs) {
      if (err) {
        console.log(err);
        if (middleware.acceptJson(req)) {
          res.send({
            result: 'fail',
            message: err.message
          });
        } else {
          req.flash("error", err.message);
          res.redirect("back");
        }
      } else {
        var total = allJobs.length;
        var start = itemPerPage * (currentPage - 1);
        var end = start + itemPerPage;
        var subList = allJobs.slice(start, end);
        var result = {
          result: 'success',
          jobs: subList,
          totalJobCount:total,
          itemPerPage: itemPerPage,
          currentPage: currentPage
        };
        if (middleware.acceptJson(req)) {
          res.send(result);
        } else {
          res.render("job/index", result);
        }
      }
    });
});

router.get("/new", middleware.isLoggedIn,  function(req, res){
  //req.flash("error", "test error");
  //res.redirect("/");
  res.render("job/new")
});

router.post("/", middleware.isLoggedIn, middleware.fileUpload, function(req, res){
  // get data from form and add to job array
  console.log("upload file path : " + req.body.uploadFilePath);
  var name = req.body.name;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newJob = {name: name, description: description, author:author}
  // Create a new campground and save to DB
  Job.create(newJob, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
      dbHandler.createSmsFromFile(newlyCreated, author, req.body.uploadFilePath)
        .then(function() {
          //console.log(newlyCreated);
          res.redirect("/jobs");
        })
        .catch(function(err) {
          console.log(err);
          req.flash("error", err.message);
          res.redirect("/jobs/new");
        });
      //Sms.create(
      //  {
      //    name: "홍길동",
      //    phonenumber: "01023456789",
      //    author: author,
      //    job: newlyCreated
      //  }, function (err, sms) {
      //    if (err) {
      //      console.log(err);
      //    } else {
      //      //job.author = {id: user._id, username: user.username};
      //      newlyCreated.smslist.push(sms);
      //      newlyCreated.save(function (err, job, numAffected) {
      //        if (err) {
      //          console.log(err);
      //        }
      //        else {
      //          console.log(newlyCreated);
      //          res.redirect("/jobs");
      //        }
      //      });
      //    }
      //  });
    }
  });
});

router.get("/:id", middleware.checkUserJob, function(req, res){
  // find the job with provided id
  Job.findById(req.params.id).populate("smslist").exec(function(err, foundJob){
    if(err){
      req.flash("error", err.message);
      console.log(err);
      res.redirect("/jobs");
    } else {
      //console.log(foundJob)
      //render show template with that campground
      res.render("job/show", {job: foundJob, itemPerPage:10, currentPage: 1});
    }
  });
});

router.get("/:id/page/:page", middleware.checkUserJob, function(req, res){
  // find the job with provided id
  Job.findById(req.params.id).populate("smslist").exec(function(err, foundJob){
    if(err){
      console.log(err);
      if (middleware.acceptJson(req)) {
        res.send({
          result: 'fail',
          message: err.message
        });
      } else {
        req.flash("error", err.message);
        res.redirect("/jobs");
      }
    } else {
      //console.log(foundJob)
      //render show template with that campground
      var result = {
        result: 'success',
        job: foundJob,
        itemPerPage:10,
        currentPage: req.params.page
      };
      if (middleware.acceptJson(req)) {
        res.send(result);
      } else {
        res.render("job/show", result);
      }
    }
  });
});

router.delete("/:id", middleware.checkUserJob, function(req, res){
  Job.findByIdAndRemove(req.params.id, function(err){
    if(err){
      console.log(err);
    } else {
      Sms.find({'job.id': mongoose.Types.ObjectId(req.params.id)}).remove(function(err){
        if(err) {
          console.log(err);
        }
        else {
          res.redirect("/jobs");
        }
      });
    }
  })
});

router.get("/:id/edit", middleware.checkUserJob, function(req, res){
  Job.findById(req.params.id).populate("smslist").exec(function(err, foundJob){
    if(err){
      console.log(err);
      req.flash("error", err.message);
      res.redirect("/jobs/" + req.params.id);
    } else {
      //console.log(foundJob)
      res.render("job/edit", {job: foundJob});
    }
  });
});

router.put("/:id", middleware.checkUserJob, function(req, res){
  var newData = {name: req.body.job.name, description: req.body.job.description};
  Job.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, job){
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      req.flash("success","Successfully Updated!");
      res.redirect("/jobs/" + job._id);
    }
  });
});

module.exports = router;
