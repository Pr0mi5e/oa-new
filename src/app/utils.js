/**
 * Created by CrazyDong on 2017/6/12.
 * 通用工具类
 */
(function () {
    'use strict';

    var app = angular.module('community.services.utils',[]);

    /**
     * 判断运行平台
     */
    app.factory("$isMobile", ['$window', function ($window) {
        return {
            Android: navigator.userAgent.match(/Android/i) && $window.cordova,
            BlackBerry: navigator.userAgent.match(/BlackBerry/i) && $window.cordova,
            IOS: navigator.userAgent.match(/iPhone|iPad|iPod/i) && $window.cordova,
            Opera: navigator.userAgent.match(/Opera Mini/i) && $window.cordova,
            Windows: navigator.userAgent.match(/IEMobile/i) && $window.cordova,
            isPC: !(navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i) && $window.cordova)
        };
    }]);

    /**
     * 多语言服务
     */
    app.factory('T', ['$translate', function ($translate) {
        var T = {
            translate: function (key) {
                if (key) {
                    return $translate.instant(key);
                }
                return key;
            }
        };
        return T;
    }]);

    /**
     * Local Storage的存储
     */
    app.factory('storageService', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || null);
            },
            /*清空localStorage*/
            clearAll: function () {
                $window.localStorage.clear();
            },
            /*删除localStorage某个键值对*/
            removeItem: function (key) {
                $window.localStorage.removeItem(key);
            }
        };
    });

    /**
     * Session Storage的存储
     */
    app.factory('tempStorageService', function ($window) {
        return {
            set: function (key, value) {
                $window.sessionStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.sessionStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.sessionStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.sessionStorage[key] || null);
            },
            /*清空session Storage*/
            clearAll: function () {
                $window.sessionStorage.clear();
            },
            /*删除localStorage某个键值对*/
            removeItem: function (key) {
                $window.sessionStorage.removeItem(key);
            }
        };
    });

    /**
     * 相册调用服务
     */
    app.factory('Camera', ['$q', function ($q) {
        return {
            getPicture: function (options) {
                var q = $q.defer();
                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);
                return q.promise;
            }
        }
    }]);

    /**
     * 网络请求服务
     */
    app.factory('GetRequestService', ['$q', '$http', '$ionicLoading',
        '$timeout', 'application', 'timeout','$ionicPopup','T', '$cordovaToast',
        '$isMobile','public_constant','$rootScope',
        function ($q, $http, $ionicLoading, $timeout, application, timeout,
                  $ionicPopup,T,$cordovaToast,$isMobile,public_constant,$rootScope) {
            var timeOutPop;//请求超时对象

            $rootScope.$on(public_constant.loginOnce, function() {
                application.hideLoading();
                $timeout.cancel(timeOutPop);
            });

            /**
             * url : 请求地址
             * param : 请求参数
             * isLoading : boolean类型,控制是否显示loading图标
             * method : 对应请求的方法  GET\POST
             */
            $rootScope.utilsCount = 0
            var getRequestData = function (url, param, isLoading, method, defaultTimeOut, defaultMax) {
              if (isLoading) {
                    /*请求超时提示*/
                    var timeOutPop1 = $timeout(function () {
                      console.log('FROM: ' + url)
                        $rootScope.utilsCount--
                        if(!$isMobile.isPC){
                            $cordovaToast.showShortBottom(T.translate("publicMsg.timeOutAlert"));
                        }
                    }, defaultTimeOut || timeout.timeOut);
                $rootScope.utilsCount++;
                    application.showLoading(true);
                    $timeout(function () {
                        application.hideLoading();
                    }, defaultMax || timeout.max);
                }

                var def = $q.defer();
                $http({
                    method: method,
                    url: url,
                    params: param
                }).success(function (result) {
                  def.resolve(result);
                    if (isLoading) {
                      $rootScope.utilsCount--;
                      if($rootScope.utilsCount === 0) {
                          application.hideLoading();
                        }
                        $timeout.cancel(timeOutPop1);
                    }
                }).error(function (error) {
                    def.reject(error);
                    if (isLoading) {
                      $rootScope.utilsCount--;
                        if($rootScope.utilsCount === 0) {
                          application.hideLoading();
                        }
                        $timeout.cancel(timeOutPop1);
                    }
                })
                return def.promise;
            };

            /*
             含有headers的请求方法
             * type:Content-Type的格式
             * */
            var getRequestDataJson = function (url, param, isLoading, method, type) {
                if (isLoading) {
                    /*请求超时提示*/
                    timeOutPop = $timeout(function () {
                      console.log('FROM: ' + url)
                        if(!$isMobile.isPC){
                            $cordovaToast.showShortBottom(T.translate("publicMsg.timeOutAlert"));
                        }
                    }, timeout.timeOut);
                    application.showLoading(true);
                    $timeout(function () {
                        application.hideLoading();
                    }, timeout.max);
                }
                var def = $q.defer();
                $http({
                    method: method,
                    url: url,
                    data: param, //forms user object
                    headers: {'Content-Type': type}
                }).success(function (result) {
                    def.resolve(result);
                    if (isLoading) {

                        application.hideLoading();
                        $timeout.cancel(timeOutPop);
                    }
                }).error(function (error) {
                    def.reject(error);
                    if (isLoading) {
                        application.hideLoading();
                        $timeout.cancel(timeOutPop);
                    }
                });
                return def.promise;
            };

            return {
                getRequestData: getRequestData,
                getRequestDataJson : getRequestDataJson
            }
        }]);

    /**
     * SQL工具类
     */
    app.factory('SQLiteHelper', ['$SQLite','jdbc','$isMobile', function ($SQLite,jdbc,$isMobile) {
        var clientID = 1;
        return {
            setPushId: function (pushid) {
                if ($isMobile.Android) {
                    $SQLite.ready(function () { // The DB is created and prepared async.
                        this.selectFirst('SELECT * FROM jPush WHERE id = ? LIMIT 1', [clientID])
                            .then(
                                function () {
                                    console.log('Empty Result!');
                                    $SQLite.insert('jPush', {pushId: pushid});
                                },
                                function () {
                                    console.err('Error!');
                                },
                                function (data) {
                                    if (data.count > 0) {
                                        $SQLite.execute('UPDATE jPush SET pushId = ? WHERE id = ?', [pushid, 1])
                                    }
                                }
                            );
                    });
                }else {
                    var _jpushData = {};
                    _jpushData.id=1;
                    _jpushData.pushid=pushid;
                    jdbc.put("jpushData", _jpushData);
                }
            },
            setSearch: function (searchValue) {
                if ($isMobile.Android) {
                    $SQLite.ready(function () { // The DB is created and prepared async.
                        $SQLite.execute('delete from searchValue', null);
                        $SQLite.insert('searchValue', {SyncData: searchValue});
                    });
                }else {
                    jdbc.findAll("searchValue").then(function(response) {
                        if (response) {
                            jdbc.remove("searchValue", response.syncData);
                        }
                    });
                    jdbc.put("searchValue", searchValue);
                }
            }
        }
    }]);

    /**
     * 版本控制服务
     */
    app.factory('versionUpdate', ['serverConfiguration', '$isMobile', 'GetRequestService', 'APP', '$cordovaToast',
        '$ionicLoading', '$q', 'T', 'storageService', 'auth_events', 'authService', '$timeout', '$ionicPopup', 'DBSingleInstance', 'mobileSocket', "jdbc",
        '$cordovaFileOpener2',
        function (serverConfiguration, $isMobile, GetRequestService, APP, $cordovaToast, $ionicLoading, $q, T,
            storageService, auth_events, authService, $timeout, $ionicPopup, DBSingleInstance, mobileSocket, jdbc,$cordovaFileOpener2) {

            var oldVersionCode;//当前versionCode
            var newVersionCode;//后台请求，新的versionCode
            var updateUrlPkid;//更新App的url的pkid
            var appFileName;//apk名字
            var requestExitFlag = true;//控制退出不重复发起请求,默认可以请求退出接口
            var der = $q.defer();
            /**
             * * 2018/5/3 16:21  tyw
             *  变更描述：用户版本信息收集，在现有接口的基础上升级，添加参数count
             *  功能说明：用户版本信息收集，从v1借口升级到v2
             */
            var count = null;//当前版本号
            var userInputName = null; //用户名

            /*获取版本信息*/
            var getVersionInfo = function getVersionInfo(timeOutFlag) {
                if ($isMobile.Android) {
                    //添加权限
                    var perArr = ["android.permission.WRITE_EXTERNAL_STORAGE"];
                    PermissionsPlugin.addPermissions("权限", function () { }, function () { }, perArr);
                }

                var loadingAndTime = true;//是否显示超时提示和  loading图标 :默认为显示
                // if (typeof (timeOutFlag) !== "undefined") {
                //     loadingAndTime = false;
                // }
                var der = $q.defer();
                var versionUrl = serverConfiguration.baseApiUrl + "app/version/v1/get";
                // var versionUrl = serverConfiguration.baseApiUrl + "app/version/v2/get";

                var platform = "Android";//默认android
                if ($isMobile.Android) {
                    platform = "Android"
                } else if ($isMobile.IOS) {
                    platform = "IOS"
                }
                var getRequestData = function (count) {
                    var param = {
                        platform: platform, //应用类型，包括：Android、IOS,
                        count: count,
                        username: userInputName
                    };
                    GetRequestService.getRequestData(versionUrl, param, loadingAndTime, 'GET', 10500, 10000).then(function (versionResult) {
                        if (APP.devMode) {
                            console.log("版本信息", versionResult);
                        }
                        if (versionResult.state == 0) {
                            if (typeof (versionResult.versionCount) === "undefined") {
                                der.reject();
                                return;
                            }
                            newVersionCode = versionResult.versionCount;//后台请求，新的versionCode
                            updateUrlPkid = versionResult.pkid;//更新App的url的pkid
                            appFileName = versionResult.fileName;//apk名字,带.apk后缀

                            if (!$isMobile.isPC) {
                                window.cordova.getAppVersion.getVersionCode(function (currentVersionCode) {
                                    oldVersionCode = parseInt(currentVersionCode);
                                    /*判断是否需要更新*/
                                    if (newVersionCode > oldVersionCode) {
                                        versionResult.shouldUpdate = true;
                                        versionResult.mustUpdate = false;
                                        if (versionResult.flagStatus == 1) {
                                            versionResult.mustUpdate = true;
                                            //der.resolve("mustUpdate");
                                        }
                                    }
                                    else {
                                        versionResult.shouldUpdate = false;
                                    }
                                    der.resolve(versionResult);
                                });
                            }
                        } else {
                            der.reject(versionResult);
                        }
                    }, function (err) {
                        /*判断平台*/
                        if (!$isMobile.isPC) {
                            $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                        der.reject(err);
                    });
                }
                userInputName = storageService.get(auth_events.inputName, null)
                if (!$isMobile.isPC) {
                    window.cordova.getAppVersion.getVersionCode(function (count) {
                        storageService.set("versionCount",count)
                        getRequestData(parseInt(count));
                    });
                }
                return der.promise;
            };

            /*更新的方法*/
            var upDateVersion = function upDateVersion(mustUpdateData) {
                if ($isMobile.Android) {
                    var upDateUrl = serverConfiguration.baseApiUrl + "app/attachment/getApk?pkid=" + updateUrlPkid;
                    var targetPath = "/sdcard/Download/" + appFileName;//手机下载路径,默认为android路径Download文件夹里面
                    var uri = encodeURI(upDateUrl);
                    var fileTransfer = new FileTransfer();

                    /*进度*/
                    fileTransfer.onprogress = function (progressEvent) {
                        //进度
                        var downloadProgress = (progressEvent.loaded / progressEvent.total) * 100;
                        $ionicLoading.show({
                            template: "已经下载：" + Math.floor(downloadProgress) + "%"
                        });
                        if (downloadProgress > 99) {
                            $ionicLoading.hide();
                        }
                    };
                    /*下载*/
                    fileTransfer.download(uri, targetPath, function (entry) {
                            /**
                             * * 2018/8/29 15:58  CrazyDong
                             *  变更描述：修改7.0以上无法打开Apk的问题
                             *  功能说明：打开Apk
                             */
                            var openApkFlag = false;//当手机无法自动打开所下载的apk时候,给予提示的标识
//                            /*打开APK*/
//                            window.install.install(targetPath, function () {
//                                openApkFlag = true;
//                            });

                            $cordovaFileOpener2.open(targetPath,'application/vnd.android.package-archive').then(function(){
                                openApkFlag = true;
                            },function(err){
                                openApkFlag = true;
                                $ionicPopup.alert({
                                    title: T.translate("publicMsg.popTitle"),
                                    template: T.translate("publicMsg.openApkAlert"),
                                    okText: T.translate("publicMsg.sure")
                                });
                            });

                            //1.5秒后,若无法自动打开apk,给予提示
                            $timeout(function () {
                                if(!openApkFlag){
                                    $ionicPopup.alert({
                                        title: T.translate("publicMsg.popTitle"),
                                        template: T.translate("publicMsg.openApkAlert"),
                                        okText: T.translate("publicMsg.sure")
                                    });
                                }
                            },1500);


                        }, function (err) {
                            $cordovaToast.showShortBottom(T.translate("publicMsg.upDateErr"));
                        },
                        false, {
                            headers: {
                                "Authorization": "BasicdGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                            }
                        });
                } else if ($isMobile.IOS) {
                    cordova.exec(null, null, "InAppBrowser",
                        "open", [encodeURI("itms-services://?action=download-manifest&url=" + mustUpdateData.filePath), "_system"]);
                }
            };

            /*退出登录的方法
             * isClearId : Boolean值,true:发送请求,清除jPushId,false反之
             * */
            var exitLogin = function exitLogin(isClearId){
                if(isClearId && requestExitFlag){
                    var exitUrl = serverConfiguration.baseApiUrl + "app/common/v1/logout";
                    var param = {
                        account : storageService.get(auth_events.userId,null) //用户id
                    };
                    GetRequestService.getRequestData(exitUrl,param,true,'POST').then(function(result){
                        if(result.state == 0){
                            requestExitFlag = false;
                            clearDbExitLogin();
                            mobileSocket.close();

                        }else{
                            /*判断平台*/
                            if(!$isMobile.isPC){
                                $cordovaToast.showShortBottom(T.translate("mine.logout-error"));
                            }
                            der.reject("exitErr");
                        }
                    },function(err){
                        /*判断平台*/
                        if(!$isMobile.isPC){
                            $cordovaToast.showShortBottom(T.translate("mine.logout-error"));
                        }
                        der.reject(err);
                    });
                    return der.promise;
                }else{
                    clearDbExitLogin();
                    mobileSocket.close();
                }

            };

            /**
             * 获取当前版本号
             * */
            var getCurrentVersion = function(){
                if (!$isMobile.isPC) {
                    window.cordova.getAppVersion.getVersionNumber(function (currentVersionNumber) {
                        der.resolve(currentVersionNumber);
                    });
                }
                return der.promise;
            }
            /*清空Db,退出登录*/
            function clearDbExitLogin(){

                if ($isMobile.Android) {
                    /**
                     *  2018/9/7 chris.zheng
                     *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
                     *  功能说明：使用websql创建数据库
                     */
                    var db = DBSingleInstance.getSyncDb();
                    /*清空db*/
                    db.transaction(function(tx){
                        tx.executeSql('delete from SyncData',[],function(tx,res){
                            der.resolve("exitSuccess");
                            requestExitFlag = true;
                            authService.logout();
                            return der.promise;
                        },function (tx,err){
                            der.reject();
                            return der.promise;
                        })
                    });
                }else {
                    jdbc.findAll("syncData").then(function(response) {
                        if (response) {
                            response.forEach(function(element) {
                                jdbc.remove("syncData", element.id);
                            });
                        }
                    });
                    requestExitFlag = true;
                    authService.logout();
                    return der.promise;
                }
            }

            return {
                getVersionInfo: getVersionInfo, //获取版本信息
                upDateVersion: upDateVersion, //更新的方法,下载
                exitLogin:exitLogin, //退出登录方法
                getCurrentVersion : getCurrentVersion//获取当前版本号
            }
        }]);

    /**
     * 跳转工具类
     */
    app.factory('stateGoHelp', function ($ionicNativeTransitions,timeout,APP,$ionicHistory,$ionicViewSwitcher,$state) {
        /*
         *isBack:boolean类型,true:跳转    false:back返回
         *addressTarget: string类型,跳转到的route地址
         *takeValue:object,所带的值
         * animation:string类型,left|right|up|down
         * */
        var stateGoUtils = function(isBack,addressTarget,takeValue,animation){
            if(APP.devMode){
                console.log("跳转带值",takeValue);
            }
            if(isBack){
                if(ionic.Platform.isIOS()){
                    $ionicViewSwitcher.nextDirection('forward');
                    //$ionicViewSwitcher.nextTransition("enter");
                    $state.go(addressTarget, takeValue, null);
                }else{
                    $ionicNativeTransitions.stateGo(addressTarget,takeValue,{},{
                        "type": "slide",
                        "direction": animation, // 滑动方向'left|right|up|down'
                        "duration": timeout.animDuration // 切换间隔,引入timeout
                    });
                }
            }else{
                // if(ionic.Platform.isIOS()){
                //     $ionicHistory.goBack ();
                // }else{
                    $ionicNativeTransitions.goBack();
                // }
            }
        };
        return {
            stateGoUtils : stateGoUtils
        };
    });

    /**
     * 深度克隆 便于对象复制
     */
    app.factory('clone', function () {
        /*
         * Obj:obj||array
         * */
        var cloneData = function(Obj){
          var buf;
          if (Obj instanceof Array) {
            buf = [];  // 创建一个空的数组
            var i = Obj.length;
            while (i--) {
              buf[i] = cloneData(Obj[i]);
            }
            return buf;
          } else if (Obj instanceof Object){
            buf = {};  // 创建一个空对象
            for (var k in Obj) {  // 为这个对象添加新的属性
              buf[k] = cloneData(Obj[k]);
            }
            return buf;
          }else{
            return Obj;
          }
        };
        return {
          cloneData : cloneData
        };
    });

    /**
     * 通用工具类
     */
    app.factory('appUtils', [
        '$state',
        '$ionicViewSwitcher',
        '$ionicNativeTransitions',
        '$ionicHistory',
        '$ionicModal',
        '$cordovaToast',
        '$ionicScrollDelegate',
        "$translate",
        "$ionicLoading",
        function ($state, $ionicViewSwitcher, $ionicNativeTransitions, $ionicHistory, $ionicModal,
                  $cordovaToast, $ionicScrollDelegate, $translate, $ionicLoading) {
            /* 通用返回函数 */
            var back = function () {
                // 不同平台分别处理,此处使用了ionic-native-transitions插件
                ionic.Platform.isIOS() ? $ionicHistory.goBack() : $ionicNativeTransitions.goBack();
            };

            /* 进入某个路由模块 */
            /* 路由的跳转不推荐使用a标签加上相应属性来做,用事件和下面的方法来跳转有效果较好的转场动画 */
            var go = function (route, params, callback) {
                $ionicViewSwitcher.nextDirection('forward');
                $state.go(route, params);
                callback && typeof callback === 'function' && callback();
            };

            /* 解决双平台刷新问题的直接进入 tab栏 on-select 时使用 直接进入模块(无动画) */
            var doGo = function (url) {
                $ionicNativeTransitions.locationUrl(url, {
                    "type": "fade",
                    "duration": 0
                });
            };

            /* 字符串 trim 函数 */
            var trim = function (str) {
                if (typeof str === 'string') {
                    return str.replace(/^\s+|\s+$/g, "");
                }
            };

            /* 展示遮罩 */
            var showLoading = function (showBackdrop) {
                $ionicLoading.show({
                    content: '',
                    animation: 'fade-in',
                    showBackdrop: showBackdrop,
                    maxWidth: 200,
                    showDelay: 0
                });
            };

            /* 隐藏遮罩 */
            var hideLoading = function () {
                $ionicLoading.hide();
            };

            /* 截取字符串的方法 */
            var textCut = function (str, num) {
                if (typeof str === 'string' && typeof num === 'number' && str.length >= num) {
                    var temp = str.slice(0, num);
                    var last = temp.lastIndexOf(' '); // 找到空格的索引
                    temp = null; // 内存回收
                    return str.slice(0, last) + '...';
                }
                return str;
            };

            /* 用户提示功能 */
            var showTips = function (messageOrKey, translateMessage, index) {
                // 位置信息 0 上 , 1 中 , 2 下
                if (translateMessage) {
                    $translate(messageOrKey).then(function (translation) {
                        tips(translation, index);
                    });
                } else {
                    tips(messageOrKey, index);
                }
            };

            var tips = function (prompt, index) {
                // 位置信息 0 上 , 1 中 , 2 下
                switch (index) {
                    case 0:
                        return window.cordova ? $cordovaToast.showShortTop(prompt) : alert(prompt);
                        break;
                    case 1:
                        return window.cordova ? $cordovaToast.showShortCenter(prompt) : alert(prompt);
                        break;
                    case 2:
                        return window.cordova ? $cordovaToast.showShortBottom(prompt) : alert(prompt);
                        break;
                }
            };

            var doShowToast = function(message, displayLongOrShort) {
                if (window.cordova) {
                    if (displayLongOrShort === 'short') {
                        $cordovaToast.showShortCenter(message);
                    } else {
                        $cordovaToast.showLongCenter(message);
                    }
                } else {
                    console.log("NOTE - not running on device: showToast('" + message + "')");
                }
            };

            var showToast = function (messageOrKey, translateMessage, displayLongOrShort) {
                if (translateMessage) {
                    $translate(messageOrKey).then(function (translation) {
                        doShowToast(translation, displayLongOrShort);
                    });
                } else {
                    doShowToast(messageOrKey, displayLongOrShort);
                }
            };

            /* 弹出模态窗口功能 */
            var showModal = function (path, scope, animation, cb) {
                $ionicModal.fromTemplateUrl(path, {
                    scope: scope,
                    animation: animation
                }).then(function (modal) {
                    cb && angular.isFunction(cb) && cb(modal);
                });
            };

            /* 隐藏 modal */
            var hideModal = function (modal) {
                modal.hide();
            };

            /* 移除 modal 支持多个modal一起移除 */
            var destroyModal = function (scope, modal) {
                scope.$on('$destroy', function () {
                    // 如果是单个，则直接移出，如果是数组，则迭代移除
                    if (Array.isArray(modal)) {
                        modal.forEach(function (item) {
                            item.remove();
                        })
                    } else {
                        modal && modal.remove();
                    }
                });
            };

            /* 清除历史记录功能，每次回到tab根目录调用,修复ionic偶尔无法回退bug */
            var clearHistory = function () {
                $ionicHistory.clearHistory();
            };

            /* 数组去重功能 */
            var arrayUnique = function (arr) {
                if (!Array.isArray(arr)) return;
                var res = [];
                var json = {};
                for (var i = 0; i < arr.length; i++) {
                    if (!json[arr[i]]) {
                        res.push(arr[i]);
                        json[arr[i]] = 1;
                    }
                }
                return res;
            };

            /* 存储搜索记录 */
            var getSearchTextStorage = function (searchText) {
                var searchList = [];
                var res = [];
                if (localStorage.searchList && searchText) {
                    searchList = JSON.parse(localStorage.searchList);
                    searchList.unshift(searchText); // 头部加1
                    res = arrayUnique(searchList); // 数组去重
                } else if (!localStorage.searchList && searchText) {
                    res.unshift(searchText);
                } else {
                    return localStorage.searchList ? JSON.parse(localStorage.searchList) : [];
                }
                localStorage.searchList = JSON.stringify(res); // 本地存储
                return res;
            };

            /* 用于判断参数是否为数字,不是返回null,数字是否 < 10 , < 10 则补0 */
            var tenFormat = function (num) {
                if(typeof num !== "number"){
                    return null;
                }
                return num / 10 < 1 ? '0' + num : num;
            };

            /* 处理时分秒 */
            var handleTime = function (hour, min, sec) {
                var hh = tenFormat(hour);
                var mm = tenFormat(min);
                var ss = tenFormat(sec);
                return hh + ':' + mm + ':' + ss;
            };

            /* 处理正在进行的时间 格式为: hh:mm:ss */
            var handlePlayingTime = function (time) {
                var hh = Math.floor(time / 3600);
                var mm = Math.floor(time % 3600 / 60);
                var ss = Math.floor(time % 60);
                return handleTime(hh, mm, ss);
            };

            // 隐藏闪屏
            var enterSettings = function () {
                navigator.splashscreen && navigator.splashscreen.hide && navigator.splashscreen.hide(); // 设置闪屏
                window.StatusBar && window.StatusBar.show(); // 显示状态栏
            };

            // 滚动到最顶部方法
            var scrollToTop = function (name, flag) {
                $ionicScrollDelegate.$getByHandle(name).scrollTop(flag);
            };

            /*判断对象是否为空*/
            var isObjectEmpty = function (object) {
                if (!object) {
                    return true;
                }

                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            };
            var isObjectNotEmpty = function (object) {
                return !isObjectEmpty(object);
            };

            //格式化金额
            var outputMoney = function (number) {
                var indexPosition = number.indexOf(".");
                if(indexPosition > 0){
                    var beforePosStr = number.substring(0,indexPosition);
                    var afterPosStr =  number.substring(indexPosition,number.length);

                }else{
                    var beforePosStr = number;
                    var afterPosStr = "";
                }


                if (beforePosStr.length <= 3)
                    return (beforePosStr == '' ? '0' : beforePosStr + afterPosStr);
                else {
                    var mod = beforePosStr.length % 3;
                    var output = (mod == 0 ? '' : (beforePosStr.substring(0, mod)));
                    for (var i = 0; i < Math.floor(beforePosStr.length / 3); i++) {
                        if ((mod == 0) && (i == 0))
                            output += beforePosStr.substring(mod + 3 * i, mod + 3 * i + 3);
                        else
                            output += ',' + beforePosStr.substring(mod + 3 * i, mod + 3 * i + 3);
                    }
                    return (output + afterPosStr);
                }
            };
            return {
                back: back,

                go: go,
                doGo: doGo,
                trim: trim,
                showLoading: showLoading,
                hideLoading: hideLoading,

                textCut: textCut,
                showTips:showTips,
                tips: tips,
                doShowToast: doShowToast,
                showToast: showToast,
                showModal: showModal,

                hideModal: hideModal,
                destroyModal: destroyModal,
                clearHistory: clearHistory,
                arrayUnique: arrayUnique,
                getSearchTextStorage: getSearchTextStorage,

                handleTime: handleTime,
                handlePlayingTime: handlePlayingTime,
                enterSettings: enterSettings,
                scrollToTop: scrollToTop,
                isObjectEmpty: isObjectEmpty,

                isObjectNotEmpty:isObjectNotEmpty,
                outputMoney : outputMoney
            };
        }]);

    /**
     * 手机socket，在线用户统计
     */
    app.factory('mobileSocket', ['$window', '$isMobile', 'serverConfiguration', 'storageService', 'auth_events',
        'DBSingleInstance', '$filter',

        function ($window, $isMobile, serverConfiguration, storageService, auth_events, DBSingleInstance, $filter) {
            //网络状态变成联网时重连一次
            document.addEventListener("online", function () { connect();storageService.set('wsConnectionCount', 0); }, false);
            //连接socket方法
            var connect = function (wsConnectionCount) {
                if ($isMobile.isPC) return false;
                //参数：userpkid：用户pkid
                var userpkid = storageService.get(auth_events.userId, null);
                //参数：client_type客户端类型
                var client_type = $isMobile.IOS ? 'IOS' : 'Android';
                //参数：version_count版本次数
                var version_count = storageService.get('versionCount',1)
                //wsConnectionCount:记录重连次数
                if (wsConnectionCount > 4) {
                    var make_time = $filter('date')((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss sss');//创建时间
                    var loginEnglishName = storageService.get(auth_events.loginEnglishName, null);//用户名英文输入的
                    var loginChinaName = storageService.get(auth_events.name, null);//用户汉语名字
                    var user_name = loginChinaName + "&&" + loginEnglishName;//数据库存的英文和汉语名字
                    var timeDB = DBSingleInstance.getTimeDb();
                    var url = serverConfiguration.webSocket;
                    timeDB.transaction(function (tx) {
                        /*插入数据*/
                        tx.executeSql('insert into TimeData values(?,?,?,?,?,?)', [userpkid, user_name, client_type, url, make_time, "webSocket"], function (tx) { },
                            function (tx, err) { })
                    })
                    return false;
                }
                //每次连接socket前断开上一个连接，保证只有一个socket正在连接
                try { $window.ws.close() } catch (e) { console.warn('websocket:' + e) }
                //安卓没有获取到用户pkid直接返回
                if ($isMobile.Android && !userpkid) return false;
                //开始连接
                $window.ws = new WebSocket(serverConfiguration.webSocket + "?user=" + userpkid + '&system=oa&subsystem=oa-web&client_type=' + client_type + '&version_count=' + version_count);
                // $window.ws = new WebSocket("ws://192.168.11.117:8181");
                // 无网一分钟尝试重连，有网三秒后尝试重连
                if (navigator.connection.type) {
                    $window.ws.waitTime = navigator.connection.type == 'none' ? 60000 : 3000
                } else {
                    $window.ws.waitTime = navigator.network.connection.type == 'none' ? 60000 : 3000;
                }
                //测试用：向后台发送信息
                $window.ws.onopen = function (evt) {
                    //连接成功后将失败次数清零
                    storageService.set('wsConnectionCount', 0);
                    // 测试用连接成功发送信息
                    $window.ws.send("用户pkid：" + userpkid + '客户端：' + client_type + '版本号：' + version_count);
                };
                //接受心跳
                $window.ws.onmessage = function (evt) {
                    var msg = evt.data;
                    var socket = evt.target;
                    socket.send('yes');
                    if (msg === 'hi') {
                    }
                }
                //连接断开时触发onclose事件
                $window.ws.onclose = function (evt) {
                    //主动关闭时直接return，不执行任何操作
                    if (evt.code == 4000 && evt.reason == "logout") return false;
                    //reconnect：针对锁屏，socket要暂时断开，app唤醒时重连
                    //connected->(error->)close->reconnect->connected用socket生命周期形成递归，唤醒后不断的去尝试重连，直到连接成功
                    setTimeout(function () {
                        //每失败一次wsConnectionCount+1
                        var wsConnectionCount = storageService.get('wsConnectionCount', 0);
                        storageService.set('wsConnectionCount', ++wsConnectionCount);
                        //readyState=1连接已经建立
                        if ($window.ws.readyState == 1) return false;
                        connect(wsConnectionCount);
                    }, $window.ws.waitTime)
                };
            };
            //主动关闭；只在用户退出登陆/安卓熄屏时调用
            var close = function () {
                try { $window.ws.close(4000, 'logout') } catch (e) { console.warn('websocket:' + e) }
            }
            return {
                connect: connect,
                close: close
            }
        }]);

    /**
     * * 2018/5/25 10:49  CrazyDong
     *  变更描述：暂时只针对android
     *  功能说明：下载功能,目前用来下载图片
     */
    app.factory('downloadFileUtil', ['serverConfiguration', '$isMobile', 'GetRequestService', '$cordovaToast',
        '$ionicLoading', '$q', 'T',
        function (serverConfiguration, $isMobile, GetRequestService , $cordovaToast, $ionicLoading, $q, T) {

            /**
             *
             * @param url 下载地址
             * @param targetPath 文件下载到SD卡中的文件夹名字,如"OAOther"
             * @param fileName 文件名字,必须带后缀
             * @param isLoading 是否显示loading和进度
             */
            var downloadFile = function downloadFile(url,targetPath,fileName,isLoading) {
                var der = $q.defer();
                if ($isMobile.Android) {
                    //添加权限
                    var perArr = ["android.permission.WRITE_EXTERNAL_STORAGE","android.permission.MOUNT_UNMOUNT_FILESYSTEMS"];
                    PermissionsPlugin.addPermissions("权限", function () { }, function () { }, perArr);
                    if(isLoading){
                        $ionicLoading.show({
                            template: "正在下载,请您稍等..."
                        });
                    }

                    //创建文件夹
                    window.resolveLocalFileSystemURI(cordova.file.externalRootDirectory, function (fileEntry) {
                        fileEntry.getDirectory(targetPath, {create: true, exclusive: false}, function (exclusive) {

                            var downloadUrl = url;
                            var sdTargetPath = "/sdcard/" + targetPath + "/" + fileName;
                            var uri = encodeURI(downloadUrl);
                            var fileTransfer = new FileTransfer();
                            /*下载*/
                            fileTransfer.download(uri, sdTargetPath, function (entry) {
                                    if(isLoading){
                                        $cordovaToast.showLongBottom("文件已下载到SD卡下的"+ targetPath +"文件夹内");
                                        $ionicLoading.hide();
                                    }

                                    der.resolve(sdTargetPath);//返回文件下载的地址

                                }, function (err) {
                                    if(isLoading){
                                        $ionicLoading.hide();
                                        $cordovaToast.showShortBottom(T.translate("view-form.download-error"));
                                    }

                                    der.reject(err);
                                },
                                false, {
                                    headers: {
                                        "Authorization": "BasicdGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                    }
                                });
                        }, function (err) {
                            if(isLoading){
                                $ionicLoading.hide();
                                $cordovaToast.showShortBottom(T.translate("view-form.create-error"));
                            }
                            der.reject(err);
                        });

                    });
                    return der.promise;
                } else if ($isMobile.IOS) {
                    //TODO IOS不知道怎么写 InAppBrowser插件搞搞
                }
            };


            return {
                downloadFile: downloadFile //获取版本信息
            }
        }]);


    app.service('jdbc', function ($http, $q) {
        var _self = this;
        var myDB = {
            name: 'zhongWangOA',
            version: 1,
            db: null,
            schema: {
                2: function(db) {
                    // 初始化 自定义同步工作桌面
                    db.createObjectStore('syncData', {keyPath:"id", autoIncrement: true});

                    // 初始化 极光推送
                    db.createObjectStore('jpushData', {keyPath:"id", autoIncrement: true});

                    // 初始化 网络请求日志
                    var webLog = db.createObjectStore('TimeData', {keyPath:"id", autoIncrement: true});
                    webLog.createIndex("userPkid", "userName", {unique: false});
                }
            }
        };
        // 用于处理跟回调函数相反的方式,当defer调用resolve方法之后,就会触发defer.promise.then(callback)传入的callback方法,并且resolve可以传入任意的变量
        var defer = $q.defer();
        _self.onload = function(cb) {
            return defer.promise.then(cb);
        };
        var getDb = function(db) {
            var d = $q.defer();
            if (db) {
                d.resolve(db);
            }
            // 打开数据库
            var result = window.indexedDB.open(myDB.name);
            result.onerror = function (e) {
                console.log("Open DB Error!");
                d.reject("error");
            };
            // 正确打开
            result.onsuccess = function (e) {
                var db = e.target.result;
                myDB.db = db;
                d.resolve(db);
            };
            return d.promise;
        };
        _self.openDB = function (name, version, success, upgrade) {
            var d = $q.defer();
            var name = name || myDB.name;
            var version = version || myDB.version;
            // 打开数据库
            var result = window.indexedDB.open(name, version);
            // 错误
            result.onerror = function (e) {
                console.log("Open DB Error!");
                d.reject(e);
            };
            // 正确打开
            result.onsuccess = function (e) {
                myDB.db = e.target.result;
                if (success) success(myDB.db);
                d.resolve(e);
            };
            // 数据库版本变更
            result.onupgradeneeded = function (e) {
                myDB.db = e.target.result;
                if (upgrade) upgrade(myDB.db);
                d.resolve("upgradeneeded");
            };
            return d.promise;
        };
        var schema = function (schema) {
            angular.forEach(schema, function(upgrade, version, o) {
                _self.openDB(myDB.name, version, function() {
                    defer.resolve();
                }, function(db) {
                    upgrade(db);
                });
            })
        };
        schema(myDB.schema);
        _self.get = function (storeName, key) {
            var d = $q.defer(); //promise
            getDb(myDB.db).then(function (db) {
                var transaction = db.transaction(storeName, 'readonly');
                var store = transaction.objectStore(storeName);
                var result = store.get(key);
                result.onsuccess = function (e) {
                    _self.result = e.target.result;
                    d.resolve();
                };
                result.onerror = function (e) {
                    d.reject();
                };
            });
            return d.promise;
        };
        _self.find = function (storeName, key, value) {
            var d = $q.defer();//promise
            getDb(myDB.db).then(function(db) {
                var transaction = db.transaction(storeName, 'readonly');
                var store = transaction.objectStore(storeName);
                var keyRange = IDBKeyRange.only(value);
                var result = store.index(key).openCursor(keyRange, "next");
                var results = [];
                result.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        d.resolve(results);
                    }
                };
                result.onerror = function (e) {
                    d.reject();
                };
            });
            return d.promise;
        };
        _self.put = function (storeName, value) {
            var d = $q.defer();
            var db = myDB.db || getDb();
            var transaction = db.transaction(storeName, 'readwrite');
            var store = transaction.objectStore(storeName);
            if (value !== null && value !== undefined) {
                store.put(value);
                d.resolve();
            } else {
                d.reject();
            }
            return d.promise;
        };
        _self.remove = function (storeName, value) {
            var d = $q.defer();//promise
            var db = myDB.db || getDb();
            var transaction = db.transaction(storeName, 'readwrite');
            var store = transaction.objectStore(storeName);
            var result = store.delete(value);
            result.onsuccess = function (e) {
                d.resolve();
            };
            result.onerror = function (e) {
                d.reject();
            };
            return d.promise;
        };
        _self.findAll = function (storeName) {
            var d = $q.defer();//promise
            getDb(myDB.db).then(function(db) {
                var transaction = db.transaction(storeName, 'readonly');
                var store = transaction.objectStore(storeName);
                var result = store.openCursor();
                var results = [];
                result.onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        d.resolve(results);
                    }
                };
                result.onerror = function (e) {
                    d.reject();
                };
            });
            return d.promise;
        };
        return _self;
    });



    /**
     * android手机打开文件
     * */
    app.factory('openFileUtils', ["$ionicLoading","$cordovaFileOpener2",
        function ($ionicLoading,$cordovaFileOpener2) {

        //打开PDF文件
        var openFilePDF = function(sdTargetPath){

            /**
             * * 2018/9/7 13:51  CrazyDong
             *  变更描述：由于$cordovaFileOpener2.open在部分系统上无法打开PDF,所以改用自己写的插件
             *  功能说明：调用第三方应用,打开PDF文件
             */
            PermissionsPlugin.addPermissions("LevelAPI",function(level){
                //6.0以上有权限问题,所以分开适配
                if(level <= 23){
                    var path = [sdTargetPath];
                    PermissionsPlugin.addPermissions("openPDF", function () {
                            $ionicLoading.hide();},
                        function () {
                            $ionicLoading.hide();
                        }, path);
                }else{
                    $cordovaFileOpener2.open("file:///" + sdTargetPath,'application/pdf' ).then(function () {
                        $ionicLoading.hide();
                    }, function (err) {
                        $ionicLoading.hide();
                    });
                }
            });
        };
        return {
            openFilePDF : openFilePDF
        };
    }]);
})();
