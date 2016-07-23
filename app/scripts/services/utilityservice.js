'use strict';

/**
 * @ngdoc service
 * @name panelsApp.utilityService
 * @description
 * # utilityService
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('utilityService', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      generateRandomId: function (length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for(var i=0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      },
    };
  });
