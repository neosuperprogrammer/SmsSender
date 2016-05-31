var XLSX = require('xlsx');
var Sms = require("../models/sms");

function createSms(job, user, name, phonenumber) {
  return new Promise(function (resolve, reject) {
    Sms.create(
      {
        name: name,
        phonenumber: phonenumber,
        author: {id: user.id, username: user.username},
        job: {id: job._id}
      }, function (err, sms) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          job.smslist.push(sms);
          resolve(job);
        }
      });
  });
}

function to_json(workbook) {
  var result = {};
  workbook.SheetNames.forEach(function (sheetName) {
    var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    if (roa.length > 0) {
      result[sheetName] = roa;
    }
  });
  return result;
}

module.exports = {
  createSmsFromFile: function (job, user, filepath) {
    //console.log('filepath : ' + filepath);
    var workbook = XLSX.readFile(filepath);
    //console.log('workbook : ' + workbook.SheetNames);
    var translate_data = to_json(workbook)['Sheet1'];
    //console.log(translate_data);
    var sequence = Promise.resolve();
    translate_data.forEach(function (translate) {
      var name = translate['Name'];
      var phonenumber = translate['Phone'];
      sequence = sequence
        .then(function () {
          return createSms(job, user, name, phonenumber)
        });
    });

    return sequence
      .then(function () {
        return new Promise(function (resolve, reject) {
          job.save(function (err, job, numAffected) {
            if (err) {
              reject(err);
            }
            else {
              resolve(job);
            }
          });
        });
      });
  }
};
