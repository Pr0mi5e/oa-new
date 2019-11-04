(function () {
  'use strict';
  
  var app = angular.module('community.directive');
    
  app.directive('dateFilter', function () {
      return {
          restrict: 'EA',
          replace: true,
          template :'<span style="display: inline-block;">{{time}}</span>',
          scope:{
            time : '=text'
          },
          controller : function ($scope,$element,DateUtil,$filter) {
            var format = "yyyy-mm-dd";
            var dateNow = new Date();
            var myJsDate=$filter('date')(dateNow,'yyyy-MM-dd');
            var date = new DateUtil(new Date($scope.time)).format(format);
            if(myJsDate == date){
              var formatDif= "hh:ii:ss";
              $scope.time = new DateUtil(new Date($scope.time)).format(formatDif)
            }else {
              $scope.time = date
            }
          }
      };
  })
 
})();
