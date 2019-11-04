
(function() {
  'use strict';
  var app = angular.module ('community.module.viewForm',[]);
  app.factory('scopeData',function () {
    
    function User(data) {
      // Public properties, assigned to the instance ('this')

      this.checkFlag = null;
      this.htmlData = null;//表单HTML
      this.permissionData = null;//表单权限
      // user type is initially null (not determined)
      this.userRole = null;//表单数据
      this.signData = null;//签章数据
      this.stateCurrentViewDataName = null;//当前页面路由数据1用来存储是哪个页面跳到查看表单的
      this.stateCurrentViewParams = null;//当前页面路由数据2用来存储是哪个页面跳到查看表单的
      this.longFormEnlargementData = null;//长表单数据
    }
    User.prototype.getUserRole = function () {
      return this.userRole;
    };
    User.prototype.getHtmlData = function () {
      return this.htmlData;
    };
    User.prototype.getPermissionData = function () {
      return this.permissionData;
    };
    User.prototype.getSignData = function () {
      return this.signData;
    };
    User.prototype.getCheckFlag = function () {
      return this.checkFlag;
    };
    User.prototype.getStateCurrentViewDataName = function () {
      return this.stateCurrentViewDataName;
    };
    User.prototype.getStateCurrentViewParams = function () {
      return this.stateCurrentViewParams;
    };
    User.prototype.getLongFormEnlargementData = function () {
      return this.longFormEnlargementData;
    };
  
  
    User.prototype.setUserRole = function (value) {
      this.userRole = value;
    };
    User.prototype.setHtmlData = function (value) {
      this.htmlData = value;
    };
    User.prototype.setPermissionData = function (value) {
      this.permissionData = value;
    };
    User.prototype.setSignData = function (value) {
      return this.signData = value;
    };
    User.prototype.setCheckFlag = function (value) {
      this.checkFlag = value;
    };
    User.prototype.setStateCurrentViewDataName = function (value) {
      this.stateCurrentViewDataName = value;
    };
    User.prototype.setStateCurrentViewParams = function (value) {
      this.stateCurrentViewParams = value;
    };
    User.prototype.setLongFormEnlargementData = function (value) {
      this.longFormEnlargementData = value;
    };
    User.build = function (data) {
      if (!data) {
        return null;
      }
      return new User (
        data
      );
    };
    return User;
  })

})();
