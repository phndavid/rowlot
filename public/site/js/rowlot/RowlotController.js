/**
 * Controller for draw in GoogleMapApi
 *
 * @author Nelson D. Padilla and David E. Morales
 * @since 17-dic-2016
 *
 */

(function () {
  "use strict";

  angular.module("AdsbApp")
    .controller("RowlotController", RowlotController);

  RowlotController.$inject = ['$scope', '$timeout', 'AircraftService',"CurrentUserService","toastr"];

  function RowlotController($scope, $timeout,  AircraftService, CurrentUserService, toastr) {    
    $scope.profile={
      email: 'default@rowlot.com',
      username: 'rowlot',
    }
    var inicialize = function () {
      console.log(CurrentUserService.profile);
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
              // Saco el nombre
              let nombre = nombres[k].Nombre;
              // Saco el apellido
              let apellido = nombres[k].Apellido;
              // console.log(nombre, apellido);

              

          }

      });
    } ();

  }
} ());
