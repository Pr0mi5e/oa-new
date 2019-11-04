/**
 * Created by chris.zheng on 2017/5/17.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.gestureLock');

    app.controller('signInGestureLockCtrl', ['$scope', '$state', '$gestureLock', '$timeout', 'gestureLockService',
        '$window', 'scopeData', '$stateParams', 'viewFormService', '$ionicNativeTransitions', 'serverConfiguration', '$rootScope',
        'authService', '$ionicPopup', 'T', 'storageService', 'auth_events', 'set_home_page', '$cordovaToast', '$isMobile',
        'public_constant','GetRequestService','stateGoHelp','mobileSocket','DBSingleInstance',
        function ($scope, $state, $gestureLock, $timeout, gestureLockService, $window, scopeData, $stateParams, viewFormService,
                  $ionicNativeTransitions, serverConfiguration, $rootScope, authService, $ionicPopup, T, storageService, auth_events,
                  set_home_page, $cordovaToast, $isMobile,public_constant,GetRequestService,stateGoHelp,mobileSocket,DBSingleInstance) {

            $rootScope.hideTabs = true;
            $rootScope.bell = false;
            $rootScope.titleData = '绘制图案解锁';
            var password = '';
            var titleFlag = $stateParams.titleFlag;
            var username = $stateParams.username;//登录时传过来的username
            var webType = $stateParams.webType;//判断是从表单处理页跳转过来
          
            /*请求返回状态为-1*/
            $scope.$on(auth_events.successSysErr, function(event, msg) {
              $scope.title = "手势密码验证失败";
              gestureLock.viewStatus("error", {ring: true});
              $timeout(function () {
                gestureLock.reset();
              }, 500);
            });
          
            /*请求返回状态为400*/
            $scope.$on(public_constant.responseError400, function() {
                $scope.title = "手势密码错误";
                gestureLock.viewStatus("error", {ring: true});
                $timeout(function () {
                    gestureLock.reset();
                }, 500);
            });

            //表单处理页面带过来的数据start
          
            if (webType == "formHandle") {
                var paramData = angular.fromJson($stateParams.paramData);
                var account = paramData.account;
                var taskId = paramData.taskId;
                var procInstId = paramData.procInstId;
                var actionName = paramData.actionName;
                var opinion = paramData.opinion;
            /**
            * * 2018/7/19 14:23  tyw
            *  修改表单数据获取的方式，从路由传参变为module里取值
            */
                var data = scopeData.prototype.getSignData();
                // var data = paramData.data;
                // data = eval("("+data+")");
                var sign = data.sign;//带过来的sign数组bmzg
                data = data.data;//带古来的data数据
                var newData = {};
                
                var signList ;//拆分数组得出单个字段的数组
                $scope.signatureId = '';
              
                var attachmentPkids = paramData.attachmentPkids;
                
                if (!attachmentPkids) {
                    attachmentPkids = '';
                }
                var follow = paramData.follow;
                if (!follow) {
                    follow = '0';
                }
                $rootScope.toBack = true;
                $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                    viewData.enableBack = true;
                });
            } else {
                $rootScope.toBack = false;
            }
            //表单处理页面带过来的数据end
            var flagType = $stateParams.flagType;//密码标识 测试中所以写死了 -1时候后台不验证

            //$scope.title = "绘制图案解锁";

            var passwordData = gestureLockService.getPassword();

            var gestureLockCanvas = document.getElementById("gestureLock");
            gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
            gestureLockCanvas.height = gestureLockCanvas.width;

            var gestureLock = new $gestureLock(gestureLockCanvas, {
                matrix: 3
            });

            gestureLock.gestureStart = function (e) {
                return;
            };

            gestureLock.gestureEnd = function (e) {
                password = gestureLock.getGesturePassword();

                if (webType == 'formHandle') {//从处理表单页面过来的
                    
                    signatureGestureData(account,password,true);
                } else {
                    /*登录手势验证*/
                    loginLockAuth(password);
                }
            };
            //同意或不同意  表单审批的请求
            function approveData(account, taskId, procInstId, actionName, opinion, data, attachmentPkids, flagType, password, follow, isLoading) {
                var url = serverConfiguration.baseApiUrl + "app/approve/v1/approve";
                var strPassword = password.join(',');
                var param = {
                    account: account,
                    taskId: taskId,
                    procInstId: procInstId,
                    actionName: actionName,
                    opinion: opinion,
                    data: data,
                    attachmentPkids: attachmentPkids,
                    flagType: flagType,
                    password: strPassword,
                    follow: follow,
                    isLoading: isLoading
                };

                /**
                 * * 2018/4/9 13:47  CrazyDong
                 *  变更描述：修改请求方法,统一使用utils里面的网络请求方法
                 *  功能说明：请求数据
                 */
                GetRequestService.getRequestDataJson(url, param, isLoading,'POST','application/json').then(function (result) {
                    $scope.state = result.state;
                    if ($scope.state == '0') {
                        $scope.title = "手势密码验证成功";
                        if (!$isMobile.isPC) {
                            $cordovaToast.showShortBottom(T.translate('form-handle.handle-success'));
                        }
                        gestureLock.viewStatus("success", {ring: true});
                        gestureLock.destructor();
                        $scope.workWaitData = $stateParams.workWaitData;
                        /**
                        * * 2018/7/19 14:23  tyw
                        *  在退出表单详情，审批通过之后清空储存的表单数据
                        */
                        $scope.$emit('clearStorageFormData');        
                        storageService.set('needRemberPosition',true)                        
                        stateGoHelp.stateGoUtils(true,'tab.waitWork',{titleFlag:titleFlag,workWaitData:$scope.workWaitData},'left');
                    }
                }, function (error) {
                    if(!$isMobile.isPC){
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            /*登录手势密码验证*/
            function loginLockAuth(password) {
                authService.login(username, password).then(function (tokenUrl) {
                    getUserInfo(tokenUrl);
                }, function (err) {
                    $scope.title = "手势密码错误";
                    gestureLock.viewStatus("error", {ring: true});
                    $timeout(function () {
                        gestureLock.reset();
                    }, 500);
                });
            }

            function getUserInfo(tokenUrl){
                var param = "username=" + "040011";
              authService.getUserId(username).then(function(userId){
                // storageService.set(auth_events.token, token);
                storageService.set(auth_events.userId, userId.account);
                storageService.set(auth_events.authorization,userId.authorization);//存储authorization
                mobileSocket.connect();
                /*显示设置*/
                var setHomeFlag = storageService.get(set_home_page.setHomeKey, null);
                var goFlag = "tab.work";
                if (setHomeFlag == null || setHomeFlag == set_home_page.work) {
                  goFlag = "tab.work";
                } else if (setHomeFlag == set_home_page.waitWork) {
                  goFlag = "tab.waitWork";
                } else if (setHomeFlag == set_home_page.information) {
                  goFlag = "tab.information";
                } else if (setHomeFlag == set_home_page.mine) {
                  goFlag = "tab.mine";
                }
                $scope.title = "通过手势密码验证";
                gestureLock.viewStatus("success", {ring: true});
                gestureLock.destructor();
                $rootScope.hideTabs = false;

                /**
                 * * 2018/8/23 10:18  CrazyDong
                 *  变更描述：
                 *  功能说明： 清空请求的DB
                 */
                if (storageService.get(set_home_page.requestTimeDbKey,null) == null) {

                  var timeDB = DBSingleInstance.getTimeDb();
                  timeDB.transaction(function (tx) {
                    tx.executeSql('DELETE FROM TimeData', [], function (tx, res) {
                      storageService.set(set_home_page.requestTimeDbKey,"haveRequestDb");
                    }, function (tx, err) {

                    })
                  });
                }

                $state.go(goFlag, {}, {reload: true});
              },function(err){
                $scope.title = "获取必要信息接口失败";
                gestureLock.viewStatus("error", {ring: true});
                $timeout(function () {
                  gestureLock.reset();
                }, 500);
              });
                // GetRequestService.getRequestDataJson(tokenUrl,param,true,'POST','application/x-www-form-urlencoded').then(function(token){
                //   debugger
                //     authService.getUserId(username).then(function(userId){
                //       debugger
                //         storageService.set(auth_events.token, token);
                //         storageService.set(auth_events.userId, userId.account);
                //         storageService.set(auth_events.authorization,userId.authorization);//存储authorization
                //         mobileSocket.connect();
                //         /*显示设置*/
                //         var setHomeFlag = storageService.get(set_home_page.setHomeKey, null);
                //         var goFlag = "tab.work";
                //         if (setHomeFlag == null || setHomeFlag == set_home_page.work) {
                //             goFlag = "tab.work";
                //         } else if (setHomeFlag == set_home_page.waitWork) {
                //             goFlag = "tab.waitWork";
                //         } else if (setHomeFlag == set_home_page.information) {
                //             goFlag = "tab.information";
                //         } else if (setHomeFlag == set_home_page.mine) {
                //             goFlag = "tab.mine";
                //         }
                //         $scope.title = "通过手势密码验证";
                //         gestureLock.viewStatus("success", {ring: true});
                //         gestureLock.destructor();
                //         $rootScope.hideTabs = false;
                //
                //         /**
                //          * * 2018/8/23 10:18  CrazyDong
                //          *  变更描述：
                //          *  功能说明： 清空请求的DB
                //          */
                //         if (storageService.get(set_home_page.requestTimeDbKey,null) == null) {
                //
                //             var timeDB = DBSingleInstance.getTimeDb();
                //             timeDB.transaction(function (tx) {
                //                 tx.executeSql('DELETE FROM TimeData', [], function (tx, res) {
                //                     storageService.set(set_home_page.requestTimeDbKey,"haveRequestDb");
                //                 }, function (tx, err) {
                //
                //                 })
                //             });
                //         }
                //
                //         $state.go(goFlag, {}, {reload: true});
                //     },function(err){
                //         $scope.title = "获取必要信息接口失败";
                //         gestureLock.viewStatus("error", {ring: true});
                //         $timeout(function () {
                //             gestureLock.reset();
                //         }, 500);
                //     });
                // },function(){
                //   debugger
                //     $scope.title = "手势密码错误";
                //     gestureLock.viewStatus("error", {ring: true});
                //     $timeout(function () {
                //         gestureLock.reset();
                //     }, 500);
                // });



            }
  
            //审批手势密码验证的请求
            function signatureGestureData(account,signatureGesturePwd,isLoading) {
                var url = serverConfiguration.baseApiUrl + "app/common/v1/signatureGesture";
                var param = {
                    account: account,
                    signatureGesturePwd:signatureGesturePwd.join(',')
                };
        
                //请求数据
                viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
                    $scope.signatureId = result.signatureId;
  
                    
                    for(var i = 0;i<sign.length;i++){//遍历带过来的数组
  
                        signList = sign[i].split(".");//拆分数组得出单个字段
                        for(var j = 1;j<signList.length;j++){//遍历拆分后返回的数组 得到每个字段
      
                            //判断是否含有该属性
                            if(data.hasOwnProperty(signList[j]) == true || data.hasOwnProperty(signList[j]) == 'true' ){
                              newData = data[signList[j]];
          
                            }else {
                              newData[signList[j]] = $scope.signatureId;
          
                            }
      
                        }
  
                    }
                  
                    newData = JSON.stringify(data);
                   
                    $scope.state = result.state;
                    if ($scope.state == '0') {
                        $scope.title = "手势密码验证成功";
                        if (!$isMobile.isPC) {
                          $cordovaToast.showShortBottom(T.translate('form-handle.handle-success'));
                        }
                        gestureLock.viewStatus("success", {ring: true});
                        gestureLock.destructor();
                        approveData(account, taskId, procInstId, actionName, opinion, newData, attachmentPkids, 0, password, follow, true);
                    }else {
                        $scope.title = "手势密码错误，请重试！";
                        gestureLock.reset();
                    }
                }, function (error) {
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }
    
  
            gestureLock.init();

            angular.element($window).bind('resize', function () {
                gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
                gestureLockCanvas.height = gestureLockCanvas.width;
                gestureLock.init();
            });

        }]);
})();
