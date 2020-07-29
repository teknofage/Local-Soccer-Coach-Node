const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  name: { type: String, required: true },
  role: {type: String, select: false },
  sports: {type: String, select: false },
  biography: {type: String, select: false },
  profilepicture: {type: mongoose.Schema.Types.Mixed, select: false },
  resume: {type: mongoose.Schema.Types.Mixed, select: false },
  email: {type: String, select: false },
  phone: {type: String, select: false },
//   posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
//   comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

var profileModel = mongoose.model('Profile', profileSchema);
module.exports=profileModle;