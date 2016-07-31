'use strict';

/**
 * @ngdoc service
 * @name panelsApp.firebaseService
 * @description
 * # firebaseService
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('firebaseService', ['$window', '$firebaseAuth', '$firebaseObject', '$firebaseArray', '$q', 'lodash',
    'userService', 'localFileService',
    function ($window, $firebaseAuth, $firebaseObject, $firebaseArray, $q, lodash, userService, localFileService) {

    var auth = $firebaseAuth(),
        rootRef = $window.firebase.database();

    var service = {
      auth: auth,
      rootRef: rootRef,
      users: rootRef.ref('users'),
      files: rootRef.ref('files'),
      userRecords: null,
      userProfile: null,
      userRecord: null,
      userRef: null,

      promptGoogleAuth: function () {
        return this.auth.$signInWithPopup('google');
      },

      getAuth: function () {
        var deferred = $q.defer();
        this.auth.$onAuthStateChanged(function(firebaseUser) {
          this.userProfile = firebaseUser;
          deferred.resolve(firebaseUser);
        }, this);

        return deferred.promise;
      },

      getUserRecord: function () {
        var self = this,
            userRef = $firebaseObject(this.users.child(this.userProfile.uid)),
            deferred = $q.defer();
        this.userRef = userRef;
        return userRef.$loaded();
      },

      getRef: function (refString, array) {
        if (!array) {
          return $firebaseObject(this.rootRef.ref(refString));
        } else {
          return $firebaseArray(this[refString]);
        }
      },

      getAuthorFullFiles: function (profile) {
        var self = this,
            files = {};
        lodash.forEach(userService.getUserRecord().files, function (value, key) {
          files[key] = $firebaseObject(self.files.child(key)).$loaded();
        });

        return $q.all(files);
      },

      getFullFile: function (fileId) {
        var deferred = $q.defer();
        $firebaseObject(this.files.child(fileId)).$loaded(function (loaded) {
          deferred.resolve(loaded);
        });
        return deferred.promise;
      },

      addRemoteFile: function (file) {
        var self = this,
            deferred = $q.defer();

        this.authFileExists(file).then(function (doesExist) {
          if (!doesExist) {
            return self.updateAuthFileRef(file);
          } else {
            console.log('Author already has this file');
          }
        })
        .then(function (aRef) {
          return self.fileExists(file).then(function (doesExist) {
            if (!doesExist) {
              return self.updateFileRef(file);
            } else {
              console.log('This file already exists');
            }
          });
        })
        .then(function (success) {
          deferred.resolve(success);
        })
        .catch(function (error) {
          console.log(error);
        });

        return deferred.promise;
      },

      fileExists: function (file) {
        var fileRec = $firebaseObject(this.files.child(file.id)),
            deferred = $q.defer();

        fileRec.$loaded(function (loaded) {
          if (loaded.id) {
            deferred.resolve(true);
          } else {
            deferred.resolve(false);
          }
        });

        return deferred.promise;
      },

      authFileExists: function (file) {
        var authFileRec = $firebaseObject(this.users.child(file.author.id).child('files/' + file.id)),
            deferred = $q.defer();

        authFileRec.$loaded(function (loaded) {
          if (loaded.id) {
            deferred.resolve(true);
          } else {
            deferred.resolve(false);
          }
        });

        return deferred.promise;
      },

      updateFile: function (file) {
        this.updateFileRef(file);
        this.updateAuthFileRef(file);
      },

      updateFileRef: function (file) {
        var deferred = $q.defer(), fileRec;

        if (!lodash.has(file, '$id')) {
          fileRec = $firebaseObject(this.files.child(file.id));
        } else {
          fileRec = file;
        }
        fileRec.$loaded(function (fileRec) {
          lodash.forEach(file, function (value, key) {
            if (value) {
              fileRec[key] = value;
            }
          });
          fileRec.modifiedOn = Date.now();
          fileRec.$save()
          .then(function (success) {
            deferred.resolve(success);
          })
          .catch(function (error) {
            deferred.reject(error);
          })
          ;
        });

        return deferred.promise;
      },

      updateAuthFileRef: function (file) {
        var deferred = $q.defer(),
            authorCopy = $firebaseObject(this.users.child(file.author.id).child('files').child(file.id));
        authorCopy.$loaded(function (authCopy) {
          lodash.forEach(['id', 'title', 'content', 'modifiedOn'], function (value) {
            if (file[value]) {
              authorCopy[value] = file[value];
            }
          });

          authCopy.$save().then(function (success) {
            deferred.resolve(success);
          });
        });

        return deferred.promise;
      },

      newUserRef: function (profile) {
        var users = $firebaseObject(this.users),
            newUser = {
              username: profile.email,
              files: null,
              id: profile.uid,
              photoURL: profile.photoURL,
              displayName: profile.displayName
            };

        users[profile.uid] = newUser;
        return users.$save()
        .then(function (users) {
          return $firebaseObject(users).$loaded();
        });
      },

      addNewFileToFiles: function () {
        var self = this;
        return this.createNewFile()
        .then(function (newfile) {
          localFileService.files[newfile.id] = newfile;
          return self.loadRemoteFiles(localFileService.files);
        });
      },

      syncLocalFile: function (file) {
        var self = this;

        if (file.author === null ||
          file.author.id === null ||
          file.author.username === null) {
          var userRecord = userService.getUserRecord();
          file.author = {
            id: userRecord.id,
            username: userRecord.username
          };
        }

        return this.addRemoteFile(file).
        then(function (rfile) {
          return $firebaseObject(rfile).$loaded();
        })
        .then(function (rfile) {
          localFileService.files[rfile.id] = rfile;
          localFileService.saveLocalFiles();
          return self.loadRemoteFiles(localFileService.files);
        });
      },

      unSyncLocalFile: function (file) {
        var converted = localFileService.convertFirebaseFile(file);
        converted.synced = false;
        localFileService.files[converted.id] = converted;
        localFileService.saveLocalFiles();
      },

      createNewFile: function () {
        var newFile = localFileService.createNewFile(),
            newRemoteFile;
        return this.addRemoteFile(newFile).
        then(function (rfile) {
          return $firebaseObject(rfile).$loaded();
        });
      },

      loadRemoteFiles: function (files) {
        var self = this;
        if (lodash.keys(files).length > 0) {
          angular.forEach(files, function (val, key) {
            localFileService.files[key] = val;
          });
        }

        var lastModified = lodash.orderBy(lodash.toArray(localFileService.files), 'modifiedOn', 'desc')[0];
        localFileService.currentFile = lastModified;

        return localFileService.files;
      },

      loadUserRecords: function () {
        var self = this,
            deferred = $q.defer();
        // Check current user authentication
        self.getAuth().then(function (profile) {
            if (profile) {
                userService.setUserProfile(profile);
                return self.getUserRecord()
                .then(function (record) {
                    // If a user record exists, use it and sync local files
                    if (lodash.has(record, 'username')) {
                        userService.setUserRecord(record);
                        deferred.resolve(record);
                    } else {
                        console.log('making new user');
                        // If a user record doesn't exist, create new record and sync local files
                        self.newUserRef(userService.getUserProfile())
                        .then(function(users) {
                          var userRecord = users[profile.uid];
                          this.userRecords = users;
                          userService.setUserRecord(userRecord);
                          deferred.resolve(userRecord);
                        }).catch(function(error) {
                          console.log('Error saving record');
                        });
                    }
                });
            } else {
                deferred.reject({msg: 'No profile found'});
            }
        });

        return deferred.promise;
      }
    };

    // service.auth.$onAuthStateChanged(function(firebaseUser) {
    //   service.user = firebaseUser;
    // });

    return service;
  }]);
