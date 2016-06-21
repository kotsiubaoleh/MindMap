var mongoose = require('mongoose'),
    materialized = require('mongoose-materialized'),
    mindMapData = require('./db/data.json'),
    async = require('async');
    Schema = mongoose.Schema;

var NodeSchema = new Schema({name: String});
NodeSchema.plugin(materialized);

var Node = mongoose.model('Node',NodeSchema);

async.series([
    connect,
    dropDb,
    insertData
], function (err) {
    if (err) console.log("Error");
    else console.log("Data successfully inserted");
    mongoose.disconnect();
});


function connect(callback) {
    mongoose.connect("mongodb://localhost/mindMap");
    mongoose.connection.on("open", function(err) {
        if (err) callback(err);
        else callback(null);
    });
}

function dropDb(callback) {
    mongoose.connection.db.dropDatabase(function (err, result) {
        if (err) callback(err);
        else callback(null);
    });
}

function getNodeNum(node) {
    var num = 1;
    if (node.children) {
        node.children.forEach((child) => {
            num += getNodeNum(child)
        });
    }
    return num;
}

function insertData(callback) {
    nodesLeft = getNodeNum(mindMapData);

    function saveChildren(err, parentNode) {

        if (err) {
            console.error(parentNode + " Error: " + err.message);
            return;
        }
        
        if (--nodesLeft == 0) {
            mongoose.disconnect();
            callback();
            return;
        }

        if (this.children) {
            this.children.forEach((childNode, i, children) => {
                var node = new Node({name: childNode.name});
                parentNode.appendChild(node, saveChildren.bind(childNode));
            })
        }
    }

    var node = new Node({name: mindMapData.name});
    node.save(saveChildren.bind(mindMapData));
}
