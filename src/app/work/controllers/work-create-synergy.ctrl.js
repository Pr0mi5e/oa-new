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
    /*新建协同*/
    app.controller('newSynergyCtrl', ['$scope','$state','$rootScope','$stateParams','$ionicNativeTransitions','$ionicActionSheet',
        function($scope,$state,$rootScope,$stateParams,$ionicNativeTransitions,$ionicActionSheet) {
            //控制保存草稿与上传图片 按钮
            $scope.tableFlag = '';
            //按钮分页面控制
            var tableType = 'y';
            //底部轻量与原始按钮的切换
            $scope.toSwitch = function (tableType) {
                
                if(tableType == 'y'){
                    $scope.tableFlag = 'a';
                }else if (tableType == 'q'){
                    $scope.tableFlag = 'b';
                }
            }
            //附件
            $scope.uploadAttachment = function(){
                /*弹出popupWindow选择器*/
                var type = null;
                var  hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: '从相册选择' },
                        { text: '拍照' }
                    ],
                    titleText: '上传附件',
                    cancelText: '取消',
                    cancel: function() {
                    },
                    buttonClicked: function(index) {
                        if(index == 0){//相册
                            type = 0
                        }else if(index == 1){//相机
                            type = 1
                        }
                        if (type !== null) {;
                            hideSheet();
                        }
                        return true;
                    }
                });
            }


        }]);
})();
