
(function() {
  'use strict';
  
  var app=angular.module('community.controllers.notification', []);
  
  /*通知*/
  app.controller('NotificationWorkCtrl', ['$scope','$state','$rootScope','$ionicNativeTransitions','$stateParams','scopeData', '$ionicHistory',
    'GetRequestService','$cordovaToast','storageService', 'auth_events','serverConfiguration','$isMobile','$ionicPopup','timeout','stateGoHelp',
      function($scope,$state ,$rootScope,$ionicNativeTransitions,$stateParams,scopeData,$ionicHistory,GetRequestService,$cordovaToast,
               storageService,auth_events,serverConfiguration,$isMobile,$ionicPopup,timeout,stateGoHelp){



          $scope.$on('$ionicView.beforeEnter', function (event,data) {
              $rootScope.titleData = '消息详情';//标题
              $rootScope.toBack = true;//返回按钮显示
              $rootScope.hideTabs = true;//tabs导航栏不显示
              data.enableBack = true;//交叉路由
              $rootScope.bell = false;//小铃铛不显示
              
              
              var currentViewData = $ionicHistory.backView();
              var currentForwardViewData = $ionicHistory.forwardView();
            

              //   待优化1 ：
              if(!(currentViewData == null)) {
            
                  if (currentViewData.stateName == 'tab.view-form' || currentViewData.stateName == 'tab.viewFormWork') {
                      data.direction = 'back';
             
                      if (!$isMobile.isPC && $isMobile.Android) {
                          if (data.direction === "back") {
                              var transitionDirection = "right";
                              window.plugins.nativepagetransitions.slide ({
                                "direction": transitionDirection
                              });
                          }
                      }
                  }
              }

              if(!(currentForwardViewData == null)){
                    
                  if(currentForwardViewData.stateName == 'tab.view-form' || currentForwardViewData.stateName == 'tab.viewFormWork'){
                      data.direction = 'back';
                     
                      if(!$isMobile.isPC && $isMobile.Android) {
                          if(data.direction === "back"){
                              var transitionDirection = "right";
                              window.plugins.nativepagetransitions.slide({
                                  "direction": transitionDirection
                              });
                          }
                      }
                  }
              }
              
              //存了地址以后在查看表单页返回的时候用
              scopeData.prototype.setStateCurrentViewDataName($ionicHistory.currentView().stateName);
              scopeData.prototype.setStateCurrentViewParams($ionicHistory.currentView().stateParams);
              $rootScope.$ionicGoBack = function() {
                
                  if($stateParams.type == 'mine'){
                    stateGoHelp.stateGoUtils(true,'tab.mineNotification', {type:$stateParams.type},'right');
                  }else if($stateParams.information == 'information'){
                    stateGoHelp.stateGoUtils(true,'tab.notification-item', {information:$stateParams.information},'right');
                  }else if($stateParams.type == 'work'){
                    stateGoHelp.stateGoUtils(true,'tab.workNotification', {type:$stateParams.type},'right');
                  } else {
                    stateGoHelp.stateGoUtils(true,'tab.notification', {},'right');
                  }
               
              };
  
              if(!$isMobile.Android){
                  /*解决下方bar有时会显示2-3秒才隐藏的问题*/
                  angular.element(document.querySelectorAll(".tabs-icon-top")).addClass("tabs-item-hide");
              }
    
          });

          $scope.$on('$ionicView.enter', function () {
              angular.element(document.querySelectorAll(".tabs-icon-top")).addClass("tabs-item-hide");
              $rootScope.hideTabs = true;
              $rootScope.toBack = true;
              
          });
          $scope.NotificationItem = angular.fromJson($stateParams.NotificationItem);
          $scope.msgTypeName = $scope.NotificationItem.msgTypeName;
          $scope.makeTime = $scope.NotificationItem.makeTime;
          $scope.msgInfo = $scope.NotificationItem.msgInfo;
          $scope.jumpTypeTrue = true;//查看按钮显示
          var pkid = $scope.NotificationItem.pkid;
          if($scope.NotificationItem.jumpType == '2'){//留出来的type  之前说返回2的时候不能去查看 目前没有这个返回
              $scope.jumpTypeTrue = false;//查看按钮不显示
          }
          var account = storageService.get(auth_events.userId,null);
          $scope.goNotificationDetail = function () {

              var waitWorkPassDate = {
                  taskId: $scope.NotificationItem.taskId,
                  procInstId: $scope.NotificationItem.procInstId
              };
              
              if($scope.NotificationItem.jumpType == '0'){//返回0是只读权限：只能查看比如跟踪已发
                stateGoHelp.stateGoUtils(true,'tab.view-form',{titleName:'已发事项',titleFlag:'0',type:$stateParams.type,notificationDetail:'notificationDetail',
                      notification:'notification',information:$stateParams.information,waitWorkPassDate: angular.toJson(waitWorkPassDate),NotificationItem:angular.toJson($scope.NotificationItem)},'left');
              } else if($scope.NotificationItem.jumpType == '1') {//返回1是有修改权限：比如待办
                stateGoHelp.stateGoUtils(true,'tab.view-form',{titleFlag:$scope.titleFlag,type:$stateParams.type,NotificationItem:angular.toJson($scope.NotificationItem),
                    notification:'notification',information:$stateParams.information,waitWorkPassDate: angular.toJson(waitWorkPassDate)},'left');

              } else if($scope.NotificationItem.jumpType == '5'){//公文
                stateGoHelp.stateGoUtils(true,'tab.view-form',{titleName:'公文查询',titleFlag:'4',type:$stateParams.type,notificationDetail:'notificationDetail',
                  notification:'notification',information:$stateParams.information,waitWorkPassDate: angular.toJson(waitWorkPassDate),NotificationItem:angular.toJson($scope.NotificationItem)},'left');
              }
          }
          $scope.deleteDetail = function () {
              $scope.item = '确认要删除吗？';
              var Pop = $ionicPopup.confirm({
                title : "提示",
                template: "<div><p>{{item}}</p></div>",
                cancelText:"取消",
                cancelType:'button-assertive',
                okText:"确定",
                okType:'button-positive',
                scope: $scope
              });
              Pop.then(function(res){
                if(res){
                  deleteDetail(account,pkid)
                }else {
        
                }
              });
             
          
          }
  
          //删除
          function deleteDetail(account,pkid) {
              var url = serverConfiguration.baseApiUrl + "app/message/v1/msgDel";
        
              var param = {
                  account: account,
                  pkid:pkid
          
              };
        
              //请求数据
              GetRequestService.getRequestData(url, param,true,'POST').then(function (result) {
          
                  if(result.state == '0'){
                      if($stateParams.type == 'work'){
                          $ionicNativeTransitions.stateGo('tab.workNotification', {
                            type:$stateParams.type,
                            dele : 'dele'
          
                          });
                      }else if($stateParams.information == 'information'){
                          $ionicNativeTransitions.stateGo('tab.notification-item', {
                            information:$stateParams.information,
                            dele : 'dele'
          
                          });
                      } else if($stateParams.type == 'mine'){
                          $ionicNativeTransitions.stateGo('tab.mineNotification', {
                            type:$stateParams.type,
                            dele : 'dele'
          
                          });
                      } else {
                          $ionicNativeTransitions.stateGo('tab.notification', {
                            type:$stateParams.type,
                            dele : 'dele'
          
                      });
                  }
                  }else {
              
                      if(!$isMobile.isPC) {
                        $cordovaToast.showShortBottom (T.translate("notification.clean-error"));
                      }
                  }
            
              }, function (error) {
                  if(!$isMobile.isPC) {
                    $cordovaToast.showShortBottom (T.translate ("publicMsg.requestErr"));
                  }
              });
          }
    
  
      }])
    
})();
