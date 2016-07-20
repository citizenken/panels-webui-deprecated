'use strict';

/**
 * @ngdoc service
 * @name panelsApp.localStorage
 * @description
 * # localStorage
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('fileService', ['$rootScope', 'appConfig', 'lodash',
   function ($rootScope, appConfig, lodash) {
    var service = {
      currentFile: null,
      files: null,
      generateRandomId: function (length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for(var i=0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
      },

      loadFiles: function (files, setCurrent, profile) {
        var localFiles = this.getLocalFiles();
        if (files) {
          var fileIds = lodash.map(files, 'id');
          angular.forEach(localFiles, function(value, key) {
            if (fileIds.indexOf(value.id) === -1){
              files.push(value);
            }
          });
        } else {
          files = localFiles;
          if (!files) {
              files = [];
              files.push(this.createNewFile(profile));
              localStorage.setItem('panelsFiles', JSON.stringify(files));
          }

        }

        files = lodash.orderBy(files, 'modifiedOn', 'desc');

        if (setCurrent) {
          this.currentFile = files[0];
          this.files = files;
        }
        return files;
      },

      saveLocalFiles: function () {
        if (appConfig.chromeApp) {
            console.log('chrome app');
        } else {
            var toSave = [];
            angular.forEach(this.files, function (value) {
              var file = value;
              if (lodash.has(file, '$id')) {
                file = this.convertFirebaseFile(file);
              }
              toSave.push(file);
            }, this);
            localStorage.setItem('panelsFiles', JSON.stringify(toSave));
        }

        return this.files;
      },

      convertFirebaseFile: function (file) {
        var converted = {};

        lodash.mapKeys(file, function(value, key) {
          if (key.indexOf('$') === -1) {
            converted[key] = value;
          }
        });
        return converted;
      },

      getLocalFiles: function (profile) {
        var files;
        if (appConfig.chromeApp) {
            console.log('chrome app');
        } else {
            files = JSON.parse(localStorage.getItem('panelsFiles'));
        }
        return files;
      },

      createNewFile: function (profile) {
        var id = this.generateRandomId(20),
            file = {
              id: id,
              name: null,
              createdOn: Date.now(),
              modifiedOn: Date.now(),
              author: null,
              content: null,
              synced: false
            };

        if (profile) {
          file.author = {
            username: profile.username,
            id: profile.id
          };
        }

        return file;
      },

      addNewFile: function (profile) {
        var newFile = this.createNewFile(profile);
        this.files.unshift(newFile);
        this.currentFile = newFile;
        this.saveLocalFiles();
      },

      saveCurrentFile: function (onlineStatus) {
        // Make sure that the first file in the list of files is the current file
        this.files.shift();
        this.files.unshift(this.currentFile);
        if (onlineStatus) {
          console.log('save online');
        } else {
          this.saveLocalFiles();
        }
      },

      updateCurrentFileContent: function (newValue) {
        this.currentFile = newValue;
        this.currentFile.modifiedOn = Date.now();
        this.saveCurrentFile();
        return this.files;
      },

      updateCurrentFileProps: function (props) {
        var self = this;
        lodash.each(props, function (value, key) {
          self.currentFile[key] = value;
        });

        this.currentFile.modifiedOn = Date.now();
        this.saveCurrentFile();
        return this.files;
      },

      changeCurrentFile: function (fileIndex) {
        // Set the desired file to the first file in the list
        this.saveCurrentFile();
        var file = this.files[fileIndex];
        this.currentFile = this.files.splice(fileIndex, 1)[0];
        this.files.unshift(file);
        console.log('files', this.files);
        console.log(this.currentFile.id);
      }

    };

    // $rootScope.$on('scriptContentChange', service.updateCurrentFileContent);

    return service;
  }]);