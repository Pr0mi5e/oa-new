/**
 * Created by developer on 2017/5/27.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.work');
    /*筛选-待办事项*/
    app.controller('MyWorkSizerCtrl', ['$scope','$state','$rootScope','$stateParams','$ionicNativeTransitions','stateGoHelp',
        function($scope,$state,$rootScope,$stateParams,$ionicNativeTransitions,stateGoHelp) {
            var btnArr = ["allBtn","pauseBtn","backBtn","readBtn","unreadBtn"];
            $scope.selectedBtn = "allBtn";
            function checkActiveBtn(activeBtn,btnArr) {
                btnArr.forEach(function (e) {
                    var btnDom = document.getElementById(e)
                    btnDom.style.backgroundColor = (e == activeBtn) ? "#c5f5e9" : "#e5e5e5";
                    btnDom.style.color = (e == activeBtn) ? "#01a65a" : "#999";
                })
            }
            checkActiveBtn($scope.selectedBtn, btnArr);                            
            $scope.selectBtn = function(event){
                var activeBtn = event.target.id;
                if (!activeBtn) return;
                $scope.selectedBtn = activeBtn;
                checkActiveBtn($scope.selectedBtn, btnArr);                
            }
            $rootScope.$ionicGoBack = function(){
                /*返回上一页*/
                stateGoHelp.stateGoUtils(false);
            }
        }]);
})();
