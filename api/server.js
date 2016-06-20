var path = require('path');
var bodyParser = require('body-parser');

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
    req.models = {node: require('./models/node')};
    next();
});

app.use("/data", require('./routes/data'));


app.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.use(function(err, req, res, next) {
    console.log("Error: " + err);
    res.send(err.status);
});

app.listen(3000);

console.log("Server started!");
