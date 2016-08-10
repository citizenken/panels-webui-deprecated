'use strict';

describe('Directive: diffview', function () {

  // load the directive's module
  beforeEach(module('panelsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<diffview></diffview>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the diffview directive');
  }));
});
