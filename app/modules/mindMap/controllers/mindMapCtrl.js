export default function ($scope, $http) {
    $scope.selectedNode = {name:""};

    $http.get("/data").then(function(response) {
        $scope.json = response.data;
    });


    $scope.save = function(node, success, fail) {
        $http.post("data/" + node._id, {name: node.name}).then(function (response) {
            success();
            console.log("Edit success!");
        }, function (response) {
            fail();
            console.log("Error!");
        })
    };

    $scope.delete = function (node, success, fail) {
        $http.delete("data/" + node._id).then(function (response) {
            success();
            console.log("Delete success!");
        }, function (response) {
            fail();
            console.log("Error!");
        })
    };

    $scope.insert = function(node, success, fail) {
        $http.put("data/", {name: node.name, parentId: node.parent._id}).then(function (response) {
            success(response.data.id);
            console.log("Insert success!");
        }, function (response) {
            fail();
            console.log("Error!");
        })
    };
}