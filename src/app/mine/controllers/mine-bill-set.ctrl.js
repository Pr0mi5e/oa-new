/**
 * Created by developer on 2017/5/27.
 * 单据设置
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.mine');
    app.controller('BillSetCtrl', ['$scope','$state','$rootScope','$ionicNativeTransitions','T','$isMobile','stateGoHelp',
        function($scope,$state,$rootScope,$ionicNativeTransitions,T,$isMobile,stateGoHelp) {
            $scope.summaryBill = T.translate("mine.set-bill-summary");
            $scope.isSelectOriginal = true;//控制选择原始单据
            $scope.isSelectLight = false;//控制选择轻量单据
            var setBill;//存选择的单据数据
            $rootScope.titleData = '单据设置';
            $scope.$on('$ionicView.beforeEnter', function (event,data) {
                $rootScope.titleData = '单据设置';
                $rootScope.hideTabs = true;
                $rootScope.bell = false;
                $rootScope.toBack = true;
           
                /*单据设置,默认为原始数据*/
                if(window.localStorage.getItem('setBill') == null || window.localStorage.getItem('setBill') == "原始数据"){
                    $scope.isSelectOriginal = true;
                }else if(window.localStorage.getItem('setBill') == "轻量单据"){
                    $scope.isSelectOriginal = false;//控制选择原始单据
                    $scope.isSelectLight = true;//控制选择轻量单据
                }
  
                if(!$isMobile.isPC) {
                    if(!$isMobile.isPC && $isMobile.Android){
                        var transitionDirection = data.direction !== "back" ? "left" : "right";
                        window.plugins.nativepagetransitions.slide({
                          "direction": transitionDirection
                        });
                    }
                }
            });


            /*点击原始单据*/
            $scope.isSelectOriginalClick = function(){
                $scope.isSelectOriginal = !$scope.isSelectOriginal;
                $scope.isSelectLight = !$scope.isSelectLight;
            }

            /*点击轻量单据*/
            $scope.isSelectLightClick = function(){
                $scope.isSelectLight = !$scope.isSelectLight;
                $scope.isSelectOriginal = !$scope.isSelectOriginal;
            }

            /*完成设置*/
            $scope.setFinish = function(){
                if($scope.isSelectOriginal){
                    setBill = "原始单据";
                }else if($scope.isSelectLight){
                    setBill = "轻量单据";
                }
                window.localStorage.setItem("setBill" , setBill);
                stateGoHelp.stateGoUtils(true,'tab.mine', {},'left');
            }


        }]);

})();
