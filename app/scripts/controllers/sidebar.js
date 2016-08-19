'use strict';

/**
 * @ngdoc function
 * @name panelsApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsApp
 */
angular.module('panelsApp')
  .controller('SidebarCtrl', [ 'onlineStatus', '$rootScope', '$scope', '$mdDialog', 'userService',
    function (onlineStatus, $rootScope, $scope, $mdDialog, userService) {
    var ctrl = this;
    ctrl.init = init;
    ctrl.isOpen = false;
    ctrl.showUserDialog = showUserDialog;
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

    function showUserDialog (ev) {
        var dialogObj = $mdDialog.show({
            controller: DialogCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'views/user-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true
        })
        .then(function(answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          $scope.status = 'You cancelled the dialog.';
        });
        function DialogCtrl(userService, $mdDialog, lodash, $q) {
            var ctrl = this;
            ctrl.selectedUsers = [];
            ctrl.users = userService.users;
            ctrl.closeDialog = closeDialog;
            ctrl.userSearch = userSearch;

            function closeDialog () {
              $mdDialog.hide();
            }

            function userSearch (query) {
              var results = query ? lodash.filter(ctrl.users, function(value, key){
                if (key.indexOf('$') !== - 1) {
                  return false;
                } else {
                  return (value.username.indexOf(query)) ? true : false;
                }
              }): [];
              return results;
            }
        }
    }


    function closeDialog () {
        ctrl.dialog.hide();
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
