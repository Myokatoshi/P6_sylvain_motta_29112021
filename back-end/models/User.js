const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const regExPassword = (value) => {
  const regEx = /(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}/gm.test(value);
  return regEx;
}

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { 
    type: String,
    required: true,
    validate: [regExPassword, 'error']
  }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);