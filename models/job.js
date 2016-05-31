var mongoose = require("mongoose");

var JobSchema = new mongoose.Schema({
  name: String,
  description: String,
  created:  {type: Date, default: Date.now},
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  smslist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sms"
    }
  ]
});

module.exports = mongoose.model("Job", JobSchema);