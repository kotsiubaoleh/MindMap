var mongoose = require('mongoose'),
    materialized = require('mongoose-materialized'),
    mindMapData = require('./db/testdata.json');
    Schema = mongoose.Schema;

function getNodeNum(node) {
    var num = 1;
    if (node.children) {
        node.children.forEach((child) => {
            num += getNodeNum(child)
        });
    }
    return num;
}

function saveData(data, callback) {
    mongoose.connect("mongodb://localhost/mindMap");

    var NodeSchema = new Schema({name: String});
    NodeSchema.plugin(materialized);

    var Node = mongoose.model('Node',NodeSchema);
    
    nodesLeft = getNodeNum(data);

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

module.exports = saveData;

if (!module.parent) saveData(mindMapData, () => console.log("Data saved."));