var path = require('path');
var data = require('../db/data.js')

var express = require('express');
var app = express();


app.use(express.static('assets/css'));
app.use(express.static('build'));

app.get('/data', function(req, res) {
   res.send(data);
});

app.get('/', function(req, res) {
    res.sendFile(path.resolve() + "/app/views/index.html");
});

app.listen(3000);

console.log("Server started!");