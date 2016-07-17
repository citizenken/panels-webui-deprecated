'use strict';

/**
 * @ngdoc service
 * @name panelsApp.localStorage
 * @description
 * # localStorage
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('fileService', ['$rootScope', 'appConfig', 'lodash', function ($rootScope, appConfig, lodash) {
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

      loadFiles: function (files, setCurrent) {
        if (!files) {
            files = this.getLocalFiles();
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
            localStorage.setItem('panelsFiles', JSON.stringify(this.files));
        }

        return this.files;
      },

      getLocalFiles: function () {
        var files;
        if (appConfig.chromeApp) {
            console.log('chrome app');
        } else {
            files = JSON.parse(localStorage.getItem('panelsFiles'));
            if (!files) {
                files = [];
                files.push(this.createNewFile());
                localStorage.setItem('panelsFiles', JSON.stringify(files));
            }
        }
        return files;
      },

      createNewFile: function () {
        var id = this.generateRandomId(20),
            file = {
              id: id,
              name: '',
              createdOn: Date.now(),
              modifiedOn: Date.now(),
              author: null,
              content: '',
              syncStatus: 'unsynced'
            };

        return file;
      },

      addNewFile: function () {
        var newFile = this.createNewFile();
        this.files.unshift(newFile);
        this.currentFile = newFile;
        this.saveLocalFiles();
      },

      saveCurrentFile: function (onlineStatus) {
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
        lodash.each(props, function (value, key) {
          this.currentFile[key] = value;
        });

        this.currentFile.modifiedOn = Date.now();
        this.saveCurrentFile();
        return this.files;
      },

      changeCurrentFile: function (fileIndex) {
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