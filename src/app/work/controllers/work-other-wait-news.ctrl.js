/**
 * Created by developer on 2017/5/27.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.work');
    /*其他应用-事项列表*/
    app.controller('WaitNewsCtrl', ['$scope','$state','$rootScope','$stateParams','$ionicNativeTransitions','serverConfiguration','$timeout','scopeData',
        'storageService','auth_events','$ionicScrollDelegate','timeout','work','wait_work','WaitHomeService','$ionicHistory','$isMobile','$cordovaToast','T','stateGoHelp','$ionicListDelegate','$ionicPopup',
        function($scope,$state,$rootScope,$stateParams,$ionicNativeTransitions,serverConfiguration,$timeout,scopeData,
                 storageService,auth_events,$ionicScrollDelegate,timeout,work,wait_work,WaitHomeService,$ionicHistory,$isMobile,$cordovaToast,T,stateGoHelp,$ionicListDelegate,$ionicPopup) {

            var searchWorkFlag = $stateParams.searchWorkFlag;//从搜索页过来的
            var searchTitle = $stateParams.searchTitle;//收缩的标题

            $rootScope.hideTabs = true;//tab导航不显示
            $scope.WorkNewsListData = [];//已发数据容器
            $scope.doneWorkListData = [];//已办数据容器
            $scope.followWorkListData = [];//跟踪数据容器
            $scope.title = $stateParams.titleName;//当前页的标题
            $scope.workFlag = $stateParams.workFlag;//当前页是从工作页跳转的 以后在查看表单详情时用来做判断
            $scope.titleFlag = $stateParams.titleFlag; //已发是0  已办是1  跟踪是2 待发是3 4是公文 5是知会
          $rootScope.bell = false;//通知的小铃铛图标不显示
            $rootScope.toBack = true;//返回按钮显示
            $scope.userName = storageService.get(auth_events.name,null);//当前用户名
            /**
            * * 2018/4/19 14:23  tyw
            *  变更描述：添加空数据展示页面
            *  功能说明：当请求数据为空时展示一个空数据图标
            */
            $scope.isEmptyData = true;//是否显示空数据界面

            var taskStatusMap = {
                "allBtn": null,
                "pauseBtn": 3,
                "backBtn": 2,
                "readBtn": 1,
                "unreadBtn": 0
            }
            var userId = storageService.get(auth_events.userId,null);

            var typeId = storageService.get(wait_work.sizerWorkTypeKey,null);//事项分类
            var status = taskStatusMap[storageService.get(wait_work.sizerWorkStateKey,"allBtn")];//同意 拒绝 终止
            var subjectSearch = null;//标题
            var createTimeFromSearch = null;//发起开始时间
            var createTimeToSearch = null;//发起结束时间
            var creatorSearch = null;//发起人
            var typeIdDone = $stateParams.typeId;//已办的事项分类typeId

          /**
            * * 2018/4/12 14:23  tyw
            *  变更描述：优化判断条件
            * 从if(a){
            *  if(b){}
            * }else{
            *  if(b){}
            * }
            * 变更为 if(b){
            *  if(a){}
            * }
            *  功能说明：页面加载的时候初始化一些参数 （标题，发起人，开始结束时间）
           */
            if (!($stateParams.searchDataStr == undefined || $stateParams.searchDataStr == "")) {
                var searchDataStr = angular.fromJson($stateParams.searchDataStr);
                subjectSearch = searchDataStr.searchTitle;//标题

                if (searchTitle != 'followWork') {//不是跟踪

                    createTimeFromSearch = searchDataStr.searchStartTime;//发起开始时间
                    createTimeToSearch = searchDataStr.searchEndTime;//发起结束时间
                    if (createTimeFromSearch == "开始时间") {
                        createTimeFromSearch = null;
                    }
                    if (createTimeToSearch == "结束时间") {
                        createTimeToSearch = null;
                    }
                    creatorSearch = searchDataStr.searchName;//发起人
                }

            }

            var titleName = $stateParams.titleName;

            $scope.noti = {};
            var currentPageFlag = 1;

            $scope.$on('$ionicView.beforeEnter', function (event, data) {
              //这个生命周期内的重复的数据不要删除，因为第二次进入的时候只有生命周期会走 外面的数据不会被赋值
                $rootScope.toBack = true;
                $rootScope.hideTabs = true;
                data.enableBack = true;
                $rootScope.bell = false;
                searchWorkFlag = $stateParams.searchWorkFlag;
                searchTitle = $stateParams.searchTitle;

                var currentViewData = $ionicHistory.backView();
                var currentForwardViewData = $ionicHistory.forwardView();

                if(!(currentViewData == null)) {

                    if (currentViewData.stateName == 'tab.view-form' || currentViewData.stateName == 'tab.viewFormWork') {
                        data.direction = 'back';

                        if (!$isMobile.isPC && $isMobile.Android) {
                            if (data.direction === "back") {
                                var transitionDirection = "right";
                                window.plugins.nativepagetransitions.slide ({
                                  "direction": transitionDirection
                                });
                            }
                        }
                    }
                }
                if(!(currentForwardViewData == null)){

                    if(currentForwardViewData.stateName == 'tab.view-form' || currentForwardViewData.stateName == 'tab.viewFormWork'){
                        data.direction = 'back';

                        if(!$isMobile.isPC && $isMobile.Android) {
                            if(data.direction === "back"){
                                var transitionDirection = "right";
                                window.plugins.nativepagetransitions.slide({
                                    "direction": transitionDirection
                                });
                            }
                        }
                    }
                }
              //存入本页的$ionicHistory.currentView().stateName路径地址  在到查看表单页各种乱七八糟操作后返回时确保不会返回错
                scopeData.prototype.setStateCurrentViewDataName($ionicHistory.currentView().stateName);
                scopeData.prototype.setStateCurrentViewParams($ionicHistory.currentView().stateParams);
                storageService.set("viewFormCacheWork",null);//这个是在放大表单页存进去的 在这里置空 因为放大返回后到这页不置空就再次进入查看表单页会出错
                $rootScope.$ionicGoBack = function () {//正确的说 如果想要你写的返回按钮在当前页面内生效，那你必须写在这个生命周期里
                    if($scope.titleFlag == '1' || $scope.titleFlag == '0' ||$scope.titleFlag == '2'||$scope.titleFlag == '4'||$scope.titleFlag == '5'){

                      //如果你是从工作页来的已发已办跟踪公文 那就返回工作页
                      stateGoHelp.stateGoUtils(true, 'tab.work', {},'right');

                    }else {
                      //如果你是待办列表 就回待办页
                      stateGoHelp.stateGoUtils(true, 'tab.waitWork',{},'right');

                    }
                };

                var typeId = storageService.get(wait_work.sizerWorkTypeKey,null);//事项分类
                var status = taskStatusMap[storageService.get(wait_work.sizerWorkStateKey,"allBtn")];//同意 拒绝 终止

                $rootScope.titleData = $scope.title;
                if (data.direction !== "back") {
                    //判断是从别的页面跳来的还不是返回来的
                    $rootScope.titleData = $scope.title;
                    $ionicScrollDelegate.scrollTop();
                    if ($scope.titleFlag == '0') {
                        //请求已发列表
                        requestWorkNewsData(userId, 1, 10, subjectSearch, '', typeId, createTimeFromSearch, createTimeToSearch, "", "", true);
                    } else if ($scope.titleFlag == '1') {
                        //请求已办列表
                        requestDoneWorkData(userId, 1, 10, subjectSearch, status, typeIdDone, creatorSearch, createTimeFromSearch, createTimeToSearch, "end_time_", "", true);
                    } else if ($scope.titleFlag == '2' && !searchTitle) {
                        //请求跟踪列表 这个是没有去搜索的
                        requestFollowWorkData(userId, 1, 10, subjectSearch, typeId, creatorSearch, "", "", true)
                    } else if ($scope.titleFlag == '2' && searchTitle == 'followWork') {
                        //请求跟踪列表 这个是有搜索的
                        requestFollowWorkData(userId, 1, 10, subjectSearch, typeId, null, "", "", true)
                    } else if ($scope.titleFlag == '4') {//公文查询
                        requestWorkDocData(userId, 1, 10, subjectSearch, creatorSearch, createTimeFromSearch, createTimeToSearch, true);
                    } else if ($scope.titleFlag == '5') {//知会事项
                        requestUnderstandingData(userId, 1, 10, subjectSearch, creatorSearch, createTimeFromSearch, createTimeToSearch, true);
                    }
                }
            });
            $scope.$on('$ionicView.enter', function () {//$ionicView.afterEnter
              //返回和小铃铛 因为上一个生命周期有时候不好使 就多写了一遍以防万一
                $rootScope.toBack = true;
                $rootScope.bell = false;
            });
            if($scope.titleFlag == '0'){
              //已发下拉刷新
                $scope.doRefresh = function () {
                    currentPageFlag = 1;
                    $timeout(function () {
                      requestWorkNewsData(userId,1,10,subjectSearch,'',typeId,createTimeFromSearch,createTimeToSearch,
                        "","",false);
                      $scope.$broadcast('scroll.refreshComplete');
                    }, timeout.pullDown);
                }


              //已发上拉加载
                $scope.loadMore = function() {
                    var num = ++currentPageFlag;
                    var url = serverConfiguration.baseApiUrl + "app/sent/v2/getList";
                    var param = {
                      account: userId,//用户账号，pkid
                      currentPage: num,//当前页码
                      pageSize: 10,//每页记录数
                      subject: subjectSearch,//标题
                      taskName : '',//节点名称
                      typeId: typeId,//事项分类
                      createTimeFrom: createTimeFromSearch,//发起开始时间
                      createTimeTo: createTimeToSearch,//发起结束时间
                      orderField: "",//排序字段：默认create_time
                      orderSeq: ""//排序方向：默认desc-[desc,asc]


                    }
                    WaitHomeService.getWaitWorkListData(url, param, false).then (function (result) {
                        $scope.isHasNextPage = result.flagNextPage;
                        $scope.WorkNewsListData = $scope.WorkNewsListData.concat(result.list);
                      for (var i = 0; i < $scope.WorkNewsListData.length; i++) {
                        if ($scope.WorkNewsListData[i].subject && $scope.WorkNewsListData[i].subject.split('¤※').length > 1) {
                          $scope.WorkNewsListData[i].totalNum = $scope.WorkNewsListData[i].subject.split('¤※')[1]
                          $scope.WorkNewsListData[i].totalLetter = convertCurrency($scope.WorkNewsListData[i].totalNum)
                          $scope.WorkNewsListData[i].totalNum = fmoney($scope.WorkNewsListData[i].totalNum)
                        }
                      }
                        $scope.$broadcast ('scroll.infiniteScrollComplete');
                    }, function (err) {
                        if(!$isMobile.isPC){
                          $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    })
                }

            }else if($scope.titleFlag == '1'){
              //已办下拉刷新
                $scope.doRefresh = function () {
                    currentPageFlag = 1;
                    $timeout(function () {
                      requestDoneWorkData (userId,1,10,subjectSearch,status,typeIdDone,
                        creatorSearch,createTimeFromSearch,createTimeToSearch,"end_time_","",false);
                      $scope.$broadcast('scroll.refreshComplete');
                    }, timeout.pullDown);

                }

              //已办上拉加载
                $scope.loadMore = function(){
                    var num = ++currentPageFlag;
                    var url = serverConfiguration.baseApiUrl + "app/done/v2/getList";
                    var param = {
                      account:userId,//用户账号，pkid
                      currentPage:num,//当前页码
                      pageSize:10,//每页记录数
                      subject:subjectSearch,//标题
                      status:status,//agree:同意 reject:驳回 manual_end:终止
                      typeId:typeIdDone,//事项分类
                      creator:creatorSearch,//发起人
                      orderField:"end_time_",//排序字段：默认create_time
                      orderSeq:""//排序方向：默认desc-[desc,asc]

                    }

                    WaitHomeService.getWaitWorkListData(url,param,false).then(function(result){
                        $scope.isHasNextPage = result.flagNextPage;
                        $scope.doneWorkListData = $scope.doneWorkListData.concat(result.list);
                      for (var i = 0; i < $scope.doneWorkListData.length; i++) {
                        if ($scope.doneWorkListData[i].subject && $scope.doneWorkListData[i].subject.split('¤※').length > 1) {
                          $scope.doneWorkListData[i].totalNum = $scope.doneWorkListData[i].subject.split('¤※')[1]
                          $scope.doneWorkListData[i].totalLetter = convertCurrency($scope.doneWorkListData[i].totalNum)
                          $scope.doneWorkListData[i].totalNum = fmoney($scope.doneWorkListData[i].totalNum)
                        }
                      }
                        $scope.$broadcast ('scroll.infiniteScrollComplete');

                    },function(err){
                        if(!$isMobile.isPC){
                          $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    });
                }

            }else if($scope.titleFlag == '2'){
              //跟踪下拉刷新
                $scope.doRefresh = function () {
                    currentPageFlag = 1;
                    $timeout(function () {
                        requestFollowWorkData (userId,1,10,subjectSearch,typeId,
                            creatorSearch,"","",false);
                        $scope.$broadcast('scroll.refreshComplete');
                    }, timeout.pullDown);

                }

              //跟踪上拉加载
                $scope.loadMore = function(){
                    var num = ++currentPageFlag;
                    var url = serverConfiguration.baseApiUrl + "app/follow/v2/getList";
                    var param = {
                        account:userId,//用户账号，pkid
                        currentPage:num,//当前页码
                        pageSize:10,//每页记录数
                        subject:subjectSearch,//标题
                        typeId:typeId,//事项分类
                        creator:creatorSearch,//发起人
                        orderField:"",//排序字段：默认create_time
                        orderSeq:""//排序方向：默认desc-[desc,asc]

                    };

                    WaitHomeService.getWaitWorkListData(url,param,false).then(function(result){
                        $scope.isHasNextPage = result.flagNextPage;
                        $scope.followWorkListData = $scope.followWorkListData.concat(result.list);
                      for (var i = 0; i < $scope.followWorkListData.length; i++) {
                        if ($scope.followWorkListData[i].subject && $scope.followWorkListData[i].subject.split('¤※').length > 1) {
                          $scope.followWorkListData[i].totalNum = $scope.followWorkListData[i].subject.split('¤※')[1]
                          $scope.followWorkListData[i].totalLetter = convertCurrency($scope.followWorkListData[i].totalNum)
                          $scope.followWorkListData[i].totalNum = fmoney($scope.followWorkListData[i].totalNum)
                        }
                      }
                        $scope.$broadcast ('scroll.infiniteScrollComplete');
                    },function(err){
                        if(!$isMobile.isPC){
                          $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    });
                }

            } else if ($scope.titleFlag == '4') {//公文查询
                //公文下拉刷新
                $scope.doRefresh = function () {
                    currentPageFlag = 1;
                    $timeout(function () {
                        requestWorkDocData(userId, 1, 10, subjectSearch, creatorSearch, createTimeFromSearch, createTimeToSearch, true);//公文
                        $scope.$broadcast('scroll.refreshComplete');
                    }, timeout.pullDown);

                }

                //公文上拉加载
                $scope.loadMore = function () {
                    var num = ++currentPageFlag;
                    //公文先用已办接口试用start
                    var url = serverConfiguration.baseApiUrl + "app/document/v1/list";
                    var param = {
                        account: userId,//用户账号，pkid
                        pageNum: num,//当前页码
                        pageSize: 10,//每页记录数
                        subject: subjectSearch,//标题
                        creator: creatorSearch,//发起人
                        startTime: createTimeFromSearch,//开始时间
                        endTime: createTimeToSearch//结束时间

                    };

                    WaitHomeService.getWaitWorkListData(url, param, false).then(function (result) {

                        $scope.workDocListData = $scope.workDocListData.concat(result.list);
                      for (var i = 0; i < $scope.workDocListData.length; i++) {
                        if ($scope.workDocListData[i].subject && $scope.workDocListData[i].subject.split('¤※').length > 1) {
                          $scope.workDocListData[i].totalNum = $scope.workDocListData[i].subject.split('¤※')[1]
                          $scope.workDocListData[i].totalLetter = convertCurrency($scope.workDocListData[i].totalNum)
                          $scope.workDocListData[i].totalNum = fmoney($scope.workDocListData[i].totalNum)
                        }
                      }
                        $scope.isHasNextPage = result.flagNextPage;
                        $scope.$broadcast('scroll.infiniteScrollComplete');

                    }, function (err) {
                        if (!$isMobile.isPC) {
                            $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    });
                }

            } else if ($scope.titleFlag == '5') {//知会事项
                //知会下拉刷新
                $scope.doRefresh = function () {
                    currentPageFlag = 1;
                    $timeout(function () {
                        requestUnderstandingData(userId, 1, 10, subjectSearch, creatorSearch, createTimeFromSearch, createTimeToSearch, true);//公文
                        $scope.$broadcast('scroll.refreshComplete');
                    }, timeout.pullDown);

                }

                //知会上拉加载
                $scope.loadMore = function () {
                    var num = ++currentPageFlag;
                    var url = serverConfiguration.baseApiUrl + "app/understanding/v1/list";
                    var param = {
                        account: userId,//用户账号，pkid
                        pageNum: num,//当前页码
                        pageSize: 10,//每页记录数
                        subject: subjectSearch,//标题
                        creator: creatorSearch,//发起人
                        startTime: createTimeFromSearch,//开始时间
                        endTime: createTimeToSearch//结束时间

                    };

                    WaitHomeService.getWaitWorkListData(url, param, false,'GET').then(function (result) {
                        $scope.workUnderstandingListData = $scope.workUnderstandingListData.concat(result.list);
                      for (var i = 0; i < $scope.workUnderstandingListData.length; i++) {
                        if ($scope.workUnderstandingListData[i].subject && $scope.workUnderstandingListData[i].subject.split('¤※').length > 1) {
                          $scope.workUnderstandingListData[i].totalNum = $scope.workUnderstandingListData[i].subject.split('¤※')[1]
                          $scope.workUnderstandingListData[i].totalLetter = convertCurrency($scope.workUnderstandingListData[i].totalNum)
                          $scope.workUnderstandingListData[i].totalNum = fmoney($scope.workUnderstandingListData[i].totalNum)
                        }
                      }
                        $scope.isHasNextPage = result.flagNextPage;
                        $scope.$broadcast('scroll.infiniteScrollComplete');

                    }, function (err) {
                        if (!$isMobile.isPC) {
                            $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    });
                }

                //删除知会
                $scope.deleteUndData = function (index,undData){
                    var Pop = $ionicPopup.confirm({
                        title: "删除提示",
                        template: '<div"><p>确认删除此条信息？</p></div>',
                        cancelText: "取消",
                        cancelType: 'button-assertive',
                        okText: "确定",
                        okType: 'button-positive',
                        scope: $scope
                    });
                    Pop.then(function (res) {
                        if (res) {
                            var url = serverConfiguration.baseApiUrl + "app/understanding/v1/understandingDel";
                            var param = {
                                account: userId,//用户账号，pkid
                                pkid: undData.pkid
                            }
                            WaitHomeService.getWaitWorkListData(url, param, true, "GET").then(function (result) {
                                if(result.state==0){
                                    $scope.workUnderstandingListData.splice(index, 1);
                                    //数量为0刷新列表
                                    if ($scope.workUnderstandingListData == 0) {
                                        $scope.isEmptyData = true;
                                        $scope.doRefresh();
                                    }
                                }
                            }, function (err) {
                                if (!$isMobile.isPC) {
                                    $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                                }
                            });

                        }
                        //关闭已打开的删除条目
                        $ionicListDelegate.closeOptionButtons();
                    });
                }
            }

            $scope.isallPersonShow = true;//是否显示当前待办人
            $scope.isImgShow = true;//是否显示图片


            /*页面显示控制*/
            if($scope.titleFlag == "3"){
              //待办 你说待办没有个数字 他的内心是不是会很委屈呢
                $scope.isallPersonShow = false;
            }else if($scope.titleFlag == "0"){//已发
                $scope.isallPersonShow = false;
                $scope.isImgShow = false;
            }else if($scope.titleFlag == "1"){//已办
                $scope.isallPersonShow = false;
                $scope.isImgShow = false;
            }else if($scope.titleFlag == "2"){//跟踪
                $scope.isImgShow = false;
            }else if($scope.titleFlag == "4"){//公文
                $scope.isImgShow = false;
            }else if($scope.titleFlag == "5"){//知会
                $scope.isImgShow = false;
            }


            /*跳转搜索*/
            $scope.goSearch = function(){
                    /**
                     * * 2018/4/12 14:23  tyw
                     *  变更描述：参数titleFlag=01234，判断条件从（titleFlag=01234）变为（titleFlag！=3）
                     *  功能说明：由titleFlag判断跳转至哪个页面
                     */
                if(($scope.titleFlag||$scope.titleFlag != "3")){
                    stateGoHelp.stateGoUtils(true,'tab.searchWork', {
                        workFlag:"isWork",titleName:titleName,titleFlag:$scope.titleFlag,typeId:typeIdDone
                    },'left');
                }

            }

            var waitWorkPassDate;//带着有用的数据去下一页 请求用
            /*跳转详情*/
            $scope.goDetails = function(result){
            /**
             * * 2018/4/12 14:23  tyw
             *  变更描述：参数titleFlag=01234，判断条件从（titleFlag=01234）变为（titleFlag！=3）
             *  功能说明：由titleFlag判断跳转至哪个页面
             */

                var paramsMap = {
                    "0": "已发事项",
                    "1": "已办事项",
                    "2": "跟踪事项",
                    "4": "公文查询",
                    "5": "知会事项"
                }
                if (!$scope.titleFlag || $scope.titleFlag == "3") return;
                waitWorkPassDate = {
                    taskId: result.taskId,
                    procInstId: result.id
                }
                if ($scope.titleFlag == '4') {
                    waitWorkPassDate.procInstId = result.procInstId;
                    result.flagRead = '1';//点击后更改状态为已读
                    updateFlagRead(result.pkid);
                }
                if ($scope.titleFlag == '5') {
                    waitWorkPassDate.procInstId = result.procInstId;
                    result.flagRead = '1';//点击后更改状态为已读
                }
                stateGoHelp.stateGoUtils(true, 'tab.viewFormWork', {
                    type: "work",
                    searchWorkFlag: searchWorkFlag,
                    titleName: paramsMap[$scope.titleFlag],
                    waitWorkPassDate: angular.toJson(waitWorkPassDate),
                    titleFlag: $scope.titleFlag
                }, 'left');
            };


               /**
                 * * 2018/4/12 14:23  tyw
                 *  变更描述：提取重复代码
                 *  功能说明：页面刷新后提示更新文字
               */
            var changeNotiText = function(result){
                if(result.list&&result.list.length>0){
                    $scope.isEmptyData = false;
                    $scope.noti.text = "成功更新" + result.list.length + "条信息";
                }else{
                    $scope.noti.text = "没有数据可以更新";
                    $scope.isEmptyData = true;
                }
            }

            //  请求已发列表
            function requestWorkNewsData (account,currentPage,pageSize,subject,taskName,typeId,createTimeFrom,createTimeTo,
                                          orderField,orderSeq,isLoading){
                var url = serverConfiguration.baseApiUrl + "app/sent/v2/getList";
                if(currentPage == 1){
                  currentPageFlag = 1;
                }
                var param = {
                    account:account,//用户账号，pkid
                    currentPage:currentPage,//当前页码
                    pageSize:pageSize,//每页记录数
                    subject:subject,//标题
                    taskName : taskName,//节点名称
                    typeId:typeId,//事项分类
                    createTimeFrom:createTimeFrom,//发起开始时间
                    createTimeTo:createTimeTo,//发起结束时间
                    orderField:orderField,//排序字段：默认create_time
                    orderSeq:orderSeq,//排序方向：默认desc-[desc,asc]
                    isLoading:isLoading

                }

                WaitHomeService.getWaitWorkListData(url,param,isLoading).then(function(result){

                    $scope.WorkNewsListData = result.list;

                    for (var i = 0; i < $scope.WorkNewsListData.length; i++) {
                      if ($scope.WorkNewsListData[i].subject && $scope.WorkNewsListData[i].subject.split('¤※').length > 1) {
                        $scope.WorkNewsListData[i].totalNum = $scope.WorkNewsListData[i].subject.split('¤※')[1]
                        $scope.WorkNewsListData[i].totalLetter = convertCurrency($scope.WorkNewsListData[i].totalNum)
                        $scope.WorkNewsListData[i].totalNum = fmoney($scope.WorkNewsListData[i].totalNum)
                      }
                    }



                    $scope.isHasNextPage = result.flagNextPage;

                    changeNotiText(result)

                },function(err){
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            // 已办处理金额函数
          function convertCurrency(currencyDigits) {

            var tmp = _toCashNumber(currencyDigits);
            if (isNaN(tmp)) return currencyDigits;

            var MAXIMUM_NUMBER = 99999999999.99;
            var CN_ZERO = "零";
            var CN_ONE = "壹";
            var CN_TWO = "贰";
            var CN_THREE = "叁";
            var CN_FOUR = "肆";
            var CN_FIVE = "伍";
            var CN_SIX = "陆";
            var CN_SEVEN = "柒";
            var CN_EIGHT = "捌";
            var CN_NINE = "玖";
            var CN_TEN = "拾";
            var CN_HUNDRED = "佰";
            var CN_THOUSAND = "仟";
            var CN_TEN_THOUSAND = "万";
            var CN_HUNDRED_MILLION = "亿";
            var CN_SYMBOL = "";
            var CN_DOLLAR = "元";
            var CN_TEN_CENT = "角";
            var CN_CENT = "分";
            var CN_INTEGER = "整";
            var integral;
            var decimal;
            var outputCharacters;
            var parts;
            var digits, radices, bigRadices, decimals;
            var zeroCount;
            var zeroLast = false;
            var i, p, d;
            var quotient, modulus;
            currencyDigits = currencyDigits.toString();
            if (currencyDigits == "") {
              return "";
            }
            if (currencyDigits.match(/[^,.\d]/) != null) {
              return "";
            }
            if ((currencyDigits)
              .match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
              return "";
            }
            currencyDigits = currencyDigits.replace(/,/g, "");
            currencyDigits = currencyDigits.replace(/^0+/, "");

            if (Number(currencyDigits) > MAXIMUM_NUMBER) {
              return "";
            }

            parts = currencyDigits.split(".");
            if (parts.length > 1) {
              integral = parts[0];
              decimal = parts[1];

              decimal = decimal.substr(0, 2);
            } else {
              integral = parts[0];
              decimal = "";
            }

            digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE,
              CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
            radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
            bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
            decimals = new Array(CN_TEN_CENT, CN_CENT);

            outputCharacters = "";

            if (Number(integral) > 0) {
              zeroCount = 0;
              //最后一位是否为0
              zeroLast = false;
              for (i = 0; i < integral.length; i++) {
                p = integral.length - i - 1;
                d = integral.substr(i, 1);
                quotient = p / 4;
                modulus = p % 4;
                if (d == "0") {
                  zeroCount++;
                } else {
                  if (zeroCount > 0) {
                    outputCharacters += digits[0];
                  }
                  zeroCount = 0;
                  outputCharacters += digits[Number(d)] + radices[modulus];
                }
                if (modulus == 0 && zeroCount < 4) {
                  outputCharacters += bigRadices[quotient];
                }
                //200.1 显示贰佰元零一角
                if (i == integral.length - 1 && d == "0") {
                  zeroLast = true;
                }
              }
              outputCharacters += CN_DOLLAR;
              if (zeroLast && Number(decimal) > 10) {
                outputCharacters += CN_ZERO;
              }else{
                if (decimal != "") {
                  if(zeroLast && Number(decimal.substr(0,1)) >0){
                    outputCharacters += CN_ZERO;
                  }
                }
              }
            }

            if (decimal != "") {
              for (i = 0; i < decimal.length; i++) {
                d = decimal.substr(i, 1);
                if (d != "0") {
                  if (i != 0) {
                    var dtemp = decimal.substr(0, 1);
                    if (Number(integral) >0 && Number(decimal.substr(0,1) == 0)) {
                      outputCharacters += digits[0];
                    }
                  }
                  outputCharacters += digits[Number(d)] + decimals[i];
                }
              }
            }
            if (outputCharacters == "") {
              outputCharacters = CN_ZERO + CN_DOLLAR;
            }
            if (decimal == "" || decimal == "0" || decimal == "00" || (decimal.toString().length == 1) || (decimal.toString().length > 1 && (Number(decimal).toString()).substr(1, 1) == "0")) {
              outputCharacters += CN_INTEGER;
            }
            outputCharacters = CN_SYMBOL + outputCharacters;
            return outputCharacters;
          }

          function _toCashNumber(x) {
            if (x === null || x === undefined || x === '')
              return '';
            if (typeof x == "string") {
              x = x.replace(/,/g, "");
            }
            var match = x.toString().match(/([$|￥])\d+\.?\d*/);
            if (match) {
              x = x.replace(match[1], '');
            }
            return Number(x);
          }
          // fmoney
          function fmoney(num) {
            return (num + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
          }


            //已办列表
            function requestDoneWorkData (account,currentPage,pageSize,subject,status,typeId,
                                            creator,processTimeFrom,processTimeTo,orderField,orderSeq,isLoading){
                var url = serverConfiguration.baseApiUrl + "app/done/v2/getList";
                // debugger
                if(currentPage == 1){
                  currentPageFlag = 1;
                }
                var param = {
                    account:account,//用户账号，pkid
                    currentPage:currentPage,//当前页码
                    pageSize:pageSize,//每页记录数
                    subject:subject,//标题
                    status:status,//agree:同意 reject:驳回 manual_end:终止
                    typeId:typeId,//事项分类
                    creator:creator,//发起人
                    processTimeFrom:processTimeFrom,
                    processTimeTo:processTimeTo,
                    orderField:orderField,//排序字段：默认create_time
                    orderSeq:orderSeq,//排序方向：默认desc-[desc,asc]
                    isLoading:isLoading
                }

                WaitHomeService.getWaitWorkListData(url,param,isLoading).then(function(result){

                    $scope.doneWorkListData = result.list;
                    // 已办金额合计
                    for (var i = 0; i < $scope.doneWorkListData.length; i++) {
                      if ($scope.doneWorkListData[i].subject && $scope.doneWorkListData[i].subject.split('¤※').length > 1) {
                        $scope.doneWorkListData[i].totalNum = $scope.doneWorkListData[i].subject.split('¤※')[1]
                        $scope.doneWorkListData[i].totalLetter = convertCurrency($scope.doneWorkListData[i].totalNum)
                        $scope.doneWorkListData[i].totalNum = fmoney($scope.doneWorkListData[i].totalNum)
                      }
                    }



                    $scope.isHasNextPage = result.flagNextPage;
                    changeNotiText(result)

                },function(err){
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            //跟踪列表
            function requestFollowWorkData (account,currentPage,pageSize,subject,typeId,creator,orderField,orderSeq,isLoading){
                var url = serverConfiguration.baseApiUrl + "app/follow/v2/getList";
                if(currentPage == 1){
                  currentPageFlag = 1;
                }
                var param = {
                  account:userId,//用户账号，pkid
                  currentPage:currentPage,//当前页码
                  pageSize:pageSize,//每页记录数
                  subject:subject,//标题
                  typeId:typeId,//事项分类
                  creator:creator,//发起人
                  orderField:orderField,//排序字段：默认create_time
                  orderSeq:orderSeq,//排序方向：默认desc-[desc,asc]
                  isLoading:isLoading
                }

                WaitHomeService.getWaitWorkListData(url,param,isLoading).then(function(result){

                    $scope.followWorkListData = result.list;
                  for (var i = 0; i < $scope.followWorkListData.length; i++) {
                    if ($scope.followWorkListData[i].subject && $scope.followWorkListData[i].subject.split('¤※').length > 1) {
                      $scope.followWorkListData[i].totalNum = $scope.followWorkListData[i].subject.split('¤※')[1]
                      $scope.followWorkListData[i].totalLetter = convertCurrency($scope.followWorkListData[i].totalNum)
                      $scope.followWorkListData[i].totalNum = fmoney($scope.followWorkListData[i].totalNum)
                    }
                  }
                    $scope.isHasNextPage = result.flagNextPage;
                    changeNotiText(result)

                },function(err){
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }
            //公文查询
            function requestWorkDocData (account,pageNum,pageSize,subject,creator,startTime,endTime,isLoading){
                var url = serverConfiguration.baseApiUrl + "app/document/v1/list";
                if(pageNum == 1){
                  currentPageFlag = 1;
                }
                var param = {
                  account:account,//用户账号，pkid
                  pageNum:pageNum,//当前页码
                  pageSize:pageSize,//每页记录数
                  subject:subject,//标题
                  creator:creator,//发起人
                  startTime:startTime,//开始时间
                  endTime:endTime,//结束时间
                  isLoading:isLoading
                };

                WaitHomeService.getWaitWorkListData(url,param,isLoading).then(function(result){

                    $scope.workDocListData = result.list;
                    $scope.isHasNextPage = result.flagNextPage;

                    changeNotiText(result)

                },function(err){
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            //更新公文已读状态
            function updateFlagRead (pkid){
                var url = serverConfiguration.baseApiUrl + "app/document/v1/updateFlagRead";
                var param = {
                  pkid:pkid
                }

                WaitHomeService.getWaitWorkListData(url,param,false).then(function(result){

                },function(err){

                });
            }

            //知会事项
            function requestUnderstandingData(account, pageNum, pageSize, subject, creator, startTime, endTime, isLoading) {
                var url = serverConfiguration.baseApiUrl + "app/understanding/v1/list";
                if (pageNum == 1) {
                    currentPageFlag = 1;
                }
                var param = {
                    account: account,//用户账号，pkid
                    pageNum: pageNum,//当前页码
                    pageSize: pageSize,//每页记录数
                    subject: subject,//标题
                    creator: creator,//发起人
                    startTime: startTime,//开始时间
                    endTime: endTime,//结束时间
                    isLoading: isLoading
                };

                WaitHomeService.getWaitWorkListData(url, param, isLoading,"GET").then(function (result) {
                    $scope.workUnderstandingListData = result.list;
                    $scope.isHasNextPage = result.flagNextPage;
                    changeNotiText(result)
                }, function (err) {
                    if (!$isMobile.isPC) {
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

        }]);

})();
