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

  var app = angular.module('community.controllers.waitWork', []);
  /*待办事项查询*/
  app.controller('SearchCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$ionicNativeTransitions',
    '$filter', '$isMobile', 'stateGoHelp', 'storageService',
    function ($scope, $state, $stateParams, $rootScope, $ionicNativeTransitions, $filter, $isMobile, stateGoHelp, storageService) {

      $rootScope.hideTabs = true;
      $rootScope.bell = false;
      $rootScope.toBack = true;
      var isWorkFlag = $stateParams.workFlag;
      var titleName = $stateParams.titleName;
      var titleFlag = $stateParams.titleFlag;
      var typeId = $stateParams.typeId;
      $scope.title = $stateParams.titleName;
      $scope.stpicker = null; // 初始化开始时间选择器
      $scope.endpicker = null; // 初始化结束时间选择器
      $scope.viewOtherWaitWork = JSON.parse($stateParams.viewOtherWaitWork || 'false') || false;
      $scope.todoUserCode = $stateParams.todoUserCode || '';

      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        $rootScope.hideTabs = true;
        $rootScope.toBack = true;
        data.enableBack = true;//交叉路由
        $scope.startTime = {};//显示开始时间
        $scope.endTime = {};//显示结束时间
        $scope.startTime.time = "开始时间";
        $scope.endTime.time = "结束时间";
        $rootScope.$ionicGoBack = function () {
          /*返回上一页*/
          stateGoHelp.stateGoUtils(false);
        };
        if (!$isMobile.isPC && $isMobile.Android) {
          if (data.direction === "back") {
            var transitionDirection = data.direction !== "back" ? "left" : "right";
            window.plugins.nativepagetransitions.slide({
              "direction": transitionDirection
            });
          }
        }

        $rootScope.titleData = (isWorkFlag == "isWork") ? titleName : "待办事项";
        $scope.titleFlagText = ($stateParams.titleFlag == '1') ? '处理' : '发起';

      });

      $scope.$on('$ionicView.enter', function (event, data) {

        document.getElementById("titleID").value = "";
        document.getElementById("nameID").value = "";
      });

      /*选择开始时间*/
      $scope.selectStartTime = function () {

      }
      /*选择结束时间*/
      $scope.selectEndTime = function () {

      }

      /*查询*/
      $scope.searchWaitWork = function () {
        if (titleFlag != '2') {
          var title = document.getElementById("titleID").value;
          var name = document.getElementById("nameID").value;
          var startTimeStr = $filter("date")($scope.startTime.time, "yyyy-MM-dd");
          var endTimeStr = $filter("date")($scope.endTime.time, "yyyy-MM-dd");
          var searchData = {
            searchTitle: title,
            searchName: name,
            searchStartTime: startTimeStr,
            searchEndTime: endTimeStr
          }
        } else if (titleFlag == '2') {
          var title = document.getElementById("titleID").value;
          var searchData = {
            searchTitle: title
          }
        }


        var searchDataStr = angular.toJson(searchData);
        storageService.set("searchDataStr", searchDataStr)
        if (isWorkFlag == "isWork") {
          if (titleFlag == '0') {//已发
            stateGoHelp.stateGoUtils(true, 'tab.waitNews', {

              searchDataStr: searchDataStr,
              workFlag: "isWork",
              titleName: titleName,
              searchWorkFlag: "searchWork",
              titleFlag: titleFlag
            }, 'left');
          } else if (titleFlag == '1') {//已办
            stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
              searchDataStr: searchDataStr,
              workFlag: "isWork",
              titleName: titleName,
              searchWorkFlag: "searchWork",
              titleFlag: titleFlag,
              typeId: typeId
            }, 'left');
          } else if (titleFlag == '2') {//跟踪
            stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
              searchDataStr: searchDataStr,
              workFlag: "isWork",
              titleName: titleName,
              searchWorkFlag: "searchWork",
              searchTitle: "followWork",
              titleFlag: titleFlag
            }, 'left');
          } else if (titleFlag == '4') {//公文查询
            stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
              searchDataStr: searchDataStr,
              workFlag: "isWork",
              titleName: titleName,
              searchWorkFlag: "searchWork",
              searchTitle: "workDoc",
              titleFlag: titleFlag
            }, 'left');
          } else if (titleFlag == '5') {//知会事项
            stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
              searchDataStr: searchDataStr,
              workFlag: "isWork",
              titleName: titleName,
              searchWorkFlag: "searchWork",
              titleFlag: titleFlag
            }, 'left');
          } else {
            stateGoHelp.stateGoUtils(true, 'tab.myWorkWaitWork', {
              searchDataStr: searchDataStr,
              workFlag: "isWork",
              titleName: titleName,
              searchWorkFlag: "searchWork",
              condition: $stateParams.condition,
              typeId: typeId,
              viewOtherWaitWork: $scope.viewOtherWaitWork,
              todoUserCode: $scope.todoUserCode
            }, 'left');
          }

        } else {
          stateGoHelp.stateGoUtils(true, 'tab.waitWork', {
            searchDataStr: searchDataStr, titleFlag: titleFlag
          }, 'left');
        }

      }

      /**
       * 选择开始时间
       */
      $scope.pickStartTime = function () {
        var beginDate = new Date(0)
        var endDate = new Date(new Date().getFullYear() + 10, 11, 31)
        // 如果结束时间已确定
        // var endDate = $scope.endTime.time === '结束时间'
        //   ? new Date(new Date().getFullYear() + 10, 11, 31)
        //   : new Date($scope.endTime.time)
        $scope.stpicker = new mui.DtPicker({
          type: "date",//设置日历初始视图模式
          beginDate: beginDate,
          endDate: endDate,
          labels: ['年', '月', '日'],//设置默认标签区域提示语
        })
        // 设置默认值（如果有）
        if ($scope.startTime.time !== '开始时间') {
          $scope.stpicker.setSelectedValue($scope.startTime.time);
        }
        $scope.stpicker.show(function (items) {
          $scope.startTime.time = items.text;
          $scope.$apply()
          // $scope.stpicker.dispose();
          // $scope.stpicker = null;
        });
      };

      /**
       * 选择结束时间
       */
      $scope.pickEndTime = function () {
        var beginDate = new Date(0)
        var endDate = new Date(new Date().getFullYear() + 10, 11, 31)
        // 如果开始时间已确定
        // var beginDate = $scope.startTime.time === '开始时间'
        //   ? new Date(0)
        //   : new Date($scope.startTime.time)
        $scope.endpicker = new mui.DtPicker({
          type: "date",//设置日历初始视图模式
          beginDate: beginDate,
          endDate: endDate,
          labels: ['年', '月', '日'],//设置默认标签区域提示语
        })
        // 设置默认值（如果有）
        if ($scope.endTime.time !== '结束时间') {
          $scope.endpicker.setSelectedValue($scope.endTime.time);
        }
        $scope.endpicker.show(function (items) {
          $scope.endTime.time = items.text;
          $scope.$apply()
          // $scope.endpicker.dispose();
          // $scope.endpicker = null;
        });
      };

    }]);

})();
