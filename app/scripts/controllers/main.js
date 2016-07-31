'use strict';

/**
 * @ngdoc function
 * @name panelsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the panelsApp
 */
angular.module('panelsApp')
  .controller('MainCtrl', [ 'onlineStatus', '$rootScope', '$scope', 'localFileService', '$timeout', 'firebaseService',
    'lodash', 'userService',
    function (onlineStatus, $rootScope, $scope, localFileService, $timeout, firebaseService, lodash, userService) {
    var ctrl = this;
    ctrl.scriptType = 'comicbook';
    ctrl.editorOptions = {
        lineWrapping : true,
        lineNumbers: false
    };
    ctrl.openPanel = openPanel;
    ctrl.codemirrorLoaded = codemirrorLoaded;
    ctrl.addNewFile = addNewFile;
    ctrl.changeFile = changeFile;
    ctrl.syncFileRemote = syncFileRemote;
    ctrl.signIn = signIn;
    ctrl.init = init;
    ctrl.userRecord = null;
    ctrl.mine = null;
    ctrl.typeDelayTimer = null;
    ctrl.files = null;
    ctrl.fireBaseAuth = null;
    $scope.mine = null;
    // ctrl.theirs = null,
    // ctrl.dm = new window.diff_match_patch(); // jshint ignore:line

    function init () {
        localFileService.loadFiles(ctrl.scriptType);
        var fireService = firebaseService;
        if (onlineStatus.online) {
            fireService.loadUserRecords()
            .then(function () {
                ctrl.userRecord = userService.getUserRecord();
                return firebaseService.getAuthorFullFiles();
            })
            .then(function (files) {
                // if (files.length > 0) {
                firebaseService.loadRemoteFiles(files);
                loadCtrlFiles();

                // } else {
                //     loadFiles(null, true, firebaseService.userRecord);
                // }
                // firebaseService.addLocalFiles();
            })
            .catch(function (error) {
                if (error.msg === 'No profile found') {
                    // revert to local files
                    loadCtrlFiles();
                }
            });
        }
    }

    function loadCtrlFiles () {
        ctrl.mine = localFileService.currentFile;
        ctrl.files = localFileService.files;
    }

    function openPanel () {
        $rootScope.$emit('openPanel');
    }

    function codemirrorLoaded (_editor) {
        _editor.setSize('100%', '100%');
        _editor.refresh();
    }

    function signIn () {
        firebaseService.promptGoogleAuth()
        .then(function () {
            init();
        });
    }

    function addNewFile () {
        localFileService.addNewFile(ctrl.scriptType);
        // firebaseService.addNewFileToFiles()
        // .then(function (files) {
        //     loadCtrlFiles();
        // });
        ctrl.files = localFileService.files;
        ctrl.mine = localFileService.currentFile;
        // firebaseService.getRef();
        // firebaseService.promptGoogleAuth();
        // localFileService.currentFile.author = firebaseService.userProfile.uid;
        // firebaseService.addFile(localFileService.currentFile);
    }

    function syncFileRemote (fileId) {
        if (ctrl.mine.synced) {
            firebaseService.syncLocalFile(localFileService.files[fileId])
            .then(function () {
                loadCtrlFiles();
            });
        } else {
            firebaseService.unSyncLocalFile(localFileService.files[fileId]);
            loadCtrlFiles();
        }
    }

    function changeFile (fileId) {
        localFileService.changeCurrentFile(fileId);
        ctrl.mine = localFileService.currentFile;
        ctrl.files = localFileService.files;
    }

    function handleFileChange (newValue, oldValue) {
        if (ctrl.typeDelayTimer) {
            $timeout.cancel(ctrl.typeDelayTimer);
        }

        $rootScope.$emit('scriptContentChange', newValue);

        ctrl.typeDelayTimer = $timeout(function () {
            if (newValue.id === oldValue.id) {
                if (!newValue.history) {
                    newValue.history = [];
                }

                if (newValue.history.length === 20) {
                    newValue.history.pop();
                }
                newValue.history.unshift(oldValue);
            }
            if (!angular.equals(newValue)) {
                if (lodash.has(newValue, '$id')) {
                    console.log(newValue);
                    firebaseService.updateFile(newValue);
                } else {
                    localFileService.updateCurrentFileContent(newValue);
                    ctrl.mine = localFileService.currentFile;
                }
            }
        }, 500);
    }

    $scope.$watch(function () {
        if (ctrl.mine) {
            var props = {};
            lodash.forEach(ctrl.mine, function (value, key) {
                if (key.indexOf('$') === -1 && key !== 'history') {
                    props[key] = value;
                }
            });
            return props;
        } else {
            return null;
        }
    }, function (newValue, oldValue) {
        if (newValue !== null && oldValue !== null) {
            if (newValue.synced !== oldValue.synced) {
                syncFileRemote(newValue.id);
            } else if (newValue.content !== oldValue.content ||
                newValue.title !== oldValue.title) {
                handleFileChange(ctrl.mine, oldValue);
            }
        }
    }, true);

    // $rootScope.$on('authStateChange', );

    ctrl.init();

  }]);
