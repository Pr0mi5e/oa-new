/**
 * Created by developer on 2016/11/8.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function () {
  'use strict';

  var app = angular.module('community.services.auth', []);

  app.service('authService', ['$timeout', '$ionicLoading', '$httpParamSerializer', '$q', '$http',
    '$state', 'application', 'storageService', 'userModel', 'timeout', 'serverConfiguration', 'tempStorageService', 'mine', '$SQLite',
    '$isMobile', '$cordovaToast', 'T', 'public_constant', '$rootScope', 'GetRequestService', 'auth_events', 'APP', '$ionicPopup',
    'set_home_page', 'jdbc',
    function ($timeout, $ionicLoading, $httpParamSerializer, $q, $http,
              $state, application, storageService, userModel, timeout, serverConfiguration, tempStorageService, mine, $SQLite,
              $isMobile, $cordovaToast, T, public_constant, $rootScope, GetRequestService, auth_events, APP, $ionicPopup,
              set_home_page, jdbc) {

      var local_user_info = 'userInfo';
      var local_user_login = 'userLogin';

      var user_pkid = '';//用户主键
      var login_name = '';//登录名
      var is_approvel = false;//有审批权限标记
      var auth_role;//角色
      var auth_post;//职位编码
      var timeOutPop;//请求超时对象

      /*请求返回状态为400时,关闭pop弹窗*/
      $rootScope.$on(public_constant.responseError400, function () {
        application.hideLoading();
        $timeout.cancel(timeOutPop);
      });

      //获取缓存用户信息
      function loadUserCredentials() {
        var token = storageService.getObject(local_user_info, null);
        if (token) {
          useCredentials(token);
        }
      }

      //缓存用户信息
      function storeUserCredentials(user_info) {
        user_pkid = user_info.userPkid;
        storageService.setObject(local_user_info, user_info);
        useCredentials(user_info.type);
      }

      //判断是否有审批权限
      function useCredentials(role) {
        if (angular.isArray(role)) {
          var hasApprovel = false;
          angular.forEach(role, function (item, index) {
            if (angular.lowercase(item) == 'role_approval') {
              hasApprovel = true;
            }
          });
          is_approvel = hasApprovel;
        }
        auth_role = role;
      }

      //销毁令牌
      function destroyUserCredentials() {
        auth_role = undefined;
        login_name = '';
        user_pkid = '';
        /**
         * * 2018/8/23 11:10  CrazyDong
         *  变更描述：
         *  功能说明：临时变量,防止清空的时候,把requestDB的value清掉
         */
        var tempValueRequestDb = storageService.get(set_home_page.requestTimeDbKey, null);
        storageService.clearAll();//清除所有localStorage
        storageService.set(set_home_page.requestTimeDbKey, tempValueRequestDb);
      }

      //登录
      var login = function (name, pw) {
        var der = $q.defer();
        /**
         * * 2018/8/1 14:48  CrazyDong
         *  变更描述：增加字段notificationFlag,用来判断是否需要打开通知状态栏
         *  功能说明：
         */
        if ($isMobile.Android && APP.notificationFlag) {
          /**
           * * 2018/8/1 14:34  CrazyDong
           *  变更描述：
           *  功能说明：通知栏状态
           */
          PermissionsPlugin.addPermissions("isNotificationEnabled", function (result) {
            if (result == "opened") {//通知状态打开
              getTokenUrl(name, pw, der);
            } else if (result == "closed") {//通知状态关闭
              var Pop = $ionicPopup.confirm({
                title: T.translate("publicMsg.popTitle"),
                template: T.translate("publicMsg.notificationAlert"),
                cancelText: T.translate("publicMsg.cancel"),
                cancelType: 'button-assertive',
                okText: T.translate("publicMsg.sure"),
                okType: 'button-positive'
              });

              //popupWindow确定的回调
              Pop.then(function (res) {
                if (res) {
                  //跳转到通知状态栏设置
                  PermissionsPlugin.addPermissions("notificationSet", null, null, null);
                } else {
                  getTokenUrl(name, pw, der);
                }
              });
            }
          }, null, null);
        } else {
          getTokenUrl(name, pw, der);
        }
        return der.promise;
      };

      //获取token的url
      var getTokenUrl = function (name, pw, der) {
        storageService.set(auth_events.loginEnglishName, name);//存入用户名
        /*请求超时提示*/
        timeOutPop = $timeout(function () {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate("publicMsg.timeOutAlert"));
          }
        }, timeout.timeOut);
        /*等待框*/
        application.showLoading(true);
        $timeout(function () {
          application.hideLoading();
        }, timeout.max);
        var param = "username=" + name + "&password=" + pw;
        //将参数转化utf-8编码格式,传给后台,修改移动端汉语名字无法登录问题
        var nameCode = encodeURI(param, "UTF-8");
        $.ajax({
          method: 'POST',
          url: serverConfiguration.SSOUrl + "/cas/v1/tickets?service=http://www.baidu.com",
          data: nameCode, //forms user object
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          responseType: "text",
          success: function (response) {
            console.log(response);
            $timeout.cancel(timeOutPop);
            /*等待框*/
            application.hideLoading();
            // der.resolve();
            // return
            if (response !== '') {
              console.log(response);
              var test = response.split('"');
              var uIData = test[3];
              var parser = new DOMParser();
              var doc = parser.parseFromString(response, "text/html");//三星不执行,返回null
              var uIData = doc.getElementsByTagName('form')[0].action;
              console.log(der);

              der.resolve(uIData);
            } else {
              der.reject('Login Failed.');
            }
          },
          error: function (error) {
            $timeout.cancel(timeOutPop);
            /*等待框*/
            application.hideLoading();
            der.reject(error);
          }
        })
//                 $http({
//                     method: 'POST',
//                     url: serverConfiguration.SSOUrl + "/cas/v1/tickets?service=http://www.baidu.com",
//                     data: nameCode, //forms user object
//                     headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//                     responseType: "text"
//                 }).success(function (data, status, headers, config) {
//                     $timeout.cancel(timeOutPop);
//                     /*等待框*/
//                     application.hideLoading();
//
//                     if (status == 201){
//                         var test = data.split('"');
//                         var uIData = test[3];
// //                            var parser = new DOMParser();
// //                            var doc=parser.parseFromString(data,"text/html");//三星不执行,返回null
// //                            var uIData = doc.getElementsByTagName('form')[0].action;
//                         der.resolve(uIData);
//                     }else{
//                         der.reject('Login Failed.');
//                     }
//
//                 }).error(function (error) {
//                     $timeout.cancel(timeOutPop);
//                     /*等待框*/
//                     application.hideLoading();
//                     der.reject(error);
//                 });

      }


      //登出
      var logout = function () {
        tempStorageService.set(mine.jPushId, storageService.get(mine.jPushId, null));
        destroyUserCredentials();
        //退出后跳转首页
        $state.go('login', {}, {reload: true});
      };

      //获取用户id
      var getUserId = function (name) {
        var der = $q.defer();

        var jPushID = storageService.get(mine.jPushId, null);
        if (jPushID == null || jPushID == "null") {
          jPushID = tempStorageService.get(mine.jPushId, null);
          console.log(jPushID);
          if ($isMobile.Android) {
            /**
             *  2018/9/7 chris.zheng
             *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
             *  功能说明：使用websql创建数据库
             */
            $SQLite.ready(function () { // The DB is created and prepared async.
              return this.selectFirst('SELECT * FROM jPush WHERE id = 1 LIMIT 1')
                .then(
                  function () {
                    if (APP.devMode) {
                      console.log('Empty Result!');
                    }
                    var param = {
                      userCode: name
                    };
                    getNecessaryInfo(param, der);
                  },
                  function () {
                    if (APP.devMode) {
                      console.err('Error!');
                    }
                  },
                  function (data) {
                    // data.item
                    // data.count
                    //storageService.set(mine.jPushId, data.item.pushId);
                    jPushID = data.item.pushId;
                    if (jPushID != null || jPushID !== "null") {
                      var param = {
                        userCode: name,
                        notificationId: jPushID
                      };
                    }

                    getNecessaryInfo(param, der);
                    return data.item;
                  }
                );
            });
          } else {
            jdbc.findAll("jpushData").then(function (response) {
              if (response && response.length > 0) {
                var param = {
                  userCode: name,
                  notificationId: response[0].pushid
                };
                getNecessaryInfo(param, der);
              } else {
                var param = {
                  userCode: name
                };
                getNecessaryInfo(param, der);
              }
            });
          }
        } else {
          var param = {
            userCode: name,
            notificationId: jPushID
          };

          getNecessaryInfo(param, der);
        }

        return der.promise;
      };

      var getNecessaryInfo = function (param, der) {
        var platform = "PC";
        if ($isMobile.Android) {
          platform = "Android";
        } else if ($isMobile.IOS) {
          platform = "IOS";
        }
        param.platform = platform;
        /**
         * * 2018/5/3 16:21  tyw
         *  变更描述：用户版本信息收集，在现有接口的基础上升级，添加参数count
         *  功能说明：用户版本信息收集，从v1借口升级到v2
         */
//                var url = serverConfiguration.baseApiUrl + "app/common/v1/getNecessaryInfo";
        var url = serverConfiguration.baseApiUrl + "app/common/v3/getNecessaryInfo";
        var currentVersionCode = storageService.get('versionCount', 1);
        param.count = parseInt(currentVersionCode);
        var dataParam = $httpParamSerializer(param);
        GetRequestService.getRequestDataJson(url, dataParam, true, 'POST', 'application/x-www-form-urlencoded').then(function (data) {
          console.log(data);
          storageService.set(auth_events.followed, data.followed);//存储跟踪标记 0:关闭 1:打开
          storageService.set(auth_events.roleList, data.roleList);//角色权限列表
          storageService.set(mine.approveSwitchKey, data.signature === "1");// 存储设置签章状态 0:不免密 1：免密
          der.resolve(data);
        }, function (error) {
          der.reject(error);
        });
      };

      var is_Authorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }
        return (is_authenticated && authorizedRoles.indexOf(role) !== -1);
      };
      loadUserCredentials();

      return {
        login: login,
        getUserId: getUserId,
        logout: logout,
        isAuthorized: is_Authorized,
        loadUserLogin: function () {
          var info = storageService.getObject(local_user_login, null);
          return info;
        },
        storeUserLogin: function (name, pw, save, auto) {
          var login = {};
          login.name = name;
          login.pw = pw;
          login.save = save;
          login.auto = auto;
          storageService.setObject(local_user_login, login);
        },
        isApprovel: function () {
          return is_approvel;
        },
        isAuthenticated: function () {
          return is_authenticated;
        },
        loginName: function () {
          return login_name;
        },
        userPkid: function () {
          return user_pkid;
        },
        role: function () {
          return auth_role;
        },
        userPost: function () {
          return auth_post;
        }
      };
    }]);
})();
