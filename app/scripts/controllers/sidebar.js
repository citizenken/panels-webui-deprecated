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
    ctrl.historyTarget = null;
    ctrl.showUserDialog = showUserDialog;
    ctrl.showHistoryDialog = showHistoryDialog;
    ctrl.addCollaborator = addCollaborator;
    ctrl.revertHistory = revertHistory;
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

    function revertHistory (selectedHistory) {
      console.log(selectedHistory);
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
            controller: UserDialogCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'views/user-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true,
            locals: {
              collabTarget: ctrl.collabTarget,
              addCollaborator: ctrl.addCollaborator
            }
        });

        function UserDialogCtrl(userService, $mdDialog, lodash, $q, $filter, collabTarget, addCollaborator) {
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
                } else if (value.id === collabTarget.author) {
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

    function showHistoryDialog (ev, fileId) {
        ctrl.historyTarget = fileId;
        var dialogObj = $mdDialog.show({
            controller: HistoryDialogCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'views/history-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true,
            locals: {
              historyTarget: ctrl.historyTarget,
              revertHistory: ctrl.revertHistory
            }
        });

        function HistoryDialogCtrl(historyTarget, revertHistory) {
            var ctrl = this;
            ctrl.history = historyTarget.history;
            ctrl.selectedHistory = null;
            ctrl.closeDialog = closeDialog;
            ctrl.submitDialog = submitDialog;

            function closeDialog () {
              $mdDialog.hide();
            }

            function submitDialog () {
              $mdDialog.hide();
              addCollaborator(ctrl.selectedHistory);
            }
        }
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
