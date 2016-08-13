'use strict';

/**
 * @ngdoc overview
 * @name panelsApp
 * @description
 * # panelsApp
 *
 * Main module of the application.
 */
angular
  .module('panelsApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngMaterial',
    'ui.codemirror',
    'ui.layout',
    'ngLodash',
    'firebase',
    'puElasticInput',
    'ngFileSaver'
  ])
  .constant('appConfig', {
    chromeApp: ((window.chrome && window.chrome.app && window.chrome.app.runtime) !== undefined)
  })
  .run(['lodash', function (lodash) {
    window._ = lodash;
  }])
  .config(function () {
    var config = {
      apiKey: 'AIzaSyBFM-2jOMfbeB0gOw_Xi2WQkhBg8GTqsIQ',
      authDomain: 'panels-fd87e.firebaseapp.com',
      databaseURL: 'https://panels-fd87e.firebaseio.com',
      storageBucket: 'panels-fd87e.appspot.com',
    };
    window.firebase.initializeApp(config);
  })
  .config(function ($mdThemingProvider, $mdIconProvider) {
    $mdThemingProvider.theme('altTheme').primaryPalette('red');
    // $mdThemingProvider.setDefaultTheme('altTheme');
    $mdIconProvider.iconSet('navigation', 'images/icons/sets/svg-sprite-navigation.svg', 24);
    $mdIconProvider.iconSet('content', 'images/icons/sets/svg-sprite-content.svg', 24);
    $mdIconProvider.iconSet('action', 'images/icons/sets/svg-sprite-action.svg', 24);
    $mdIconProvider.iconSet('social', 'images/icons/sets/svg-sprite-social.svg', 24);
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
