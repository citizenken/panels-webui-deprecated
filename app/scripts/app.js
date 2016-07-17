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
    'LocalStorageModule'
  ])
  .constant('appConfig', {
    chromeApp: ((window.chrome && window.chrome.app && window.chrome.app.runtime) !== undefined)
  })
  .run(['lodash', function (lodash) {
    window._ = lodash;
  }])
  .config(function (localStorageServiceProvider) {
    localStorageServiceProvider
      .setPrefix('panelsApp');
  })
  .config(function ($mdThemingProvider, $mdIconProvider) {
    $mdThemingProvider.theme('red');
    $mdIconProvider.iconSet('navigation', 'images/icons/sets/svg-sprite-navigation.svg', 24);
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      // .when('/about', {
      //   templateUrl: 'views/about.html',
      //   controller: 'AboutCtrl',
      //   controllerAs: 'about'
      // })
      // .when('/main', {
      //   templateUrl: 'views/main.html',
      //   controller: 'MainCtrl',
      //   controllerAs: 'main'
      // })
      .otherwise({
        redirectTo: '/'
      });
  });
