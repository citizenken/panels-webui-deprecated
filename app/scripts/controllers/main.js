'use strict';

/**
 * @ngdoc function
 * @name panelsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the panelsApp
 */
angular.module('panelsApp')
  .controller('MainCtrl', [ 'onlineStatus', '$rootScope', '$scope', 'fileService', '$timeout', 'firebaseService',
    'lodash',
    function (onlineStatus, $rootScope, $scope, fileService, $timeout, firebaseService, lodash) {
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
    ctrl.fireBaseAuth = null;
    // ctrl.theirs = null,
    // ctrl.dm = new window.diff_match_patch(); // jshint ignore:line

    function init () {
        if (onlineStatus.status) {
            firebaseService.loadUserRecords()
            .then(function () {
                return firebaseService.getAuthorFullFiles();
            }).then(function (files) {
                if (files.length > 0) {
                    loadFiles(files, true, firebaseService.userRecord);
                } else {
                    loadFiles(null, true, firebaseService.userRecord);
                }
                firebaseService.addLocalFiles();
            })
            .catch(function (error) {
                loadFiles(null, true);
            });
        } else {
            loadFiles(null, true);
        }
    }

    function loadFiles (files, setCurrent, profile) {
        fileService.loadFiles(files, true, profile);
        ctrl.mine = fileService.currentFile;
        ctrl.files = fileService.files;
    }

    function openPanel () {
        console.log(ctrl.mine);
        $rootScope.$emit('openPanel');
    }

    function codemirrorLoaded (_editor) {
        _editor.setSize('100%', '100%');
        _editor.refresh();
    }

    function handleContentChange (newValue, oldValue) {
        if (ctrl.typeDelayTimer) {
            $timeout.cancel(ctrl.typeDelayTimer);
        }

        $rootScope.$emit('scriptContentChange', newValue, oldValue);

        ctrl.typeDelayTimer = $timeout(function () {
            if (!angular.equals(newValue, oldValue)) {
                fileService.updateCurrentFileContent(newValue);
                ctrl.mine = fileService.currentFile;
            }
        }, 500);
    }

    function addNewFile () {
        fileService.addNewFile(firebaseService.userRecord);
        // ctrl.files = fileService.files;
        // ctrl.mine = fileService.currentFile;
        // firebaseService.getRef();
        firebaseService.promptGoogleAuth();
        // fileService.currentFile.author = firebaseService.userProfile.uid;
        // firebaseService.addFile(fileService.currentFile);
    }

    function changeFile (fileIndex) {
        fileService.changeCurrentFile(fileIndex);
        ctrl.mine = fileService.currentFile;
        ctrl.files = fileService.files;
    }

    // $scope.$watch(function () {
    //     var watched = angular.copy(ctrl.mine);

    //     if (watched) {
    //         delete watched['modifiedOn'];
    //     }
    //     return watched;
    // }, function (newValue, oldValue) {
    //     if (newValue !== null) {
    //         handleContentChange(newValue, oldValue);
    //     }
    // });

    // $rootScope.$on('authStateChange', );

    ctrl.init();

  }]);
