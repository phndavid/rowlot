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

    LoginService.$inject = ['RestService', 'CurrentUserService', '$q', "$firebaseAuth"];

    function LoginService(RestService, CurrentUserService, $q, $firebaseAuth) {

        // Servicio de inicio de sesión        
        var login = function (credentials) {

            var defered = $q.defer();
            var promise = defered.promise;

            const auth = firebase.auth();

            //Sign In
            auth.signInWithEmailAndPassword(credentials.username, credentials.password).catch(function (error) {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;                
                // ...
            });
            
            // Add a realtime listener
            firebase.auth().onAuthStateChanged(function(user) {
                if(user) {
                    console.log("Logged in as:",user);
                    CurrentUserService.setProfile(credentials.username, user.uid);
                    defered.resolve();                     
                }else{
                    console.error("Authentication failed:", error);
                    defered.reject("Usuario no existe...")    
                }
            });
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