'use strict';
// jscs:disable
/**
 * @ngdoc service
 * @name panelsApp.diffservice
 * @description
 * # diffservice
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('diffservice', function () {
    // Service logic
    // ...

    var dmp = new diff_match_patch; //jshint ignore:line

    dmp.diff_prettyHtml = function(diffs, patchNum) { //jshint ignore:line
      var html = [],
          patternAmp = /&/g,
          patternLt = /</g,
          patternGt = />/g,
          patternPara = /\n/g,
          diffInsert = 1,
          diffDelete = -1,
          diffEqual = 0;
      for (var x = 0; x < diffs.length; x++) {
        var op = diffs[x][0];    // Operation (insert, delete, equal)
        var data = diffs[x][1];  // Text of change.
        var text = data.replace(patternAmp, '&amp;').replace(patternLt, '&lt;')
            .replace(patternGt, '&gt;').replace(patternPara, '\n<br>');
        switch (op) {
          case diffInsert:
            html[x] = '<mine>' + text + '</mine>';
            break;
          case diffDelete:
            html[x] = '<theirs>' + text + '</theirs>';
            break;
          case diffEqual:
            if (patchNum !== undefined) {
              html[x] = '<span class="patch-span" diff-patch>' + text + '</span>';
            } else {
              html[x] = '<span class="diff-view">' + text + '</span>';
            }
            break;
        }
      }
      return html.join('');
    };

    // Public API here
    return {
      diffs: null,
      patches: null,
      diffMain: function (mine, theirs) {
        return dmp.diff_main(mine, theirs); //jshint ignore:line
      },
      diffSemantic: function (mine, theirs) {
        var diffs = this.diffMain(mine, theirs);
        dmp.diff_cleanupSemantic(diffs); //jshint ignore:line
        return diffs;
      },
      diffEfficiency: function (mine, theirs) {
        var diffs = this.diffMain(mine, theirs);
        dmp.diff_cleanupEfficiency(diffs); //jshint ignore:line
        this.diffs = diffs;
        return diffs;
      },
      diffHtml: function (mine, theirs) {
        return dmp.diff_prettyHtml(this.diffEfficiency(mine, theirs)); //jshint ignore:line
      },
      diffHtmlFromDiffs: function (diffs, patchNum) {
        return dmp.diff_prettyHtml(diffs, patchNum); //jshint ignore:line
      },
      patchMakeFromDiffs: function (diffs) {
        this.patches = dmp.patch_make(diffs); //jshint ignore:line
        return this.patches;
      },
      applyPatch: function (patch, text) {
        return dmp.patch_apply([patch], text); //jshint ignore:line
      }

    };
  });
