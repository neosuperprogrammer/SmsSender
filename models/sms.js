var mongoose = require("mongoose");

var SmsSchema = mongoose.Schema({
  name: String,
  phonenumber: String,
  status:  {type: Number, default: 0}, // 0: undefined, 1: success, -1:failed
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  job: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }
  }
});

module.exports = mongoose.model("Sms", SmsSchema);