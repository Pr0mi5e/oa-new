/**
 * Created by developer on 2017/5/27.
 * 签章方式
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function () {
  'use strict';

  var app = angular.module('community.controllers.mine');
  app.controller('SignatureWayCtrl', ['$scope', '$state', '$ionicPopup', '$rootScope', '$ionicNativeTransitions',
    'storageService', 'mine', 'auth_events', 'MineService', '$cordovaToast', 'serverConfiguration', 'md5', '$timeout', '$isMobile',
    '$ionicHistory', 'T', 'stateGoHelp', 'authService',
    function ($scope, $state, $ionicPopup, $rootScope, $ionicNativeTransitions, storageService, mine, auth_events,
              MineService, $cordovaToast, serverConfiguration, md5, $timeout, $isMobile, $ionicHistory, T, stateGoHelp, authService) {
      $scope.summaryPWOpen = "出于安全考虑，免输签章密码的设置每次用户退出或者应用进程被杀死后失效，如果需要再次开启请用户登录后重新设置。";
      $scope.summaryPWClose = "关闭后,则不需要密码进行签章";
      $scope.summaryGesturesOpen = "开启后,签章方式为解锁手势图案密码,手势图案与解锁图案不一致";
      $scope.checkPW = false; // 设置登录手势前校验数字密码
      $scope.errMsg = '';
      // mui('.mui-switch')['switch']()
      /*解决跳到本业面  底部tabs不隐藏的bug*/
      $scope.$on('$ionicView.enter', function (event, data) {
        angular.element(document.querySelectorAll(".tabs-icon-top")).addClass("tabs-item-hide");
      });

      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        console.log(storageService.get(auth_events.signature));
        $rootScope.bell = false;
        $rootScope.toBack = true;
        $scope.isChangePW = false;//dialog显示隐藏控制,默认为隐藏
        // $scope.valuePW = false;//审批时免输签章密码控制,默认为关闭
        $scope.valueImg = false;//手势图案签章切换控制,默认为关闭
        $scope.changeHandImg = false;//修改手势密码控制,默认为隐藏
        $rootScope.titleData = '签章管理';
        // $scope.valuePW = storageService.get(auth_events.signature) !== 0;
        if (storageService.get(mine.approveSwitchKey, false) == "true") {
          $scope.valuePW = true;
        }
        if (storageService.get(mine.signatureSwitchKey, false) == 'true') {
          $scope.valueImg = true;
          $scope.changeHandImg = true;
        }

        if (!$isMobile.isPC && $isMobile.Android) {
          if (data.direction === "back") {
            var transitionDirection = data.direction !== "back" ? "left" : "right";
            window.plugins.nativepagetransitions.slide({
              "direction": transitionDirection
            });
          }
        }
      });

      /*审批时免输签章密码*/
      $scope.toggleChangePW = function () {

        $scope.valuePW = !$scope.valuePW;
        /*存储是否开启审批免输密码*/
        // storageService.set(mine.approveSwitchKey, $scope.valuePW);
        if ($scope.valuePW) {
          $scope.isChangePW = true;
          $scope.maskTitle = '身份验证';
        } else {
          setSignature()
        }

      }

      /*手势图案签章切换按钮*/
      $scope.toggleChangeImg = function () {
        /*存储是否开启手势图案签章密码*/
        if (!$scope.valueImg) {
          $scope.checkPW = true;
          // stateGoHelp.stateGoUtils(true,'gesture.setGestureLock',{pwType: 'pwType',lockBack:$scope.valueImg},'left');
        }
        /*关闭的时候存值*/
        if ($scope.valueImg) {
          $scope.valueImg = !$scope.valueImg;
          $scope.changeHandImg = !$scope.changeHandImg;
          storageService.set(mine.signatureSwitchKey, $scope.valueImg);
        }
      }

      $scope.isChangePW = false;//修改签章密码的弹出确认框
      var changePassword;
      /*修改手势密码跳转*/
      $scope.goGestureLock = function () {
        $scope.isChangePW = true;
        $scope.maskTitle = '身份验证';

      }

      /*dialog确定*/
      $scope.goDash = function () {
        var url = serverConfiguration.baseApiUrl + "app/common/v1/signatureValidate";
        changePassword = document.getElementById("changePassword").value;
        if (changePassword.length == 0) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate("mine.signature-pw-null"));
          }
          return;
        }
        var param = {
          account: storageService.get(auth_events.userId, null),//用户id
          signaturePwd: md5.createHash(changePassword)
        }
        console.log(param);
        MineService.getMineData(url, param).then(function (result) {
          if (result.state == 0) {
            setSignature();
            if ($scope.valuePW) {
              $scope.isChangePW = false;
              $scope.isShowSignature = false;
              stateGoHelp.stateGoUtils(false);
              // stateGoHelp.stateGoUtils(true, 'tab.mine', {}, 'left');
            } else {
              stateGoHelp.stateGoUtils(true, 'gesture.setGestureLock', {changePwType: 'changePwType'}, 'left');
            }

          } else {

            $scope.valuePW = false;
            $scope.isShowSignature = true;

            $scope.isChangePW = false;
            angular.element("#pwdInput").removeAttr('checked');
            /*存储是否开启审批免输密码*/
            // storageService.set(mine.approveSwitchKey, $scope.valuePW);

            if (!$isMobile.isPC) {
              $cordovaToast.showShortBottom(result.msg);
            }
          }

        }, function (err) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate("form-handle.gesture-error"));
          }
        });

        document.getElementById("changePassword").value = '';
      }

      /*dialog取消*/
      $scope.cancel = function () {
        /*审批时免输入密码时的执行*/
        if ($scope.valuePW) {
          $scope.valuePW = false;
          $scope.isShowSignature = true;
          /*存储是否开启审批免输密码*/
          // storageService.set(mine.approveSwitchKey, $scope.valuePW);
          angular.element("#pwdInput").removeAttr('checked');

        }
        $scope.isChangePW = false;
        document.getElementById("changePassword").value = '';

      }
      /*跳转签章密码*/
      $scope.goChangePW = function () {
        stateGoHelp.stateGoUtils(true, 'tab.setPassword', {pwType: 'pwType'}, 'left');
      }

      /**
       * 校验登录数字密码
       */
      $scope.checkPWMethod = function () {
        var userLogin = authService.loadUserLogin();  // 获取当前登录用户信息
        var pwValue = document.querySelector('#pwValue').value;
        if (userLogin.pw === pwValue) {
          $scope.checkPW = false;  // 关闭dialog
          stateGoHelp.stateGoUtils(true, 'gesture.setGestureLock', {
            pwType: 'pwType',
            lockBack: $scope.valueImg
          }, 'left');
          $scope.valueImg = !$scope.valueImg;
          $scope.changeHandImg = !$scope.changeHandImg;
        } else {
          $scope.errMsg = '密码校验失败';
          $timeout(function () {
            $scope.errMsg = '';
          }, 2000);
        }
      }

      /**
       *
       */
      $scope.cancelCheck = function () {
        $scope.checkPW = false;
        $scope.checkPW = '';
        angular.element("input[type='checkbox']").removeAttr('checked');
      }

      /*返回*/
      $rootScope.$ionicGoBack = function () {
        /*返回上一页*/
        stateGoHelp.stateGoUtils(false);

      }

      /**
       * 设置签章状态
       */
      function setSignature() {
        var url = serverConfiguration.baseApiUrl + "app/common/v1/signature";
        var param = {
          account: storageService.get(auth_events.userId, null),
          signature: $scope.valuePW === true ? 1 : 0
        };
        MineService.getMineData(url, param).then(function (result) {
          storageService.set(mine.approveSwitchKey, $scope.valuePW);
        }, function (err) {

        });
      }

    }]);

})();
