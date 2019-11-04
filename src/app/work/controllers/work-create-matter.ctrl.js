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

    var app=angular.module('community.controllers.work', []);
    /*新建事项*/
    app.controller('newMatterCtrl', ['$scope','$state','$rootScope','$stateParams','$ionicNativeTransitions','stateGoHelp',
        function($scope,$state,$rootScope,$stateParams,$ionicNativeTransitions,stateGoHelp) {
            //新建事项
            //我保存的模板显示
            $scope.mineItemFlag = true;
            $scope.commonalityFlag = false;

            $scope.goMineItem = function () {
                $scope.mineItemFlag = !$scope.mineItemFlag;
            };

            $scope.goCommonality = function () {
                $scope.commonalityFlag = !$scope.commonalityFlag;
            }

            /*跳转新建协同*/
            $scope.goSynergy=function () {
                stateGoHelp.stateGoUtils(true,'tab.synergy', {},'left');
            }

        }]);
})();
