'use strict';

/**
 * @ngdoc service
 * @name panelsApp.onlineStatus
 * @description
 * # onlineStatus
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('onlineStatus', ['$rootScope', function ($rootScope) {
    var service = {
      status: null,
      updateOnlineStatus: function () {
        this.status = navigator.onLine;
        $rootScope.$emit('onlineStatusChange', service.onLine);
      }
    };
    service.updateOnlineStatus();
    window.addEventListener('online',  service.updateOnlineStatus);
    window.addEventListener('offline', service.updateOnlineStatus);

    return service;
  }]);
