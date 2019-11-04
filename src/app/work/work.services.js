/**
 * Created by CrazyDong on 2017/8/2.
 */
(function() {
    'use strict';

    var app=angular.module('starter.services.work.home',[]);
    app.service('WaitHomeService', ['$q', '$http','$ionicLoading','$timeout','application','timeout',
        function($q, $http,$ionicLoading,$timeout,application,timeout) {

            /*返回工作首页数据*/
            var getWaitWorkListData = function(url,param,isLoading,method){
                if(isLoading){
                    application.showLoading(true);
                    $timeout(function () {
                        application.hideLoading();
                    }, timeout.max);
                }

                var def = $q.defer();
                $http({
                    method  : method?method:'POST',
                    url     : url,
                    params  : param
                }).success(function(result){
                    def.resolve(result);
                    if(isLoading){
                        application.hideLoading();
                    }

                }).error(function(error){
                    def.reject(error);
                    if(isLoading){
                        application.hideLoading();
                    }
                });
                return def.promise;
            }

            return{
                getWaitWorkListData : getWaitWorkListData,
                /*默认数据*/
                getVirtualData:{
                    "list": [
                        {
                            "id": "10000003330043",
                            "name": "财务审批"
                        },
                        {
                            "id": "10000000070035",
                            "name": "人事审批"
                        },
                        {
                            "id": "10000000070037",
                            "name": "采购审批"
                        },
                        {
                            "id": "10000000070034",
                            "name": "其他审批"
                        }
                    ],
                  "alreadyList": [
                      {
                          "id": "10000003330043",
                          "name": "财务审批"
                      },
                      {
                          "id": "10000000070035",
                          "name": "人事审批"
                      },
                      {
                          "id": "10000000070037",
                          "name": "采购审批"
                      },
                      {
                          "id": "10000000070034",
                          "name": "其他审批"
                      }
                  ]
                }
            }

        }]);

})();
