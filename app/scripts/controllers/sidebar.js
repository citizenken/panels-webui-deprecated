'use strict';

/**
 * @ngdoc function
 * @name panelsApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsApp
 */
angular.module('panelsApp')
  .controller('SidebarCtrl', [ 'onlineStatus', '$rootScope', '$scope', function (onlineStatus, $rootScope, $scope) {
    var ctrl = this;
    ctrl.init = init;
    ctrl.isOpen = false;
    ctrl.settings = {
        online: null
    };

    function init () {
        ctrl.settings.online = onlineStatus.status;
    }

    function updateOnlineStatus () {
        ctrl.settings.online = onlineStatus.status;
        $scope.$apply();
    }

    function openPanel () {
        ctrl.isOpen = !ctrl.isOpen;
    }

    $rootScope.$on('onlineStatusChange', updateOnlineStatus);
    $rootScope.$on('openPanel', openPanel);
    // $scope.$watch(function () {
    //     return ctrl.isOpen;
    // }, function () {
    //     var state = ctrl.isOpen ? 'open':'closed';
    //     $rootScope.$emit('sideBarStateChange', state);
    // });

    ctrl.init();
  }]);
