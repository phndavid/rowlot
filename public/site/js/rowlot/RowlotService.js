/**
 * Servicio para el manejo de la lógica de negocio del módulo de aviones
 *
 * @author Nelson D. Padilla
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular
        .module('AdsbApp')
        .service('RowlotService', RowlotService);

    RowlotService.$inject = ['RestService','$q'];

    function RowlotService(RestService, $q) {

        var getCurrentUser = function(){
            var defered = $q.defer();
            var promise = defered.promise;
            let user = firebase.auth().currentUser;            
            if(user != null){            
                firebase.database().ref('/Usuarios/' + user.uid).once('value').then(function(snapshot) {
                  //var username = snapshot.val().username;                  
                  defered.resolve(snapshot.val());
                  // ...
                })            
            }
            return promise;
        }
        
        var getUsers = function () {
            var defered = $q.defer();
            var promise = defered.promise;
            let users = [];            
            //acceso al servicio bd
            let database = firebase.database();
            //Mi nodo de Usuarios
            let ref = database.ref('Usuarios');
                ref.on('value', function (ss) {
                //let nombre = ss.val();
                let nombres = ss.val();                
                //tengo las keys de los usuarios en un array
                let keys = Object.keys(nombres);      
                for (let i = 0; i < keys.length; i++){
                    let k = keys [i];                    
                    users.push({"data": nombres[k], "uid": k});
                }                
                defered.resolve(users);
            })

            return promise;
        }

        var updateCoins = function(userId, coins){
            var userRef = firebase.database().ref('/Usuarios/' + userId);
            userRef.update({
              Moneda: coins
            });
        }
        

        var updateMedalla = function(userId, metal){
            var userRef = firebase.database().ref('/Usuarios/' + userId);
            userRef.update({
              Medalla: metal
            });
        } 
        
        return {
            getUsers: getUsers,
            getCurrentUser: getCurrentUser,
            updateCoins:updateCoins,
            updateMedalla: updateMedalla
        }
    }
} ());
