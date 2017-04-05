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
    $scope.users = [];
    $scope.profile = [];
    var loadCurrentUser = function(){
      return RowlotService.getCurrentUser().then(function(response){
        console.log("user",response)
        $scope.profile = response;
        console.log("TIPO", $scope.profile.Tipo);
        var typeStudent = showStudent($scope.profile.Tipo);
        $scope.showStudent = typeStudent;
        var typeTeacher = showTeacher($scope.profile.Tipo);
        $scope.showTeacher = typeTeacher;
        console.log("SHOW", type);
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

    $scope.addCoins = function(userId, coins){                
      var val = angular.element('#'+userId).val();      
      var newCoins = parseInt(coins)+parseInt(val);
      RowlotService.updateCoins(userId, newCoins);
      angular.element('#'+userId).val();
      $scope.users = [];
      loadUsers();
      loadCurrentUser();
    }

    $scope.substratCoins = function(userId, coins){            
      var val = angular.element('#'+userId).val();      
      var newCoins = parseInt(coins)-parseInt(val);
      RowlotService.updateCoins(userId, newCoins);
      angular.element('#'+userId).val();
      $scope.users = [];
      loadUsers();
      loadCurrentUser();
    }
    var showStudent = function(type){         
        return type=="Estudiante";
    }
    var showTeacher = function(type){         
        return type=="Profesor";
    }
    var init = function(){
      loadUsers();
      loadCurrentUser();
    }();
   
  }
} ());
