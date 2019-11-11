/**
 * @Description: 公用服务
 * 主要包含网络请求模块，基本数据处理模块
 * @author: 闫一夫
 * @date: 2017年06月15日
 * @version: 1.0
 * @change log:
 */

var base = angular.module("base", []);
/**
 * * 2018/4/8 14:00  add by wurina
 *  变更描述：与PC端合并
 *  功能说明：网络请求缓存，缓存队列20个
 */
base.factory('lruCache', ["$cacheFactory", function ($cacheFactory) {
  return $cacheFactory("myLruCache", {capacity: 20});
}])

// /**
//  * 网络请求
//  */
base
    .service("net", ["$http", "$q","lruCache", function ($http, $q,lruCache) {
        var service = {
            get: function (url, useCache) {
                var deferred = $q.defer();
                $http.get(url, {cache: useCache? lruCache : false}).success(function (data, status) {
                    deferred.resolve(data);
                }).error(function (data, status) {
                    deferred.reject(data);
                });
                return deferred.promise;
            },
            postForm: function (url, param) {
                var deferred = $q.defer();
                $http.post(url, param, {
                    transformRequest: $jsonToFormData
                })
                    .success(function (data, status) {
                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            },
            post: function (url, param) {
                var deferred = $q.defer();
                $http.post(url, param)
                    .success(function (data, status) {
                        deferred.resolve(data);
                    })
                    .error(function (data, status) {
                        deferred.reject(data);
                    });
                return deferred.promise;
            }
        };
        return service;
    }])
    .factory("DateUtil", function () {
        Date.prototype.format = function (fmt) { //author: meizz
            var o = {
                "m+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "i+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
            return fmt;
        };

        return Date;
    });
