'use strict';

/**
 * @ngdoc service
 * @name panelsApp.typo
 * @description
 * # typo
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('typo', function () {
    var dict = new window.Typo('en_US', false, false, { dictionaryPath: 'bower_components/Typo.js/typo/dictionaries' });

    // Public API here
    return {
      check: function (word) {
        return dict.check(word);
      },
      suggest: function (word) {
        return dict.suggest(word);
      }
    };
  });
