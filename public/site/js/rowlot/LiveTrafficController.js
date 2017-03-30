/**
 * Controller for Live Traffic
 *
 * @author David E. Morales
 * @since 02-mar-2017
 *
 */

(function () {
  "use strict";

  angular.module("AdsbApp")
    .controller("LiveTrafficController", LiveTrafficController);

  LiveTrafficController.$inject = ['$stateParams'];

  function LiveTrafficController($stateParams) {

    var station = $stateParams.station;
    $("#siteloader").html('<object data="http://1200.aero/' + station + '"/>');

  }
} ());
