'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:diffpatch
 * @description
 * # diffpatch
 */
angular.module('panelsApp')
  .directive('diffpatch', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.text('this is the diffpatch directive');
      }
    };
  });
