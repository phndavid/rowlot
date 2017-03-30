/**
 * Controller de la página de autenticación (Login)
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    "use strict";

    angular.module("AdsbApp")
           .controller("LoginController", LoginController);

    LoginController.$inject = ["$scope", "$rootScope",  "LoginService", "CurrentUserService", "LoginRedirectService", "toastr"];

    function LoginController($scope, $rootScope,  LoginService, CurrentUserService, LoginRedirectService, toastr) {

        $scope.credentials = {
            username: "dev@gmail.com",
            password: "password"
        }

        // Instancia del usuario actual
        $scope.user = CurrentUserService.profile;

        // Inicio de sesión
        $scope.login = function (form) {
            if (form.$valid) {
                LoginService.login($scope.credentials)
                             .then(function (response) {

                                 LoginRedirectService.redirectPostLogin();
                                 
                             }, function (error) {

                                 toastr.error("No se pudo ejecutar la operación");
                                 console.log(error);

                             });

                $scope.credentials.password = "";
                form.$setUntouched();
            }
        }

        // Cierre de sesión - Se eliminan datos del usuario y se redirecciona a la página de login
        $scope.logout = function () {
            LoginService.logout();
            LoginRedirectService.redirectPostLogout();
        }
    }

}());