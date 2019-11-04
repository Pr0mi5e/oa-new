
/**
 * Created by CrazyDong on 2017/8/14.
 */

(function() {
  'use strict';
  
  var app=angular.module('starter.services.notification',[]);
  
  app.service('NotificationService', ['$q', '$http','$ionicLoading','$timeout','T','$cordovaToast','timeout','$httpParamSerializer','application',
    function($q, $http,$ionicLoading,$timeout,T,$cordovaToast,timeout,$httpParamSerializer,application) {
      var getNotificationData = function(url,param,isLoading){
        if(isLoading){
          application.showLoading(true);
          $timeout(function () {
            application.hideLoading();
          }, timeout.max);
        }
        
        var der = $q.defer();
        
        $http({
          method : 'POST',
          url : url,
          data    : $httpParamSerializer(param), //forms user object
          headers : {'Content-Type': 'application/x-www-form-urlencoded'}
          
        }).success(function(data){
          der.resolve(data);
          $ionicLoading.hide();
        }).error(function(error){
          der.reject(error);
          $ionicLoading.hide();
        });
        
        return der.promise;
      }
      
      return{
        getNotificationData : getNotificationData
      }
      
      
    }]);
  
})();
