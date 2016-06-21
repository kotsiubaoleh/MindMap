export default function($scope, $auth) {
    $scope.login = function() {
        $auth.login({
            login: $scope.loginName,
            password: $scope.password
        });
    }
}