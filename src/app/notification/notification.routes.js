
(function () {
    'use strict';

    var app = angular.module('community.routes');

    app.config(function ($stateProvider) {
        $stateProvider

            /*通知*/
            .state('tab.notification', {
                url: '/notification/:titleFlag/:type/:backFlag',
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/notification/templates/notification.html',
                        controller:  'NotificationCtrl'
                    }
                }
            })
            /*工作通知7*/
            .state('tab.notification-work', {
                url: '/notification-work/:titleFlag/:NotificationItem/:type/:information/:savereply/:enlargement',
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/notification/templates/notification-work.html',
                        controller : 'NotificationWorkCtrl'
                    }
                }
            })
           





    });
})();

