// Routes config
(function () {
    'use strict';

    var app = angular.module('community.routes', []);

    app.config(function($stateProvider, $urlRouterProvider) {

      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        nativeTransitions : null,
        templateUrl: 'app/tabs/tabs.html'
      })
      /*工作*/
          .state('tab.work', {
              url: '/work',
              nativeTransitions : null,
              views: {
                  'tab-work': {
                      templateUrl: 'app/work/templates/tab-my-work.html',
                      controller: 'WorkCtrl'
                  }
              }
          })
          /*待办  带值跳转*/
          .state('tab.waitWork', {
              url: '/waitWork/:searchDataStr/:workWaitData/:retrieve',
              nativeTransitions : null,
              views: {
                  'tab-waitWork': {
                      templateUrl: 'app/wait-work/templates/tab-wait-work.html',
                      controller: 'WaitWorkCtrl'
                  }
              }
          })
          //消息
          .state('tab.information', {
              url: '/information',
              nativeTransitions : null,
              views: {
                  'tab-information': {
                      templateUrl : 'app/information/templates/information.html',
                      controller: 'InformationCtrl'
                  }
              }
          })
          /*我*/
          .state('tab.mine', {
              url: '/mine',
              nativeTransitions :null,
              views: {
                  'tab-mine': {
                      templateUrl: 'app/mine/templates/tab-my.html',
                      controller: 'MineCtrl'
                  }
              }
          })
          /*通讯录*/
      // .state('tab.addressList', {
      //     url: '/addressList',
      //     nativeTransitions : null,
      //     views: {
      //         'tab-addressList': {
      //             templateUrl: 'app/addressList/templates/tab-addressList.html',
      //             controller: 'AddressListCtrl'
      //         }
      //     }
      // })



      // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise(
            function($injector, $location){
                $location.path("/login");//登录页面
            }
        );

    });
})();
