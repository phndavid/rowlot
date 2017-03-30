/**
 * Controller for draw in GoogleMapApi
 *
 * @author Nelson D. Padilla
 * @since 17-dic-2016
 *
 */

(function () {
  "use strict";

  angular.module("AdsbApp")
    .controller("RowlotController", RowlotController);

  RowlotController.$inject = ['$scope', '$timeout', 'RowlotService',"CurrentUserService","toastr"];

  function RowlotController($scope, $timeout,  RowlotService, CurrentUserService, toastr) {    
  
    var loadCurrentUser = function(){
      return RowlotService.getCurrentUser().then(function(response){
        console.log("user",response)
        $scope.profile = response;
      }, function (error) {
          toastr.error("Error al cargar usuario");
          console.log(error);
        });
    }
    var loadUsers = function(){
      return RowlotService.getUsers().then(function (response) {          
          console.log("Users", response);
          $scope.users = response;
        }, function (error) {
          toastr.error("Error al cargar usuarios");
          console.log(error);
        });     
    }
    var init = function(){
      loadUsers();
      loadCurrentUser();
    }();
   
  }
} ());
