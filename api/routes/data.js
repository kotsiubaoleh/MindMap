var router = require('express').Router();
var node = require('../models/node');
var async = require('async');

router.get('/', function(req, res, next) {
    req.models.node.GetFullArrayTree(function(err, root) {
        if (err) {
            next(err);
            return;
        }
        res.send(root[0]);
    })
});

router.put('/', function (req, res, next) {
    req.models.node.findOne({_id: req.body.parentId}, function (err, parentNode) {
        if (err) {
            next(err);
            return;
        } else if (!parentNode) {
            var error = new Error("Node not find");
            error.status = 404;
            next(error);
            return;
        }
        var newNode = new req.models.node({name: req.body.name});

        parentNode.appendChild(newNode, function (err, node) {
            if (err) {
                next(err);
                return;
            }
            res.send({id: node._id});
        });
    })
});

// router.post('/:id', function (req, res, next) {
//     req.models.node.findOne({_id: req.params.id}, function (err, node) {
//         if (err) {
//             next(err);
//             return;
//         }
//         node.name = req.body.name;
//         node.save(function (err, node) {
//             if (err) {
//                 next(err);
//                 return;
//             }
//             res.send({success: true});
//         });
//     })
// });

router.post('/:id', function (req, res, next) {
    async.waterfall([
        function(callback) {
            req.models.node.findOne({_id: req.params.id}, function (err, node) {
                if (err) callback(err);
                else {
                    node.name = req.body.name;
                    callback(null, node);
                }
            })
        },
        function (node, callback) {
            node.save(function (err, node) {
                if (err) callback(err);
                else callback(null);
            });
        }
    ],
    function(err) {
        if (err) next(err);
        else res.send({success: true});
    });
});

// router.delete('/:id', function (req, res, next) {
//     async.wa
//     req.models.node.findOne({_id: req.params.id},function (err, node) {
//         if (err) {
//             next(err);
//             return;
//         }
//         node.getChildren({limit: 300, fields: {_id:1}}, function (err, idsToDelete) {
//             if (err) {
//                 next(err);
//                 return;
//             }
//             idsToDelete.push(req.params.id);
//             req.models.node.remove({_id: {$in: idsToDelete}}, function (err) {
//                 if (err) {
//                     next(err);
//                     return;
//                 }
//                 res.send({success: true});
//             })
//         })
//     })
// });

router.delete('/:id', function (req, res, next) {

  async.waterfall([
      function(callback) {
          req.models.node.findOne({_id: req.params.id},function (err, node) {
              if (err) callback(err);
              else callback(null, node);
          });
      },
      function(node, callback) {
          node.getChildren({limit: 300, fields: {_id:1}}, function (err, idsToDelete) {
              if (err) callback(err);
              else callback(null, idsToDelete);
          });
      },
      function(idsToDelete, callback) {
          idsToDelete.push(req.params.id);
          req.models.node.remove({_id: {$in: idsToDelete}}, function (err, resp) {

                if (err) callback(err);
                else callback(null);
            })
      }
  ],function(err, result) {
      if (err) next(err);
      else res.send({success: true});
  })
});

module.exports = router;
