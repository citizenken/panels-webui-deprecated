'use strict';

/**
 * @ngdoc directive
 * @name panelsApp.directive:diffview
 * @description
 * # diffview
 */
angular.module('panelsApp')
  .directive('diffView', ['$rootScope', 'diffservice', '$compile', function ($rootScope, diffservice, $compile) {
    return {
      restrict: 'AE',
      scope: true,
      controller: function postLink($scope, $element) {
        $scope.acceptTheirs = function (patchNum) {
          $rootScope.$emit('applyPatch', diffservice.patches[patchNum]);
        };

        function renderDiff (event, mine, theirs) {
          if (mine && theirs) {
            $element.empty();
            var diffs = diffservice.diffEfficiency(theirs.content, mine.content);
            if (diffs.length === 1 && diffs[0][0] === 0) {
              $element.append(angular.element('<span>' + theirs.content + '</span>'));
            } else {
              var patches = diffservice.patchMakeFromDiffs(diffs);
              var html = diffservice.diffHtmlFromDiffs(diffs),
                  patchEls = [],
                  startIndex = 0;

              angular.forEach(patches, function (value, key) {
                var patchHtml = diffservice.diffHtmlFromDiffs(value.diffs, key),
                    cleanPatchHtml = patchHtml
                    .replace(/^<span[^>]+>/, '')
                    .replace(/<span[^>]+>/, '<span class="diff-view">')
                    .replace(/<\/span>$/, '');

                var insertIndex = html.indexOf(cleanPatchHtml),
                    lastCharIndex = insertIndex + cleanPatchHtml.length;

                var menu = ['</span>',
                            '<md-menu-content>',
                            '<md-button ng-click="acceptTheirs(' + key +')" aria-label="Do something">',
                            'Accept theirs',
                            '</md-button>',
                            '</md-menu-content>',
                            '</md-menu>'
                ];

                patchHtml = '<md-menu><span ng-click="$mdOpenMenu($event)">' + patchHtml + menu.join('');

                patchHtml = $compile(patchHtml)($scope);

                $element.append(html.slice(0, insertIndex));
                $element.append(patchHtml);
                html = html.slice(lastCharIndex);
                // startIndex = lastCharIndex;
              });
            }
            // var compiled = $compile(html)($scope);
            // $element.append(html);
          }
        }

        $rootScope.$on('renderDiff', renderDiff);
      }
    };
  }]);
