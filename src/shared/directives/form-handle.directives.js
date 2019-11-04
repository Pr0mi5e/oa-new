(function () {
  'use strict';
  
  var app = angular.module('community.directive');
  
  app.directive('keyboardshow', function ($rootScope, $ionicPlatform, $timeout, $ionicHistory, $isMobile, $ionicScrollDelegate) {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        var scroll = document.getElementById("message-detail-content");
        var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
        if ($isMobile.IOS) {
          window.addEventListener('native.keyboardshow', function (e) {
            angular.element(element).css({
              'bottom': e.keyboardHeight + 'px'
            });
          });
          
          window.addEventListener('native.keyboardhide', function (e) {
            angular.element(element).css({
              'bottom': ''
            });
          });
        }
      }
    };
  });
})();
