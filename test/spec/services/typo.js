'use strict';

describe('Service: typo', function () {

  // load the service's module
  beforeEach(module('panelsApp'));

  // instantiate service
  var typo;
  beforeEach(inject(function (_typo_) {
    typo = _typo_;
  }));

  it('should do something', function () {
    expect(!!typo).toBe(true);
  });

});
