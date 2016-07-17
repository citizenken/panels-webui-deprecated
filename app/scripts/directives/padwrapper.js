'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:cmWrapepr
 * @description
 * # cmWrapepr
 */
angular.module('panelsApp')
  .directive('cmWrapper', ['$rootScope', 'typo', function ($rootScope, typo) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var classNames = element[0].querySelector('.CodeMirror').className;
        element[0].querySelector('.CodeMirror').className = 'md-whiteframe-8dp ' + classNames;

        function checkSpelling (event, newValue, oldValue) {

        }


        $rootScope.$on('scriptContentChange', checkSpelling);
      }
    };
  }]);
