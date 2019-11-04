(function () {
    'use strict';
    var app = angular.module('community.services.viewForm', []);

    app.service('viewFormService', ['$q', '$http', '$ionicLoading', '$timeout', 'application', 'timeout', '$httpParamSerializer', '$isMobile', 'T', '$cordovaToast', 'scopeData',
        'storageService','auth_events',
        function ($q, $http, $ionicLoading, $timeout, application, timeout, $httpParamSerializer, $isMobile, T, $cordovaToast, scopeData, storageService, auth_events) {

            //获取表单
            var getViewFormData = function (url, param, isLoading,method) {
                if (isLoading) {
                    application.showLoading(true);
                    $timeout(function () {
                        application.hideLoading();
                    }, timeout.max);
                }

                var def = $q.defer();
                // $http({
                //     method: method?method:'POST',
                //     url: url,
                // /**
                //  * * 2018/6/11 14:23  tyw
                //  *  变更描述：参数从data：param变更为params: param
                //  *  功能说明：新增知会12-1，12-2，12-4接口请求方式为GET，而之前共用此方法的请求方式为POST
                //  *  当参数为data时，$http方法不会将参数以键值对的形式拼到url的后面，从而导致新增的三个接口后台拿不到请求数据
                //  *  所以将data变为params，就会把键值对拼到url后面，保证新增接口正常使用
                //  *  相应的，之前共用这个函数的POST请求，也会将参数拼到url后面，但并不影响使用
                //  */
                //     params: param,
                //     headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                //     transformRequest: function (obj) {
                //         var str = [];
                //         for (var p in obj) {
                //             str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                //         }
                //         return str.join("&");
                //     }
                //
                // }).success(function (result) {
                //   def.resolve(result);
                //     if (isLoading) {
                //         application.hideLoading();
                //     }
                //
                // }).error(function (error) {
                //   def.reject(error);
                //     if (isLoading) {
                //         application.hideLoading();
                //     }
                // });
              /**
               * 2019-05-17 15:15
               * Gao
               * 表单详情报错弹窗提示，点击确定返回到列表页
               * 判断依据 result.state 为 -1
               */
              var authorization = storageService.get(auth_events.authorization,null);
              var userId = storageService.get(auth_events.userId, null)
              $.ajax({
                method: method ? method : 'POST',
                url: url,
                data: param, //forms user object
                headers: {'Authorization': authorization,'User_Pkid': userId},
                success: function (result) {
                    def.resolve(typeof result === 'object' ? result : JSON.parse(result));
                      if (isLoading) {
                          application.hideLoading();
                      }
                },
                error: function (error) {
                    def.reject(typeof error === 'object' ? error : JSON.parse(error));
                      if (isLoading) {
                          application.hideLoading();
                      }
                }
              })
                return def.promise;
            };

            //上传数据
            /**
             * * 2018/7/6 14:23  tyw
             *  重构附件上传
             */
            var uploadData = function (url, param, isLoading) {
                if (isLoading) {
                    application.showLoading(true);
                    $timeout(function () {
                        application.hideLoading();
                    }, timeout.max);
                }

                var def = $q.defer();
                $http({
                    method: 'POST',
                    url: url,
                    data: param,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    transformRequest: function (obj) {
                        var str = [];
                        for (var p in obj) {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                        return str.join("&");
                    }

                }).success(function (result) {
                    def.resolve(result);
                    if (isLoading) {
                        application.hideLoading();
                    }

                }).error(function (error) {
                    def.reject(error);
                    if (isLoading) {
                        application.hideLoading();
                    }
                });
                return def.promise;
            };

            /**
             * 表单验证
             * @param $scope
             * @param index 0，表单详情；1、放大表单
             * @returns {boolean}
             */
            var form_check = function common_form_check($scope, index) {
                var result = true;//表单验证结果
                if (!$scope) {
                    return result;
                }
                try {
                    var formContent = angular.element('ion-nav-view[nav-view="active"]').find('ion-view[nav-view="active"] form');

                    $scope.custForm = formContent[0];
                    Object.keys($scope.custForm).forEach(function (key) {
                        if (key.indexOf('jQuery') == 0) {
                            var tempScope = $scope.custForm[key];
                            do {
                                if (tempScope.$formController) {
                                    result = tempScope.$formController.$valid;
                                }
                                tempScope = tempScope.$$nextSibling;
                            } while (tempScope);
                        }
                    });
                } catch (e) {
                    result = false;
                }

                if (!result) {
                    application.hideLoading();
                    if (!$isMobile.isPC) {
                        $cordovaToast.showShortBottom(T.translate("view-form.form-error"));
                    }
                    else {
                        alert(T.translate("view-form.form-error"));
                    }
                }
                $scope.custForm = null;
                return result;
            };
            return {
                getViewFormData: getViewFormData,
                uploadData: uploadData,
                form_check: form_check
            }
        }]);

})();
