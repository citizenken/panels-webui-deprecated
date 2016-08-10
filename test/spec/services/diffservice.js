'use strict';

describe('Service: diffservice', function () {

  // load the service's module
  beforeEach(module('panelsApp'));

  // instantiate service
  var diffservice;
  beforeEach(inject(function (_diffservice_) {
    diffservice = _diffservice_;
  }));

  it('should do something', function () {
    expect(!!diffservice).toBe(true);
  });

});
