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
    'fileService',
    function ($window, $firebaseAuth, $firebaseObject, $firebaseArray, $q, lodash, fileService) {

    var auth = $firebaseAuth(),
        rootRef = $window.firebase.database();

    var service = {
      auth: auth,
      rootRef: rootRef,
      users: rootRef.ref('users'),
      files: rootRef.ref('files'),
      userProfile: null,
      userRecord: null,
      userRef: null,

      promptGoogleAuth: function () {
        this.auth.$signInWithPopup('google').then(function(firebaseUser) {
          console.log('Signed in as:', firebaseUser);
        }).catch(function(error) {
          console.log('Authentication failed:', error);
        });
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
        userRef.$loaded(function (record) {
          self.userRecord = record;
          deferred.resolve(record);
        });
        return deferred.promise;
      },

      getRef: function (refString, array) {
        if (!array) {
          return $firebaseObject(this.rootRef.ref(refString));
        } else {
          return $firebaseArray(this[refString]);
        }
      },

      getAuthorFullFiles: function () {
        var self = this,
            files = [];
        lodash.forEach(self.userRecord.files, function (value, key) {
          files.push($firebaseObject(self.files.child(key)).$loaded());
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

      addFile: function (file) {
        var self = this,
            deferred = $q.defer();

        this.fileExists(file).then(function (doesExist) {
          if (!doesExist) {
            return self.updateFileRef(file);
          } else {
            console.log('This file already exists');
          }
        })
        .then(function (ref) {
          return self.authFileExists(file).then(function (doesExist) {
            if (!doesExist) {
              return self.updateAuthFileRef(file);
            } else {
              console.log('Author already has this file');
            }
          });
        })
        .then(function (success) {
          deferred.resolve(success);
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
        var deferred = $q.defer(),
            fileRec = $firebaseObject(this.files.child(file.id));
        fileRec.$loaded(function (fileRec) {
          lodash.forEach(file, function (value, key) {
            fileRec[key] = value;
          });
          fileRec.$save().then(function (success) {
            deferred.resolve(success);
          });
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
              photoURL: profile.photoURL
            };

        users[profile.uid] = newUser;
        users.$save().then(function(ref) {
          console.log('New user saved!', ref);
        }).catch(function(error) {
          console.log('Error!');
        });
      },

      addLocalFiles: function () {
        var unsynced = lodash.filter(fileService.files, ['synced', false]),
            self = this;
        lodash.forEach(unsynced, function (value, key) {
          fileService.updateCurrentFileProps({synced: true});
          self.addFile(value);
        });
      },

      loadUserRecords: function () {
        var self = this,
            deferred = $q.defer();
        // Check current user authentication
        self.getAuth().then(function (profile) {
            if (profile) {
                return self.getUserRecord()
                .then(function (record) {
                    // If a user record exists, use it and sync local files
                    if (record) {
                        deferred.resolve(record);
                    } else {
                        console.log('making new user');
                        // If a user record doesn't exist, create new record and sync local files
                        self.newUserRef(self.userRecord);
                        deferred.resolve(record);
                    }
                });
            } else {
                deferred.reject();
            }
        });

        return deferred.promise;
      }
    };

    service.auth.$onAuthStateChanged(function(firebaseUser) {
      service.user = firebaseUser;
    });

    return service;
  }]);
