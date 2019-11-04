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
            /*待办  一级页面*/
            .state('tab.waitWorkStart', {
                url: '/waitWork',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/wait-work/templates/tab-wait-work.html',
                        controller: 'WaitWorkCtrl'
                    }
                }
            })
            /*待办-筛选*/
            .state('tab.sizer', {
                url: '/sizer/:titleFlag/:mapList',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/wait-work/templates/wait-work-sizer.html',
                        controller: 'SizerCtrl'
                    }
                }
            })

            /*待办事项查询*/
            .state('tab.search', {
                url: '/search/:titleFlag',
                nativeTransitions : null,
                cache:false,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/wait-work/templates/wait-work-search.html',
                        controller: 'SearchCtrl'
                    }
                }
            })

            
    });
})();
