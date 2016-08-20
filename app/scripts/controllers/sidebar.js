'use strict';

/**
 * @ngdoc function
 * @name panelsApp.controller:SidebarCtrl
 * @description
 * # SidebarCtrl
 * Controller of the panelsApp
 */
angular.module('panelsApp')
  .controller('SidebarCtrl', [ 'onlineStatus', '$rootScope', '$scope', '$mdDialog', 'userService', 'firebaseService',
    function (onlineStatus, $rootScope, $scope, $mdDialog, userService, firebaseService) {
    var ctrl = this;
    ctrl.init = init;
    ctrl.isOpen = false;
    ctrl.collabTarget = null;
    ctrl.showUserDialog = showUserDialog;
    ctrl.addCollaborator = addCollaborator;
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

    function addCollaborator (selectedUsers) {
      var target = ctrl.collabTarget;
        if (!target.collaborators || target.collaborators.indexOf(ctrl.collaborators) === -1) {
          angular.forEach(selectedUsers, function(collaborator) {
            firebaseService.addCollaborator(target, collaborator.id)
            .then(function (copy) {
                $rootScope.$emit('updateFiles');
            });
          });
        } else {
            console.log('already collaborate in file');
        }
    }

    function showUserDialog (ev, fileId) {
        ctrl.collabTarget = fileId;
        var dialogObj = $mdDialog.show({
            controller: DialogCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'views/user-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true,
            locals: {
              addCollaborator: ctrl.addCollaborator
            }
        });

        function DialogCtrl(userService, $mdDialog, lodash, $q, $filter, addCollaborator) {
            var ctrl = this;
            ctrl.selectedUsers = [];
            ctrl.filterSelected = true;
            ctrl.users = userService.users;
            ctrl.closeDialog = closeDialog;
            ctrl.submitDialog = submitDialog;
            ctrl.userSearch = userSearch;

            function closeDialog () {
              $mdDialog.hide();
            }

            function submitDialog () {
              $mdDialog.hide();
              addCollaborator(ctrl.selectedUsers);
            }

            function userSearch (query) {
              var results = query ? lodash.filter(ctrl.users, function(value, key){
                if (key.indexOf('$') !== - 1) {
                  return false;
                } else if (value.username.indexOf(query) || value.displayName.indexOf(query)) {
                  var emailLimit = 28,
                      username = $filter('limitTo')(value.username, emailLimit);
                  username = username + ((username.length < emailLimit) ? '' : '...');
                  ctrl.users[key].username = username;
                  return true;
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
