/**
 * Created by developer on 2017/5/15.
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
            /*个人资料*/
            .state('tab.mineDetails', {
                url: '/mineDetails',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/my-details.html',
                        controller: 'MineDetailsCtrl'
                    }
                }
            })

            /*首页设置*/
            .state('tab.homePageSet', {
                url: '/homePageSet',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/home-page-set.html',
                        controller: 'HomePageSetCtrl'
                    }
                }
            })

            /*单据设置*/
            .state('tab.billSet', {
                url: '/billSet',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/set-bill.html',
                        controller: 'BillSetCtrl'
                    }
                }
            })

            /*签章方式*/
            .state('tab.signatureWay', {
                url: '/signatureWay',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/signature-way.html',
                        controller: 'SignatureWayCtrl'
                    }
                }
            })

            /*登录密码*/
            .state('tab.setPassword', {
                url: '/setPassword/:pwType',
                nativeTransitions : null,
                cache: false,//不缓存
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/set-password.html',
                        controller: 'SetPasswordCtrl'
                    }
                }
            })
            /*跳转通知页面（复用）*/
            .state('tab.mineNotification', {
                url: '/mineNotification/:type',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/notification/templates/notification.html',
                        controller:  'NotificationCtrl'
                    }
                }
            })
              /*从我的页面跳转工作通知页面（复用）*/
            .state('tab.mineWorkNotification', {
                url: '/mineWorkNotification/:type',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/notification/templates/notification-work.html'

                    }
                }
            })
            .state('tab.authPassword', {
                url: '/authPassword',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/auth-password.html'
                    }
                }
            })

            //关于系统
            .state('tab.mineAboutSystem', {
                url: '/mineAboutSystem/:systemData',
                nativeTransitions : null,
                views: {
                    'tab-mine': {
                        templateUrl: 'app/mine/templates/about-system.html',
                        controller:'AboutSystemCtrl'
                    }
                }
            })
            /*其他人待办工作*/
          .state('tab.mineOtherWaitWork', {
            url: '/myWorkWaitWork/:titleName/:typeId/:workFlag/:searchDataStr/:searchWorkFlag/:condition/:titleFlag/:workWaitData/:custom/:viewOtherWaitWork/:todoUserCode',
            nativeTransitions : null,
            views: {
              'tab-mine': {
                templateUrl: 'app/wait-work/templates/tab-wait-work.html',
                controller: 'WaitWorkCtrl'
              }
            }
          });
    });
})();
