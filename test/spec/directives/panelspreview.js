'use strict';

describe('Directive: panelsPreview', function () {

  // load the directive's module
  beforeEach(module('panelsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<panels-preview></panels-preview>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the panelsPreview directive');
  }));
});
