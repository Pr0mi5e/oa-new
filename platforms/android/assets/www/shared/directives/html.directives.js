/**
 * Created by chris.zheng on 2017/6/8.
 */
(function () {
    'use strict';

    var app = angular.module('community.directive', [], function ($compileProvider) {
        // configure new 'compile' directive by passing a directive
        // factory function. The factory function injects the '$compile'
        $compileProvider.directive('compile', ['$compile', function ($compile) {
            //directive factory creates a link function
            return function (scope, element, attrs) {
                scope.$watch(
                    function (scope) {
                        // watch the 'compile' expression for changes
                        return scope.$eval(attrs.compile);
                    },
                    function (value) {
                        // when the 'compile' expression changes
                        // assign it into the current DOM
                        element.html(value);
                        // compile the new DOM and link it to the current
                        // scope.
                        // NOTE: we only compile .childNodes so that
                        // we don't get into infinite loop compiling ourselves
                        $compile(element.contents())(scope);
                    }
                );
            };
        }]);

        $compileProvider.directive('dynamicCompile', ['$compile', function ($compile) {
            return {
                replace: true,
                restrict: 'EA',
                link: function ($scope, elm, iAttrs) {
                    var DUMMY_SCOPE = {
                            $destroy: angular.noop
                        },
                        root = elm,
                        childScope,
                        destroyChildScope = function () {
                            (childScope || DUMMY_SCOPE).$destroy();
                        };

                    iAttrs.$observe("html", function (html) {
                        if (html) {
                            destroyChildScope();
                            childScope = $scope.$new(false);
                            var content = $compile(html)(childScope);
                            root.replaceWith(content);
                            root = content;
                        }

                        $scope.$on("$destroy", destroyChildScope);
                    });
                }
            };
        }]);
        //data指令 将页面的data数据传过来 在查看表单详情页和放大表单页用到了
        $compileProvider.directive('data', ['$rootScope','$compile','scopeData','clone', function ($rootScope,$compile,scopeData,clone) {
            return {
                replace: true,
                restrict: 'EA',
                link: function ($scope, elm, iAttrs) {
                    var DUMMY_SCOPE = {
                          $destroy: angular.noop
                        },
                        root = elm,
                        childScope,
                        destroyChildScope = function () {
                          (childScope || DUMMY_SCOPE).$destroy();
                        };

                    iAttrs.$observe("data", function (data) {
                        if (data) {
                            $rootScope.dataTimeNew = clone.cloneData(angular.fromJson(data));
                            $rootScope.dataTimeNewNow = clone.cloneData(angular.fromJson(data));
                          
                        }

                        $scope.$on("$destroy", destroyChildScope);
                    });
                }
            };
        }]);
    });

    //解决进入二级页面后，隐藏tabs
    app.directive('hideTabs', function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                scope.$on('$ionicView.beforeEnter', function () {
                    scope.$watch(attributes.hideTabs, function (value) {
                        $rootScope.hideTabs = 'tabs-item-hide';
                    });
                });
                scope.$on('$ionicView.beforeLeave', function () {
                    scope.$watch(attributes.hideTabs, function (value) {
                        $rootScope.hideTabs = 'tabs-item-hide';
                    });
                    scope.$watch('$destroy', function () {
                        $rootScope.hideTabs = false;
                    })
                });
            }
        };
    });
})();
