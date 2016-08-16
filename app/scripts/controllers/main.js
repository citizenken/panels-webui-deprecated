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
    'lodash', 'userService', 'diffservice', 'FileSaver', 'Blob',
    function (onlineStatus, $rootScope, $scope, localFileService, $timeout, firebaseService, lodash, userService, diffservice, FileSaver, Blob) { // jshint ignore:line
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
    ctrl.togglePreview = togglePreview;
    ctrl.addCollaborator = addCollaborator;
    ctrl.toggleDiffRelated = toggleDiffRelated;
    ctrl.downloadFile = downloadFile;
    ctrl.collaborators = null;
    ctrl.previewSize = 0;
    ctrl.fabIsOpen = false;
    ctrl.userRecords = null;
    ctrl.userRecord = null;
    ctrl.mine = null;
    ctrl.related = null;
    ctrl.collaborators = null;
    ctrl.typeDelayTimer = null;
    ctrl.files = null;
    ctrl.fireBaseAuth = null;
    ctrl.online = false;

    $scope.mine = null;
    // ctrl.theirs = null,
    // ctrl.dm = new window.diff_match_patch(); // jshint ignore:line

    function init () {
        ctrl.online = onlineStatus.online;
        localFileService.loadFiles();
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
                    initLocalFiles();
                }
            });

            fireService.getUsers().$loaded().then(function (users) {
                ctrl.userRecords = users;
                userService.setUserRecords(users);
            });
        } else {
            initLocalFiles();
        }
    }

    function initLocalFiles () {
        if (lodash.keys(localFileService.files).length === 0) {
           localFileService.createNewLocalFile(ctrl.scriptType);
            localFileService.loadFiles();
        }
        loadCtrlFiles();
    }

    function loadCtrlFiles () {
        ctrl.mine = localFileService.currentFile;
        ctrl.files = localFileService.files;

        if (lodash.has(ctrl.mine, '$id')) {
            loadRelatedRecords(ctrl.mine);
        }
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

        if (lodash.has(ctrl.mine, '$id')) {
            loadRelatedRecords(ctrl.mine);
        }
    }

    function downloadFile () {
      var data = new Blob([ctrl.mine.content], { type: 'text/plain;charset=utf-8' });
      FileSaver.saveAs(data, ctrl.mine.title + '.txt');
    }

    function loadRelatedRecords (file) {
        firebaseService.loadRelated(file)
        .then(function (related) {
            ctrl.related = related;
            return firebaseService.loadCollaborators(ctrl.mine);
        })
        .then(function (collaborators) {
            ctrl.collaborators = collaborators;
        });
    }

    function handleFileChange (newValue, oldValue) {
        if (ctrl.typeDelayTimer) {
            $timeout.cancel(ctrl.typeDelayTimer);
        }

        $rootScope.$emit('scriptContentChange', newValue);
        $rootScope.$emit('renderDiff', newValue, ctrl.theirs);

        ctrl.typeDelayTimer = $timeout(function () {
            if (oldValue !== null && newValue.id === oldValue.id) {
                if (!newValue.history) {
                    newValue.history = [];
                }

                if (newValue.history.length === 20) {
                    newValue.history.pop();
                }
                newValue.history.unshift(oldValue);
            }

            if (lodash.has(newValue, '$id')) {
                firebaseService.updateFile(newValue);
            } else {
                localFileService.updateCurrentFileContent(newValue);
                ctrl.mine = localFileService.currentFile;
            }
        }, 500);
    }

    function togglePreview () {
        ctrl.theirs = null;
        if (ctrl.previewSize) {
            ctrl.previewSize = 0;
        } else {
            ctrl.previewSize = 50;
            $rootScope.$emit('scriptContentChange', ctrl.mine);
        }
    }

    function addCollaborator () {
        if (!ctrl.mine.collaborators || ctrl.mine.collaborators.indexOf(ctrl.collaborators) === -1) {
            firebaseService.addCollaborator(ctrl.collaborators)
            .then(function (copy) {
                console.log(copy);
                console.log(localFileService.currentFile);
                loadCtrlFiles();
            });
        } else {
            console.log('already collaborate in file');
        }
    }

    function updateOnlineStatus () {
        ctrl.online = onlineStatus.online;
    }

    function toggleDiffRelated (fileId) {
        ctrl.previewSize = null;
        ctrl.theirs = ctrl.related[fileId];
    }

    function applyPatch (event, patch) {
        ctrl.mine.content = diffservice.applyPatch(patch, ctrl.mine.content)[0];
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
        if (newValue !== null) {
            if (oldValue === null) {
                handleFileChange(ctrl.mine, oldValue);
            } else if (newValue.synced !== oldValue.synced &&
                newValue.id === oldValue.id) {
                syncFileRemote(newValue.id);
            } else if (newValue.content !== oldValue.content ||
                newValue.title !== oldValue.title) {
                handleFileChange(ctrl.mine, oldValue);
            }
        }
    }, true);

    $scope.$watch(function () {
        if (ctrl.theirs) {
            var props = {};
            lodash.forEach(ctrl.theirs, function (value, key) {
                if (key.indexOf('$') === -1 && key !== 'history') {
                    props[key] = value;
                }
            });
            return props;
        } else {
            return null;
        }
    }, function (newValue, oldValue) {
        if (newValue !== null) {
            if (oldValue === null) {
                $rootScope.$emit('renderDiff', ctrl.mine, ctrl.theirs);
            } else if (newValue.content !== oldValue.content ||
                newValue.title !== oldValue.title) {
                $rootScope.$emit('renderDiff', ctrl.mine, ctrl.theirs);
            }
        }
    }, true);

    // $rootScope.$on('authStateChange', );
    $rootScope.$on('applyPatch', applyPatch);
    $rootScope.$on('onlineStatusChange', updateOnlineStatus);

    ctrl.init();

  }]);
