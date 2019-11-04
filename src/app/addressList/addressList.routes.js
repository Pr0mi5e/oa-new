/**
 * Created by developer on 2017/6/7.
 */
(function () {
    'use strict';

    var app = angular.module('community.routes');

    app.config(function ($stateProvider) {
        $stateProvider
            /*跳通知(复用)*/

            .state('tab.addressNotification', {
                url: '/addressNotification/:type',
                nativeTransitions : null,
                views: {
                    'tab-addressList': {
                        templateUrl: 'app/notification/templates/notification.html',
                        controller:  'NotificationCtrl'
                    }
                }
            })
            .state('tab.addressNotificationwork', {
                url: '/addressNotificationwork/:type',
                nativeTransitions : null,
                views: {
                    'tab-addressList': {
                        templateUrl: 'app/notification/templates/notification-work.html',
                        controller:  'NotificationCtrl'
                    }
                }
            })




    });
})();
