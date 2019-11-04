// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var app = angular.module('community', [
    'ionic', "ion-datetime-picker", 'pascalprecht.translate',
    'angular-md5', 'ionic-native-transitions',
    'ngCordova', 'ngSQLite', 'oi.select','base64',
    /*用户登录*/
    'community.controllers.auth',
    'community.services.auth',
    /*应用配置*/
    'community.routes', 'community.configs',
    'community.controllers', 'community.services','community.services.utils','community.constant',

    /*我*/
    'community.controllers.mine', 'starter.services.mine',
    /*工作*/
    'community.controllers.work', 'starter.services.work.home',
    /*待办*/
    'community.controllers.waitWork', 'starter.services.wait.work',
    /*查看表单*/
    'community.controllers.viewForm', 'community.services.viewForm', 'community.module.viewForm',

    /*消息*/
    'community.controllers.information',

    /*处理表单*/
    'community.controllers.formHandle',
    /*表单放大*/
    'community.controllers.formEnlargement',
    /*通知*/
    'community.controllers.notification', 'starter.services.notification',

    //手势解锁
    'community.controllers.gestureLock', 'community.services.gestureLock',

    'templates',
    'monospaced.elastic',
    //compile指令
    'community.directive',
    /*返回表单指令部分*/
    'base', 'formComponents',
    //echart指令
    'community.controllers.echarts'
]);

app.run(['$ionicPlatform', '$rootScope', '$isMobile', '$ionicPickerI18n', '$location', '$timeout', '$cordovaToast', '$ionicNativeTransitions',
    'storageService', 'auth_events', '$ionicHistory', '$stateParams', 'mine', '$SQLite', 'DB_CONFIG', 'SQLiteHelper', 'timeout', 'scopeData', 'stateGoHelp',
    'APP', 'DBSingleInstance', 'mobileSocket', 'serverConfiguration',
    function ($ionicPlatform, $rootScope, $isMobile, $ionicPickerI18n, $location, $timeout, $cordovaToast, $ionicNativeTransitions,
              storageService, auth_events, $ionicHistory, $stateParams, mine, $SQLite, DB_CONFIG, SQLiteHelper, timeout, scopeData, stateGoHelp, APP,
              DBSingleInstance, mobileSocket, serverConfiguration) {
        $ionicPlatform.ready(function () {
            $ionicPickerI18n.weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
            $ionicPickerI18n.months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
            $ionicPickerI18n.ok = "确定";
            $ionicPickerI18n.cancel = "取消";
            $ionicPickerI18n.okClass = "button-positive";
            $ionicPickerI18n.cancelClass = "button-stable";

            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                navigator.splashscreen.hide();

                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            if ($isMobile.Android) {
                /**
                 *  2018/9/7 chris.zheng
                 *  变更描述：解决ios的WKWebView在ios部分平台不支持websql 的问题
                 *  功能说明：使用websql创建数据库
                 */

                /*初始化数据库  建立表*/
                $SQLite.dbConfig({
                    name: 'OA',
                    description: 'Test DB',
                    version: '1.0'
                });
                $SQLite.init(function (init) {
                    angular.forEach(DB_CONFIG, function (config, name) {
                        init.step();
                        $SQLite.createTable(name, config).then(init.done);
                    });
                    init.finish();
                });

                /**
                 * * 2018/4/9 16:20  CrazyDong
                 *  变更描述：单例模式
                 *  功能说明：初始化数据库对象
                 */
                DBSingleInstance.initDb();
            }

            if ($isMobile.Android) {
                //Android back键在一级菜单退出App
                var flagBack = true;
                var isBack = true;//控制是否可以返回,默认为true可以返回
                var timeoutTemp;
                /**
                 * * 2018/4/26 11:11  CrazyDong
                 *  变更描述：增加android生命周期监听
                 *  功能说明：监控android生命周期,判断back键状态
                 */
                lifeListener();

                function lifeListener() {
                    LifeListener.lifeListener("life", function (msg) {
                        //App在后台时,执行
                        if (msg == "onStop" || msg == "onPause") {
                            isBack = false;
                            mobileSocket.close();
                        } else if (msg == "onResume" || msg == "onStart") {//App重新进入活跃状态时,执行
                            mobileSocket.connect();
                            timeoutTemp = $timeout(function () {
                                isBack = true;
                            }, 500);
                        }
                        lifeListener();//递归
                    }, null);
                }

                $ionicPlatform.registerBackButtonAction(function (e) {
                    if (isBack) {
                        if ($location.path() == '/tab/work' || $location.path() == '/tab/waitWork'
                            || $location.path() == '/tab/information' || $location.path() == '/tab/mine' || $location.path() == '/login') {
                            flagBack = !flagBack;
                            if (flagBack) {
                                ionic.Platform.exitApp();
                            } else {
                                flagBack = false;
                                $cordovaToast.showShortBottom("再按一次退出系统");
                                $timeout(function () {
                                    flagBack = true;
                                }, 2000);
                            }
                        } else if ($location.path() == '/gesture///setGestureLock////' || $location.path() == '/gesture///resetGestureLock/') {
                            $ionicNativeTransitions.stateGo("tab.mine", {});
                        } else {
                            var currentViewData = $ionicHistory.currentView();
                            if (!($stateParams.workWaitData == undefined || $stateParams.workWaitData == "")) {
                                var workWaitData = angular.fromJson($stateParams.workWaitData);
                                var isWorkFlag = workWaitData.workFlag;
                                var title = workWaitData.title;

                            }

                            if (currentViewData.stateName === 'tab.view-form' || currentViewData.stateName === 'tab.viewFormWork') {
                                var currentViewDataName = $ionicHistory.backView();
                                var stateCurrentViewDataName = scopeData.prototype.getStateCurrentViewDataName();
                                var stateCurrentViewParams = scopeData.prototype.getStateCurrentViewParams();
                                if (currentViewDataName.stateName == 'tab.form-handle' ||
                                    currentViewDataName.stateName == 'tab.form-handle-reply' ||
                                    currentViewDataName.stateName == 'tab.form-enlargement' ||
                                    currentViewDataName.stateName == 'tab.formHandleWork' ||
                                    currentViewDataName.stateName == 'tab.work-form-enlargement'
                                ) {
                                    currentViewDataName.stateName = stateCurrentViewDataName;
                                    currentViewDataName.stateParams = stateCurrentViewParams;
                                    $ionicHistory.goBack();
                                } else {
                                    $ionicHistory.goBack();
                                }
                            } else if (currentViewData.stateName === 'tab.notification-work') {


                                if ($stateParams.type == 'work') {

                                    stateGoHelp.stateGoUtils(true, 'tab.workNotification', {type: $stateParams.type}, 'right');
                                } else if ($stateParams.type == 'mine') {

                                    stateGoHelp.stateGoUtils(true, 'tab.mineNotification', {
                                        type: $stateParams.type

                                    }, 'right');
                                } else if ($stateParams.information == 'information') {

                                    stateGoHelp.stateGoUtils(true, 'tab.notification-item', {
                                        information: $stateParams.information

                                    }, 'right');
                                } else {

                                    stateGoHelp.stateGoUtils(true, 'tab.notification', {
                                        type: $stateParams.type

                                    }, 'right');
                                }

                            } else if (currentViewData.stateName === 'tab.workNotification') {
                                stateGoHelp.stateGoUtils(true, 'tab.work', {}, 'right');
                            } else if (currentViewData.stateName === 'tab.notification') {

                                if ($stateParams.backFlag) {
                                    $ionicNativeTransitions.goBack();//从待办过来时使用,不然data.direction返回值为forward,切换动画就出错
                                } else {
                                    stateGoHelp.stateGoUtils(true, 'tab.waitWork', {}, 'right');
                                }
                            } else if (currentViewData.stateName === 'tab.notification-item') {
                                stateGoHelp.stateGoUtils(true, 'tab.information', {}, 'right');
                            } else if (currentViewData.stateName === 'tab.mineNotification') {
                                stateGoHelp.stateGoUtils(true, 'tab.mine', {}, 'right');
                            } else if (currentViewData.stateName === 'tab.myWorkWaitWork' || currentViewData.stateName === 'tab.doneWork' || currentViewData.stateName === 'tab.waitNews') {
                                stateGoHelp.stateGoUtils(true, 'tab.work', {titleFlag: $stateParams.titleFlag}, 'right');
                            } else if (currentViewData.stateName === 'tab.waitWork') {
                                if (isWorkFlag == 'isWork') {
                                    stateGoHelp.stateGoUtils(true, 'tab.work', {titleFlag: $stateParams.titleFlag}, 'right');
                                } else {
                                    flagBack = !flagBack;
                                    if (flagBack) {
                                        ionic.Platform.exitApp();
                                    } else {
                                        flagBack = false;
                                        $cordovaToast.showShortBottom("再按一次退出系统");
                                        $timeout(function () {
                                            flagBack = true;
                                        }, 2000);
                                    }
                                }
                            } else if (currentViewData.stateName === "tab.signatureWay") {
                                /*存储是否开启审批免输密码*/
                                storageService.set(mine.approveSwitchKey, "false");
                                $ionicNativeTransitions.goBack();
                            }
                            else {

                                $ionicNativeTransitions.goBack();
                            }

                        }
                        return false;
                    }
                }, 101);
            }

            if (!$isMobile.isPC) {
                /*极光推送*/
                window.plugins.jPushPlugin.init();

                /**
                 *  2018/9/7 chris.zheng
                 *  变更描述：关闭生产环境下jpush的调试模式
                 */
                if ($isMobile.Android) {
                    /**
                     * * 2018/7/19 10:00  CrazyDong
                     *  变更描述：极光的统计功能,使用不上,注释掉为了兼容版本,下载极光插件时,低版本没有此方法
                     *  功能说明：
                     */
//                    window.plugins.jPushPlugin.setStatisticsOpen(true);
                    window.plugins.jPushPlugin.setDebugMode(APP.devMode);

                } else if ($isMobile.IOS) {
                    if (APP.devMode) {
                        window.plugins.jPushPlugin.setDebugModeFromIos();
                    }

                    window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
                }

                window.plugins.jPushPlugin.openNotification.alert;

                if ($isMobile.IOS) {
                    //IOS接收消息(APP在前台)
                    var onReceiveNotification = function (event) {
                        $cordovaToast.showShortBottom("您收到一条消息");
                    };
                    //IOS接收消息(APP在后台)
                    var onBackgroundNotification = function (event) {
                        $cordovaToast.showShortBottom("您收到一条消息");
                    };
                    //IOS打开消息
                    var onOpenNotification = function (event) {
                        var waitWorkPassDate = {
                            taskId: event.taskId,
                            procInstId: event.procInstId
                        };

                        jumpToDetail(waitWorkPassDate, event.jumpType);
                    };
                }

                if ($isMobile.Android) {
                    //android接受消息回调
                    window.plugins.jPushPlugin.receiveNotificationInAndroidCallback = function (data) {
                        $cordovaToast.showShortBottom("您收到一条消息");
                    };

                    //android打开消息回调
                    window.plugins.jPushPlugin.openNotificationInAndroidCallback = function (data) {
                        var waitWorkPassDate = {
                            taskId: data.extras.taskId,
                            procInstId: data.extras.procInstId
                        };

                        jumpToDetail(waitWorkPassDate, data.extras.jumpType);
                    };

                    function jumpToDetail(waitWorkPassDate, jumpFlag) {
                        var loginToken = storageService.get(auth_events.token, null);
                        if (loginToken == null) {
                            $cordovaToast.showShortBottom("请先登录系统");
                            $ionicNativeTransitions.stateGo('login', {}, $rootScope.obj);
                        } else {
                            /*跳转类型（1-审批 0-详情）*/
                            if (jumpFlag == "0") {
                                $ionicNativeTransitions.stateGo('tab.view-form', {
                                    titleName: '已发事项', titleFlag: '0', type: 'work',
                                    waitWorkPassDate: angular.toJson(waitWorkPassDate)
                                }, $rootScope.obj);
                            } else if (jumpFlag == "1") {
                                $ionicNativeTransitions.stateGo('tab.view-form', {
                                    waitWorkPassDate: angular.toJson(waitWorkPassDate)
                                }, $rootScope.obj);
                            }
                        }
                    }
                } else if ($isMobile.IOS) {
                    //IOS接收消息(APP在前台)
                    document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
                    //IOS打开消息
                    document.addEventListener("jpush.openNotification", onOpenNotification, false);
                    //IOS接收消息(APP在后台)
                    document.addEventListener("jpush.backgoundNotification", onBackgroundNotification, false);
                }

                //获取getRegistrationID
                function getRegistrationID() {
                    window.plugins.jPushPlugin.getRegistrationID(onGetRegistrationID);
                }

                function onGetRegistrationID(data) {
                    if (data.length == 0) {
                        window.setTimeout(getRegistrationID, 1000);
                    } else {
                        if (data != null) {
                            storageService.set(mine.jPushId, data);
                            SQLiteHelper.setPushId(data);
                        }
                    }
                }

                getRegistrationID();
            }

            if (ionic.Platform.isIPad()) {
                screen.unlockOrientation();
            }
        });
    }]);

app.config(["$translateProvider", '$stateProvider', '$ionicConfigProvider', '$ionicNativeTransitionsProvider',
    function ($translateProvider, $stateProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider) {
        //滑动插件设置--开始
        var transOption = {
            duration: 300,
            slowdownfactor: 10,  // overlap views (higher number is more) or no overlap (1), default 4
            androiddelay: -1,    // same as above but for Android, default -1
            fixedPixelsTop: 0,  // the number of pixels of your fixed header, default 0 (iOS and Android)
            fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
            backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
        };

        var defaultTrans = {
            type: 'slide',
            direction: 'left'
        };

        var backTrans = {
            type: 'slide',
            direction: 'right'
        };

        function setAndroidTrans() {
            $ionicNativeTransitionsProvider.setDefaultOptions(transOption);
            $ionicNativeTransitionsProvider.setDefaultTransition(defaultTrans);
            $ionicNativeTransitionsProvider.setDefaultBackTransition(backTrans);
            $ionicNativeTransitionsProvider.enable(true); // Enable plugin and disable ionic transitions
        }

        $ionicConfigProvider.views.swipeBackEnabled(ionic.Platform.isIOS());
        ionic.Platform.isAndroid() ? setAndroidTrans() : $ionicNativeTransitionsProvider.enable(false);//插件动画设置,IOS使用HTML动画,android使用原生的
        //滑动插件设置--结束

        //tabs运行在手机位置在上面的问题，android有这个问题
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');//将left改为center，解决title居中问题

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
        $ionicConfigProvider.backButton.text("");
        $ionicConfigProvider.backButton.previousTitleText(false);

        $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.views.swipeBackEnabled(false);

        //多语言配置--开始
        var lang = window.localStorage.lang || 'cn';

        $translateProvider.fallbackLanguage(lang);
        $translateProvider.preferredLanguage(lang);
        $translateProvider.useSanitizeValueStrategy('escapeParameters');
        $translateProvider.useStaticFilesLoader({
            prefix: 'locales/',
            suffix: '.json'
        });
        //多语言配置--结束
    }]);

