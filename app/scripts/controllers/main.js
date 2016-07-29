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
    'lodash',
    function (onlineStatus, $rootScope, $scope, localFileService, $timeout, firebaseService, lodash) {
    var ctrl = this;
    ctrl.editorOptions = {
        lineWrapping : true,
        lineNumbers: false
    };
    ctrl.openPanel = openPanel;
    ctrl.codemirrorLoaded = codemirrorLoaded;
    ctrl.mine = null;
    ctrl.init = init;
    ctrl.typeDelayTimer = null;
    ctrl.addNewFile = addNewFile;
    ctrl.files = null;
    ctrl.changeFile = changeFile;
    ctrl.syncFileRemote = syncFileRemote;
    ctrl.fireBaseAuth = null;
    $scope.mine = null;
    // ctrl.theirs = null,
    // ctrl.dm = new window.diff_match_patch(); // jshint ignore:line

    function init () {
        localFileService.loadFiles();
        var fireService = firebaseService;
        if (onlineStatus.online) {
            fireService.loadUserRecords()
            .then(function () {
                return firebaseService.getAuthorFullFiles();
            })
            .then(function (files) {
                console.log(files);
                // if (files.length > 0) {
                firebaseService.loadRemoteFiles(files);
                loadCtrlFiles();

                // } else {
                //     loadFiles(null, true, firebaseService.userRecord);
                // }
                // firebaseService.addLocalFiles();
            })
            .catch(function (error) {
                // if (error.msg === 'No profile found') {
                //     // revert to local files
                //     // loadLocalFiles();
                // }
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

    function addNewFile () {
        localFileService.addNewFile();
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
        firebaseService.syncLocalFile(localFileService.files[fileId]);
    }

    function changeFile (fileId) {
        localFileService.changeCurrentFile(fileId);
        ctrl.mine = localFileService.currentFile;
        ctrl.files = localFileService.files;
    }

    function handleContentChange (newValue, oldValue) {
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
            if (newValue.content !== oldValue.content ||
                newValue.title !== oldValue.title) {
                handleContentChange(ctrl.mine, oldValue);
            }
        }
    }, true);

    // $rootScope.$on('authStateChange', );

    ctrl.init();

  }]);
