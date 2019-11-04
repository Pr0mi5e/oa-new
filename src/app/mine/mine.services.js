/**
 * Created by CrazyDong on 2017/8/14.
 */

(function() {
    'use strict';

    var app=angular.module('starter.services.mine',[]);

app.service('MineService', ['$q', '$http','$ionicLoading','$timeout','T','$cordovaToast','timeout','$httpParamSerializer',
    function($q, $http,$ionicLoading,$timeout,T,$cordovaToast,timeout,$httpParamSerializer) {
        var getMineData = function(url,param){
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $timeout(function(){
                $ionicLoading.hide();
//                    $cordovaToast.showShortBottom(T.translate("1110008"));
            },timeout.max);
            var der = $q.defer();

            $http({
                method : 'POST',
                url : url,
                data    : $httpParamSerializer(param), //forms user object
                headers : {'Content-Type': 'application/x-www-form-urlencoded'}
//                data : param,
//                headers : {'Content-Type': 'application/json'}

            }).success(function(data){
                der.resolve(data);
                $ionicLoading.hide();
            }).error(function(error){
                der.reject(error);
                $ionicLoading.hide();
            });

            return der.promise;
        }
        //上传头像
        var uploadAvatar = function(url,param,isLoading){
            if(isLoading){
                application.showLoading(true);
                $timeout(function () {
                    application.hideLoading();
                }, timeout.max);
            }

            var def = $q.defer();
            $http({
                method  : 'POST',
                url     : url,
                data  : param,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function(obj) {
                    var str = [];
                    for (var p in obj) {
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                    return str.join("&");
                }
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
        };

      var getOtherTodoCtl = function(url,param,isLoading){
        var def = $q.defer();
        $http({
          method  : 'GET',
          url     : url,
          params  : param,
          headers : {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(result){
          def.resolve(result);
        }).error(function(error){
          def.reject(error);
        });
        return def.promise;
      }
        return{
            getMineData : getMineData,
            uploadAvatar : uploadAvatar,
          getOtherTodoCtl:getOtherTodoCtl
        }


    }]);

})();
