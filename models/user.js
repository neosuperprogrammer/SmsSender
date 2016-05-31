var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String
});

module.exports = mongoose.model("User", UserSchema);