(function () {
    'use strict';

    var app = angular.module('community.controllers.formHandle');

    /*签章密码*/
    app.controller('SignaturePasswordCtrl', ['$scope', '$state', '$timeout', '$ionicNativeTransitions', '$rootScope',
        'stateGoHelp',
        function ($scope, $state, $timeout, $ionicNativeTransitions, $rootScope,stateGoHelp) {
            $scope.onePasswordModel = "";//第一位密码Model
            $scope.twoPasswordModel = "";//第二位密码Model
            $scope.threePasswordModel = "";//第三位密码Model
            $scope.fourPasswordModel = "";//第四位密码Model
            $scope.fivePasswordModel = "";//第五位密码Model
            $scope.sixPasswordModel = "";//第六位密码Model
            var intString = "0123456789";//用来判断输入时候为数字

            $scope.$on('$ionicView.beforeEnter', function () {
                /*默认第一位密码获取焦点*/
                $timeout(function () {
                    document.getElementById("onePassword").focus();
                }, 100);
            });

            /*监听第一位密码*/
            $scope.$watch("onePasswordModel", function (newValue, oldValue) {
                if (newValue.length != 0 && intString.indexOf(newValue) >= 0) {
                    document.getElementById("twoPassword").focus();//第二位密码获取焦点
                }
            }, false);

            /*监听第二位密码*/
            $scope.$watch("twoPasswordModel", function (newValue, oldValue) {
                if (newValue.length != 0 && intString.indexOf(newValue) >= 0) {
                    document.getElementById("threePassword").focus();//第二位密码获取焦点
                }
            }, false);

            /*监听第三位密码*/
            $scope.$watch("threePasswordModel", function (newValue, oldValue) {
                if (newValue.length != 0 && intString.indexOf(newValue) >= 0) {
                    document.getElementById("fourPassword").focus();//第二位密码获取焦点
                }
            }, false);

            /*监听第四位密码*/
            $scope.$watch("fourPasswordModel", function (newValue, oldValue) {
                if (newValue.length != 0 && intString.indexOf(newValue) >= 0) {
                    document.getElementById("fivePassword").focus();//第二位密码获取焦点
                }
            }, false);

            /*监听第五位密码*/
            $scope.$watch("fivePasswordModel", function (newValue, oldValue) {
                if (newValue.length != 0 && intString.indexOf(newValue) >= 0) {
                    document.getElementById("sixPassword").focus();//第二位密码获取焦点
                }
            }, false);

            /*监听第六位密码*/
            $scope.$watch("sixPasswordModel", function (newValue, oldValue) {
                if (newValue.length != 0 && intString.indexOf(newValue) >= 0) {
                    var password = $scope.onePasswordModel + $scope.twoPasswordModel + $scope.threePasswordModel +
                        $scope.fourPasswordModel + $scope.fivePasswordModel + $scope.sixPasswordModel;
                    stateGoHelp.stateGoUtils(true,'tab.form-handle', {},'left');

                }
            }, false);


        }]);

})();

