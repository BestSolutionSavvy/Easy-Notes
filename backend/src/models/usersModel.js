const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  surname: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "teacher"],
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  }],
});

// Method to get user info without password
userSchema.methods.toUserInfo = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// Automatically exclude password when converting to JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };
