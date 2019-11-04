/**
 * Created by chris.zheng on 2017/4/12.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers', []);

    //检测用户状态
    app.controller('ApplicationCtrl', ['$scope', '$rootScope', 'auth_events', '$isMobile', '$cordovaToast', 'T', 'public_constant',
        'authService', '$ionicPopup', 'versionUpdate', '$ionicLoading', 'scopeData', 'storageService',
        function ($scope, $rootScope, auth_events, $isMobile, $cordovaToast, T, public_constant, authService, $ionicPopup, versionUpdate,
                  $ionicLoading, scopeData, storageService) {
            $rootScope.tabWork = false;//是否显示"工作"的红点提示
            $rootScope.tabWaitWork = false;//是否显示"待办"的红点提示
            $rootScope.tabIonNotification = false;//是否显示"消息"的红点提示
            $rootScope.tabMine = false;//是否显示"我的"的红点提示
            $rootScope.bellRed = false;//是否显示铃铛的红点提示
            var loginOnceFlag = true;//互斥登录,控制alert只提示一次

            /*未连接网络 application.service.js*/
            $scope.$on(auth_events.notNetConnected, function () {
                /*判断平台*/
                if (!$isMobile.isPC) {
                    $cordovaToast.showShortBottom(T.translate("publicMsg.noNetwork"));
                }
            });

            /*未连接VPN application.service.js*/
            $scope.$on(auth_events.notVpnConnected, function () {
                /*判断平台*/
                if (!$isMobile.isPC) {
                    $cordovaToast.showShortBottom(T.translate("publicMsg.noVPN"));
                }
            });

            /*请求返回状态为400*/
            $scope.$on(public_constant.responseError400, function (event) {
                $ionicPopup.alert({
                    title: T.translate("publicMsg.popTitle"),
                    template: event.targetScope.titleData === "绘制图案解锁" ? "您绘制的手势有误，请重试！" : "用户名或密码错误，请重试"
                });
            });

            /*服务宕机*/
//            $scope.$on(public_constant.serviceErr, function(e,hideFlag) {
//                $ionicLoading.hide();
//                if(hideFlag){
//                    /*判断平台*/
//                    if(!$isMobile.isPC){
//                        $ionicPopup.alert({
//                            title: T.translate("publicMsg.popTitle"),
//                            template: T.translate("publicMsg.service-err")
//                        });
//                    }else{
//                        alert(T.translate("publicMsg.service-err"));
//                    }
//
//                    return;
//                }
//
//            });

            /*互斥状态 即status为511*/
            $scope.$on(public_constant.loginOnce, function () {
                if (!$isMobile.isPC) {
                    if (loginOnceFlag) {
                        loginOnceFlag = false;
                        var exitPop = $ionicPopup.alert({
                            title: T.translate("publicMsg.popTitle"),
                            template: T.translate("publicMsg.loginOnce"),
                            okText: T.translate("publicMsg.sure"),
                            okType: 'button-positive'
                        });
                    }


                } else {
                    alert(T.translate("publicMsg.loginOnce"));
                    versionUpdate.exitLogin(false);

                }

                exitPop.then(function (res) {
                    loginOnceFlag = true;
                    versionUpdate.exitLogin(false);

                });


            });

            /*token出错,返回401*/
            $scope.$on(public_constant.tokenErr, function () {
                if (!$isMobile.isPC) {
                    if (loginOnceFlag) {
                        loginOnceFlag = false;
                        var exitPop = $ionicPopup.alert({
                            title: T.translate("publicMsg.popTitle"),
                            template: T.translate("publicMsg.tokenErr"),
                            okText: T.translate("publicMsg.sure"),
                            okType: 'button-positive'
                        });
                    }


                } else {
                    alert(T.translate("publicMsg.loginOnce"));
                    versionUpdate.exitLogin(false);

                }

                exitPop.then(function (res) {
                    loginOnceFlag = true;
                    versionUpdate.exitLogin(false);

                });


            });


            /*请求返回状态为-1*/
            $scope.$on(auth_events.successSysErr, function (event, msg) {
                $ionicLoading.hide();
                /*判断平台*/
                if (!$isMobile.isPC) {
                    $cordovaToast.showShortBottom(msg);
                } else {
                    alert(msg);
                }
            });

            /**
             * * 2018/7/19 14:23  tyw
             *  在退出表单详情，审批通过之后清空储存的表单数据
             */
            $scope.$on('clearStorageFormData', function (event, msg) {
                scopeData.prototype.setHtmlData(null);
                scopeData.prototype.setPermissionData(null);
                scopeData.prototype.setPermissionData(null);
                storageService.set("viewFormCacheWork", null);//标识符表示不是放大表单页返回
                $rootScope.dataListENew = [];//放大页面存的长表单数据
                storageService.removeItem('backReply');//回复页返回的标志
            });

        }]);
})();
