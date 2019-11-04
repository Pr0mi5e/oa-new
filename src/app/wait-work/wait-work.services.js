/**
 * Created by CrazyDong on 2017/8/1.
 */
(function() {
    'use strict';

    var app=angular.module('starter.services.wait.work',[]);

    app.service('WaitWorkListService', ['$q', '$http','$ionicLoading','$timeout','application','timeout','$rootScope','T','$isMobile','$cordovaToast',
        function($q, $http,$ionicLoading,$timeout,application,timeout, $rootScope, T, $isMobile, $cordovaToast) {

            /*返回待办列表数据*/
          $rootScope.waitWorkCount = 0;
          var getWaitWorkListData = function(url,param,isLoading){
              if(isLoading){
                  var timeOutPop1 = $timeout(function () {
                      console.log('FROM: ' + url)
                      $rootScope.waitWorkCount--
                      if(!$isMobile.isPC){
                          $cordovaToast.showShortBottom(T.translate("publicMsg.timeOutAlert"));
                      }
                  }, timeout.timeOut);
                    application.showLoading(true);
                $rootScope.waitWorkCount++;
                    $timeout(function () {
                        application.hideLoading();
                    }, timeout.max);
                }

                var def = $q.defer();
                $http({
                    method  : 'POST',
                    url     : url,
                    params  : param
                }).success(function(result){
                  console.log($rootScope.waitWorkCount, isLoading)
                    def.resolve(result);
                    if(isLoading){
                      $rootScope.waitWorkCount--;
                        if($rootScope.waitWorkCount === 0){
                          application.hideLoading();
                        }
                        $timeout.cancel(timeOutPop1);
                    }
                }).error(function(error){
                    def.reject(error);
                    if(isLoading){
                      $rootScope.waitWorkCount--;
                        if($rootScope.waitWorkCount === 0) {
                          application.hideLoading();
                        }
                        $timeout.cancel(timeOutPop1);
                    }
                });
                return def.promise;
            }

            return{
                getWaitWorkListData : getWaitWorkListData
            }

        }]);

})();
