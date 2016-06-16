export default function ($scope, $http) {
    $scope.fileName = "mindMap";
    $scope.isMenuVisible = false;
    $scope.selectedNode = {name:""};

    $http.get("/data").then(function(response) {
        $scope.json = response.data;
    });

    function serializeData(source){
        var json = {};
        //json.name = source.name;
        if (source.checked) json.checked = true;
        var children = source.children || source._children;
        var childList = [];
        if(children){
            children.forEach(function(node){
                childList.push(serializeData(node));
            });
            json.children = childList;
        }
        return json;
    }


    $scope.new = function(){
        $scope.json =
        {
            "name" : "root"
        };
    }

    $scope.load = function(file){
        var reader = new FileReader();
        reader.onload = function(event){
            var contents = event.target.result;
            //console.log(JSON.parse(contents));
            $scope.json = JSON.parse(contents);
            $scope.$apply();
        }
        reader.readAsText(file);
    }

    $scope.save = function(){
        var saveData = serializeData($scope.json);
        // window.open("data:text/json;charset=utf-8," + escape(JSON.stringify(saveData)));
        var MIME_TYPE = 'application/json';
        var bb = new Blob([JSON.stringify(saveData)], {type: MIME_TYPE});

        var a = document.createElement('a');
        a.download = $scope.fileName + ".json";
        a.href = window.URL.createObjectURL(bb);
        a.textContent = 'Download';

        a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
        document.querySelectorAll("#downloadLinkWrap")[0].innerHTML = "";
        document.querySelectorAll("#downloadLinkWrap")[0].appendChild(a);
    }

    $scope.edit = function(node) {
        console.log("Edited: " + node);
    }
}