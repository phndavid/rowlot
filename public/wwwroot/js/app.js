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
         "firebase",
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

            .state("auth.rowlot", {
                page_title: "Rowlot - Dashboard",
                url: "/dashboard",
                templateUrl: "views/rowlot/dashboard.html",                                     
                controller: "RowlotController"
            })
            .state("auth.rowlot-listtask", {
                page_title: "Rowlot - Dashboard",
                url: "/task",
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

       $rootScope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams) {
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
        })

        // Mostrar por defecto el menú lateral colapsado
        $cookieStore.put('sideNavCollapsed', false);
        $rootScope.sideMenuAct = true;       
    };
})();
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

    LoginController.$inject = ["$scope", "$rootScope",  "LoginService", "CurrentUserService", "LoginRedirectService", "toastr"];

    function LoginController($scope, $rootScope,  LoginService, CurrentUserService, LoginRedirectService, toastr) {

        $scope.credentials = {
            username: "dev@gmail.com",
            password: "password"
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
