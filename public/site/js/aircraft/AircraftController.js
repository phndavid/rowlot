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
    .controller("AircraftController", AircraftController);

  AircraftController.$inject = ['$scope', '$timeout', 'uiGmapGoogleMapApi', 'AircraftService', 'GoogleMapService', "toastr"];

  function AircraftController($scope, $timeout, GoogleMapApi, AircraftService, GoogleMapService, toastr) {
    const FLAGS_INTERVAL = 10;
    $scope.map = {
      center: { latitude: 34.976070404052734, longitude: -78.08470916748047 },
      zoom: 8,
      control: {
      },
      polilyneEvents: {
        mouseover: function (polilyne, eventName, model) {
          console.log("Polilyne was clicked", angular.toJson(model.path));
          $scope.map.polilyneAlert.model = model.path[0];
          $scope.map.polilyneAlert.show = true;
        }
      },
      markersEvents: {
        click: function (marker, eventName, model) {
          $scope.map.window.model = model;
          $scope.map.window.alert = model.alert;
          $scope.map.window.show = true;
        }
      },
      window: {
        marker: {},
        show: false,
        closeClick: function () {
          this.show = false;
        },
        options: {
          pixelOffset: { width: 0, height: -60 }
        },
        alert: {}
      },
      polilyneAlert: {
        marker: {},
        show: false,
        closeClick: function () {
          this.show = false;
        },
        options: {
          pixelOffset: { width: 0, height: -60 }
        },
        alert: {}
      },
      options: {
        boxClass: "infobox",
        boxStyle: {
          backgroundColor: "#f9f9f9",
          border: "2px solid d9d9d9"
        },
        mapTypeId: 'faaSectionalChart',
        mapTypeControlOptions: {
          mapTypeIds: ['faaSectionalChart', 'ifrEnrouteLow', 'openStreet', google.maps.MapTypeId.ROADMAP],
        }
      },
      faaSectionalChartMapType: {
        getTileUrl: function (coord, zoom) {
          return "http://wms.chartbundle.com/tms/1.0.0/sec/" + zoom + "/" + coord.x + "/" + coord.y + ".png?origin=nw";
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'Sectional',
        maxZoom: 19,
      },
      ifrEnrouteLowMapType: {
        getTileUrl: function (coord, zoom) {
          return "http://wms.chartbundle.com/tms/1.0.0/enrl/" + zoom + "/" + coord.x + "/" + coord.y + ".png?origin=nw";
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'IFR',
        maxZoom: 19,
      },
      openStreetMapType: {
        getTileUrl: function (coord, zoom) {
          return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png";;
        },
        tileSize: new google.maps.Size(256, 256),
        name: 'OSM',
        maxZoom: 18,
      }
    };

    $scope.polylines = [];
    $scope.gndspd_markers = [];
    $scope.vspd_markers = [];
    $scope.emerg_markers = [];
    $scope.sqwk_markers = [];
    var flight = [];

    $scope.spd_check = false;
    $scope.speedFilter = function () {

      if ($scope.spd_check == false) {
        $scope.spd_check = true;
        $scope.gndspd_markers = GoogleMapService.drawMarkers("gndspd", [], 0);
        return;
      }

      $scope.spd_check = false;
      var gndspd_markers = [];
      for (var i = 0; i < flight.length; i++) {
        var path = flight[i];
        if (path.gndspd != null && path.gndspd <= 150) {
          var newPath = findPathNext(flight, i);
          if (newPath != null && newPath.latitude != null && newPath.longitude != null) {
            newPath.alert = { title: "Ground speed", body: path.gndspd + " kts" };
            gndspd_markers.push(newPath);
          }
        }
      }
      $scope.gndspd_markers = GoogleMapService.drawMarkers("gndspd", gndspd_markers, FLAGS_INTERVAL);

    }

    $scope.vspd_check = false;
    $scope.vspdFilter = function () {

      if ($scope.vspd_check == false) {
        $scope.vspd_check = true;
        $scope.vspd_markers = GoogleMapService.drawMarkers("vspd", [], 0);
        return;
      }

      $scope.vspd_check = false;
      var vspd_markers = [];
      for (var i = 0; i < flight.length; i++) {
        var path = flight[i];
        if (path.vspd != null && (path.vspd > 3000 || path.vspd < -3000)) {
          var newPath = findPathNext(flight, i);
          if (newPath != null && newPath.latitude != null && newPath.longitude != null) {
            newPath.alert = { title: "Vspd", body: path.vspd + " ft/min" };
            vspd_markers.push(newPath);
          }
        }
      }
      $scope.vspd_markers = GoogleMapService.drawMarkers("vspd", vspd_markers, FLAGS_INTERVAL);

    }

    $scope.emerg_check = false;
    $scope.emergFilter = function () {

      if ($scope.emerg_check == false) {
        $scope.emerg_check = true;
        $scope.emerg_markers = GoogleMapService.drawMarkers("emerg", [], 0);
        return;
      }

      $scope.emerg_check = false;
      var emerg_markers = [];
      for (var i = 0; i < flight.length; i++) {
        var path = flight[i];
        if (path.emerg != null && path.emerg) {
          var newPath = findPathNext(flight, i);
          if (newPath != null && newPath.latitude != null && newPath.longitude != null) {
            newPath.alert = { title: "Emergency", body: path.emerg };
            emerg_markers.push(newPath);
          }
        }
      }
      $scope.emerg_markers = GoogleMapService.drawMarkers("emerg", emerg_markers, FLAGS_INTERVAL);
    }

    $scope.sqwk_check = false;
    $scope.sqwkFilter = function () {

      if ($scope.sqwk_check == false) {
        $scope.sqwk_check = true;
        $scope.sqwk_markers = GoogleMapService.drawMarkers("sqwk", [], 0);
        return;
      }

      $scope.sqwk_check = false;

      var sqwk_markers = [];
      for (var i = 0; i < flight.length; i++) {
        var path = flight[i];
        if (path.sqwk != null) {
          var newPath = findPathNext(flight, i);
          if (newPath != null && newPath.latitude != null && newPath.longitude != null) {
            newPath.alert = { title: "Squawk", body: path.sqwk };
            sqwk_markers.push(newPath);
          }
        }
      }
      $scope.sqwk_markers = GoogleMapService.drawMarkers("sqwk", sqwk_markers, FLAGS_INTERVAL);
    }

    $scope.getHistory = function (icao, date) {
      $scope.history = [];
      AircraftService.getHistory(icao, date).then(function (response) {

        $scope.history = response;
        console.log("history", $scope.history);

      }, function (error) {
        toastr.error("The requested action (get history) could not be performed. Try again.");
        console.log(error);
      });
    }

    $scope.drawAircraftByIcao = function (icao, date, index) {
      clearAll();
      AircraftService.getHistoryFlight(icao, date, index).then(function (response) {

        flight = response;
        $scope.polylines = GoogleMapService.drawPath(response);
        GoogleMapService.fitMap($scope.map.control.getGMap(), $scope.polylines);
        initFilters();

      }, function (error) {
        toastr.error("The requested action (get history flight) could not be performed. Try again.");
        console.log(error);
      });
    }

    $scope.findAircraftByRegn = function () {
      console.log("REGN", $scope.regn);
      var regn = $scope.regn;

      if (regn == null || regn == undefined || regn == "") {
        toastr.error("Enter a valid data");
        return;
      }

      // Borra los datos dibujados previamente
      $scope.tail_history = [];
      $scope.polylines = [];
      clearAll();

      AircraftService.getTailHistory(regn.toUpperCase()).then(function (response) {
        $scope.tail_history = response;
        console.log("tail", $scope.tail_history);
      }, function (error) {
        toastr.error("The requested action (get tail history flight) could not be performed. Try again.");
        console.log(error);
      });
    }

    var clearAll = function () {
      changeCheck(false);
      $scope.gndspd_markers = GoogleMapService.drawMarkers("gndspd", [], 0);
      $scope.vspd_markers = GoogleMapService.drawMarkers("vspd", [], 0);
      $scope.emerg_markers = GoogleMapService.drawMarkers("emerg", [], 0);
      $scope.sqwk_markers = GoogleMapService.drawMarkers("sqwk", [], 0);
    }

    var initFilters = function () {
      changeCheck(true);
      $scope.speedFilter();
      $scope.vspdFilter();
      $scope.emergFilter();
      $scope.sqwkFilter();
      changeCheck(true);
    }

    var changeCheck = function (state) {
      $scope.spd_check = state;
      $scope.vspd_check = state;
      $scope.emerg_check = state;
      $scope.sqwk_check = state;
    }

    var findPathNext = function (array, x) {
      for (var i = x; i < array.length; i++) {
        var path = array[i];
        if (path.latitude != null && path.longitude != null)
          return array[i];
      }
      return null;
    }

    $scope.dateFormat = function (date) {
      return moment(date).utc().format("hh:mm:ss a");   
    }

    var inicialize = function () {
      return AircraftService.getAircrafts('sdelosrios95@gmail.com', 'password')
        .then(function (response) {
          $scope.aircrafts = response;
        }, function (error) {
          toastr.error("Error execute aircrafts");
          console.log(error);
        });
    } ();

  }
} ());
