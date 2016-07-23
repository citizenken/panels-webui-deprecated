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
    ctrl.fireBaseAuth = null;
    // ctrl.theirs = null,
    // ctrl.dm = new window.diff_match_patch(); // jshint ignore:line

    function init () {
        // if (onlineStatus.status === false) {
        //     firebaseService.loadUserRecords()
        //     .then(function () {
        //         return firebaseService.getAuthorFullFiles();
        //     }).then(function (files) {
        //         if (files.length > 0) {
        //             loadFiles(files, true, firebaseService.userRecord);
        //         } else {
        //             loadFiles(null, true, firebaseService.userRecord);
        //         }
        //         firebaseService.addLocalFiles();
        //     })
        //     .catch(function (error) {
        //         loadFiles(null, true);
        //     });
        // } else {
            loadLocalFiles();
        // }
    }

    function loadLocalFiles () {
        localFileService.loadFiles();
        ctrl.mine = localFileService.currentFile;
        ctrl.files = localFileService.files;
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
                localFileService.updateCurrentFileContent(newValue);
                ctrl.mine = localFileService.currentFile;
            }
        }, 500);
    }

    function addNewFile () {
        localFileService.addNewFile(firebaseService.userRecord);
        // ctrl.files = localFileService.files;
        // ctrl.mine = localFileService.currentFile;
        // firebaseService.getRef();
        firebaseService.promptGoogleAuth();
        // localFileService.currentFile.author = firebaseService.userProfile.uid;
        // firebaseService.addFile(localFileService.currentFile);
    }

    function changeFile (fileId) {
        localFileService.changeCurrentFile(fileId);
        ctrl.mine = localFileService.currentFile;
        ctrl.files = localFileService.files;
    }

    $scope.$watch(function () {
        if (ctrl.mine) {
            return ctrl.mine;
        } else {
            return null;
        }
    }, function (newValue, oldValue) {
        if (newValue !== null) {
            handleContentChange(newValue, oldValue);
        }
    }, true);

    // $rootScope.$on('authStateChange', );

    ctrl.init();

  }]);
