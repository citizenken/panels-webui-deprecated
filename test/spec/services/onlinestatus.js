'use strict';

describe('Service: onlineStatus', function () {

  // load the service's module
  beforeEach(module('panelsApp'));

  // instantiate service
  var onlineStatus;
  beforeEach(inject(function (_onlineStatus_) {
    onlineStatus = _onlineStatus_;
  }));

  it('should do something', function () {
    expect(!!onlineStatus).toBe(true);
  });

});
