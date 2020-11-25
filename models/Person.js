const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  usertype: {
    type: String,
    default: "Customer"
  },
  areacode: {
    type: String
  },
  address: {
    type: String
  },
  mobile: {
    type: String
  },
  profilepic: {
    data: Buffer,
    contentType: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Person = mongoose.model("MyUsers", PersonSchema);
