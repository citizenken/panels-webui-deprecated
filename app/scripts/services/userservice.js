'use strict';

/**
 * @ngdoc service
 * @name panelsApp.userService
 * @description
 * # userService
 * Factory in the panelsApp.
 */
angular.module('panelsApp')
  .factory('userService',['utilityService', function (utilityService) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      userProfile: null,
      userRecord: null,
      setUserProfile: function (profile) {
        this.userProfile = profile;
      },
      getUserProfile: function () {
        if (this.userProfile === null) {
          this.setUserProfile(this.generateUserProfile());
        }
        return this.userProfile;
      },
      setUserRecord: function (userRecord) {
        this.userRecord = userRecord;
      },
      getUserRecord: function () {
        return this.userRecord;
      },
      generateUserProfile: function () {
        return {
          id: utilityService.generateRandomId(20)
        };
      }
    };
  }]);
