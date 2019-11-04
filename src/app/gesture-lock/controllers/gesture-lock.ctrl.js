/**
 * Created by chris.zheng on 2017/5/17.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.gestureLock', []);

    app.controller('gestureLockCtrl', ['$scope','$rootScope',
        function ($scope, $rootScope) {
        $rootScope.hideTabs = true;
        $rootScope.bell = false;
          
    }]);
})();
