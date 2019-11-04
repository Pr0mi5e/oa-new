/**
 * Created by developer on 2016/11/17.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('starter.controllers.addressListCtrl', []);

    //联系人
    app.controller('AddressListCtrl', ['$scope','$state','$rootScope','$ionicNativeTransitions','$stateParams',
        'stateGoHelp',
        function($scope,$state ,$rootScope,$ionicNativeTransitions,$stateParams,stateGoHelp) {
            $scope.checkFlag = false;
            $scope.choiceBox = function ($index) {

                this.checkFlag = !this.checkFlag;
            }
            //部门选择
            var tableType = 'y';

            $scope.toSwitchover = function (tableType) {
                if(tableType == 'headquarters'){
                    $scope.tableFlag = 'headquarters';
                }else if (tableType == 'finance'){
                    $scope.tableFlag = 'finance';
                }else if (tableType == 'administration'){
                    $scope.tableFlag = 'administration';
                }else if(tableType == 'produce'){
                    $scope.tableFlag = 'produce';
                }
            }
            /*跳转通知*/
            $scope.goAddressNotification = function(){
                stateGoHelp.stateGoUtils(true,'tab.addressNotification', {
                    type:"addressList"

                },'right')

            }



        }]);


})();
