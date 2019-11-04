
/**
 * Created by developer on 2017/5/17.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function () {
    'use strict';

    var app = angular.module('community.routes');

    app.config(function ($stateProvider) {
        $stateProvider

            /*通知*/
            .state('tab.notification-item', {
                url: '/notification-item/:titleFlag/:information',
                views: {
                    'tab-information': {
                      templateUrl: 'app/notification/templates/notification.html',
                      controller:  'NotificationCtrl'
                 }
                }
            })
           
  
  
    });
})();
