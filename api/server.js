var path = require('path');
var data = require('../db/data.json')

var express = require('express');
var app = express();

var mongoose = require('mongoose'),
    materialized = require('mongoose-materialized');

mongoose.connect("mongodb://localhost/mindMap");
mongoose.plugin(materialized);

var NodeSchema = new mongoose.Schema({name: String});
var Node = mongoose.model("Node", NodeSchema)

app.use('/assets/css', express.static(path.join(__dirname, '../assets/css')));
app.use('/build',express.static(path.join(__dirname, '../build')));
app.use('/bower_components', express.static(path.join(__dirname,'../bower_components')));
app.use('/app/views', express.static(path.join(__dirname, '../app/views')));

app.get('/data', function(req, res, next) {
    Node.GetFullArrayTree(function(err, root) {
        if (err) next(err);
        res.send(root[0]);
    })
});

// app.get('/data', function(req, res, next) {
//     res.send(data);
//
// });

app.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, "../index.html"));
});

app.use(function(err, req, res, next) {
    console.log(err);
   res.send(err.status);
});

app.listen(3000);

console.log("Server started!");
