
/**
 * Created by developer on 2017/5/16.
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
            /*新建事项*/
            .state('tab.matter', {
                url: '/matter',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/work/templates/my-work-new-matter.html',
                        controller: 'newMatterCtrl'
                    }
                }
            })
            /*新建协同*/
            .state('tab.synergy', {
                url: '/synergy',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/work/templates/my-work-new-synergy.html',
                        controller: 'newSynergyCtrl'
                    }
                }
            })
            /*待发事项*/
            .state('tab.waitNews', {
                url: '/waitNews/:titleName/:typeId/:workFlag/:searchDataStr/:searchWorkFlag/:searchTitle/:titleFlag',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/work/templates/my-work-matter-list.html',
                        controller:'WaitNewsCtrl'
                    }
                }
            })
            /*已办事项*/
            .state('tab.doneWork', {
                url: '/doneWork/:titleName/:typeId/:workFlag/:searchDataStr/:searchWorkFlag/:searchTitle/:titleFlag',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                      templateUrl: 'app/work/templates/my-work-done-work.html',
                      controller:'WaitNewsCtrl'
                    }
                }
            })

            /*待办工作*/
            .state('tab.myWorkWaitWork', {
                url: '/myWorkWaitWork/:titleName/:typeId/:workFlag/:searchDataStr/:searchWorkFlag/:condition/:titleFlag/:workWaitData/:custom/:viewOtherWaitWork/:todoUserCode',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
//                        templateUrl: 'app/work/templates/my-work-wait-work.html',
                        templateUrl: 'app/wait-work/templates/tab-wait-work.html',
                        controller: 'WaitWorkCtrl'
                    }
                }
            })

            /*工作里面的筛选*/
            .state('tab.myWorkSizer', {
                url: '/myWorkSizer/:titleName/:titleFlag/:workFlag',
                nativeTransitions : null,
                cache:false,
                views: {
                    'tab-work': {
                        templateUrl: 'app/wait-work/templates/wait-work-sizer.html',
                        controller: 'SizerCtrl'
                    }
                }
            })
            /*待办事项查询-工作*/
            /**
             * * 2018/4/2 16:26  CrazyDong
             *  变更描述：增加typeId参数
             *  功能说明：修改工作页面中财务、人事、采购、其他审批进入列表搜索（放大镜）数据错误，未在财务等大的前提下搜索
             */
            .state('tab.searchWork', {
                url: '/searchWork/:workFlag/:titleName/:titleFlag/:condition/:typeId/:viewOtherWaitWork/:todoUserCode',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/wait-work/templates/wait-work-search.html',
                        controller: 'SearchCtrl'
                    }
                }
            })
            /*工作里面的列表详情(复用)*/
            .state('tab.viewFormWork', {
                url: '/viewFormWork/:type/:titleName/:imgFlag/:waitWorkPassDate/:searchWorkFlag/:notification/:titleFlag/:workWaitData',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/view-form/templates/view-form.html',
                        controller:  'viewFormController'
                    }
                }
            })
            /*工作里面的表单处理(复用)*/
            .state('tab.formHandleWork', {
                url: '/formHandleWork/:type/:titleFlag',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/view-form/templates/form-handle.html',
                        controller: 'FormHandleController'
                    }
                }
            })
            /*二级页面-联系人*/
            .state('tab.workAddressList', {
                url: '/workAddressList/:titleFlag',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/wait-work/templates/wait-work-address-list.html',
                        controller: 'AddressListCtrl'
                    }
                }
            })
            /*工作跳通知(复用)*/
            .state('tab.workNotification', {
                url: '/workNotification/:type/:titleFlag',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/notification/templates/notification.html',
                        controller:  'NotificationCtrl'
                    }
                }
            })
            /*工作跳表单放大页面(复用)*/
            .state('tab.work-form-enlargement', {
                url: '/view-form/formEnlargement/:type/:titleFlag/:workWaitData/:waitWorkPassDate/:notification/:information/:NotificationItem/:notificationDetail',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/view-form/templates/form-enlargement.html',
                        controller : 'FormEnlargementCtrl'
                    }
                }
            })

    });
})();

