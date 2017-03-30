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
    var user = firebase.auth().currentUser;
      $scope.profile={
        email: "example.com",
        username: "rowlot"
      }
      if (user != null) {
      $scope.profile={
        email: user.email,
        username: user.Nombre+" "+user.Apellido,
      }
      console.log("User", user);
    }
    
 
  }
} ());
