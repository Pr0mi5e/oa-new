/**
 * Created by chris.zheng on 2017/5/17.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.gestureLock');

    app.controller('resetGestureLockCtrl', ['$scope', '$state', '$gestureLock', '$timeout', 'gestureLockService', '$window',
        'storageService','mine','$rootScope','$ionicNativeTransitions','serverConfiguration','auth_events',
        'GestureLockService','timeout','stateGoHelp',
        function ($scope, $state, $gestureLock, $timeout, gestureLockService, $window,storageService,mine,$rootScope,
                  $ionicNativeTransitions,serverConfiguration,auth_events,GestureLockService,timeout,stateGoHelp) {
            $rootScope.hideTabs = true;
            $rootScope.bell = false;
            $rootScope.toBack = true;
            //$rootScope.titleData = '';
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });

            var oldPassword = gestureLockService.getPassword();
            var isValidate = false;
            $scope.title = "绘制图案设置锁";

            var passwords = [2];
            var count = 1;

            var gestureLockCanvas = document.getElementById("gestureLock");
            gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
            gestureLockCanvas.height = gestureLockCanvas.width;
            var gestureLock = new $gestureLock(gestureLockCanvas, {
                matrix: 3
            });

            if (!isValidate) {
                $scope.title = "请输入原密码";
            }

            gestureLock.gestureEnd = function (e) {
                if (!isValidate) {
                    if (gestureLock.validatePassword(oldPassword, gestureLock.getGesturePassword())) {

                        gestureLock.viewStatus("success", {ring: true});
                        $scope.title = "绘制图案设置锁";

                        $timeout(function () {
                            isValidate = true;
                            gestureLock.reset();
                        }, 500);
                    } else {
                        gestureLock.viewStatus("error", {ring: true});
                        $scope.title = "密码输入错误,请重新输入";

                        $timeout(function () {
                            gestureLock.reset();
                        }, 500);
                    }
                } else {

                    passwords[count % 2] = gestureLock.getGesturePassword();

                    if (passwords[count % 2].length >= 3) {
                      // 输入单次了
                      if (count % 2 === 1) {
                        gestureLock.viewStatus("success", {ring: true});
                        $scope.title = "请再输入一次";
                        $timeout(function () {
                          gestureLock.reset();
                        }, 500);
                      } else if (count % 2 === 0) {
                        if (gestureLock.validatePassword(passwords[0], passwords[1])) {
                          gestureLock.viewStatus("success", {ring: true});
                          gestureLockService.setPassword(passwords[0]);
                          var urlLoginLock = serverConfiguration.baseApiUrl + "app/common/v1/setGesturePassword";
                          var param = {
                            account: storageService.get(auth_events.userId, null),//用户id
                            flagType: 0,//密码类型  0-登录 1-签章
                            gesturePwd: gestureLockService.getPassword()//用户手势密码
                          };

                          GestureLockService.setGestureLock(urlLoginLock, param).then(function (result) {

                            if (result.state == 0) {
                              $scope.title = "设置成功";
                              gestureLock.destructor();//释放手势事件
                              /*0.5s后跳转,给用户显示"设置成功"交互*/
                              $timeout(function () {
                                gestureLock.reset();
                                $ionicNativeTransitions.stateGo("tab.mine", {});
                              }, 500);

                            } else {
                              $scope.title = "设置失败";
                              gestureLock.viewStatus("error", {ring: true});
                            }
                          }, function (err) {
                            $scope.title = "设置失败";
                            gestureLock.viewStatus("error", {ring: true});
                          });


                        } else {
                          $scope.title = "两次设置不一致，请重新设置";
                          gestureLock.viewStatus("error", {ring: true});
                          $timeout(function () {
                            gestureLock.reset();
                          }, 500);
                        }
                      }
                      ++count;
                    }else {
                      $scope.title = "图案设置锁至少三位";
                      gestureLock.viewStatus("error", {ring: true});
                      $timeout(function () {
                        gestureLock.reset();
                      }, 500);
                    }
                }
            };

            gestureLock.init();

            angular.element($window).bind('resize', function () {
                gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
                gestureLockCanvas.height = gestureLockCanvas.width;
                gestureLock.init();
            });

            $rootScope.$ionicGoBack = function() {
                gestureLock.destructor();//释放手势事件
                stateGoHelp.stateGoUtils(true,'tab.mine', {},'left');
            }


        }]);
})();
