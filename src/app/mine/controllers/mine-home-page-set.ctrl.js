/**
 * Created by developer on 2017/5/27.
 * 首页设置
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.mine');

    app.controller('HomePageSetCtrl', ['$scope','$state','$rootScope','$ionicNativeTransitions','set_home_page',
        'storageService','T','serverConfiguration','auth_events','MineService','$isMobile','$cordovaToast',
        'stateGoHelp','DBSingleInstance','GetRequestService','jdbc',
        function($scope,$state,$rootScope,$ionicNativeTransitions,set_home_page,storageService,T,serverConfiguration,
                 auth_events,MineService,$isMobile,$cordovaToast,stateGoHelp,DBSingleInstance,GetRequestService,jdbc) {
            $scope.summanyHomePage = T.translate("mine.summany-home-page");
            //工作设置
            $scope.workSettingsRemarks = T.translate("mine.work-settings-remarks");
            $scope.isWork = true;//控制选择工作项
            $scope.isWaitDo = false;//控制选择待办项
            $scope.isContact = false;//控制选择消息项
            $scope.isMine = false;//控制选择我的项
            var setHomePage;//存选择的数据
            var userId = storageService.get(auth_events.userId,null);
            //控制"默认跟踪"的切换按钮的开关, 0:关闭 1:打开
            var isFollowed = storageService.get(auth_events.followed, "0");
            //控制"日志记录"的切换按钮的开关,0:关闭 1:打开
            var isLogRecord = storageService.get(auth_events.logRecode, "0");
            $rootScope.titleData = '显示设置';
            $scope.$on('$ionicView.beforeEnter', function (event,data) {
                $rootScope.hideTabs = true;
                $rootScope.bell = false;
                $rootScope.toBack = true;
                $rootScope.titleData = '显示设置';
              
                /*首页设置,默认为待办*/
                var textFlag = storageService.get(set_home_page.setHomeKey,null);
                if(textFlag == null || textFlag == set_home_page.work){
                    $scope.isWork = true;
                }else if(textFlag == set_home_page.waitWork){
                    $scope.isWaitDo = true;//控制选择待办项
                    $scope.isWork = false;//控制选择工作项
                    $scope.isContact = false;//控制选择联系人项
                    $scope.isMine = false;//控制选择我的项
                }else if(textFlag == set_home_page.information){
                    $scope.isWaitDo = false;//控制选择待办项
                    $scope.isWork = false;//控制选择工作项
                    $scope.isContact = true;//控制选择联系人项
                    $scope.isMine = false;//控制选择我的项
                }else if(textFlag == set_home_page.mine){
                    $scope.isWaitDo = false;//控制选择待办项
                    $scope.isWork = false;//控制选择工作项
                    $scope.isContact = false;//控制选择联系人项
                    $scope.isMine = true;//控制选择我的项
                }

                //切换按钮控制
                if (isFollowed == "1") {
                    angular.element("input[id='followBtnId']").attr('checked', '');

                } else  if(isFollowed == "0"){

                    angular.element("input[id='followBtnId']").removeAttr('checked');
                }

                //"日志记录"切换按钮
                if (isLogRecord == "1") {
                    angular.element("input[id='logBtnId']").attr('checked', '');
                } else  if(isLogRecord == "0"){
                    angular.element("input[id='logBtnId']").removeAttr('checked');
                }
  
                if(!$isMobile.isPC && $isMobile.Android) {
                    if(data.direction === "back"){
                        var transitionDirection = data.direction !== "back" ? "left" : "right";
                        window.plugins.nativepagetransitions.slide({
                          "direction": transitionDirection
                        });
                    }
                }
            });

            /*设置是否跟踪*/
            $scope.setFollow = function(){
                if(isFollowed == "0"){
                    isFollowed = "1";
                }else if(isFollowed == "1"){
                    isFollowed = "0";
                }

                var urlFollow = serverConfiguration.baseApiUrl + "app/common/v1/updateFollowed";
                var paramFollow = {
                    account : userId,
                    followed : isFollowed
                }
                GetRequestService.getRequestData(urlFollow, paramFollow, true, "POST").then(function(result){
                    storageService.set(auth_events.followed,isFollowed);//存储跟踪标记 0:关闭 1:打开
                    if(!$isMobile.isPC){
                        $cordovaToast.showShortBottom(T.translate('mine.followed-success'));
                    }else{
                        alert(T.translate('mine.followed-success'));
                    }

                },function(err){

                    //如果请求失败,将切换按钮回复原状态
                    if (isFollowed == "0") {
                        angular.element("input[id='followBtnId']").attr('checked', '');

                    } else  if(isFollowed == "1"){

                        angular.element("input[id='followBtnId']").removeAttr('checked');
                    }

                    if(!$isMobile.isPC){
                        $cordovaToast.showShortBottom(T.translate('mine.followed-err'));
                    }else{
                        alert(T.translate('mine.followed-err'));
                    }

                });
            }

            /**
             * * 2018/8/23 15:02  CrazyDong
             *  变更描述：
             *  功能说明：设置手机端是否记录请求日志,当关闭的时候清空日志数据库
             */
            $scope.setLogRecord = function(){
                isLogRecord = isLogRecord == "0" ? "1" : "0";
                storageService.set(auth_events.logRecode,isLogRecord);//存储跟踪标记 0:关闭 1:打开
                if(isLogRecord == "0"){
                    var timeDB = DBSingleInstance.getTimeDb();
                    timeDB.transaction(function (tx) {
                        tx.executeSql('DELETE FROM TimeData', [], function (tx, res) {

                        }, function (tx, err) {

                        })
                    });
                }
            }

            /*点击待办*/
            $scope.isWaitDoClick = function(){
                $scope.isWaitDo = !$scope.isWaitDo;
                $scope.isWork = false;
                $scope.isContact = false;
                $scope.isMine = false;
            }

            /*点击工作*/
            $scope.isWorkClick = function(){
                $scope.isWaitDo = false;
                $scope.isWork = !$scope.isWork;
                $scope.isContact = false;
                $scope.isMine = false;
            }

            /*点击联系人*/
            $scope.isContactClick = function(){
                $scope.isWaitDo = false;
                $scope.isWork = false;
                $scope.isContact = !$scope.isContact;
                $scope.isMine = false;
            }

            /*点击我的*/
            $scope.isMineClick = function(){
                $scope.isWaitDo = false;
                $scope.isWork = false;
                $scope.isContact = false;
                $scope.isMine = !$scope.isMine;
            }

            /*保存*/
            $scope.setFinish = function(){
                if($scope.isWaitDo){
                    setHomePage = set_home_page.waitWork;
                }
                if($scope.isWork){
                    setHomePage = set_home_page.work;
                }
                if($scope.isContact){
                    setHomePage = set_home_page.information;
                }
                if($scope.isMine){
                    setHomePage = set_home_page.mine;
                }

                storageService.set(set_home_page.setHomeKey,setHomePage);
                stateGoHelp.stateGoUtils(true,'tab.mine',{},'left');
            }


            /*同步*/
            $scope.syncOperate = function(){
                var urlSync = serverConfiguration.baseApiUrl + "app/home/v1/custom";
                var param = {
                    account : userId
                }
                MineService.getMineData(urlSync,param).then(function(result){
                    if(result.list.length != 0){
                        /**
                         *  2018/9/7 chris.zheng
                         *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
                         *  功能说明：使用websql创建数据库
                         */
                        if ($isMobile.Android) {
                            /**
                             * * 2018/4/9 16:30  CrazyDong
                             *  变更描述：使用单例方式获取
                             *  功能说明：获取同步数据库对象
                             */
                            var db = DBSingleInstance.getSyncDb();
                            /*清空db*/
                            db.transaction(function(tx){
                                tx.executeSql('delete from SyncData',[],function(tx,res){},function (tx,err){
                                })
                            });

                            db.transaction(function(tx){
                                /*插入数据*/
                                tx.executeSql('insert into SyncData values(?)',[result.list],function(tx){
                                        /*判断平台*/
                                        if(!$isMobile.isPC){
                                            $cordovaToast.showShortBottom(T.translate('mine.remarks-success'));
                                        }
                                    },
                                    function (tx,err){})
                            })
                        }else {
                            jdbc.findAll("syncData").then(function(response) {
                                if (response) {
                                    response.forEach(function(element) {
                                        jdbc.remove("syncData", element.id);
                                    });
                                }
                                var _syncData = {};
                                _syncData.id=1;
                                _syncData.syncValue=result.list;
                                jdbc.put("syncData", _syncData);
                            });
                        }
                    }else{
                        if(!$isMobile.isPC){
                            $cordovaToast.showShortBottom(T.translate('mine.remarks-error'));
                        }
                    }

                },function(err){
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate('mine.remarks-fail'));
                    }
                });
            }

            /*返回*/
            $rootScope.$ionicGoBack = function(){
                /*返回上一页*/
                stateGoHelp.stateGoUtils(false);
            }

        }]);

})();
