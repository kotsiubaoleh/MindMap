export default function(){
    return {
        scope: {
            changeFunction: '=changeFile'
        },
        link: function(scope, el, attrs){
            el.bind('change', function(event){
                var files = event.target.files;
                var file = files[0];
                scope.changeFunction(file);
            });
        }
    };
}