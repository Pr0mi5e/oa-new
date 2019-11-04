/**
 * Created by chris.zheng on 2017/5/9.
 */

(function () {
    'use strict';

    var app = angular.module('community.routes');

    app.config(function ($stateProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
        .state('login', {
            url: '/login',
            cache: false,
            nativeTransitions : null,
            templateUrl: 'app/auth/templates/login.html',
            controller: 'loginCtrl'
        })

        .state('forget', {
            url: '/forget',
            nativeTransitions : null,
            templateUrl: 'app/auth/templates/forget-password.html',
            controller: 'forgetCtrl'
        })
    });
})();
