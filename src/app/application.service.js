/**
 * Created by chris.zheng on 2017/4/12.
 * OA项目工具类
 */

(function () {
    'use strict';

    var app = angular.module('community.services', []);

    app.factory('application', ['storageService', "$ionicLoading",
         '$timeout',  '$rootScope', '$cordovaToast','serverConfiguration',
        '$isMobile','T','auth_events','timeout','$q','$http','DBSingleInstance','jdbc',
        function (storageService, $ionicLoading,
                  $timeout, $rootScope,  $cordovaToast,serverConfiguration,
                  $isMobile, T,auth_events,timeout,$q,$http,DBSingleInstance,jdbc) {

            var showLoading = function (showBackdrop) {
                $ionicLoading.show({
                    content: '',
                    animation: 'fade-in',
                    showBackdrop: showBackdrop,
                    maxWidth: 200,
                    showDelay: 0
                });
            };

            var hideLoading = function () {
                $ionicLoading.hide();
            };


            var syncData = {};//同步后存储同步数据对象
            var workHomeData = {};
            /*工作  待办的新消息提示*/
            function getAlertNews(){
                if ($isMobile.Android) {
                    /**
                     *  2018/9/7 chris.zheng
                     *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
                     *  功能说明：使用websql创建数据库
                     */
                    var db = DBSingleInstance.getSyncDb();
                    /*查询*/
                    db.transaction(function (tx){
                        tx.executeSql('select * from SyncData',[],function(tx,result){
                            if(result.rows && result.rows.length !== 0){
                                syncData = angular.fromJson(result.rows.item(0).name);
                                syncWorkHomeData();
                            }else{
                                requestWorkHomeData();
                            }

                        })
                    });
                }else {
                    jdbc.findAll("syncData").then(function(response) {
                      if (response && response.length===0) {
                            requestWorkHomeData();
                        }else {
                            syncData = angular.fromJson(response[response.length-1].syncValue);
                            syncWorkHomeData();
                        }
                    });
                }

                return syncData;
            }

            /*获取用户默认待办*/
            function requestWorkHomeData(){
                /**
                 *  2018/7/6 chris.zheng
                 *  变更描述：IOS进入应用清除角标
                 *  功能说明：清除角标
                 */
                if ($isMobile.IOS) {
                    window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                }else if($isMobile.Android){
                    /**
                     * * 2018/7/10 14:30  CrazyDong
                     *  变更描述：android清除通知和角标
                     *  功能说明：
                     */
                    window.plugins.jPushPlugin.clearAllNotification();//清除通知
                    window.plugins.jPushPlugin.clearBadgeNum();//清楚角标
                }

//                var url = serverConfiguration.baseApiUrl + "app/common/v1/getCountInfo";
                var url = serverConfiguration.baseApiUrl + "app/common/v1/getMyStatistics";
                var param = {
                    account:storageService.get(auth_events.userId,null)
                };
                getRequestData(url,param,false).then(function(result){
                    if(result.state === -1 ){
                        /*判断平台*/
                        if(!$isMobile.isPC){
                            $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    }else{
                        /*工作  待办是否有新提示*/
                        if(result.other != 0 || result.money != 0 || result.goods != 0 || result.staff != 0){
                            $rootScope.tabWork = true;//是否显示"工作"的红点提示
                            $rootScope.tabWaitWork = true;//是否显示"待办"的红点提示
                        }else{
                            $rootScope.tabWork = false;//是否显示"工作"的红点提示
                            $rootScope.tabWaitWork = false;//是否显示"待办"的红点提示
                        }
                        /*消息 是否有新提示*/
                        if(result.messageNum == 0){
                            $rootScope.tabIonNotification = false;//是否显示"消息"的红点提示
                            $rootScope.bellRed = false;//是否显示铃铛的红点提示
                        }else{
                            $rootScope.tabIonNotification = true;//是否显示"消息"的红点提示
                            $rootScope.bellRed = true;//是否显示铃铛的红点提示
                        }
                    }
                },function(err){
                    /*判断平台*/
                    if(!$isMobile.isPC){
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            /*同步后数据处理 -- 未请求*/
            function syncWorkHomeData(){
                var haveNewsFlag = false;
                workHomeData = syncData;
                customCount();//获取待办数量
                for (var i = 0; i < workHomeData.length; i++) {
                    if(workHomeData[i].CNT !== 0){
                        haveNewsFlag = true;
                    }
                }
                /*工作  待办是否有新提示*/
                if(haveNewsFlag){
                    $rootScope.tabWork = true;//是否显示"工作"的红点提示
                    $rootScope.tabWaitWork = true;//是否显示"待办"的红点提示
                }else{
                    $rootScope.tabWork = false;//是否显示"工作"的红点提示
                    $rootScope.tabWaitWork = false;//是否显示"待办"的红点提示
                }
            }

            /*同步后 获取用户自定义查询的待办数量*/
            function customCount(){
                var haveNewsFlag = false;
                var url = serverConfiguration.baseApiUrl + "app/home/v3/customCount";
                var param = {
                    account : storageService.get(auth_events.userId,null)
                };
                getRequestData(url,param,false).then(function(resultNum){
                    var numList = angular.fromJson(resultNum.list);
                    for(var i = 0; i < numList.length ; i++ ){
                        for(var j = 0; j < workHomeData.length ; j++ ){
                            if(numList[i].pkid === workHomeData[j].TYPE_ID){
                                workHomeData[i].CNT = numList[i].num;
                                if(workHomeData[i].CNT != 0){
                                    haveNewsFlag = true;
                                }
                            }
                        }
                    }

                    /*工作  待办是否有新提示*/
                    if(haveNewsFlag){
                        $rootScope.tabWork = true;//是否显示"工作"的红点提示
                        $rootScope.tabWaitWork = true;//是否显示"待办"的红点提示
                    }else{
                        $rootScope.tabWork = false;//是否显示"工作"的红点提示
                        $rootScope.tabWaitWork = false;//是否显示"待办"的红点提示
                    }
                    /*消息 是否有新提示*/
                    if(resultNum.messageNum == 0){
                        $rootScope.tabIonNotification = false;//是否显示"消息"的红点提示
                        $rootScope.bellRed = false;//是否显示铃铛的红点提示
                    }else{
                        $rootScope.tabIonNotification = true;//是否显示"消息"的红点提示
                        $rootScope.bellRed = true;//是否显示铃铛的红点提示
                    }
                },function(err){
                    /*判断平台*/
                    if(!$isMobile.isPC){
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            /*注入方式请求  抱循环注入错误  只能重新写请求方法*/
            var getRequestData = function(url,param,isLoading){
                if(isLoading){
                    showLoading(true);
                    $timeout(function () {
                        hideLoading();
                    }, timeout.max);
                }
                var def = $q.defer();
                $http({
                    method  : 'POST',
                    url     : url,
                    params  : param
                }).success(function(result){
                    def.resolve(result);
                    if(isLoading){
                        hideLoading();
                    }
                }).error(function(error){
                    def.reject(error);
                    if(isLoading){
                        hideLoading();
                    }
                });
                return def.promise;
            };
            return {
                showLoading: showLoading,
                hideLoading: hideLoading,
                getAlertNews:getAlertNews ////获取新消息提示  即红点(底部tabs 工作 待办 消息  铃铛)
            };
        }]);

    /*拦截网络请求*/
    app.factory('Interceptor',function(serverConfiguration,$rootScope,auth_events,$isMobile,storageService,
                                       public_constant,$q,APP,$filter,DBSingleInstance){
        /**
         * 请求时间数据插入表
         * @param user_pkid 用户id
         * @param user_name 用户名
         * @param platform 平台
         * @param url 所请求的网址
         * @param log_type 日志类型
         * @constructor
         */
        function TimeDbInsert(user_pkid,user_name,platform,url,log_type){
            /**
             * * 2018/8/23 15:39  CrazyDong
             *  变更描述：
             *  功能说明：控制"日志记录"的开关,0:关闭 1:打开,当打开的时候插入数据
             */
            if(storageService.get(auth_events.logRecode, "0") == "1"){
                var make_time = $filter('date')((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss sss');//创建时间
                if($isMobile.Android){
                    var timeDB = DBSingleInstance.getTimeDb();
                    timeDB.transaction(function(tx){
                        /*插入数据*/
                        tx.executeSql('insert into TimeData values(?,?,?,?,?,?)',[user_pkid,user_name,platform,url,make_time,log_type],function(tx){},
                            function (tx,err){})
                    })
                }
            }

        }

        return{
            request: function (config) {
                /*请求时间数据插入表*/
                if(storageService.get(auth_events.logRecode, "0") == "1"){
                    if(config.url.indexOf(serverConfiguration.baseApiUrl)>=0 ||
                        config.url.indexOf(serverConfiguration.SSOUrl)>=0){
                        var loginEnglishName = storageService.get(auth_events.loginEnglishName,null);//用户名英文输入的
                        var loginChinaName = storageService.get(auth_events.name,null);//用户汉语名
                        var user_pkid = storageService.get(auth_events.userId,null);//用户id
                        var user_name = loginChinaName + "&&" +loginEnglishName;//数据库存的英文和汉语名字
                        var platform = "PC";//平台
                        var url = config.url;//url
                        var log_type = "request";//日志类型
                        if($isMobile.Android){
                            platform = "Android";
                        }else if($isMobile.IOS){
                            platform = "IOS";
                        }
                        TimeDbInsert(user_pkid,user_name,platform,url,log_type);
                    }
                }

                //判断网络请求
                if(config.url.indexOf(serverConfiguration.baseApiUrl)>=0 ||
                    config.url.indexOf(serverConfiguration.SSOUrl)>=0){
                    /*SSO不加header字段*/
                    if(config.url.indexOf(serverConfiguration.baseApiUrl)>=0){
                        config.headers.User_Pkid = storageService.get(auth_events.userId,null);
                        config.headers.Authorization = storageService.get(auth_events.authorization,null);
                    }

                    /*判断平台*/
                    if(!$isMobile.isPC){
                        //如果联网句柄不空 继续判断网络状态
                        if(navigator.connection!=null){
                            //获取网络状态
                            var networkState = navigator.connection.type;
                            //获取网络状态是否成功
                            if(angular.isDefined(networkState)){
                                if(networkState=="none"||networkState== 0){
                                    //如果是未联网 发送未联网广播
                                    $rootScope.$broadcast(auth_events.notNetConnected);
                                    return null;
                                }else if(networkState != Connection.WIFI){
                                    if($isMobile.Android && APP.VPNFlag){
                                        PermissionsPlugin.addPermissions("VPN",function (result) {
                                            //成功的回调,VPN_OK为连接了VPN,否则为网络状态
                                            if(result != "VPN_OK"){
                                                $rootScope.$broadcast(auth_events.notVpnConnected);
                                                return null;
                                            }
                                        },function (err) {
                                            //失败的回调
                                            $rootScope.$broadcast(auth_events.notVpnConnected);
                                            return null;
                                        },null);
                                    }
                                }
                            }else{
                                //如果是未联网 发送未联网广播
                                $rootScope.$broadcast(auth_events.notNetConnected);
                                return null;
                            }
                        }
                    }
                }
                return config;
            },

            response:function(response){

                /*记录APP的网络请求数据*/
                if(storageService.get(auth_events.logRecode, "0") == "1"){
                    if(response.config.url.indexOf(serverConfiguration.baseApiUrl)>=0 ||
                        response.config.url.indexOf(serverConfiguration.SSOUrl)>=0){
                        var loginEnglishName = storageService.get(auth_events.loginEnglishName,null);//用户名英文输入的
                        var loginChinaName = storageService.get(auth_events.name,null);//用户汉语名字
                        var user_pkid = storageService.get(auth_events.userId,null);//用户id
                        var user_name = loginChinaName + "&&" +loginEnglishName;//数据库存的英文和汉语名字
                        var platform = "PC";//平台
                        var url = response.config.url;//url
                        var log_type = "response";//日志类型
                        if($isMobile.Android){
                            platform = "Android";
                        }else if($isMobile.IOS){
                            platform = "IOS";
                        }
                        TimeDbInsert(user_pkid,user_name,platform,url,log_type);
                    }
                }

                if(response.config.url.indexOf(serverConfiguration.baseApiUrl)>=0 ||
                    response.config.url.indexOf(serverConfiguration.SSOUrl)>=0){
                    if(response.data.state == -1){
                        /*状态success里面返回状态码为-1时*/
                        $rootScope.$broadcast(auth_events.successSysErr,response.data.msg);
                        return null;
                    }

                }
                return response
            },
            responseError:function(responseError){

                /*记录APP的网络请求数据*/
                if(storageService.get(auth_events.logRecode, "0") == "1"){
                    if(responseError.config.url.indexOf(serverConfiguration.baseApiUrl)>=0 ||
                        responseError.config.url.indexOf(serverConfiguration.SSOUrl)>=0){
                        var loginEnglishName = storageService.get(auth_events.loginEnglishName,null);//用户名英文输入的
                        var loginChinaName = storageService.get(auth_events.name,null);//用户汉语名字
                        var user_pkid = storageService.get(auth_events.userId,null);//用户id
                        var user_name = loginChinaName + "&&" +loginEnglishName;//数据库存的英文和汉语名字
                        var platform = "PC";//平台
                        var url = responseError.config.url;//url
                        var log_type = "responseError";//日志类型
                        if($isMobile.Android){
                            platform = "Android";
                        }else if($isMobile.IOS){
                            platform = "IOS";
                        }
                        TimeDbInsert(user_pkid,user_name,platform,url,log_type);
                    }
                }

                if(responseError.config.url.indexOf(serverConfiguration.baseApiUrl)>=0 ||
                    responseError.config.url.indexOf(serverConfiguration.SSOUrl)>=0){

                    //与服务器商定状态值对应发送的广播包
                    var statusErr= {
                        400: public_constant.responseError400,
                        511:public_constant.loginOnce,
                        401:public_constant.tokenErr,
                        0:public_constant.serviceErr
                    }[responseError.status];
                    // 用户被踢下线的情况下，重置网络请求计数器为 0
                    if(responseError.status === 511) {
                      $rootScope.utilsCount = 0
                      $rootScope.waitWorkCount = 0
                    }
                    if(statusErr!=null){
                        $rootScope.$broadcast(statusErr,true);
                        return null;
                    }
                }
                return $q.reject(responseError);
            },
            requestError:function(requestError){
                return null;
            }
        }
    });

    /*注入$httpProvider*/
    app.config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push('Interceptor');
    }]);
})();
