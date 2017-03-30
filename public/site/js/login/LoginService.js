/**
 * Servicio para el manejo de la lógica de negocio del módulo de autenticación
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular.module("AdsbApp")
           .service("LoginService", LoginService);

    LoginService.$inject = ['RestService', 'CurrentUserService', '$q'];

    function LoginService(RestService, CurrentUserService, $q) {

        // Servicio de inicio de sesión        
        var login = function (credentials) {

            //// Llama el servicio de autenticación
            //return RestService.login("api/login", credentials)
            //                  .then(function (response) {
            //                      CurrentUserService.setProfile(credentials.username, response.data.access_token);
            //                  });



            var defered = $q.defer();
            var promise = defered.promise;

            if (credentials.username === "usuario" && credentials.password === "P4$$w0rd") {
                CurrentUserService.setProfile(credentials.username, "AbCdEf123456");
                defered.resolve();
            } else {
                defered.reject("Usuario no existe...")
            }

            return promise;
        }

        // Servicio de fin de sesión
        var logout = function () {
            // Elimina el perfil almacenado
            CurrentUserService.removeProfile();
        }

        return {
            login: login,
            logout: logout
        };
    };

})();