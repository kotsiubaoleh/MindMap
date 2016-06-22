var util = require('util');

function HttpError(status, message) {
    this.status = status;
    this.message = message;
}

util.inherits(HttpError, Error);

module.exports = HttpError;