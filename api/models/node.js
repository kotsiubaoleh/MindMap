var mongoose = require("mongoose");

var nodeSchema = new mongoose.Schema({name: String});

module.exports = mongoose.model("Node", nodeSchema);