/**
 * Definición de constantes
 *
 * @author demorales13@gmail.com
 * @since 3-dic-2016
 *
 */

(function () {
	'use strict';

    angular.module('AdsbApp')
	       .constant('BaseUri', {
	  	        protocol: 'http',
	  	        host: 'dse1.1200.aero:8080',
	  	        path: '/api/v1.0/',
	  	        get url() {
	  	            return this.protocol + '://' + this.host + this.path; }
           })
		   .constant("Config", {

		   })
})();
