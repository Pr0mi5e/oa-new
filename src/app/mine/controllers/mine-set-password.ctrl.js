/**
 * Created by developer on 2017/5/27.
 * 登录密码
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.mine');
    app.controller('SetPasswordCtrl', ['$scope','$state','$ionicPopup','$ionicNativeTransitions',
        '$rootScope','T','MineService','serverConfiguration','storageService','auth_events','md5','$timeout',
        'authService','$stateParams','$isMobile','stateGoHelp',
        function($scope,$state,$ionicPopup,$ionicNativeTransitions,$rootScope,T,MineService,serverConfiguration,
                 storageService,auth_events,md5,$timeout,authService,$stateParams,$isMobile,stateGoHelp) {

            var userId = storageService.get(auth_events.userId,null);//用户ID
            $scope.pwType = $stateParams.pwType;
            if($scope.pwType == 'pwType'){
              $rootScope.titleData = '修改签章密码';
              
            }else {
              $rootScope.titleData = '修改登录密码';
              
            }
            $scope.$on('$ionicView.beforeEnter', function (event,data) {
                $scope.pwType = $stateParams.pwType;
                
                $rootScope.hideTabs = true;
                $rootScope.bell = false;
                $rootScope.toBack = true;
                if($scope.pwType == 'pwType'){
                  $rootScope.titleData = '修改签章密码';
                  $scope.PasswordSave = false;
                 
                }else {
                  $rootScope.titleData = '修改登录密码';
                  $scope.PasswordSave = true;
                 
                }
                if(!$isMobile.isPC && $isMobile.Android) {
                    if(data.direction === "back"){
                        var transitionDirection = data.direction !== "back" ? "left" : "right";
                        window.plugins.nativepagetransitions.slide({
                            "direction": transitionDirection
                        });
                    }
                }

            });
  
            /*保存*/
            $scope.clickRightSave = function(){
                var oldPassword = document.getElementById("oldPassword").value;//获取输入的旧密码
                var newPassword = document.getElementById("newPassword").value;//获取输入的新密码
                var againNewPassword = document.getElementById("againNewPassword").value;//获取再次输入的新密码

                /*判断是否输入旧密码*/
                if(oldPassword == undefined || oldPassword.length == 0){
                    var oldPasswordPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-old-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });

                    return;
                }
                if(newPassword == undefined || newPassword.length == 0){
                    var newPasswordPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-new-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });

                    return;
                }
                if(againNewPassword == undefined || againNewPassword.length == 0){
                    var againNewPasswordPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-again-new-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });
                    return;
                }
                if(oldPassword.length <6 ||newPassword.length<6||againNewPassword.length <6){
                    $ionicPopup.alert({
                      title: T.translate("mine.set-login-pw-title-pop"),
                      template: T.translate("mine.set-minlegth-pw"),
                      okText: T.translate("mine.set-login-pw-ok")
                    });
                    return;
                }
                if(newPassword != againNewPassword){
                    var isDifPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-equal-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });

                    return;
                }

                var url = serverConfiguration.baseApiUrl + "app/common/v1/editPassword";
                var param = {
                    account : userId,//用户id
                    flagType:0,//密码方式 0-文字 1-手势
                    opwd:md5.createHash(oldPassword),//旧密码
                    npwd:md5.createHash(newPassword)//新密码
                }
              
                MineService.getMineData(url,param).then(function(result){
                   
                    var changeOkPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: result.msg,
                        okText: T.translate("mine.set-login-pw-ok")
                    });

                    //点击确定按钮后，返回到登陆页面
                    changeOkPop.then(function(){
                        if(result.state == 0){
                            authService.logout();
                        }

                    });
                },function(err){
                    var changeErrPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-err-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });

                    $timeout(function(){
                        changeErrPop.close();
                    },2000);
                });


            }
  
  
            /*完成*/
            $scope.clickRightFinish = function(){
                var oldPassword = document.getElementById("oldPassword").value;//获取输入的旧密码
                var newPassword = document.getElementById("newPassword").value;//获取输入的新密码
                var againNewPassword = document.getElementById("againNewPassword").value;//获取再次输入的新密码
        
                /*判断是否输入旧密码*/
                if(oldPassword == undefined || oldPassword.length == 0){
                    var oldPasswordPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-old-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });
            
                    return;
                }
                if(newPassword == undefined || newPassword.length == 0){
                    var newPasswordPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-qz-new-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });
          
                    return;
                }
                if(againNewPassword == undefined || againNewPassword.length == 0){
                    var againNewPasswordPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-qz-again-new-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });
                    return;
                }
                if(oldPassword.length <6 ||newPassword.length<6||againNewPassword.length <6){
                  $ionicPopup.alert({
                    title: T.translate("mine.set-login-pw-title-pop"),
                    template: T.translate("mine.set-minlegth-pw"),
                    okText: T.translate("mine.set-login-pw-ok")
                  });
                  return;
                }
                if(newPassword != againNewPassword){
                    var isDifPop = $ionicPopup.alert({
                        title: T.translate("mine.set-login-pw-title-pop"),
                        template: T.translate("mine.set-login-pw-equal-pop"),
                        okText: T.translate("mine.set-login-pw-ok")
                    });
            
                  return;
                }
        
                var url = serverConfiguration.baseApiUrl + "app/common/v1/editGesturePassword";
                var param = {
                    account : userId,//用户id
                    flagType:0,//密码方式 0-文字 1-手势
                    opwd:md5.createHash(oldPassword),//旧密码
                    npwd:md5.createHash(newPassword)//新密码
                }
           
                MineService.getMineData(url,param).then(function(result){
              
                    var changeOkPop = $ionicPopup.alert({
                      title: T.translate("mine.set-login-pw-title-pop"),
                      template: result.msg,
                      okText: T.translate("mine.set-login-pw-ok")
                    });
            
                    //点击确定按钮后，返回到签章密码页
                    changeOkPop.then(function(){
                      if(result.state == 0){
                        stateGoHelp.stateGoUtils(true,'tab.signatureWay',{},'left');
                      }
              
                    });
                },function(err){
                    var changeErrPop = $ionicPopup.alert({
                      title: T.translate("mine.set-login-pw-title-pop"),
                      template: T.translate("mine.set-login-pw-err-pop"),
                      okText: T.translate("mine.set-login-pw-ok")
                    });
            
                    $timeout(function(){
                      changeErrPop.close();
                    },2000);
                });
      
      
            }

            /*返回*/
            $rootScope.$ionicGoBack = function(){
                /*返回上一页*/
                stateGoHelp.stateGoUtils(false);
            }


        }]);

})();
