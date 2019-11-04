/**
 * Created by chris.zheng on 2017/4/12.
 */
(function () {
  'use strict';

  var app = angular.module('community.controllers.auth');

  //登录
  app.controller('loginCtrl', ['$scope', '$ionicHistory', '$ionicPopup', 'T', '$state','$rootScope','$isMobile',
    '$ionicNativeTransitions','authService','storageService','auth_events','set_home_page', 'md5','mine','$ionicScrollDelegate','$timeout',
    'APP','versionUpdate','GetRequestService','serverConfiguration','stateGoHelp','mobileSocket','DBSingleInstance','$cordovaToast','application',
    function ($scope, $ionicHistory, $ionicPopup, T, $state,$rootScope,$isMobile,$ionicNativeTransitions,authService,
              storageService,auth_events,set_home_page, md5,mine,$ionicScrollDelegate,$timeout,APP,versionUpdate,
              GetRequestService,serverConfiguration,stateGoHelp,mobileSocket,DBSingleInstance, $cordovaToast, application) {
      application.hideLoading(); // 防止其他设备登录时，被踢掉，返回登录页时loading还显示
      $scope.IosTop = false;
      if($isMobile.IOS){
        $scope.IosTop = true;
      }
      if($isMobile.Android){
        $scope.isWhich = true;
      }else if($isMobile.IOS){
        $scope.isWhich = false;
      }
      //适配
      if($isMobile.Android){
        $scope.isWhich = true;
        document.getElementById('isContentHide').style.width='';
      }else if($isMobile.IOS){
        $scope.isWhich = false;
        document.getElementById('isContentHide').style.width='0';
      }

      $scope.needUpdate = true;//更新标记
      $scope.showTop = false;//判断登录页top
      $scope.isShowforgetPw = APP.forgetPwFlag;//判断是否显示忘记密码,辽阳显示,营口不显示
      var viewScroll = $ionicScrollDelegate.$getByHandle('loginScroll');


      //页面加载后,发送广播
      $scope.$on('$ionicView.afterEnter', function () {
          var userLogin=authService.loadUserLogin()
          if(userLogin!=null) {
              /*如果保存账号密码了显示*/
              if (userLogin.save == true) {
                  $scope.data.username = userLogin.name;
                  $scope.data.password = userLogin.pw;
              }
          }

        /*强制更新开始*/
        // 解决ios 12.0 机型，不能自动登录，
        if(userLogin.auto){
          forcedUpdates(0);
        }

        /*强制更新结束*/
      });

      function forcedUpdates(index) {
            if(!$isMobile.isPC){
              if(index === 20){
                alert('插件加载失败，请稍后重试！');
              }
              try{
                /*获取版本信息*/
                  versionUpdate.getVersionInfo(true).then(function(mustUpdateData){
                    updateApp(mustUpdateData,true);
                    },function(){
                    autoLogin();//自动登录
                  }).catch(function(e){
                    alert(JSON.stringify(e) + 'promise error');
                    });
              }
              catch (e) {
                  setTimeout(function () {
                      forcedUpdates(++index);
                  }, 200);
              }
            }else{
                autoLogin();//自动登录
            }

      }

      function updateApp(mustUpdateData,auto) {
        //版本描述为null的时候,给"无"字提示
        if(mustUpdateData.description != null){
          $scope.descriptionArr = mustUpdateData.description.split("\n");
        }else{
          $scope.descriptionArr = "无";
        }
        if(mustUpdateData.mustUpdate){//强制更新
          var Pop = $ionicPopup.alert({
            title : "更新提示",
            template: '<div ng-repeat="item in descriptionArr"><p>{{item}}</p></div>',
            okText:"确定",
            okType:'button-positive',
            scope: $scope
          });
          //popupWindow确定的回调
          Pop.then(function(res){
            if(res){
              versionUpdate.upDateVersion(mustUpdateData);//更新下载
            } else {
              $scope.needUpdate = false;
              if(auto) {
                autoLogin();//自动登录
              }else {
                clickLogin();//登录
              }
            }
          });
        }else if(mustUpdateData.shouldUpdate){
          var Pop = $ionicPopup.confirm({
            title : "更新提示",
            template: '<div ng-repeat="item in descriptionArr"><p>{{item}}</p></div>',
            cancelText:"取消",
            cancelType:'button-assertive',
            okText:"确定",
            okType:'button-positive',
            scope: $scope
          });
          Pop.then(function(res){
            if(res){
              versionUpdate.upDateVersion(mustUpdateData);//更新下载
            }else {
              $scope.needUpdate = false;
              if(auto) {
                autoLogin();//自动登录
              }else {
                clickLogin();//登录
              }
            }
          });
        }else {
          if(auto) {
            autoLogin();//自动登录
          }else {
            clickLogin();//登录
          }
        }
      }
      $scope.data = {username: "", password: ""};
      $scope.data.savePassword = true;
      $scope.data.autoGetToken = true;

      $scope.login = function () {
        if (!$isMobile.isPC && navigator.connection.type === 'none') {
          $cordovaToast.showShortBottom(T.translate("publicMsg.noNetwork"));
          return false
        }
        if($scope.data.username.length > 0 && $scope.data.password.length > 0){
          /*强制更新开始*/
          if(!$isMobile.isPC){
            /*获取版本信息*/
            if($scope.needUpdate){
              versionUpdate.getVersionInfo().then(function(mustUpdateData){
                updateApp(mustUpdateData,false);
              }, function (error) {
                clickLogin();//登录
              });
            } else {
              clickLogin();//登录
            }
          }else{
            clickLogin();//登录
          }
          /*强制更新结束*/
        }else if ($scope.data.username.length == 0) {
          var alertPopup = $ionicPopup.alert({
            title: T.translate("auth.login-err"),
            template: T.translate("auth.login-name-null")
          });
        } else if ($scope.data.password.length == 0) {
          var alertPopup = $ionicPopup.alert({
            title: T.translate("auth.login-err"),
            template: T.translate("auth.password-null")
          });
        }

      };

      /*自动登录的方法*/
      function autoLogin(){
        var userLogin=authService.loadUserLogin()
        if(userLogin!=null){
          /*如果保存账号密码了显示*/
          if(userLogin.save==true){
            $scope.data.username=userLogin.name;
            $scope.data.password=userLogin.pw;
            /*判断是否为自动登录*/
            if(userLogin.auto){
              /*有手势密码*/
              var gestureLockFlag = storageService.get(mine.gestureLockKey,"false");//是否打开密码手势锁
              if(gestureLockFlag == "true"){
                stateGoHelp.stateGoUtils(true,'gesture.signInGestureLock',{username:$scope.data.username,forgetPW:"forgetPW"},'right');
              }else{
                authService.login($scope.data.username, md5.createHash($scope.data.password)).then(function (tokenUrl) {
                  getUserInfo(tokenUrl);
                }, function(err) {
                  var alertPopup = $ionicPopup.alert({
                    title: T.translate("auth.login-err"),
                    template: T.translate("auth.password-or-name-err")
                  });
                });
              }

            }else{
              $scope.data.autoGetToken=false;
            }
          }else{
            $scope.data.savePassword=false;
            $scope.data.autoGetToken=false;
          }
        }
      }

      /*登录的方法*/
      function clickLogin(){
        if(navigator.connection.type === 'none') {
            var alertPopup = $ionicPopup.alert({
                title: T.translate("auth.login-err"),
                template: T.translate("auth.noNetwork")
            });
            return false
        }
        if ($scope.data.username.length > 0 && $scope.data.password.length > 0) {
          authService.login($scope.data.username, md5.createHash($scope.data.password)).then(function (tokenUrl) {
            getUserInfo(tokenUrl);
          }, function (err) {
            var alertPopup = $ionicPopup.alert({
              title: T.translate("auth.login-err"),
              template: T.translate("auth.password-or-name-err")
            });
          });
        } else if ($scope.data.username.length == 0) {
          var alertPopup = $ionicPopup.alert({
            title: T.translate("auth.login-err"),
            template: T.translate("auth.login-name-null")
          });
        } else if ($scope.data.password.length == 0) {
          var alertPopup = $ionicPopup.alert({
            title: T.translate("auth.login-err"),
            template: T.translate("auth.password-null")
          });
        }
      }

      function getUserInfo(tokenUrl){
        var token = "123"

        authService.getUserId($scope.data.username).then(function(userId){
          var name = userId.name;
          storageService.set(auth_events.name,name);
          storageService.set(auth_events.inputName,$scope.data.username);
          storageService.set(auth_events.token,token);
          storageService.set(auth_events.userId,userId.account);
          storageService.set(auth_events.authorization,userId.authorization);//存储authorization
          if(APP.devMode){
            console.log("获取存储Token值" + storageService.get(auth_events.token,null));
            console.log("获取存储userId值" + storageService.get(auth_events.userId,null));
          }
          mobileSocket.connect();

          authService.storeUserLogin($scope.data.username, $scope.data.password, $scope.data.savePassword,
            $scope.data.autoGetToken);
          /*显示设置*/
          var setHomeFlag = storageService.get(set_home_page.setHomeKey,null);
          var goFlag = "tab.work";
          if(setHomeFlag == null || setHomeFlag == set_home_page.work){
            goFlag = "tab.work";
          }else if(setHomeFlag == set_home_page.waitWork){
            goFlag = "tab.waitWork";
          }else if(setHomeFlag == set_home_page.information){
            goFlag = "tab.information";
          }else if(setHomeFlag == set_home_page.mine){
            goFlag = "tab.mine";
          }
          /**
           * * 2018/8/23 10:18  CrazyDong
           *  变更描述：
           *  功能说明： 清空请求的DB
           */
          if (!window.indexedDB && (storageService.get(set_home_page.requestTimeDbKey,null) == null)) {
            /**
             *  2018/9/7 chris.zheng
             *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
             */
            var timeDB = DBSingleInstance.getTimeDb();
            timeDB.transaction(function (tx) {
              tx.executeSql('DELETE FROM TimeData', [], function (tx, res) {
                storageService.set(set_home_page.requestTimeDbKey,"haveRequestDb");
              }, function (tx, err) {

              })
            });
          }

          $state.go(goFlag, {}, {reload: true});
        },function(err){
          alert(tokenUrl)
          $ionicPopup.alert({
            title: T.translate("auth.login-err"),
            template: T.translate("publicMsg.necessary-info-err")
          });
        });

        return





        var param = "username=" + "040011";
        GetRequestService.getRequestDataJson(tokenUrl,param,true,'POST','application/x-www-form-urlencoded').then(function(token){
          authService.getUserId($scope.data.username).then(function(userId){
            var name = userId.name;
            storageService.set(auth_events.name,name);
            storageService.set(auth_events.inputName,$scope.data.username);
            storageService.set(auth_events.token,token);
            storageService.set(auth_events.userId,userId.account);
            storageService.set(auth_events.authorization,userId.authorization);//存储authorization
            if(APP.devMode){
              console.log("获取存储Token值" + storageService.get(auth_events.token,null));
              console.log("获取存储userId值" + storageService.get(auth_events.userId,null));
            }
            mobileSocket.connect();

            authService.storeUserLogin($scope.data.username, $scope.data.password, $scope.data.savePassword,
              $scope.data.autoGetToken);
            /*显示设置*/
            var setHomeFlag = storageService.get(set_home_page.setHomeKey,null);
            var goFlag = "tab.work";
            if(setHomeFlag == null || setHomeFlag == set_home_page.work){
              goFlag = "tab.work";
            }else if(setHomeFlag == set_home_page.waitWork){
              goFlag = "tab.waitWork";
            }else if(setHomeFlag == set_home_page.information){
              goFlag = "tab.information";
            }else if(setHomeFlag == set_home_page.mine){
              goFlag = "tab.mine";
            }
            /**
             * * 2018/8/23 10:18  CrazyDong
             *  变更描述：
             *  功能说明： 清空请求的DB
             */
            if (!window.indexedDB && (storageService.get(set_home_page.requestTimeDbKey,null) == null)) {
              /**
               *  2018/9/7 chris.zheng
               *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
               */
              var timeDB = DBSingleInstance.getTimeDb();
              timeDB.transaction(function (tx) {
                tx.executeSql('DELETE FROM TimeData', [], function (tx, res) {
                  storageService.set(set_home_page.requestTimeDbKey,"haveRequestDb");
                }, function (tx, err) {

                })
              });
            }

            $state.go(goFlag, {}, {reload: true});
          },function(err){
            $ionicPopup.alert({
              title: T.translate("auth.login-err"),
              template: T.translate("publicMsg.necessary-info-err")
            });
          });
        },function(){
          var alertPopup = $ionicPopup.alert({
            title: T.translate("auth.login-err"),
            template: T.translate("auth.password-or-name-err")
          });
        });



      }

      //忘记密码
      $scope.forget = function () {
        stateGoHelp.stateGoUtils(true,'forget', {},'right');
      };

      //是否记住密码
      $scope.savePassword = function () {
        $scope.data.savePassword = !$scope.data.savePassword;
        if ($scope.data.autoGetToken && !$scope.data.savePassword) {
          $scope.data.autoGetToken = false;
        }
      };
      //是否自动登录
      $scope.autoGetToken = function () {
        $scope.data.autoGetToken = !$scope.data.autoGetToken;
        $scope.data.savePassword = true;
      };
      /*清空用户名*/
      $scope.clearName = function(){
        $scope.data.username = "";

      }

      /*清空密码*/
      $scope.clearPW = function(){
        $scope.data.password = "";
      }

      $scope.topChange = function () {
        if($isMobile.Android) {
          $scope.showTop = true;

        }

      };

      window.addEventListener('native.keyboardshow', function (e) {
        if($isMobile.Android){
          $scope.showTop = true;
          $timeout(function () {
            viewScroll.scrollBottom();
          }, 0);
        }

      });
      window.addEventListener('native.keyboardhide', function (e) {
        if($isMobile.Android){
          $scope.showTop = false;
          $timeout(function () {
            viewScroll.scrollBottom();
          }, 0);
        } else if($isMobile.IOS){
          $timeout(function () {
            viewScroll.scrollTop();
          }, 0);

        }
      });


      //回车键监听
      $scope.okKeyup = function(e){
        var keycode = window.event ? e.keyCode : e.white;
        if(keycode == 13){
          if($scope.data.username.length > 0 && $scope.data.password.length > 0){
            /*强制更新开始*/
            if(!$isMobile.isPC){
              /*获取版本信息*/
              if($scope.needUpdate){
                versionUpdate.getVersionInfo().then(function(mustUpdateData){
                  updateApp(mustUpdateData,false);
                }, function (error) {
                  clickLogin();//登录
                });
              } else {
                clickLogin();//登录
              }
            }else{
              clickLogin();//登录
            }
            /*强制更新结束*/
          }else if ($scope.data.username.length == 0) {
            var alertPopup = $ionicPopup.alert({
              title: T.translate("auth.login-err"),
              template: T.translate("auth.login-name-null")
            });
          } else if ($scope.data.password.length == 0) {
            var alertPopup = $ionicPopup.alert({
              title: T.translate("auth.login-err"),
              template: T.translate("auth.password-null")
            });
          }

        }
      }


    }]);
})();
