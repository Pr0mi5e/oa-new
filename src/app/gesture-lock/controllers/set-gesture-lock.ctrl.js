/**
 * Created by chris.zheng on 2017/5/17.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.gestureLock');

    app.controller('setGestureLockCtrl', ['$scope', '$state', '$gestureLock', '$timeout', 'gestureLockService',
        '$window', 'storageService', 'mine', '$ionicNativeTransitions', '$rootScope', 'set_home_page', 'GestureLockService',
        'serverConfiguration', 'auth_events', '$stateParams','stateGoHelp',
        function ($scope, $state, $gestureLock, $timeout, gestureLockService, $window, storageService, mine,
                  $ionicNativeTransitions, $rootScope, set_home_page, GestureLockService, serverConfiguration, auth_events, $stateParams,
                  stateGoHelp) {

            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
            $rootScope.$ionicGoBack = function () {
                gestureLock.destructor();//释放手势事件
                stateGoHelp.stateGoUtils(true,'tab.mine', {},'left');
            }

            $scope.title = "绘制图案设置锁";
            $rootScope.hideTabs = true;
            $rootScope.bell = false;
            $rootScope.toBack = true;
            $rootScope.titleData = $scope.title;

            $scope.pwType = $stateParams.pwType;
            $scope.changePwType = $stateParams.changePwType;
          
            var passwords = [2];
            var count = 1;

            var gestureLockCanvas = document.getElementById("gestureLock");

            function getWidth() {
                if (window.innerWidth < window.innerHeight) {
                    return window.innerWidth;
                } else {
                    return window.innerHeight - 200;
                }
            }

            gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
            gestureLockCanvas.height = gestureLockCanvas.width;
            var gestureLock = new $gestureLock(gestureLockCanvas, {
                matrix: 3
            });
            gestureLock.gestureEnd = function (e) {
                passwords[count % 2] = gestureLock.getGesturePassword();
              console.log(passwords[count % 2].length);

              if (passwords[count % 2].length >= 3){
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
                    var isOne;
                    var isPW;
                    var urlLoginLock = serverConfiguration.baseApiUrl + "app/common/v1/setGesturePassword";
                    if ($scope.pwType == 'pwType') {
                      var param = {
                        account: storageService.get(auth_events.userId, null),//用户id
                        flagType: 1,//密码类型  0-登录 1-签章
                        gesturePwd: gestureLockService.getPassword()//用户手势密码
                      };
                      isOne = gestureLockService.getPassword();
                      storageService.set(mine.isOne, isOne);//签章手势
                    } else {
                      var param = {
                        account: storageService.get(auth_events.userId, null),//用户id
                        flagType: 0,//密码类型  0-登录 1-签章
                        gesturePwd: gestureLockService.getPassword()//用户手势密码
                      };
                      isPW = gestureLockService.getPassword();
                      storageService.set(mine.isPW, isPW);//登录手势
                    }


                    if ($scope.pwType == 'pwType') {
                      if (storageService.get(mine.isPW) == isOne) {
                        $scope.title = "不能和登录手势密码一样";
                      } else {
                        GestureLockService.setGestureLock(urlLoginLock, param).then(function (result) {

                          if (result.state == 0) {
                            $scope.title = "设置成功";
                            gestureLock.viewStatus("success", {ring: true});
                            storageService.set(mine.pwLockKey, "true");//签章手势

                            gestureLock.destructor();  //清理绑定的手势事件
                            storageService.set(mine.signatureSwitchKey, "true");
                            stateGoHelp.stateGoUtils(true,'tab.signatureWay', {},'left');
                          } else {
                            $scope.title = "设置失败";
                            gestureLock.viewStatus("error", {ring: true});
                          }

                        }, function (err) {
                          $scope.title = "设置失败";
                          gestureLock.viewStatus("error", {ring: true});
                        });
                      }
                    } else if ($scope.changePwType == 'changePwType') {
                      var urlChangeLock = serverConfiguration.baseApiUrl + "app/common/v1/editGesturePassword";
                      var param = {
                        account: storageService.get(auth_events.userId, null),//用户id
                        flagType: 1,//密码类型  0-文字 1-手势
                        opwd: '',
                        npwd: gestureLockService.getPassword()//用户手势密码
                      };

                      GestureLockService.changeGestureLock(urlChangeLock, param).then(function (result) {

                        if (result.state == 0) {
                          $scope.title = "修改成功";
                          gestureLock.viewStatus("success", {ring: true});

                          gestureLock.destructor();  //清理绑定的手势事件
                          stateGoHelp.stateGoUtils(true,'tab.signatureWay', {},'left');
                        } else {
                          $scope.title = "修改失败";
                          gestureLock.viewStatus("error", {ring: true});
                        }
                      }, function (err) {
                        $scope.title = "修改失败";
                        gestureLock.viewStatus("error", {ring: true});
                      });
                    } else {
                      GestureLockService.setGestureLock(urlLoginLock, param).then(function (result) {

                        if (result.state == 0) {
                          $scope.title = "设置成功";
                          storageService.set(mine.gestureLockKey, "true");//登录手势
                          gestureLock.viewStatus("success", {ring: true});

                          gestureLock.destructor();  //清理绑定的手势事件
                          /*0.5s后跳转,给用户显示"设置成功"交互*/
                          $timeout(function () {
                            stateGoHelp.stateGoUtils(true,'tab.mine', {},'left');
                          }, 500);

                        } else {
                          $scope.title = "设置失败";
                          gestureLock.viewStatus("error", {ring: true});
                        }
                      }, function (err) {
                        $scope.title = "设置失败";
                        gestureLock.viewStatus("error", {ring: true});
                      });
                    }

                    $timeout(function () {
                      gestureLock.reset();
                    }, 500);
                  } else {
                    $scope.title = "两次设置不一致，请重新设置";
                    gestureLock.viewStatus("error", {ring: true});
                    $timeout(function () {
                      gestureLock.reset();
                    }, 500);
                  }
                }
                ++count;
              } else {
                $scope.title = "图案设置锁至少三位";
                gestureLock.viewStatus("error", {ring: true});
                $timeout(function () {
                  gestureLock.reset();
                }, 500);
              }

            };

            gestureLock.init();

            angular.element($window).bind('resize', function () {
                gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
                gestureLockCanvas.height = gestureLockCanvas.width;
                gestureLock.init();
            });


        }]);
})();
