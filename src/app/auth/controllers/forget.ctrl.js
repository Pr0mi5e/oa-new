/**
 * Created by chris.zheng on 2017/5/15.
 */

(function() {
    'use strict';

    var app=angular.module('community.controllers.auth');

    //忘记密码
    app.controller('forgetCtrl', ['$scope', '$ionicPopup', 'T','$isMobile',
        function ($scope, $ionicPopup, T,$isMobile) {
            $scope.phone = T.translate("publicMsg.forgetPasswordPhone");
            $scope.tel = function () {
                // window.location.href = "tel:0419-3690921";
                //2018.3.15 bugfix 255
                //解决方式由当前窗口打开变成新建窗口打开
                //ios系统版本号<=10.1弹出确认框
                if ($isMobile.IOS) {
                    if (device.version.split(".")[0] < 10 ||
                        (device.version.split(".")[0] == 10 && device.version.split(".")[1] <= 1)
                    ) {
                        var Pop = $ionicPopup.confirm({
                            title: "提示",
                            template: "<div>确定拨打{{phone}}？</div>",
                            cancelText: "取消",
                            cancelType: 'button-assertive',
                            okText: "确定",
                            okType: 'button-positive',
                            scope: $scope
                        });
                        Pop.then(function (res) {
                            res ? window.open('tel:' + $scope.phone, '_system', 'location=yes') : null;
                        });
                    } else {
                        window.open('tel:' + $scope.phone, '_system', 'location=yes')
                    }
                } else if($isMobile.Android) {
                    window.open('tel:' + $scope.phone);
                }
            }
        }]);
})();