var mongoose = require("mongoose"),
    materialize = require("mongoose-materialized"),
    Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/mindMap");
mongoose.plugin(materialize);

var NodeSchema = new Schema({name: String});

var Node = mongoose.model("Node", NodeSchema);

// Node.findOne({name: 15}, function (err, node) {
//     if (err) console.log(err.message);
//     node.getTree(function (err, tree) {
//         console.log(JSON.stringify(tree));
//         mongoose.disconnect();
//     })
// });

// Node.GetFullTree(function(err, node) {
//    console.log(node);
// });

// Node.findOne({name: 9},function (err, node) {
//     if (err) console.error(err);
//     node.getArrayTree({fields: {name: 1}}, function (err, node) {
//         console.log(node);
//     })
// });


// Node.update({name: "ten"},{$set: {name: 100}},function (err, res) {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log(res);
// });

// Node.where("name").eq("1").exec(function (err, node) {
//     console.log(node);
// })

//console.log(Node.count());

Node.findOne({name: "Community"},function (err, node) {
   console.log(node);
   node.getChildren({limit: 300, fields: {_id:1}}, function (err, idsToDelete) {
      if (err )console.log(err);
      Node.remove({_id: {$in: idsToDelete}}, function (err, res) {
         if (err )console.log(err);
         console.log(res);
      })
   })
})