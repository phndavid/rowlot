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
