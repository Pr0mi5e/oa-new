/**
 * Created by chris.zheng on 2017/5/16.
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.auth', []);

    app.factory('userModel', function () {
        // Constructor, with class name
        function User(provider, userName, createdAt, id) {
            // Public properties, assigned to the instance ('this')
            this.provider = provider;
            this.userName = userName;
            this.createdAt = createdAt;
            this.id = id;
            // user type is initially null (not determined)
            this.userRole = null;
            this.CurrentPage = null;
        }

        /**
         * Public method, assigned to prototype
         */
        User.prototype.getLoggedInDuration = function () {
            return (new Date()).getTime() - this.createdAt.getTime();
        };

        User.prototype.getUserRole = function () {
            return this.userRole;
        };

        User.prototype.setUserRole = function (value) {
            this.userRole = value;
        };

        User.prototype.getCurrentPage = function () {
            return this.CurrentPage;
        };

        User.prototype.setCurrentPage = function (value) {
            this.CurrentPage = value;
        };

        User.prototype.isAdminUser = function () {
            return this.getUserRole() === 'admin';
        };

        // Static method, assigned to class; instance ('this') is not available in static context
        User.build = function (data) {
            if (!data) {
                return null;
            }

            return new User(
                data.provider,
                data.userName,
                new Date(),
                data.id
            );
        };

        /**
         * Return the constructor function ('class')
         */
        return User;
    });
})();