var express = require("express");
var Job = require("../models/job");
var Sms = require("../models/sms");
var middleware = require("../middleware");
var router = express.Router({mergeParams: true});

router.get("/:smsId", middleware.checkUserSms, function(req, res){
  // find sms with provided id
  //console.log("id : " + req.params.id);
  //console.log("sms id : " + req.params.smsId);
  Sms.findById(req.params.smsId, function(err, sms){
    if(err){
      console.log(err);
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render("sms/show", {job_id: req.params.id, sms: sms});
    }
  });
});

router.put("/:smsId", middleware.checkUserSms, function(req, res){
  //res.send(req.body.status);
  // find sms with provided id
  console.log("id : " + req.params.id);
  console.log("sms id : " + req.params.smsId);
  if(req.body.status == "success") {
    var status = 1;
  }
  else if (req.body.status == "fail") {
    var status = -1;
  }
  Sms.findByIdAndUpdate(req.params.smsId, {status: status}, function(err, sms){
    if(err){
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
      if (middleware.acceptJson(req)) {
        res.send({
          result: 'success'
        });
      } else {
        res.redirect("/jobs/" + req.params.id + "/smslist/" + req.params.smsId);
        //res.render("sms/show", {job_id: req.params.id, sms: sms});
      }
    }
  });
});

module.exports = router;
