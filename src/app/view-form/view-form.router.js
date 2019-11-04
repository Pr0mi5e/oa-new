
(function () {
    'use strict';

    var app = angular.module('community.routes');

    app.config(function ($stateProvider) {
        $stateProvider

            /*待办详情*/
            .state('tab.view-form', {
                url: '/view-form/:waitWorkPassDate/:type/:titleName/:notification/:titleFlag/:workWaitData/:enlargement/:information/:notificationDetail/:savereply/:NotificationItem/:requestParam/:workFlag',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/view-form/templates/view-form.html',
                        controller:  'viewFormController'
                    }
                }
            })

            .state('tab.form-handle', {
                url: '/view-form/formHandle/:waitWorkPassDate/:type/:titleFlag/:workWaitData/:notification/:information/:notificationDetail',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/view-form/templates/form-handle.html',
                        controller: 'FormHandleController'
                    }
                }
            })
            /*回复服用处理表单页面*/
            .state('tab.form-handle-reply', {
                url: '/view-form/formHandleReply/:waitWorkPassDate/:reply/:title/:type/:titleFlag/:workWaitData/:information/:notification/:NotificationItem/:notificationDetail',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/view-form/templates/form-handle.html',
                        controller: 'FormHandleController'
                    }
                }
            })
            /*表单放大页面*/
            .state('tab.form-enlargement', {
                url: '/view-form/formEnlargement/:waitWorkPassDate/:type/:titleFlag/:workWaitData/:notification/:information/:NotificationItem/:notificationDetail',
                nativeTransitions : null,
                views: {
                    'tab-waitWork': {
                        templateUrl: 'app/view-form/templates/form-enlargement.html',
                        controller : 'FormEnlargementCtrl'
                    }
                }
            })

            /*工作内处理表单进入联系人（复用）*/
            .state('tab.formWorkAddressList', {
                url: '/formWorkAddressList/:type/:titleFlag',
                nativeTransitions : null,
                views: {
                    'tab-work': {
                        templateUrl: 'app/wait-work/templates/wait-work-address-list.html',
                        controller: 'AddressListCtrl'
                    }
                }
            })


    });
})();
