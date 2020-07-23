const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  name: { type: String, required: true },
  role: {type: String, select: false },
  sports: {type: String, select: false },
  biography: {type: String, select: false },
  profilepicture: {type: String, select: false },
  resume: {type: String, select: false },
  email: {type: String, select: false },
  phone: {type: String, select: false },
//   posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
//   comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});