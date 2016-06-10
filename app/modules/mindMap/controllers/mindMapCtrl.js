export default function ($scope) {
    $scope.root = null;
    $scope.fileName = "mindMap";
    $scope.isMenuVisible = false;
    $scope.selectedNode = {name:""};

    d3.json("db/data.json", function(json) {
        $scope.json = json;
        $scope.$apply();
    });

    function serializeData(source){
        var json = {};
        json.name = source.name;
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
        var saveData = serializeData($scope.root);
        // window.open("data:text/json;charset=utf-8," + escape(JSON.stringify(saveData)));
        var MIME_TYPE = 'application/json';
        var bb = new Blob([JSON.stringify(saveData)], {type: MIME_TYPE});

        var a = document.createElement('a');
        a.download = $scope.fileName + ".json";
        a.href = window.URL.createObjectURL(bb);
        a.textContent = '點擊下載';

        a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
        document.querySelectorAll("#downloadLinkWrap")[0].innerHTML = "";
        document.querySelectorAll("#downloadLinkWrap")[0].appendChild(a);
    }
}