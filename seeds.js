var mongoose = require("mongoose"),
  Job = require("./models/job"),
  Sms = require("./models/sms"),
  User = require("./models/user");

//var Promise = require('bluebird');
//var JobSchema = new mongoose.Schema({
//  jobname: String,
//  description: String,
//  created:  {type: Date, default: Date.now},
//  author: {
//    id: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: "User"
//    },
//    username: String
//  },
//  smslist: [
//    {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: "Sms"
//    }
//  ]
//});

var data = [
  {
    name: "alarm sms 1",
    description: "alarm sms for test 1"
  },
  {
    name: "alarm sms 2",
    description: "alarm sms for test 2"
  },
  {
    name: "alarm sms 3",
    description: "alarm sms for test 3"
  }
  //{
  //  name: "alarm sms 4",
  //  description: "alarm sms for test 4"
  //},
  //{
  //  name: "alarm sms 5",
  //  description: "alarm sms for test 5"
  //},
  //{
  //  name: "alarm sms 6",
  //  description: "alarm sms for test 6"
  //},
  //{
  //  name: "alarm sms 7",
  //  description: "alarm sms for test 7"
  //},
  //{
  //  name: "alarm sms 8",
  //  description: "alarm sms for test 8"
  //},
  //{
  //  name: "alarm sms 9",
  //  description: "alarm sms for test 9"
  //},
  //{
  //  name: "alarm sms 10",
  //  description: "alarm sms for test 10"
  //},
  //{
  //  name: "alarm sms 11",
  //  description: "alarm sms for test 11"
  //},
  //{
  //  name: "alarm sms 12",
  //  description: "alarm sms for test 4"
  //}
];

//var SmsSchema = mongoose.Schema({
//  name: String,
//  phonenumber: Sring,
//  status:  {type: Number, default: 0}, // 0: undefined, 1: success, -1:failed
//  job: {
//    id: {
//      type: mongoose.Schema.Types.ObjectId,
//      ref: "Job"
//    },
//    jobname: String
//  }
//});

var index = 0;
function createSms(job, user) {
  index++;
  return new Promise(function (resolve, reject) {
    //var name =  "name for sms (" + index + ")";
    //console.log(user);
    Sms.create(
      {
        name: "name for sms (" + index + ")",
        phonenumber: "01023456789",
        author: {id: user._id, username: user.username},
        job: {id: job._id}
      }, function (err, sms) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          //job.author = {id: user._id, username: user.username};
          job.smslist.push(sms);
          job.save(function (err, job, numAffected) {
            if (err) {
              reject(err);
            }
            else {
              //console.log("Created new sms");
              resolve(job);
            }
          });
        }
      });
  });
}

function createSmsList(job, user, count) {
  var sequence = Promise.resolve();
  for (var i = 0; i < count; i++) {
    sequence = sequence
      .then(function () {
        return createSms(job, user);
      });
  }
  return sequence;
}

function removeAllJob() {
  return new Promise(function (resolve, reject) {
    Job.remove({}, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      else {
        console.log("removed all jobs!");
        resolve();
      }
    });
  });
}

function removeAllSms() {
  return new Promise(function (resolve, reject) {
    Sms.remove({}, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      else {
        console.log("removed all sms!");
        resolve();
      }
    });
  });
}

function createJob(job, user) {
  return new Promise(function (resolve, reject) {
    Job.create(job, function (err, createdJob) {
      if (err) {
        console.log(err);
        reject(err);
      }
      else {
        console.log(user);
        createdJob.author = {id: user._id, username: user.username};
        createdJob.save(function (err, job, numAffected) {
          if (err) {
            reject(err);
          }
          else {
            console.log("added a job!");
            //console.log("Created new sms");
            resolve(createdJob);
          }
        })
      }
    });
  });
}

function getUser(index) {
  return new Promise(function (resolve, reject) {
    User.find({}, function (err, allUser) {
      if (err) {
        console.log(err);
        reject(err);
      }
      else {
        if (allUser.length < 1) {
          reject("no user");
          return;
        }
        if (index >= allUser.length) {
          index = allUser.length - 1;
        }
        var user = allUser[index];
        resolve(user);
      }
    });
  });
}

var userSeq = 0;

function createJobs() {
  var sequence = Promise.resolve();
  data.forEach(function (seed) {
    sequence = sequence
      .then(function () {
        return getUser(userSeq)
          .then(function (user) {
            return createJob(seed, user);
          });
      })
      .then(function (job) {
        return getUser(userSeq)
          .then(function(user) {
            userSeq++;
            return createSmsList(job, user, 101);
          });
      })
      .then(function () {
        return new Promise(function (resolve, reject) {
          Sms.find({}, function (err, allSms) {
            if (err) {
              console.log(err);
              reject(err);
            }
            else {
              console.log("sms count: " + allSms.length);
              resolve();
            }
          });
        })
      })
      .catch(function (err) {
        console.log(err);
      });
  });
  return sequence;
}

function seedDB() {
  removeAllJob()
    .then(removeAllSms)
    .then(function() {

    })
    //.then(createJobs)
    .catch(function (err) {
      console.log(err);
    });
}

module.exports = seedDB;
