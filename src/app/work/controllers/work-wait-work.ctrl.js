/**
 * Created by developer on 2017/5/27.
 * 待办工作
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.work');

    /*待办工作*/
    app.controller('MyWorkWaitWorkCtrl', ['$scope','$state','$rootScope','$stateParams','$ionicNativeTransitions','$isMobile','stateGoHelp',
        function($scope,$state,$rootScope,$stateParams,$ionicNativeTransitions,$isMobile,stateGoHelp) {
        
            $scope.$on('$ionicView.beforeEnter', function (event,data) {
              
              
                if(!$isMobile.isPC && $isMobile.Android) {
                    if(data.direction === "back"){
                      var transitionDirection = data.direction !== "back" ? "left" : "right";
                      window.plugins.nativepagetransitions.slide({
                          "direction": transitionDirection
                      });
                    }
                }
                
            });
          

            
            $scope.rsShow = false;
           

            /*跳转筛选*/
            $scope.goSizer=function () {
                stateGoHelp.stateGoUtils(true,'tab.mineNotification', {},'left');
            }

            /*跳转详情*/
            $scope.goNeed = function (flag) {
                var workWaitData = {
                  title:$scope.title,
                  typeId:$scope.typeId,
                  workFlag:$scope.workFlag,
                  condition:$scope.condition
                };

                stateGoHelp.stateGoUtils(true,'tab.viewFormWork', {
                    type:"work",titleName:$scope.title,imgFlag:flag,workWaitData:angular.toJson(workWaitData)
                    },'left');
            }

            /*跳转搜索*/
            $scope.goSearch = function(){
                stateGoHelp.stateGoUtils(true,'tab.searchWork', {
                    type:"work"
                },'left');
            }
            
            

        }]);

})();
