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
