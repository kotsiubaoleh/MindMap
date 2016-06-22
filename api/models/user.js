var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    login: {type: String, unique: true},
    password: {type: String, select: false},
});

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
       callback(err, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);