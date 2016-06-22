var router = new require('express').Router()
var HttpError = require('../lib/HttpError');

var jwt = require('jwt-simple');

function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().getTime() + 1209600000 // 14 days
    };
    return jwt.encode(payload, "mindMap"); //token secret
}

router.post('/signup', function (req, res, next) {
   req.models.user.findOne({login: req.body.login}, function(err, existingUser) {
       if (existingUser) return next(new HttpError(409, 'Login is already taken'));
       var user = new req.models.user({
           login: req.body.login,
           password: req.body.password
       });
       user.save(function (err, user) {
           if (err) return next(err);
           res.send({token: createJWT(user)});
       })
   })
});

router.post('/login', function(req, res, next) {
    req.models.user.findOne({login: req.body.login}, '+password', function(err, user) {
        if(!user) return next(new HttpError(401, 'Invalid login'));
        user.comparePassword(req.body.password, function(err, isMatch) {
            if(!isMatch) return next(new HttpError(401, 'Invalid password'));
            res.send({token: createJWT(user)});
        })
    })
});

module.exports = router;