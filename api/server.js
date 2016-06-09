var path = require('path');
var data = require('../db/data.json')

var express = require('express');
var app = express();


app.use('/assets/css', express.static(path.join(__dirname, '../assets/css')));
app.use('/build',express.static(path.join(__dirname, '../build')));
app.use('/bower_components', express.static(path.join(__dirname,'../bower_components')));

app.get('/data', function(req, res) {
   res.send(data);
});

app.get('/', function(req, res) {
    res.sendFile(path.resolve() + "/app/views/index.html");
});

app.listen(3000);

console.log("Server started!");
console.log(path.join(__dirname, '../build'));