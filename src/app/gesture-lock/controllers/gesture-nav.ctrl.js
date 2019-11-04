/**
 * Created by chris.zheng on 2017/5/17.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.gestureLock');

    app.controller('gestureNavCtrl', ['$scope', '$state', '$gestureLock', 'authService', '$rootScope', 'auth_events', 'storageService',
        '$stateParams','serverConfiguration','GetRequestService','$isMobile','$cordovaToast','T','DBSingleInstance',
        function ($scope, $state, $gestureLock, authService, $rootScope, auth_events, storageService,$stateParams,serverConfiguration,
                  GetRequestService,$isMobile,$cordovaToast,T,DBSingleInstance) {
            $rootScope.hideTabs = true;
            $rootScope.bell = false;
            $scope.showForgetPW = false;//控制是否显示"忘记密码",默认不显示
            var forgetPwFlag = $stateParams.forgetPW;//登录时传递的参数,判断时候显示"忘记密码"


            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });

            $scope.personInfo = {};//个人信息数据
            $scope.personInfo.name = storageService.get(auth_events.name, null);

            /*判断  从登录中进去显示忘记密码  其他不显示忘记密码*/
            if(forgetPwFlag === "forgetPW"){
                $scope.showForgetPW = true;
            }
            /*忘记密码*/
            $scope.resetPassword = function () {
                var gestureLockCanvas = document.getElementById("gestureLock");
                gestureLockCanvas.width = window.innerWidth < (window.innerHeight - 200) ? window.innerWidth : (window.innerHeight - 200);
                gestureLockCanvas.height = gestureLockCanvas.width;
                var gestureLock = new $gestureLock(gestureLockCanvas, {
                    matrix: 3
                });

                var exitUrl = serverConfiguration.baseApiUrl + "app/common/v1/logout";
                var param = {
                    account : storageService.get(auth_events.userId,null) //用户id
                }

                GetRequestService.getRequestData(exitUrl,param,true,'POST').then(function(result){
                    if(result.state == 0){
                        /**
                         * * 2018/4/9 16:30  CrazyDong
                         *  变更描述：使用单例方式获取
                         *  功能说明：获取同步数据库对象
                         */
                        var db = DBSingleInstance.getSyncDb();
                        /*清空db*/
                        db.transaction(function(tx){
                            tx.executeSql('delete from SyncData',[],function(tx,res){

                            },function (tx,err){

                            })
                        });
                        gestureLock.destructor();//释放手势事件
                        authService.logout();
                    }else{
                        /*判断平台*/
                        if(!$isMobile.isPC){
                            $cordovaToast.showShortBottom(T.translate("mine.logout-error"));
                        }
                    }
                },function(err){
                    /*判断平台*/
                    if(!$isMobile.isPC){
                        $cordovaToast.showShortBottom(T.translate("mine.logout-error"));
                    }
                });

            };

        }]);
})();
