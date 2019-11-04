/**
 * Created by chris.zheng on 2017/5/17.
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
            .state('gesture', {
                url: '/gesture/:forgetPW/:titleFlag',
                abstract: true,
                cache: false,
                nativeTransitions : null,
                templateUrl: 'app/gesture-lock/templates/nav.html',
                controller: 'gestureNavCtrl'
            })
            .state('gesture.signInGestureLock', {
                url: '/signInGestureLock/:paramData/:webType/:username/:titleFlag/:type/:title/:workWaitData',
                cache: false,
                nativeTransitions : null,
                views: {
                    '': {
                        templateUrl: 'app/gesture-lock/templates/unLock.html',
                        controller: 'signInGestureLockCtrl'
                    }
                }
            })
            .state('gesture.resetGestureLock', {
                url: '/resetGestureLock/:titleFlag',
                cache: false,
                nativeTransitions : null,
                views: {
                    '': {
                        templateUrl: 'app/gesture-lock/templates/reset-lock.html',
                        controller: 'resetGestureLockCtrl'
                    }
                }
            })
            .state('gesture.setGestureLock', {
                url: '/setGestureLock/:pwType/:changePwType/:titleFlag/:lockBack',
                cache: false,
                nativeTransitions : null,
                views: {
                    '': {
                        templateUrl: 'app/gesture-lock/templates/set-lock.html',
                        controller: 'setGestureLockCtrl'
                    }
                }
            });
    });
})();
