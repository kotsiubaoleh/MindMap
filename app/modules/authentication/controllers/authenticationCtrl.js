export default function($scope, $auth) {
    $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
    };

    $scope.logout = function () {
      $auth.logout();
    };

    $scope.login = function() {
        $auth.login({
            login: $scope.loginName,
            password: $scope.password
        });
    };

    $scope.signup = function () {
        $auth.signup({
            login: $scope.loginName,
            password: $scope.password
        })
    };
}