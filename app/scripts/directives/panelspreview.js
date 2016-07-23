'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:panelsPreview
 * @description
 * # panelsPreview
 */
angular.module('panelsApp')
  .directive('panelsPreview', ['$rootScope', function ($rootScope) {
    return {
      restrict: 'AE',
      link: function postLink(scope, element, attrs) {
        function renderScript (event, newValue, oldValue) {
            var script = new Script('comicbook'), //jshint ignore:line
                renderer = new Renderer(script, element); //jshint ignore:line
            if (newValue.content !== null) {
                element.empty();
                script.fromBlob(newValue.content);
                renderer.renderElements();

            }
        }

        $rootScope.$on('scriptContentChange', renderScript);
      }
    };
  }]);
