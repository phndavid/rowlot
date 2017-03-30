/**
 * Creaci�n del m�dulo principal del aplicativo
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular.module("AdsbApp",
        ["ngTouch",
         "toastr",
         "ui.router",
         "ngCookies",
         "ngAnimate",
         'oc.lazyLoad',
         "ui.bootstrap",
         "ngMessages",
         "ngMaterial",
         "ncy-angular-breadcrumb",
         "uiGmapgoogle-maps",
         "vAccordion",
         "angular-loading-bar"
        ]);
}());

/**
 * Configuración de las librerías utilizadas
 *
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    "use strict";

    angular.module("AdsbApp")
           .config(configInterceptors)
           .config(configBreadCrumb)
           .config(configLoader);

    configInterceptors.$inject = ["$httpProvider"];

    // Interceptors
    function configInterceptors($httpProvider) {
        // configuramos los interceptors
        $httpProvider.interceptors.push("AddTokenService");
        $httpProvider.interceptors.push("LoginRedirectService");
    }

    configBreadCrumb.$inject = ["$breadcrumbProvider"];

    // Breadcrumbs options
    function configBreadCrumb($breadcrumbProvider) {
        $breadcrumbProvider.setOptions({
            includeAbstract: true,
            //prefixStateName: "auth.aircraft-trackinghistory",
            templateUrl: "views/common/breadcrumbs.html"
        });
    }

    configGoogleMap.$inject = ['uiGmapGoogleMapApiProvider'];

    // Google map options
    function configGoogleMap(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDrjU-VTXQ2LGGBERUI15vV_iwDN6Lp5n8',
            v: '3',
            libraries: 'weather,geometry,visualization'
        });
    }

    configLoader.$inject = ['cfpLoadingBarProvider'];

    function configLoader(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.parentSelector = "#loading-bar-spinner-container";
    }

})();

/**
 * Definición de enrutamientos
 *
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    "use strict";

    angular.module("AdsbApp")
        .config(registerRoutes);

    registerRoutes.$inject = ["$stateProvider", "$urlRouterProvider"];

    function registerRoutes($stateProvider, $urlRouterProvider) {

        $urlRouterProvider
            .when("/", "dashboard")
            .otherwise("dashboard");

        $stateProvider

            // Login
            .state("login", {
                page_title: "Rowlot - Iniciar Sesión",
                url: "/login",
                templateUrl: "views/login.html",
                controller: "LoginController"
            })
            // Signup
            .state("signup", {
                page_title: "Rowlot - Registro",
                url: "/signup",
                templateUrl: "views/register.html",
                controller: "LoginController"
            })

            // Authenticated
            .state("auth", {
                abstract: true,
                ncyBreadcrumb: {
                    skip: true
                },
                // this state url
                url: "",
                templateUrl: "views/common/authenticated.html"
            })

            .state("auth.rowlot-dashboard", {
                page_title: "Rowlot - Dashboard",
                url: "/dashboard",
                templateUrl: "views/rowlot/dashboard.html",                                     
                controller: "LiveTrafficController"
            })
            .state("auth.rowlot-listtask", {
                page_title: "Rowlot - Dashboard",
                url: "/dashboard",
                templateUrl: "views/rowlot/listtask.html",                                     
                controller: "LiveTrafficController"
            })
      
    };
} ());

/**
 * Configuración del run
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular.module('AdsbApp')
           .run(runBlock);

    runBlock.$inject = ['$log', '$stateParams', '$rootScope', '$cookieStore', '$location', '$state', 'CurrentUserService', "LoginRedirectService"];


    function runBlock($log, $stateParams, $rootScope, $cookieStore, $location, $state, CurrentUserService, LoginRedirectService) {

        $rootScope.location = $location;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$stateChangeSuccess', function () {
            // scroll view to top
            $("html, body").animate({ scrollTop: 0 }, 200);
        });

       /* $rootScope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams) {
            // Se adiciona la lógica para comprobar que puedo mostrar si no estoy logueado
            var user = CurrentUserService.profile;

            if (!user.loggedIn && toState.name != "login") {
                e.preventDefault();
                LoginRedirectService.redirectPostLogout();
            }

            if (user.loggedIn && toState.name == "login") {
                e.preventDefault();
                LoginRedirectService.redirectPostLogin();
            }
        })*/

        // Mostrar por defecto el menú lateral colapsado
        $cookieStore.put('sideNavCollapsed', false);
        $rootScope.sideMenuAct = true;
    };
})();
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

/**
 * Servicio para el manejo de la lógica de negocio del módulo de aviones
 *
 * @author Nelson D. Padilla and David E. Morales
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular
        .module('AdsbApp')
        .service('AircraftService', AircraftService);

    AircraftService.$inject = ['RestService'];

    function AircraftService(RestService) {

        var getHistory = function (icao, day) {
            // history, {params: {icao:'+icao+',day:'+day+'}}'
            return RestService.get('history?icao=' + icao + '&day=' + day)
                .then(function (response) {
                    return response.data.messages;
                });
        }
        var getHistoryFlight = function (icao, date, index) {
            // history, {params: {icao:'+icao+',day:'+day+'}}'
            return RestService.get('history?icao=' + icao + '&day=' + date)
                .then(function (response) {
                    return response.data.messages.flights[index].data.map(function (item) {
                        return {
                            altitude: item.alt,
                            latitude: item.lat,
                            longitude: item.lon,
                            gentime: item.gentime,
                            msgtype: item.msgtype,
                            gndspd: item.gndspd,
                            emerg: item.emerg,
                            sqwk: item.sqwk,
                            vspd: item.vspd
                        }
                    });
                });
        }
        var getTailHistory = function (regn) {
            return RestService.get('tail_history?regn=' + regn)
                .then(function (response) {
                    return response.data;
                });
        }

        var getAircrafts = function (email, pwd) {
            return RestService.post('users/auth', 'email=' + email + '&pwd=' + pwd)
                .then(function (response) {
                    return response.data.aircraft;
                });
        }

        return {
            getHistory: getHistory,
            getHistoryFlight: getHistoryFlight,
            getTailHistory: getTailHistory,
            getAircrafts: getAircrafts
        }
    }
} ());

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

    LoginController.$inject = ["$scope", "$rootScope", "LoginService", "CurrentUserService", "LoginRedirectService", "toastr"];

    function LoginController($scope, $rootScope, LoginService, CurrentUserService, LoginRedirectService, toastr) {

        $scope.credentials = {
            username: "usuario",
            password: "P4$$w0rd"
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
/**
 * Servicio para el manejo del token de seguridad en las peticiones http
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular.module("AdsbApp")
           .service("AddTokenService", AddTokenService);

    AddTokenService.$inject = ['$q', 'CurrentUserService'];

    function AddTokenService($q, CurrentUserService) {

        // Intercepta la petición
        var request = function (config) {
            // Si el usuario está loggueado adiciono el token
            if (CurrentUserService.profile.loggedIn) {
                config.headers.Authorization = CurrentUserService.profile.token;
            }
            return $q.when(config);
        }

        return {
            request: request
        }
    }
})();
/**
 * Servicio para el manejo de los datos del usuario autenticado
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular.module("AdsbApp")
           .factory("CurrentUserService", CurrentUserService);

    CurrentUserService.$inject = ['LocalStorageService'];

    function CurrentUserService(LocalStorageService) {

        var USERKEY = "utoken";

        // Persiste los datos del perfil del usuario
        var setProfile = function (username, token) {
            profile.username = username;
            profile.token = token;
            // Almacena la información del token
            LocalStorageService.add(USERKEY, profile);
        };

        // Remueve los permisos del perfil del usuario
        var removeProfile = function () {
            profile.username = "";
            profile.token = "";
            // Elimina la información del token
            LocalStorageService.remove(USERKEY);
        };

        // Inicializa los datos del perfil del usuario
        var initialize = function () {

            var user = {
                username: "",
                token: "",
                get loggedIn() {
                    return this.token != "";
                }
            }
            // Si existe un usuario almacenado se recupera
            var localUser = LocalStorageService.get(USERKEY);
            if (localUser) {
                user.username = localUser.username;
                user.token = localUser.token;
            }

            return user;
        };

        var profile = initialize();

        return {
            removeProfile: removeProfile,
            setProfile: setProfile,
            profile: profile
        }
    }

})();
/**
 * Servicio para el manejo de los redireccionamientos según el estado del token de autenticación del usuario
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    "use strict";

    angular.module("AdsbApp")
           .service("LoginRedirectService", LoginRedirectService);

    LoginRedirectService.$inject = ["$q", "$injector", "$location"];

    function LoginRedirectService($q, $injector, $location) {

        var main = "auth.rowlot";
        var lastPath = main;

        // Intercepta los errores por expiración de permisos y redirecciona a la página de logueo
        var responseError = function (response) {
            if (response.status == 401 || response.status == 403) {
                lastPath = $location.path();
                $injector.get("$state").go("login");
            }
            return $q.reject(response);
        }

        // Almacena la última dirección 
        var redirectPostLogin = function () {
            // Redirije a la última dirección almacenada
            $injector.get("$state").go(lastPath);
            lastPath = main;
        }
        
        // Redirecciona a la página de login
        var redirectPostLogout = function () {
            $injector.get("$state").go("login"); 
            lastPath = main;
        }

        // Determina si se está en la página de logueo
        var isLoginPath = function () {
            if ($injector.get("$state").is("login"))
                return true;
            return false;
        }

        return {
            responseError: responseError,
            redirectPostLogin: redirectPostLogin,
            redirectPostLogout: redirectPostLogout,
            isLoginPath: isLoginPath
        }
    }
})();
(function () {
    "use strict";

    angular.module("AdsbApp")
           .controller("SideMenuController", SideMenuController);


    SideMenuController.$inject = ["$rootScope", "$scope", "$state", "$stateParams", "$timeout"];

    function SideMenuController($rootScope, $scope, $state, $stateParams, $timeout) {

        $scope.sections = [
             {
                id: 0,
                title: "Dashboard",
                icon: "mdi mdi-table fa-fw",                
                link: "auth.rowlot-dasboarh"
            },
            {
                id: 1,
                title: "Ranking",
                icon: "mdi mdi-table fa-fw",
                link: "auth.rowlow-listtask"
            },
            {
                id: 2,
                title: "Tareas",
                icon: "mdi mdi-table fa-fw",                
                submenu: [
                    {
                        title: "KRDU",
                        link: "auth.aircraft-livetraffic-01"
                    },
                    {
                        title: "KLZU",
                        link: "auth.aircraft-livetraffic-02"
                    }
                ]
            },
            {
                id: 3,
                title: "NMACs",
                icon: "fa fa-paper-plane-o first_level_icon",
                link: "auth.aircraft-nmacs"
            },
           
        ];

        // accordion menu
        $(document).off("click", ".side_menu_expanded #main_menu .has_submenu > a").on("click", ".side_menu_expanded #main_menu .has_submenu > a", function () {
            if ($(this).parent(".has_submenu").hasClass("first_level")) {
                var $this_parent = $(this).parent(".has_submenu"),
                    panel_active = $this_parent.hasClass("section_active");

                if (!panel_active) {
                    $this_parent.siblings().removeClass("section_active").children("ul").slideUp("200");
                    $this_parent.addClass("section_active").children("ul").slideDown("200");
                } else {
                    $this_parent.removeClass("section_active").children("ul").slideUp("200");
                }
            } else {
                var $submenu_parent = $(this).parent(".has_submenu"),
                    submenu_active = $submenu_parent.hasClass("submenu_active");

                if (!submenu_active) {
                    $submenu_parent.siblings().removeClass("submenu_active").children("ul").slideUp("200");
                    $submenu_parent.addClass("submenu_active").children("ul").slideDown("200");
                } else {
                    $submenu_parent.removeClass("submenu_active").children("ul").slideUp("200");
                }
            }
        });

        $rootScope.createScrollbar = function () {
            $("#main_menu .menu_wrapper").mCustomScrollbar({
                theme: "minimal-dark",
                scrollbarPosition: "outside"
            });
        };

        $rootScope.destroyScrollbar = function () {
            $("#main_menu .menu_wrapper").mCustomScrollbar("destroy");
        };

        $timeout(function () {
            if (!$rootScope.sideNavCollapsed && !$rootScope.topMenuAct) {
                if (!$("#main_menu .has_submenu").hasClass("section_active")) {
                    $("#main_menu .has_submenu .act_nav").closest(".has_submenu").children("a").click();
                } else {
                    $("#main_menu .has_submenu.section_active").children("ul").show();
                }
                // init scrollbar
                $rootScope.createScrollbar();
            }
        });


    }
})();

(function () {
    "use strict";

    angular
      .module("AdsbApp")
    /* Directives */

        // change page title
        .directive('updateTitle', [
            '$rootScope',
            function ($rootScope) {
                return {
                    link: function (scope, element) {
                        var listener = function (event, toState, toParams, fromState, fromParams) {
                            var title = 'Yukon Admin';
                            if (toState.page_title) {
                                title = toState.page_title;
                            }
                            if ($rootScope.appVer) {
                                element.text(title + ' (' + $rootScope.appVer + ')');
                            } else {
                                element.text(title);
                            }
                        };
                        $rootScope.$on('$stateChangeStart', listener);
                    }
                }
            }
        ])
        // page preloader
        .directive('pageLoader', [
            '$timeout',
            function ($timeout) {
                return {
                    restrict: 'AE',
                    template: '<div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div>',
                    link: function (scope, el, attrs) {
                        el.addClass('pageLoader hide');
                        scope.$on('$stateChangeStart', function (event) {
                            el.toggleClass('hide animate');
                        });
                        scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
                            event.targetScope.$watch('$viewContentLoaded', function () {
                                $timeout(function () {
                                    el.toggleClass('hide animate')
                                }, 600);
                            })
                        });
                    }
                };
            }
        ])
        // show/hide side menu
        .directive('menuToggle', [
            '$rootScope',
            '$cookieStore',
            '$window',
            '$timeout',
            function ($rootScope, $cookieStore, $window, $timeout) {
                return {
                    restrict: 'E',
                    template: '<span class="menu_toggle" ng-click="toggleSidebar()"><span class="icon_menu_toggle" ><i class="arrow_carrot-2left" ng-class="sideNavCollapsed ? \'hide\' : \'\'"></i><i class="arrow_carrot-2right" ng-class="sideNavCollapsed ? \'\' : \'hide\'"></i></span></span>',
                    link: function (scope, el, attrs) {
                        var mobileView = 992;
                        $rootScope.getWidth = function () {
                            return window.innerWidth;
                        };
                        $rootScope.$watch($rootScope.getWidth, function (newValue, oldValue) {
                            if (newValue >= mobileView) {
                                if (angular.isDefined($cookieStore.get('sideNavCollapsed'))) {
                                    if ($cookieStore.get('sideNavCollapsed') == false) {
                                        $rootScope.sideNavCollapsed = false;
                                    } else {
                                        $rootScope.sideNavCollapsed = true;
                                    }
                                } else {
                                    $rootScope.sideNavCollapsed = false;
                                }
                            } else {
                                $rootScope.sideNavCollapsed = true;
                            }
                            $timeout(function () {
                                $(window).resize();
                            });
                        });
                        scope.toggleSidebar = function () {
                            $rootScope.sideNavCollapsed = !$rootScope.sideNavCollapsed;
                            $cookieStore.put('sideNavCollapsed', $rootScope.sideNavCollapsed);
                            if (!$rootScope.fixedLayout) {
                                if (window.innerWidth > 991) {
                                    $timeout(function () {
                                        $(window).resize();
                                    });
                                }
                            }
                            if (!$rootScope.sideNavCollapsed && !$rootScope.topMenuAct) {
                                $rootScope.createScrollbar();
                            } else {
                                $rootScope.destroyScrollbar();
                            }
                        };
                    }
                };
            }
        ])
        // update datatables fixedHeader position
        .directive('updateFixedHeaders', function ($window) {
            return function (scope, element) {
                var w = angular.element($window);
                scope.getElDimensions = function () {
                    return {
                        'w': element.width(),
                        'h': element.height()
                    };
                };
                scope.$watch(scope.getElDimensions, function (newValue, oldValue) {
                    if (typeof oFH != 'undefined') {
                        oFH._fnUpdateClones(true);
                        oFH._fnUpdatePositions();
                    }
                }, true);
                w.bind('resize', function () {
                    scope.$apply();
                });
            };
        })
        // ng-repeat after render callback
        .directive('onLastRepeat', function ($timeout) {
            return function (scope, element, attrs) {
                if (scope.$last) {
                    $timeout(function () {
                        scope.$emit('onRepeatLast', element, attrs);
                    })
                }
            };
        })
        // add width/height properities to Image
        .directive('addImageProp', function () {
            return {
                restrict: 'A',
                link: function (scope, elem, attr) {
                    elem.on('load', function () {
                        var w = !scope.isHighDensity() ? $(this).width() : $(this).width() / 2,
                            h = !scope.isHighDensity() ? $(this).height() : $(this).height() / 2;
                        $(this).attr('width', w).attr('height', h);
                    });
                }
            };
        })


})();
/**
 * Servicio para el manejo de las ventanas de dialogo
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular.module('AdsbApp')
           .service('DialogService', DialogService);

    DialogService.$inject = ['$mdDialog', '$http'];

    
    function DialogService($mdDialog, $http) {

        // Despliega un confirm popup
        var confirm = function (titulo, mensaje) {

            var confirm = $mdDialog.confirm()
                                   .title(titulo)
                                   .content(mensaje)
                                   .ariaLabel('Confirmación de usuario')
                                   .ok('Si')
                                   .cancel('No')
                                   .hasBackdrop(true);

            return $mdDialog.show(confirm);

        }

        // Despliega un alert popup
        var alert = function (mensaje) {
            $mdDialog.show($mdDialog.alert()
                               .title('')
                               .content(mensaje)
                               .ok('Aceptar')
                               .hasBackdrop(true)
                    );
        }

        return {
            confirm: confirm,
            alert: alert
        }
    }
})();
/**
 * Servicio para interactual con los mapas de google
 *
 * @author Nelson D. Padilla and David E. Morales
 * @since 17-dic-2016
 *
 */

(function () {
    "use strict";

    angular
        .module('AdsbApp')
        .service('GoogleMapService', GoogleMapService);

    GoogleMapService.$inject = [];

    function GoogleMapService() {

        var drawPath = function (path) {

            var collection = [];
            var coord1, coord2;
            for (var i = 1; i < path.length; i++) {
                if (path[i] != null && (path[i].msgtype == 3 ||  path[i].msgtype == 2)) {
                    coord1 = path[i];
                }
                if (path[i - 1] != null && (path[i - 1].msgtype == 3 || path[i - 1].msgtype == 2)) {
                    coord2 = path[i - 1];
                }
                var step = [coord2, coord1];
                var color = altitudeColor(path[i].altitude);
                var draw = drawStep(step, color, false);
                collection.push(draw);
            }

            var airplaneIcon = {
                icon: planeSymbol,
                offset: '100%'
            }
            collection[collection.length - 1].icons.push(airplaneIcon);

            return collection;
        }

        var drawStep = function (step, color, drawIcon) {
            return {
                path: step,
                stroke: {
                    color: color,
                    weight: 5
                },
                geodesic: true,
                visible: true,
                icons: []
            }
        }

        var planeSymbol = {
            path: 'M362.985,430.724l-10.248,51.234l62.332,57.969l-3.293,26.145 l-71.345-23.599l-2.001,13.069l-2.057-13.529l-71.278,22.928l-5.762-23.984l64.097-59.271l-8.913-51.359l0.858-114.43 l-21.945-11.338l-189.358,88.76l-1.18-32.262l213.344-180.08l0.875-107.436l7.973-32.005l7.642-12.054l7.377-3.958l9.238,3.65 l6.367,14.925l7.369,30.363v106.375l211.592,182.082l-1.496,32.247l-188.479-90.61l-21.616,10.087l-0.094,115.684',
            scale: 0.0633, 
            strokeOpacity: 1,
            color: 'black',
            strokeWeight: 0,
            fillColor: '#000',
            fillOpacity: 1
        }

        var drawMarkers = function (type, markers, time) {
            var collection = [];
            for (var i = 0; i < markers.length; i++) {
                if (markers.length > 1 && markers[i + 1] != null) {
                    var now = moment(markers[i + 1].gentime);
                    var end = moment(markers[i].gentime);
                    var duration = moment.duration(now.diff(end));
                    if (duration.asSeconds() >= time) {
                        collection.push(createMarker(i, type, markers[i]));
                    }
                } else {
                    collection.push(createMarker(i, type, markers[i]));
                }
            }
            return collection;
        }

        var createMarker = function (i, type, point) {
            var ret = {
                id: i,
                latitude: point.latitude,
                longitude: point.longitude,
                alert: point.alert,
                icon: iconType(type)
            };

            return ret;
        }

        var iconType = function (type) {

            if (type == "gndspd") {
                return 'content/images/speed.png';
            } else if (type == "vspd") {
                return 'content/images/caution.png';
            } else if (type == "emerg") {
                return 'content/images/flag.png';
            } else if (type == "sqwk") {
                return 'content/images/radiotower.png';
            }
        }

        var altitudeColor = function (altitude) {

            if (altitude >= 0 && altitude <= 499)
                return '#FF0000';
            else if (altitude >= 500 && altitude <= 999)
                return '#FF6600';
            else if (altitude >= 1000 && altitude <= 1999)
                return '#CC9900';
            else if (altitude >= 2000 && altitude <= 2999)
                return '#FFCC00';
            else if (altitude >= 3000 && altitude <= 4999)
                return '#00CC00';
            else if (altitude >= 5000 && altitude <= 7499)
                return '#0033FF';
            else if (altitude >= 7500 && altitude <= 10000)
                return '#9900CC';
            else
                return '#000';
        }

        var fitMap = function (map, polylines) {
            var bounds = new google.maps.LatLngBounds();
            var firtsStep = new google.maps.LatLng(findFirstPoint(polylines).latitude,
                findFirstPoint(polylines).longitude);
            var lastStep = new google.maps.LatLng(findLastPoint(polylines).latitude,
                findLastPoint(polylines).longitude);

            bounds.extend(firtsStep);
            bounds.extend(lastStep);
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        }

        var findFirstPoint = function (polylines) {
            for (var i = 0; i < polylines.length; i++) {
                var path = polylines[i].path[0];
                if (path.latitude != undefined && path.longitude) {
                    return {
                        latitude: path.latitude,
                        longitude: path.longitude
                    }
                }
            }
        }

        var findLastPoint = function (polylines) {
            for (var i = polylines.length - 1; i > 0; i--) {
                var path = polylines[i].path[0];
                if (path.latitude != undefined && path.longitude) {
                    return {
                        latitude: path.latitude,
                        longitude: path.longitude
                    }
                }
            }
        }

        return {
            drawPath: drawPath,
            drawMarkers: drawMarkers,
            fitMap: fitMap
        }
    }
} ());

/**
 * Servicio para el manejo de las operaciones de almacenamiento en el storage
 * 
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    "use strict";

    angular.module("AdsbApp")
           .service("LocalStorageService", LocalStorageService);

    LocalStorageService.$inject = ["$window"];

    function LocalStorageService($window) {

        // Se selecciona el servicio de almacenamiento
        var store = $window.localStorage;
        var prefix = "AdsbApp_";

        // Adiciona una nueva variable
        var add = function (key, value) {
            value = angular.toJson(value);
            store.setItem(key, value);
        }

        // Obtiene una variable
        var get = function (key) {
            var value = store.getItem(key);

            if (value) {
                value = angular.fromJson(value);
            }

            return value;
        }

        // Elimina una variable
        var remove = function (key) {
            store.removeItem(key);
        }

        return {
            add: add,
            get: get,
            remove: remove
        }
    }

})();
/**
 * Servicio para el manejo de las operaciones REST
 *
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
    'use strict';

    angular
        .module('AdsbApp')
        .service('RestService', RestService);

    RestService.$inject = ['$http', '$q', 'BaseUri'];

    function RestService($http, $q, BaseUri, LoginBaseUri) {

        // Servicio post
        var post = function (path, data) {
            return $q.resolve($http({
                method: 'POST',
                url: BaseUri.url + path,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: data
            }));
        };

        // Servicio get
        var get = function (path) {          
            return $q.resolve($http.get(BaseUri.url + path));
        };

        // Servicio login
        var login = function (path, body) {
            // todo: puede falta la adición de un config
            return $q.resolve($http.post(BaseUri.url + path, body));
        };

        return {
            post: post,
            get: get,
            login: login
        }
    }
})();
