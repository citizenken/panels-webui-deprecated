'use strict';

/**
 * @ngdoc service
 * @name panelsApp.localStorage
 * @description
 * # localStorage
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('localFileService', ['$rootScope', 'appConfig', 'lodash', 'utilityService', 'userService',
   function ($rootScope, appConfig, lodash, utilityService, userService) {
    var service = {
      currentFile: null,
      files: {},

      loadFiles: function (scriptType) {
        var files = this.getLocalFiles();
        if (lodash.keys(files).length === 0) {
          var newFile = this.createNewFile(scriptType);
          files = {};
          files[newFile.id] = newFile;
          localStorage.setItem('panelsFiles', JSON.stringify(files));
        }


        angular.forEach(files, function (value, key) {
          this.files[key] = value;
        }, this);

        var lastModified = lodash.orderBy(lodash.toArray(this.files), 'modifiedOn', 'desc')[0];
        this.currentFile = lastModified;

        return this.files;
      },

      getLocalFiles: function () {
        var files;
        if (appConfig.chromeApp) {
            console.log('chrome app');
        } else {
            files = JSON.parse(localStorage.getItem('panelsFiles'));
        }
        return files;
      },

      createNewFile: function (scriptType) {
        var id = utilityService.generateRandomId(20),
            file = {
              id: id,
              title: undefined,
              createdOn: Date.now(),
              modifiedOn: Date.now(),
              author: null,
              content: null,
              synced: false,
              type: scriptType,
              history: [],
              collaborators: [],
              related: []
            };

        var profile = userService.getUserRecord();
        if (profile) {
          file.author = profile.id;
        }

        return file;
      },

      saveLocalFiles: function () {
        if (appConfig.chromeApp) {
            console.log('chrome app');
        } else {
            var toSave = {};
            angular.forEach(this.files, function (value) {
              var file = value;
              if (!lodash.has(file, '$id')) {
                toSave[file.id] = file;
              }
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

      addNewFile: function (scriptType) {
        var newFile = this.createNewFile(scriptType);
        this.files[newFile.id] = newFile;
        this.currentFile = newFile;
        this.saveLocalFiles();
      },

      saveCurrentFile: function (onlineStatus) {
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

      changeCurrentFile: function (fileId) {
        // Set the desired file to the first file in the list
        this.saveCurrentFile();
        this.currentFile = this.files[fileId];
      }

    };

    // $rootScope.$on('scriptContentChange', service.updateCurrentFileContent);

    return service;
  }]);