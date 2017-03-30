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
