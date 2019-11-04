/**
 * Created by developer on 2017/5/31.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function () {
  'use strict';

  var app = angular.module('community.controllers.waitWork');

  /*待办-筛选*/
  app.controller('SizerCtrl', ['$scope', '$state', 'storageService', '$ionicNativeTransitions',
    '$ionicPopup', 'T', 'wait_work', '$stateParams', '$rootScope', '$isMobile', '$ionicHistory', 'stateGoHelp',
    function ($scope, $state, storageService, $ionicNativeTransitions, $ionicPopup, T, wait_work, $stateParams,
              $rootScope, $isMobile, $ionicHistory, stateGoHelp) {

      var titleName = $stateParams.titleName;
      $scope.currentId = null
      var isWorkFlag = $stateParams.workFlag;
      if (!isWorkFlag){
        $scope.mapList = JSON.parse($stateParams.mapList);
      }
      $scope.isShowType = true;
      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        $rootScope.bell = false;
        $rootScope.toBack = true;
        data.enableBack = true;//交叉路由
        if (!$isMobile.isPC && $isMobile.Android) {
          if (data.direction === "back") {
            var transitionDirection = data.direction !== "back" ? "left" : "right";
            window.plugins.nativepagetransitions.slide({
              "direction": transitionDirection
            });
          }
        }

        $rootScope.titleData = titleName || "待办事项";
        $scope.isShowType = !titleName;
        $rootScope.$ionicGoBack = function () {
          stateGoHelp.stateGoUtils(false);
        }
      });

      //管理buttonID
      var statusBtn = ["allBtn", "pauseBtn", "backBtn", "readBtn", "unreadBtn"];
      // 获取之前选中的button，没有就赋默认值
      $scope.activeStatusBtn = storageService.get(wait_work.sizerWorkStateKey, "allBtn");
      $scope.activeTypeBtn = storageService.get(wait_work.sizerWorkTypeKey, null);

      //刷新页面button的样式
      function checkActiveBtn(activeBtn, btnArr) {
        btnArr.forEach(function (e) {
          var btnDom = document.getElementById(e);
          btnDom.style.backgroundColor = (e === activeBtn) ? "#c5f5e9" : "#e5e5e5";
          btnDom.style.color = (e === activeBtn) ? "#01a65a" : "#999";
        });
      }

      function checkActiveBtns(activeBtn) {
        $scope.currentId = activeBtn;
      }

      //页面初始化执行一次
      checkActiveBtn($scope.activeStatusBtn, statusBtn);
      checkActiveBtns($scope.activeTypeBtn, null);

      //status按钮点击事件
      $scope.statusRadio = function (event) {
        var activeBtn = event.target.id;
        if (!activeBtn) return;
        $scope.activeStatusBtn = activeBtn;
        checkActiveBtn($scope.activeStatusBtn, statusBtn);
      };


      //type按钮点击事件
      $scope.typeRadio = function (id) {
        $scope.activeTypeBtn = id;
        checkActiveBtns($scope.activeTypeBtn,null);
      }


      $scope.sizerSure = function () {

        //错误提示
        // !$scope.activeStatusBtn || !$scope.activeTypeBtn
        if (!$scope.activeStatusBtn) {
          $ionicPopup.alert({
            title: T.translate("wait-work.sizer-title"),
            template: $scope.activeStatusBtn ? T.translate("wait-work.type-null") : T.translate("wait-work.state-null")
          });
          return;
        }

        //存值，下次进入取值
        storageService.set(wait_work.sizerWorkStateKey, $scope.activeStatusBtn);
        storageService.set(wait_work.sizerWorkTypeKey, $scope.currentId);

        if (typeof (titleName) === "undefined") {
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
          stateGoHelp.stateGoUtils(true, 'tab.waitWorkStart', {}, 'left');
        } else {
          storageService.set("sizerBackRequest", "backRequest");
          stateGoHelp.stateGoUtils(false);
        }
      }

    }]);


})();
