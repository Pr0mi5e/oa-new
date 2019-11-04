/**
 *  2018/5/14 CrazyDong
 *  变更描述：
 *  功能说明：扫码安装,版本更新
 */

(function() {
    'use strict';

    var app=angular.module('community.controllers.mine',[]);
    app.controller('AboutSystemCtrl', ['$scope','$state','$rootScope','T','$isMobile','$stateParams','$ionicPopup',
        'versionUpdate','downloadFileUtil',
        function($scope,$state,$rootScope,T,$isMobile,$stateParams,$ionicPopup,versionUpdate,downloadFileUtil) {

            var systemData = angular.fromJson($stateParams.systemData);
            //TODO 默认为false
            $scope.isShowUpdate = true;//控制是否显示最新版本和更新按钮,
            $scope.aboutIntroduce = ["无"];
            $scope.imgUrl = "app/mine/img/about_system_qr_img.png";
            if(systemData){
                $scope.isShowUpdate = systemData.shouldUpdate;
                $scope.aboutIntroduce =systemData.description.split("\n");
                $scope.newVersionCode =systemData.version;
            }


            $scope.$on('$ionicView.beforeEnter', function (event,data) {
                $rootScope.titleData = '关于系统';
                $rootScope.hideTabs = true;
                $rootScope.bell = false;
                $rootScope.toBack = true;

            });

            //软件更新
            $scope.updateSoftware = function(){
                //TODO 下载图片测试
                var url = "http://192.168.12.36:8090/oa-web/app/attachment/showImage?pkid=15898fa15ade40e6bd289ed864bf6458";

                downloadFileUtil.downloadFile(url,"OAImg","QR.png",true).then(function(result){
                    alert("成功了" + result);
                    $scope.imgUrl = "file://" + result;
                },function(err){
                    alert("失败" + angular.toJson(err));
                });




//                /*判断是否需要更新*/
//                var Pop = $ionicPopup.confirm({
//                    title: "更新提示",
//                    template: '<div ng-repeat="item in aboutIntroduce"><p>{{item}}</p></div>',
//                    cancelText: "取消",
//                    cancelType: 'button-assertive',
//                    okText: "确定",
//                    okType: 'button-positive',
//                    scope: $scope
//                });
//
//                //popupWindow确定的回调
//                Pop.then(function (res) {
//                    if (res) {
//                        versionUpdate.upDateVersion(systemData);//下载Apk
//                    }
//                });

            }

        }]);

})();