/**
 * Created by CrazyDong on 2017/7/25.
 * 消息列表
 */
(function () {
  'use strict';

  var app = angular.module('community.controllers.information', []);

  app.controller('InformationCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$ionicNativeTransitions',
    '$ionicHistory', 'serverConfiguration', 'storageService', 'auth_events', '$timeout', '$isMobile',
    'application', 'wait_work', 'stateGoHelp', 'GetRequestService', '$httpParamSerializer',
    function ($scope, $state, $stateParams, $rootScope, $ionicNativeTransitions, $ionicHistory,
              serverConfiguration, storageService, auth_events, $timeout, $isMobile, application, wait_work, stateGoHelp,
              GetRequestService, $httpParamSerializer) {


      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        $rootScope.hideTabs = false;
        $rootScope.bell = false;
        $rootScope.toBack = false;
        $rootScope.titleData = '消息';
        //清空待办 工作待办的筛选状态
        storageService.set(wait_work.sizerWorkTypeKey, "");
        storageService.set(wait_work.sizerWorkStateKey, "");
        storageService.removeItem('searchDataStr');

        var account = storageService.get(auth_events.userId, null);
        getInformationData(account, 1, 10, true);
      });
      $scope.$on('$ionicView.enter', function () {

        $rootScope.hideTabs = false;
        // application.getAlertNews();//获取新消息提示  即红点(底部tabs 工作 待办 消息  铃铛)
      });
      $scope.InformationData = [];
      var titleFlag = $stateParams.titleFlag;
      /**
       * * 2018/4/19 14:23  tyw
       *  变更描述：添加空数据展示页面
       *  功能说明：当请求数据为空时展示一个空数据图标
       */
      $scope.isEmptyData = true;//是否显示空数据界面

      $scope.goNofitication = function () {
        stateGoHelp.stateGoUtils(true, 'tab.notification-item', {
          titleFlag: titleFlag,
          information: 'information'
        }, 'left');
      }


      function getInformationData(account, pageNum, pageSize, isLoading) {
        var url = serverConfiguration.baseApiUrl + "app/message/v1/noticeList";

        var param = {
          account: account,
          pageNum: pageNum,
          pageSize: pageSize

        };

        /**
         * * 2018/4/11 14:36  CrazyDong
         *  变更描述：使用统一的utils网络请求
         *  功能说明：请求数据
         */
        GetRequestService.getRequestDataJson(url, $httpParamSerializer(param), isLoading, 'POST', 'application/x-www-form-urlencoded').then(function (result) {
          $scope.InformationData = result.list;
          if (result.list && result.list.length) {
            $scope.isEmptyData = false;
            $rootScope.tabIonNotification = result.list[0].count > 0;//是否显示"消息"的红点提示
            $rootScope.bellRed = result.list[0].count > 0;//是否显示铃铛的红点提示
          } else {
            $scope.isEmptyData = true;
          }
        }, function (error) {

        });
      }


    }]);
})();
