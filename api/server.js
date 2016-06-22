var path = require('path');
var bodyParser = require('body-parser');
var HttpError = require('./lib/HttpError');

var express = require('express');
var app = express();

var mongoose = require('mongoose'),
    materialized = require('mongoose-materialized');

mongoose.connect("mongodb://localhost/mindMap");
mongoose.connection.on('error', function (err) {
    console.log(err);
    process.exit(1);
});

mongoose.plugin(materialized);

app.use('/assets/css', express.static(path.join(__dirname, '../assets/css')));
app.use('/build',express.static(path.join(__dirname, '../build')));
app.use('/bower_components', express.static(path.join(__dirname,'../bower_components')));
app.use('/app/views', express.static(path.join(__dirname, '../app/views')));

app.use(bodyParser.json());

app.use(function (req, res, next) {
    req.models = {};
    req.models.node = require('./models/node');
    req.models.user = require('./models/user');
    next();
});

app.use('/auth',require('./routes/auth'));
app.use('/data', require('./routes/data'));


app.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.use(function(err, req, res, next) {
    if (err instanceof HttpError) {
        res.send(err.status, err.message);
        return;
    }

    console.log('Error: ' + err);
    console.log(err.stack);
    res.send(err.status);
});

app.listen(3000, function () {
    console.log('Server started!');
});


