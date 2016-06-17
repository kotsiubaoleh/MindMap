var path = require('path');
var data = require('../db/data.json')
var bodyParser = require('body-parser');

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

app.use(bodyParser.json());
    app.get('/data', function(req, res, next) {
        Node.GetFullArrayTree(function(err, root) {
            if (err) {
                next(err);
                return;
            }
            res.send(root[0]);
        })
});


app.put('/data', function (req, res, next) {
    Node.findOne({_id: req.body.parentId}, function (err, parentNode) {
        if (err) {
            next(err);
            return;
        } else if (!parentNode) {
            var error = new Error("Node not find");
            error.status = 404;
            next(error);
            return;
        }
        var newNode = new Node({name: req.body.name});

        parentNode.appendChild(newNode, function (err, node) {
            if (err) {
                next(err);
                return;
            }
            res.send({id: node._id});
        });
    })
});

app.post('/data/:id', function (req, res, next) {
    Node.findOne({_id: req.params.id}, function (err, node) {
        if (err) {
            next(err);
            return;
        }
        node.name = req.body.name;
        node.save(function (err, node) {
            if (err) {
                next(err);
                return;
            }
            res.send({success: true});
        });
    })
});

app.delete('/data/:id', function (req, res, next) {
    Node.findOne({_id: req.params.id},function (err, node) {
        if (err) {
            next(err);
            return;
        }
        node.getChildren({limit: 300, fields: {_id:1}}, function (err, idsToDelete) {
            if (err) {
                next(err);
                return;
            }
            idsToDelete.push(req.params.id);
            Node.remove({_id: {$in: idsToDelete}}, function (err) {
                if (err) {
                    next(err);
                    return;
                }
                res.send({success: true});
            })
        })
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
