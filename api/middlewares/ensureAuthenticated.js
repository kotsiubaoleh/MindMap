var HttpError = require('../lib/HttpError');
var jwt = require('jwt-simple');

function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        return next(new HttpError(401, 'Please make sure your request has an Authorization header'));
    }
    var token = req.header('Authorization').split(' ')[1];

    var payload = null;
    try {
        payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (err) {
        return next(err);
    }

    if (payload.exp <= moment().unix()) {
        return next(new HttpError(401,'Token has expired'));
    }
    req.user = payload.sub;
    next();
}