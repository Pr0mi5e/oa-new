(function () {
  'use strict'

  var app = angular.module('community.controllers.viewForm')

  app.controller('viewFormController', ['$scope', '$state', '$timeout', '$stateParams', '$rootScope', 'viewFormService',
    '$ionicHistory', 'storageService', 'auth_events', 'serverConfiguration', 'scopeData', '$cordovaToast',
    '$isMobile', 'T', 'timeout', 'stateGoHelp', 'clone', 'application', '$ionicScrollDelegate', 'appUtils', 'GetRequestService', '$ionicPopup',
    function ($scope, $state, $timeout, $stateParams, $rootScope, viewFormService,
              $ionicHistory, storageService, auth_events, serverConfiguration, scopeData, $cordovaToast,
              $isMobile, T, timeout, stateGoHelp, clone, application, $ionicScrollDelegate, appUtils, GetRequestService, $ionicPopup) {
      $scope.commitBtn = true // 提交错误日志按钮默认显示
      $rootScope.bell = false//小铃铛不显示
      $scope.tableFlag = {//显示表单
        'display': ''
      }

      $rootScope.toBack = true//返回按钮不显示
      $rootScope.titleData = T.translate('form-handle.form-see-title')//title内容
      $scope.title = $stateParams.titleName//前面页面传来的title
      $scope.titleFlag = $stateParams.titleFlag//判断是哪里过来的 0是已发 1是已办  2是跟踪
      $scope.sign = []//签章id
      $scope.mask_content = ''//取回时填写的附言
      $scope.nowFlag = true//当前是否显示
      $scope.zwZz = false // 终止是否显示
      $scope.zwJs = false//结束是否显示
      $scope.workWaitData = $stateParams.workWaitData//带的是工作页面待办跳转时的数据
      $rootScope.isPdfFlag = false//默认不是pdf公文  可缩放
      $scope.noneStyle = {//取回模板的样式
        'display': 'none'
      }
      $scope.showUnderstandingList = false //是否展示只会tab栏
      $scope.loaded = false
      /**
       * * 2018/8/10 16:15  tyw
       *  变更描述：新增两个变量：isios-是否为ios，isLongForm-是否为长表单，动态修改表单详情页容器的overflow-scroll值
       *  功能说明：ios设备overflow-scroll=false时查看pdf无法切换tab页，需要根据平台和表单类型动态修改
       */
      $scope.isios = ionic.Platform.isIOS()
      $scope.isLongForm = false
      $scope.detailCache = {}
      $scope.detailInfoCache = {}
      //判断workWaitData是否有  有则把字符串解开
      if (!($stateParams.workWaitData == undefined || $stateParams.workWaitData == '')) {
        $scope.workWaitData = angular.fromJson($scope.workWaitData)
        var isWorkFlag = $scope.workWaitData.workFlag
      }
      /*从工作模块中跳转过来,所带的flag*/
      if ($stateParams.waitWorkPassDate) {
        var waitWorkPassDate = $stateParams.waitWorkPassDate
        var paramData = angular.fromJson(waitWorkPassDate)
        var procInstId = paramData.procInstId
        var account = storageService.get(auth_events.userId, null)
      }
      var Type = $stateParams.type//判断页面从哪跳过来
      var enlargement = $stateParams.enlargement//从放大表单过来
      var viewScroll = $ionicScrollDelegate.$getByHandle('viewFormScrollHandle')//新需求要求附言和处理打开互斥并且有数据时要自动上移
      var viewScrollForm = $ionicScrollDelegate.$getByHandle('viewFormScrollHandleChild')//控制表单点击更多时,表单数据向上滚动
      $rootScope.hideTabs = true//地步导航栏的显示与否
      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        $rootScope.hideTabs = true
        $rootScope.toBack = true
        data.enableBack = true//交叉路由
        /**
         * * 2018/7/30 14:04  CrazyDong
         *  变更描述：解决返回后,流程图中当前人无法展示姓名的问题
         *  功能说明：注释掉
         */
        //        $scope.auditorNames = [];//流程图内当前人数组
        $scope.readers = []//表单已阅人员数组
        $scope.isTemporary = false//判断弹出框是否弹出
        $scope.zoomingFlag = true//判断表单是否可以缩放
        $rootScope.enableBtn = '0'//zwfcbtn指令控制权限  控制审批页的暂存 终止 不同意是否可以点击
        /**
         * * 2018/8/15 13:27  CrazyDong
         *  变更描述：注释掉,不然进入处理页面后返回,显示放大按钮
         *  功能说明：
         */
        // $rootScope.isPdfFlag = false;//默认不是pdf公文  可缩放
        $scope.nextP = false//判断长表单的上拉显示 默认不显示
        $rootScope.jump = true//表单显示  用于测试长表单卡顿
        viewScrollForm.scrollTop()//进入时,让表单滚到顶部,否则会出现表单滚出可视窗口的现象
        /**
         * * 2018/5/7 16:15  CrazyDong
         *  变更描述：控制"点击加载更多"按钮的位置,竖屏ng-class为true,横屏为false
         *  功能说明：不同状态给予不同的top
         */
        if ($isMobile.isPC) {
          $scope.isShowTop = true
        } else {
          switch (window.orientation) {
            case 0:
              $scope.isShowTop = true
              break
            case 90:
              $scope.isShowTop = false
              break
            case -90:
              $scope.isShowTop = false
              break
          }
        }

        $scope.dataList = []//长表单查看表单页面UI数据
        $scope.data = ''//数据清空
        $scope.tableFlag = {//显示表单
          'display': ''
        }
        $scope.noneStyle = {//取回模板的样式
          'display': 'none'
        }
        /*把App设置成竖屏*/
        if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
          /**
           * * 2018/4/25 16:14  CrazyDong
           *  变更描述：竖屏改为默认
           *  功能说明：测试手机横竖屏
           */
          screen.orientation.lock('default')
        }

        var waitWorkPassDate = $stateParams.waitWorkPassDate
        if (waitWorkPassDate) {
          var paramData = angular.fromJson(waitWorkPassDate)
          var taskId = paramData.taskId
          var procInstId = paramData.procInstId
        }
        $rootScope.titleData = T.translate('form-handle.form-see-title')//查看表单标题
        var account = storageService.get(auth_events.userId, null)
        var Type = $stateParams.type
        var notification = $stateParams.notification//从通知过来
        var stateCurrentViewDataName = scopeData.prototype.getStateCurrentViewDataName()//上一页跳过来时存的stateName
        var stateCurrentViewParams = scopeData.prototype.getStateCurrentViewParams()//上一页跳过来时存的stateParams
        $rootScope.$ionicGoBack = function () {
          $scope.$emit('clearStorageFormData')
          var currentViewData = $ionicHistory.backView()//获取上一页的路径信息 判断返回到哪页
          if (currentViewData.stateName == 'tab.form-handle' ||
            currentViewData.stateName == 'tab.form-handle-reply' ||
            currentViewData.stateName == 'tab.form-enlargement' ||
            currentViewData.stateName == 'tab.formHandleWork' ||
            currentViewData.stateName == 'tab.work-form-enlargement'
          ) {
            currentViewData.stateName = stateCurrentViewDataName
            currentViewData.stateParams = stateCurrentViewParams
            stateGoHelp.stateGoUtils(false)
          } else {
            stateGoHelp.stateGoUtils(false)
          }
        }
        // //更改时间初始化 从 前一页无操作返回时初始化数据丢失问题
        var viewFormCacheWork = storageService.get('viewFormCacheWork', null)
        var backReply = storageService.get('backReply', null)//回复页直接返回的就有值
        var savereply = $stateParams.savereply//回复时候给的变量
        //如果是返回 无论从放大返回还是回复返回还是处理返回
        // || 后面的判断有必要？
        if (data.direction == 'back' || (enlargement !== 'enlargement' && viewFormCacheWork == 'viewFormCacheWork') || (savereply !== 'savereply' && backReply == 'backReply')) {
          $scope.tableFlag = {//返回时  让表单显示
            'display': ''
          }
          $scope.data = $rootScope.dataTimeNewNow//返回时给数据赋值为当前页跳转到各页面前的数据
          $scope.dataList = scopeData.prototype.getLongFormEnlargementData()//获取长表单数据
          //在pad上显示20条数据 点击每次加载20条数据 其他设备上10条start
          var xList = 10
          var xListOnly = 11
          if (ionic.Platform.isIPad()) {
            xList = 20
            xListOnly = 21
          }
          //在pad上显示20条数据 点击每次加载20条数据 其他设备上10条end
          //判断数据是不是有子表  并且子表内数据大于10
          for (var p in $scope.data) {
            for (var sub_p in $scope.data[p]) {
              if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
                if ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > 0) {
                  $scope.data[p][sub_p] = $scope.data[p][sub_p].slice(0, 10)
                  if ($scope.dataList.length == 0) {
                    $scope.nextP = false
                  } else if ($scope.dataList.length < xListOnly) {//如果这个数组的长度小于11 就直接让数据显示赋值给$scope.data
                    $scope.data[p][sub_p] = $scope.dataList
                    $scope.nextP = false
                  } else if ($scope.dataList.length > xList) {//list数组内数据大于10 让他显示前10个
                    $scope.data[p][sub_p] = $scope.dataList.slice(0, xList)
                    $scope.nextP = true
                    $scope.isLongForm = true
                    if (!$isMobile.isPC) {
                      $cordovaToast.showLongBottom('此表单为长数据表单，共' + $scope.dataList.length + '条数据,点击获取更多数据')
                    } else {
                      alert('此表单为长数据表单，共' + $scope.dataList.length + '条数据,点击加载获取更多数据')
                    }
                  }
                  scopeData.prototype.setLongFormEnlargementData($scope.dataList)//长表单数据存成新的 用于放大表单
                }
              }
            }
          }
          storageService.set('viewFormCacheWork', null)//标识符表示不是放大表单页返回
          storageService.removeItem('backReply')//回复页返回的标志
        } else { // 跳转到该页面 - 从列表页，放大页保存，回复页保存
          if (enlargement !== 'enlargement') {// 不是放大页跳转过来，清空存储的表单数据
            /**
             * * 2018/7/19 14:23  tyw
             *  在退出表单详情，审批通过之后清空储存的表单数据
             */
            $scope.$emit('clearStorageFormData')
            // scopeData.prototype.setUserRole(null);
            // scopeData.prototype.setHtmlData(null);
            // scopeData.prototype.setPermissionData(null);
            // storageService.set("viewFormCacheWork",null);//标识符表示不是放大表单页返回
            // $rootScope.dataListENew = [];//放大页面存的长表单数据
            // storageService.removeItem('backReply');//回复页返回的标志

          }
          if (enlargement == 'enlargement') {//放大表单页面跳转
            requestViewFormData(account, taskId, procInstId, true)
            getInfo($scope.myNewTodo, {
              account: account,
              taskId: taskId,
              procInstId: procInstId,
              isLoading: false
            })
            iconShow(true, false)
          } else if (Type == 'work') {//工作页面跳转
            //从工作页面跳过来的逻辑
            if ($scope.titleFlag == '0') {//已发
              iconShow(false, false)
              requestSendWorkFormData(account, procInstId, true)
              getInfo($scope.sent, {account: account, procInstId: procInstId, isLoading: false})
            } else if ($scope.titleFlag == '1') {//已办
              iconShow(false, true)
              requestDoneWorkFormData(account, procInstId, true)
              getInfo($scope.done, {account: account, procInstId: procInstId, isLoading: false})
            } else if ($scope.titleFlag == '2') {//跟踪
              iconShow(false, false)
              requestFollowWorkFormData(account, procInstId, true)
              getInfo($scope.follow, {account: account, procInstId: procInstId, isLoading: false})
            } else if ($scope.titleFlag == '4') {//公文
              iconShow(false, false)
              requestWorkDocDataFormData(account, procInstId, true)
              getInfo($scope.document, {account: account, procInstId: procInstId, isLoading: false})
            } else if ($scope.titleFlag == '5') {//知会
              iconShow(false, false)
              requestUndDataFormData(account, procInstId, true)
              getInfo($scope.understanding, {account: account, procInstId: procInstId, isLoading: false})
            } else if (notification == 'notification') {//通知
              iconShow(true, false)
              requestViewFormData(account, taskId, procInstId, true)
              getInfo($scope.myNewTodo, {
                account: account,
                taskId: taskId,
                procInstId: procInstId,
                isLoading: false
              })
            }
          } else if ($stateParams.notificationDetail == 'notificationDetail') {//消息页面跳转
            console.log(1111111111111111111111111)
            if ($scope.titleFlag == '0') {//已发
              iconShow(false, false)
              requestSendWorkFormData(account, procInstId, true)
              getInfo($scope.sent, {account: account, procInstId: procInstId, isLoading: false})
            } else if ($scope.titleFlag == '4') {//公文
              iconShow(false, false)
              requestWorkDocDataFormData(account, procInstId, true)
              getInfo($scope.document, {account: account, procInstId: procInstId, isLoading: false})
            } else if (notification == 'notification') {//通知
              iconShow(true, false)
              requestViewFormData(account, taskId, procInstId, true)
              getInfo($scope.myNewTodo, {
                account: account,
                taskId: taskId,
                procInstId: procInstId,
                isLoading: false
              })
            }
          } else if (isWorkFlag == 'isWork') {//人事 其他等四项审批
            iconShow(true, false)
            requestViewFormData(account, taskId, procInstId, true)
            /**
             * 如果是查看其他人待办，只请求表单数据，
             * 其他信息（如流程图，审批意见等getInfo()返回的内容不请求）
             * viewOtherWaitWork = true 为查看其他人待办
             */
            if ($rootScope.viewOtherWaitWork) {
              $scope.requestParam = angular.fromJson($stateParams.requestParam)// 从列表页带过来的查询条件
              $scope.totalCount = $scope.requestParam.totalCount
              if (!$scope.cacheIndex) {
                $scope.cacheIndex = $scope.requestParam.index  // 全部数据中的索引
              }
              getListDataCache($scope.cacheIndex)
              // }else{
              //   getInfo($scope.myNewTodo, {
              //     account: account,
              //     taskId: taskId,
              //     procInstId: procInstId,
              //     isLoading: false
              //   })
            }
            getInfo($scope.myNewTodo, {
              account: account,
              taskId: taskId,
              procInstId: procInstId,
              isLoading: false
            })
          } else {
            if (notification == 'notification') {//通知
              iconShow(true, false)
            } else {//待办
              iconShow(true, false)
            }
            requestViewFormData(account, taskId, procInstId, true)
            getInfo($scope.myNewTodo, {
              account: account,
              taskId: taskId,
              procInstId: procInstId,
              isLoading: false
            })
          }


        }

        //判断图标是不是显示
        function iconShow(handleBoolean, backBoolean) {
          $scope.rightHandle = handleBoolean
          $scope.rightBack = backBoolean
        }
      })
      $scope.$on('$ionicView.enter', function () {//部分页面需要在这个生命周期去判断 按钮显示才生效
        $rootScope.hideTabs = true
        $rootScope.bell = false
        $rootScope.toBack = true

        /**
         * * 2018/5/8 14:00  CrazyDong
         *  变更描述：
         *  功能说明：适配手机横竖屏时,底部附言和处理意见的位置
         */
        if ($isMobile.isPC) {
          formContentHeight(true)//固定表单容器高度
        } else {
          switch (window.orientation) {
            case 0:
              formContentHeight(true)//固定表单容器高度
              break
            case 90:
              formContentHeight(false)//固定表单容器高度
              break
            case -90:
              formContentHeight(false)//固定表单容器高度
              break
          }
        }
      })
      $scope.$on('$ionicView.leave', function () {//部分页面需要在这个生命周期去判断 按钮显示才生效
        scopeData.prototype.setCheckFlag(null)
      })
      $scope.rightShow = storageService.get(auth_events.userId, null)//判断是不是当前用户 用于处理意见时显示在左还是右  当前用户在右
      // $scope.approvals = [];//意见
      /*控制分栏数据显示*/
      $scope.itemFlag = '0'
      var type = '0'//0表单，1流程图，2相关文档
      /*切换Tab并获取数据*/
      $scope.changeAct = function (flag) {
        $scope.auditorNames = []//初始化并清空当前人数组,bug2637
        //流程图
        if ($scope.historysList) {
          var historysList = $scope.historysList//返回的流程图信息
          if (historysList.list) {//如果流程图数据存在
            $scope.historyData = angular.fromJson(historysList.list)//获取流程图数据
            angular.forEach($scope.historyData, function (data, index, array) {//遍历流程图数据
              //显示流程图
              if ($scope.historyData[index].status == '待审批') {
                $scope.auditorNames.push($scope.historyData[index].auditorName)
              } else if ($scope.historyData[index].status == '终止' || $scope.historyData[index].status == '结束') {
                $scope.nowFlag = false//当前是否显示
              }
              if ($scope.historyData[index].status == '终止') {
                $scope.zwZz = true
                $scope.zzTime = $scope.historyData[index].completeTime
                $scope.zzName = $scope.historyData[index].auditorName
                $scope.zzOption = $scope.historyData[index].opinion
              } else if ($scope.historyData[index].status == '结束') {
                $scope.zwJs = true
                $scope.jsTime = $scope.historyData[index].completeTime
                $scope.jsName = $scope.historyData[index].auditorName
                $scope.jsOption = $scope.historyData[index].opinion
              }
            })
          }
        }
        //获取意见列表end
        viewScroll.scrollTop()//tabs切换时候,让内容滚到顶部,否则会出现表单滚出可视窗口的现象
        if (flag == 0) {
          type = '0'
          $scope.itemFlag = '0'
        } else if (flag == 1) {
          type = '1'
          $scope.itemFlag = '1'
        } else if (flag == 2) {
          type = '2'
          $scope.itemFlag = '2'
        } else if (flag == 3) {
          type = '3'
          $scope.itemFlag = '3'
        }
      }
      /*切换Tab*/
      $scope.isActiveTab = function (flag) {
        return flag == type ? true : false
      }
      //监听手机横竖屏
      window.addEventListener('orientationchange', function () {
        $timeout(function () {
          viewScrollForm.scrollTop()//旋转屏幕时候,让表单滚到顶部,否则会出现表单滚出可视窗口的现象
          switch (window.orientation) {
            case 0:
              $scope.isShowTop = true
              formContentHeight(true)//固定表单容器高度
              break
            case 90:
              $scope.isShowTop = false
              formContentHeight(false)//固定表单容器高度
              break
            case -90:
              $scope.isShowTop = false
              formContentHeight(false)//固定表单容器高度
              break
          }

          /**
           * * 2018/4/8 14:23  tyw
           *  变更描述：pdf页面翻转适配
           *  功能说明：pdf预览页面翻转时适配屏幕宽度
           */
          formCenter()
        }, 100)

      })
      //在pad上显示20条数据 点击每次加载20条数据 其他设备上10条start
      var xList = 10
      var xListSub = 9
      var xListOnly = 11
      if (ionic.Platform.isIPad()) {
        xList = 20
        xListSub = 19
        xListOnly = 21
      }
      //在pad上显示20条数据 点击每次加载20条数据 其他设备上10条end
      //加载长表单数据
      $scope.loadMore = function () {
        //loading图 上拉时显示
        application.showLoading(true)
        $timeout(function () {
          application.hideLoading()
        }, timeout.max)
        $timeout(function () {//让loading先出来再更新数据
          //判断数据里是不是含有子表  并且子表数据大于10 大于10就分页显示
          for (var p in $scope.data) {
            for (var sub_p in $scope.data[p]) {
              if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
                if ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > 0) {
                  if ($scope.dataList.length - $scope.data[p][sub_p].length < xList) {
                    $scope.data[p][sub_p] = $scope.data[p][sub_p].concat($scope.dataList.slice($scope.data[p][sub_p].length))
                    viewScrollForm.scrollBy(0, heightHandle * 1 / 5, true)//使整个content上移屏幕的1/5
                  } else {
                    $scope.data[p][sub_p] = $scope.data[p][sub_p].concat($scope.dataList.slice($scope.data[p][sub_p].length, $scope.data[p][sub_p].length + xList))
                    if ($scope.dataList.length - $scope.data[p][sub_p].length == 0) {
                      //数据全部加载完毕
                    } else {
                      //                      $scope.longFormNum = '剩' + ($scope.dataList.length - $scope.data[p][sub_p].length) + '条数据未读';
                      viewScrollForm.scrollBy(0, heightHandle * 1 / 4, true)//使整个content上移屏幕的1/4
                    }
                  }
                  if ($scope.data[p][sub_p].length == $scope.dataList.length) {
                    $timeout(function () {
                      $scope.nextP = false
                    }, 2000)
                  } else {
                    $scope.nextP = true
                  }
                  $timeout(function () {
                    application.hideLoading()
                  }, 500)

                }
              }
            }
          }
        }, 10)
      }

      //长表单数据更改（用户更改了表单内数据  用已看的数据替换总数据的前面已看长度的数据）
      function isChangeDataList() {
        for (var p in $scope.data) {
          for (var sub_p in $scope.data[p]) {
            if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
              // if($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > 9 && $scope.dataList.length>10) {
              if ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > xListSub && $scope.dataList.length > xList) {
                $scope.dataList.splice(0, $scope.data[p][sub_p].length)
                $scope.dataList = $scope.data[p][sub_p].concat($scope.dataList)
                scopeData.prototype.setLongFormEnlargementData($scope.dataList)//长表单数据存成新的 用于放大表单
                $scope.tableFlag = {
                  'display': 'none'
                }
                $scope.data[p][sub_p] = $scope.dataList.slice(0, xList)
              }
            }
          }
        }
      }

      /*跳转处理*/
      $scope.clickRightHandle = function () {
        application.showLoading(true)
        // var tempData = angular.copy($scope.data, {})
        $timeout(function () {//让loading先出来再更新数据
          var tempData = angular.copy($scope.data, {})
          console.log($scope.data)
          for (var p in $scope.data) {
            for (var sub_p in $scope.data[p]) {
              if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
                //将所有的data都给$scope.data  用来做验证
                if (($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > xListSub && $rootScope.dataListENew.length > xList) || ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > xListSub && $scope.dataList.length > xList)) {
                  if (enlargement == 'enlargement') {//放大表单页保存过来的
                    $rootScope.dataListENew.splice(0, $scope.data[p][sub_p].length)
                    $rootScope.dataListENew = $scope.data[p][sub_p].concat($rootScope.dataListENew)
                    scopeData.prototype.setLongFormEnlargementData($rootScope.dataListENew)//长表单数据存成新的 用于放大表单
                    $scope.tableFlag = {
                      'display': 'none'
                    }
                    tempData[p][sub_p] = $rootScope.dataListENew
                  } else {
                    $scope.dataList.splice(0, $scope.data[p][sub_p].length)
                    $scope.dataList = $scope.data[p][sub_p].concat($scope.dataList)
                    scopeData.prototype.setLongFormEnlargementData($scope.dataList)//长表单数据存成新的 用于放大表单
                    $scope.tableFlag = {
                      'display': 'none'
                    }
                    tempData[p][sub_p] = $scope.dataList
                  }
                }
              }
            }
          }

          $timeout(function () {
            application.hideLoading()
          }, timeout.max)
          $scope.rightHandle = true//处理图标显示
          $scope.rightBack = false//取回不显示
          var waitWorkPassDate = {
            taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
            procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId
          }
          //表单验证
          $timeout(function () {//用来重新刷新页面 触发脏值检测

            var signData = {data: tempData, sign: $scope.sign}//带到处理审批页的数据
            scopeData.prototype.setSignData(signData)//如果是长表单这数据有可能更改于是在这里重新存入最新的数据
            /**
             * * 2018/9/29 16:50  CrazyDong
             *  变更描述：表单数据data丢失,提前做拦截,bug3850
             *  功能说明：判断表单数据是否为空,不为空再判断从表数据是否为空,
             *           从表数据不为空再判断存在getSignData中的从表和存在getLongFormEnlargementData中的从表是否一致
             */

            var temp = scopeData.prototype.getSignData().data
            if (angular.equals([], temp) || angular.equals({}, temp) || temp == null || temp == undefined) {
              appUtils.showTips('view-form.form-data-null', true, 2)
              application.hideLoading()
              return
            } else {
              //判断是否有从表
              for (var p in temp) {
                for (var sub_p in temp[p]) {
                  if (temp[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
                    var tempTable = scopeData.prototype.getLongFormEnlargementData()//获取从表数据
                    if (tempTable == '') {
                      //判断从表是否为空
                      appUtils.showTips('view-form.form-data-null', true, 2)
                      application.hideLoading()
                      return
                    } else {
                      //判断主从表数据是否一致
                      var tempTableFirst = (temp[p][sub_p])//获取getSignData中从表第一条
                      // console.log('总数据第一条', tempTableFirst)
                      // console.log('存的表单数据', tempTable[0])
                      // for (var key in tempTableFirst) {
                      //   if (tempTableFirst[key] != tempTable[0][key]) {
                      //     appUtils.showTips('view-form.table-form-different', true, 2)
                      //     application.hideLoading()
                      //     return
                      //   }
                      // }
                      /**
                       * 判断从表长度
                       */
                      // if(tempTableFirst.length !== scopeData.prototype.getLongFormEnlargementData().length) {
                      //   appUtils.showTips('view-form.table-form-different', true, 2)
                      //   application.hideLoading()
                      //   return false
                      // }
                      /**
                       * 从表的 ref_id_ 属性和主表的 id_ 属性相等，则是同一个表单的数据
                       * 从表的 id_ 属性和 ref_id_ 属性同时为空字符串时，则这一条从表数据是用户新增的，这条数据不做对比校验
                       */
                      for(var subKey in tempTableFirst){
                        var item = tempTableFirst[subKey]
                        if(item['id_'] !== '' && item['ref_id_'] !== '') {
                          if(item['ref_id_'] !== temp[p]['id_']) {
                            appUtils.showTips('view-form.table-form-different', true, 2)
                            application.hideLoading()
                            return false
                          }
                        }
                      }
                    }
                    /**
                     * 判断深拷贝的主表数据和绑定到scope上的主表数据是否一致
                     */
                    for(var key in $scope.data){
                      if(temp[p]['id_'] !== $scope.data[key]['id_']) {
                        appUtils.showTips('view-form.table-form-different', true, 2)
                        application.hideLoading()
                        return false
                      }
                    }
                  }
                }
              }
            }

            if ($scope.data) {
              if (viewFormService.form_check($scope, 0)) {
                stateGoHelp.stateGoUtils(true, 'tab.form-handle', {
                  workWaitData: angular.toJson($scope.workWaitData),
                  waitWorkPassDate: angular.toJson(waitWorkPassDate),
                  titleFlag: '3',
                  notification: $stateParams.notification,
                  information: $stateParams.information,
                  type: $stateParams.type,
                  notificationDetail: $stateParams.notificationDetail
                }, 'left')
                $timeout(function () {
                  application.hideLoading()
                }, 500)
              } else {//验证失败的时候页面数据显示
                $scope.tableFlag = {
                  'display': ''
                }
                /**
                 * * 2018/5/11 9:18  CrazyDong
                 *  变更描述：不去掉,会在长表单中重复增加数据
                 *  功能说明：不重新加入数据
                 */
                //                sortSubTabelByXH($scope.data);
                $timeout(function () {
                  application.hideLoading()
                }, 500)
              }
            }
          }, 300)

        }, 10)

      }
      //取回点击
      $scope.clickRightBack = function () {
        $scope.rightHandle = false//处理不显示
        $scope.rightBack = true//取回显示
        $scope.isTemporary = true//取回模板弹出
        $scope.noneStyle = {//解决 多次点击取回  取回按钮不触发 的问题
          'display': ''
        }

      }
      $scope.mask_content = ''//输入框内容
      $scope.msgMaskLength = 0//发送的信息的字数长度
      $scope.allMaskLength = 0//输入框信息与发送的信息的字数长度总和
      //监视取回时附言的长度
      $scope.$watch('mask_content', function (newValue, oldValue, scope) {
        $scope.allMaskLength = newValue.length + $scope.msgMaskLength
        if ($scope.allMaskLength > 30) {//总长度不得大于30
          $scope.mask_content = oldValue
          appUtils.showTips('view-form.mask-max-err', true, 2)
        }
      })
      //取回时弹出确认框确认按钮
      $scope.goYes = function () {
        // 小于30个字就请求 大于30个字就提示
        // 附言长度大于0
        if ($scope.allMaskLength < 31 && $scope.allMaskLength > 0) {
          doneFormRetrieve(account, procInstId, $scope.mask_content, true)
          $scope.isTemporary = false
        } else {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('view-form.mask-length-err'))
          } else {
            alert(T.translate('view-form.mask-length-err'))
          }
        }
      }
      $scope.goCancel = function () {//取消取回模板
        $scope.isTemporary = false//取回模板不显示
      }
      //回复
      $scope.replyData = function (pkid) {
        isChangeDataList()//如果是长表单 有可能可以操作子表 就把看过的子表和没看过的子表合并 保证是最新的操作过的数据
        var waitWorkPassDate = {
          taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
          procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId,
          pkid: pkid
        }
        stateGoHelp.stateGoUtils(true, 'tab.form-handle-reply', {
          waitWorkPassDate: angular.toJson(waitWorkPassDate),
          workWaitData: angular.toJson($scope.workWaitData),
          reply: 'reply',
          title: $scope.title,
          type: Type,
          titleFlag: $scope.titleFlag,
          information: $stateParams.information,
          notification: $stateParams.notification,
          NotificationItem: $stateParams.NotificationItem,
          notificationDetail: $stateParams.notificationDetail
        }, 'left')
      }
      //表单双指缩放
      $scope.onFormScroll = function (init) {
        var scaleWrapper = angular.element('ion-view.need-form[nav-view="active"]').find('.scaleWrapper')//获取控制缩放的包裹容器
        if (!scaleWrapper.parent()[0]) {
          formCenter()
          return false
        }
        var transform = init ? scaleWrapper.parent()[0].style.transform : 'transform:scale(1)'
        var scaleNum = parseFloat(transform.substring(transform.indexOf('scale(') + 6))//获取父容器缩放比例
        var form = document.getElementsByClassName('zw_formdata').length ? document.getElementsByClassName('zw_formdata') : [{clientWidth: 1}]//获取表单长度
        var formwidth = form[form.length - 1].clientWidth
        var scale = (window.innerWidth - 20) / formwidth//计算缩放比例
        var finalScale = init == 'init' ? scale : scale * scaleNum * scaleNum
        /**
         * * 2018/5/15 9:18  tyw
         *  变更描述：当屏幕长度大于表单长度时，缩放原点会默认成表单的左上点，不是屏幕的左上点；而当屏幕长度小于表单长度时，情况会相反。针对这两种情况做不同的原点适配
         *  功能说明：bug911:ipad或者手机横屏时，表单位置不正常
         */
        var origin = scale >= 1 ? 'top' : 'top left'
        scaleWrapper.css({
          'transform': 'scale(' + finalScale + ')',
          'transform-origin': origin,
          'overfolw': 'scroll'
        })//对包裹容器scale赋值
        var ionscroll = angular.element('ion-view.need-form[nav-view="active"]').find('.scroll')
        ionscroll.css({height: '100%'})
        /**
         * * 2018/8/16 9:18  tyw
         *  变更描述：动态适配pdf iframe的高度
         */
        var pdfiframe = document.getElementById('pdfiframe')
        pdfiframe.innerHTML = 'iframe[name=iframeId]{ height: ' + document.getElementById('heightScroll').offsetHeight / finalScale + 'px!important;}'
      }
      /*跳转表单放大页面*/
      $scope.goEnlargement = function () {
        isChangeDataList()//如果是长表单 有可能可以操作子表 就把看过的子表和没看过的子表合并 保证是最新的操作过的数据
        var waitWorkPassDate = {
          taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
          procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId
        }
        // debugger
        if (Type == 'work') {//工作里面,跳转处理的路由
          stateGoHelp.stateGoUtils(true, 'tab.work-form-enlargement', {
            waitWorkPassDate: angular.toJson(waitWorkPassDate),
            type: 'work',
            information: $stateParams.information,
            titleFlag: $scope.titleFlag,
            workWaitData: angular.toJson($scope.workWaitData),
            notification: $stateParams.notification,
            NotificationItem: $stateParams.NotificationItem,
            notificationDetail: $stateParams.notificationDetail
          }, 'left')
        } else if (isWorkFlag == 'isWork') {//工作的待办
          // stateGoHelp.stateGoUtils(true, 'tab.work-form-enlargement', // 解决工作待办进放大页面，再返回表单页，表单移位问题
          stateGoHelp.stateGoUtils(true, 'tab.form-enlargement', {
            waitWorkPassDate: angular.toJson(waitWorkPassDate),
            information: $stateParams.information,
            titleFlag: $scope.titleFlag,
            workWaitData: angular.toJson($scope.workWaitData),
            notification: $stateParams.notification,
            type: $stateParams.type,
            NotificationItem: $stateParams.NotificationItem,
            notificationDetail: $stateParams.notificationDetail
          }, 'left')
        } else {//待办
          stateGoHelp.stateGoUtils(true, 'tab.form-enlargement', {
            waitWorkPassDate: angular.toJson(waitWorkPassDate),
            information: $stateParams.information,
            titleFlag: $scope.titleFlag,
            notification: $stateParams.notification,
            type: $stateParams.type,
            NotificationItem: $stateParams.NotificationItem,
            notificationDetail: $stateParams.notificationDetail
          }, 'left')
        }
      }
      var heightHandle = window.innerHeight//获取屏幕的高度
      /*附言*/
      $scope.goPostscript = function () {

        if ($scope.isA) {
          //如果处理意见之前打开了并且里面有数据 那么就触发了上移的动作 这里就给清空
          viewScroll.scrollTop()
        }
        if ($scope.flagPostscript == '1' && !$scope.postscriptFlag) {//附言有小红点
          viewScroll.scrollBy(0, heightHandle * 2 / 3, true)//使整个content上移屏幕的三分之二
          $scope.isP = true//下面处理意见的时候做判断用  用处和isA一样
        } else {
          $scope.isP = false
        }
        $scope.postscriptFlag = !$scope.postscriptFlag//附言的开关
      }

      function goPostscript() {
        var othersList = $scope.others || JSON.parse($scope.cacheRequestData.others)//返回的附言 处理意见 及其附件
        if (othersList.postscripts) {//如果附言存在
          var tempPostscripts = []
          tempPostscripts = JSON.parse(othersList.postscripts)
          angular.forEach(tempPostscripts, function (data, index, array) {
            tempPostscripts[index].postscriptsAttachments = angular.fromJson(array[index].attachments)
            tempPostscripts[index].content.replace(/\n/g, '<br>')//附言要去格式 有换行的就要有换行
          })
        }
        $scope.postscripts = tempPostscripts
        $scope.opinionFlag = false//与处理意见互斥 使处理意见关闭
      }

      /*处理意见*/
      $scope.goOpinionProcessing = function () {
        var othersList = $scope.others || JSON.parse($scope.cacheRequestData.others)//返回的附言 处理意见 及其附件
        if (othersList.approvals) {//如果处理意见存在
          var tempApprovals = [], tempReplys = [], tempApprovalAttachments = []
          // $scope.approvals = angular.fromJson(othersList.approvals);//获得处理意见
          // $scope.allAttachments = angular.fromJson(othersList.allAttachments);//获得所有附件加入到自定义所有附件数组
          // angular.forEach($scope.approvals, function (data, index, array) {//遍历处理意见数组
          //   $scope.approvals[index].replys = angular.fromJson(array[index].replys);//获取回复的内容
          //   $scope.approvals[index].approvalAttachments = angular.fromJson(array[index].approvalAttachments);//获取处理意见附件
          //   $scope.replys = $scope.approvals[index].replys;//自定义一个回复的数组 将获得的回复的内容加入进去
          //   $scope.approvalAttachments = $scope.approvals[index].approvalAttachments;//自定义一个处理意见附近的数组 将获得的处理意见附件的内容加入进去
          //   angular.forEach($scope.replys, function (data, index, array) {//遍历回复数组
          //     //获取回复内的回复附件
          //     $scope.replys[index].replayAttachments = angular.fromJson(array[index].replayAttachments);
          //   })
          // });
          tempApprovals = angular.fromJson(othersList.approvals)//获得处理意见

          angular.forEach(tempApprovals, function (data, index, array) {//遍历处理意见数组
            tempApprovals[index].replys = angular.fromJson(array[index].replys)//获取回复的内容
            tempApprovals[index].approvalAttachments = angular.fromJson(array[index].approvalAttachments)//获取处理意见附件
            tempReplys = tempApprovals[index].replys//自定义一个回复的数组 将获得的回复的内容加入进去
            tempApprovalAttachments = tempApprovals[index].approvalAttachments//自定义一个处理意见附近的数组 将获得的处理意见附件的内容加入进去
            angular.forEach(tempReplys, function (data, index, array) {//遍历回复数组
              //获取回复内的回复附件
              tempReplys[index].replayAttachments = angular.fromJson(array[index].replayAttachments)
            })
          })
          $scope.approvals = tempApprovals
          $scope.replys = tempReplys
        }
        $scope.postscriptFlag = false//与附言互斥 使附言关闭
        if ($scope.isP) {
          //如果之前附言内有内容并且被打开  然后上移了  这里就清空那个动作
          viewScroll.scrollTop()
        }
        if ($scope.flagApproval == '1' && !$scope.opinionFlag) {//处理意见有小红点
          setTimeout(function () {
            viewScroll.scrollTo(0, heightHandle * 2 / 3, true)
          }, 100)//使页面上移屏幕的三分之二
          $scope.isA = true//上面附言的时候做判断用  用处和isP一样
        } else {
          $scope.isA = false
        }
        $scope.opinionFlag = !$scope.opinionFlag//处理意见的开关

      }
      $scope.getAudio = function (pkid) {//播放录音
        $scope.url = serverConfiguration.baseApiUrl + 'app/attachment/showVideo?pkid=' + pkid
        var myMedia = new Media($scope.url)//播放这个路径的语音
        myMedia.play()
      }
      $scope.approvalAttachments = []//意见附件
      $scope.replys = []//意见回复
      $scope.allAttachments = []//文档
      // $scope.auditorNames = [];//流程图内的名字
      $scope.postscriptsAttachments = []//附言附件
      $scope.nowTime = new Date()//流程图当前时间
      $scope.readers = []//表单已阅人员数组
      $scope.dataList = []//长表单查看表单页面UI数据
      $scope.nextP = false//判断长表单的上拉显示 默认不显示

      /**
       * 提交 bug 信息
       */
      $scope.commitError = function () {
        var errorMsg = localStorage.getItem('errorMsg')
        console.log(errorMsg)
        var url = serverConfiguration.baseApiUrl + 'app/common/uploadError'

        var param = {
          errorMsg: errorMsg,
          account: storageService.get(auth_events.userId, null)
        }
        GetRequestService.getRequestData(url, param, true, 'POST').then(function (result) {
          console.log(result)
          if (result.success) {
            var alertPopup = $ionicPopup.alert({
              title: '提示',
              template: '提交成功'
            })
          } else {
            var alertPopup = $ionicPopup.alert({
              title: '提示',
              template: '提交失败'
            })
          }
        }, function (err) {
          /*判断平台*/
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      //适配表单
      function formCenter() {

        $timeout(function () {
          $scope.onFormScroll('init')
        }, 100)


      }

      /**
       * 对从表数据根据序号排序
       */
      function sortSubTabelByXH($scopeData) {
        //判断数据内是不是有子表
        for (var p in $scopeData) {
          for (var sub_p in $scopeData[p]) {
            if ($scopeData[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
              //有子表就进行子表排序
              $scopeData[p][sub_p] = $.fn.sortSubTable($scopeData[p][sub_p], 'seqnum', 'asc')
              //获取子表长度依次显示
              if ($scopeData[p][sub_p] != undefined && $scopeData[p][sub_p].length > 0) {
                //放大页保存回来的直接取dataList值
                if (enlargement == 'enlargement') {
                  $scope.dataList = scopeData.prototype.getLongFormEnlargementData()//获取长表单数据

                } else {
                  /**
                   * * 2018/12/11 11:14  CrazyDong
                   *  变更描述：bug3850
                   *  功能说明：清空从表的module存储值
                   */
                  scopeData.prototype.setLongFormEnlargementData('')//长表单数据存成新的 用于放大表单
                  //不是放大页保存回来的把子表内的数据遍历给dataList
                  for (var i = 0, l = ($scopeData[p][sub_p].length); i < l; i++) {
                    $scope.dataList.push(($scopeData[p][sub_p])[i])//查看表单页的UI数据
                  }
                }
                //判断dataList数组的长度  然后根据条件不同在页面显示不同
                if ($scope.dataList.length == 0) {
                  $scope.nextP = false
                } else if ($scope.dataList.length < xListOnly) {//如果这个数组的长度小于11 就直接让数据显示赋值给$scope.data
                  $scopeData[p][sub_p] = $scope.dataList
                  $scope.nextP = false
                } else if ($scope.dataList.length > xList) {//list数组内数据大于10 让他显示前10个
                  $scopeData[p][sub_p] = $scope.dataList.slice(0, xList)
                  $scope.nextP = true
                  $scope.isLongForm = true
                  if (!$isMobile.isPC) {
                    $cordovaToast.showLongBottom('此表单为长数据表单，共' + $scope.dataList.length + '条数据,点击获取更多数据')
                  } else {
                    alert('此表单为长数据表单，共' + $scope.dataList.length + '条数据,点击加载获取更多数据')
                  }
                }
                scopeData.prototype.setLongFormEnlargementData($scope.dataList)//长表单数据存成新的 用于放大表单
              }
            }
          }
        }
        return $scopeData
      }

      /**
       * 2019-05-17 15:15
       * Gao
       * 表单详情报错弹窗提示
       * 判断依据 result.state 为 -1
       */
      var confirmBack = function (result, isBack) {
        var Pop = $ionicPopup.alert({
          title: T.translate('publicMsg.popTitle'),
          template: result.msg,
          okText: T.translate('publicMsg.sure'),
          okType: 'button-positive'
        })
        Pop.then(function (res) {
          if (isBack) {
            // 直接调用返回方法
            $rootScope.$ionicGoBack()
          }
        }).catch(function (error) {
          console.log(error)
        })
      }

      /*请求待办表单详情数据*/
      function requestViewFormData(account, taskId, procInstId, isLoading, isCache, index) {
        var url = serverConfiguration.baseApiUrl + ($rootScope.viewOtherWaitWork ? 'app/ctl/othertodo/v1/getOtherTodoDetail' : 'app/myNewTodo/v1/getDetail')
        var param = {account: account, taskId: taskId, procInstId: procInstId, isLoading: isLoading}
        //请求数据
        if ($rootScope.viewOtherWaitWork) {
          var param = {
            todoUserCode: $rootScope.todoUserCode,
            taskId: taskId,
            procInstId: procInstId,
            isLoading: isLoading
          }
        }
        viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
          // $scope.waitWork = true
          if (isCache) {
            console.log('cache')
            $scope.detailCache[index] = result
          } else {
            if (result.state == '0') {
              console.log('request')
              waitWorkRequestSuccess(result)
            } else if (result.state == -1) {
              confirmBack(result, true)
            }
          }
        }, function (error) {
          console.log(error)
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      function waitWorkRequestSuccess(result) {
        $scope.cacheRequestData = result
        var tempData = {}
        var dataList = JSON.parse(result.form)//返回的表单及数据及权限等
        var formData = dataList.list//进一步获取表单及数据 权限
        var listData = formData[0]
        var permission = listData.permission//返回的permission权限
        var understandingList = listData.ccstatus  // 知会
        $scope.understandingList = understandingList
        understandingList.forEach(function (item, index) {
          item.status == '已读' ? $scope.showUnderstandingList = true : null
        })
        if (listData.form !== undefined) {//如果表单存在
          var oneData = listData.form//返回的form对象
          var htmlData = oneData.formHtml//返回的表单
        } else {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('view-form.form-empty'))
          } else {
            alert(T.translate('view-form.form-empty'))
          }
        }

        //表单放入页面start
        if (enlargement == 'enlargement') {//如果是放大页保存
          $scope.data = {}//清空data
          $rootScope.dataTimeNew = scopeData.prototype.getUserRole()//获取在放大页存入的数据
          $scope.data = clone.cloneData($rootScope.dataTimeNew)//将放大页的世界克隆
          $scope.data = sortSubTabelByXH($scope.data)//进行子表排序及长表单分页
          $scope.htmlContent = scopeData.prototype.getHtmlData()//获取HTML
          $scope.permission = scopeData.prototype.getPermissionData()//获取权限
          var signData = {data: $scope.data, sign: $scope.sign}
          scopeData.prototype.setSignData(signData)

        } else {
          $scope.data = listData.data//获取数据
          $scope.data = sortSubTabelByXH($scope.data)//子表排序及长表单分页
          $scope.htmlContent = htmlData//获取HTML
          scopeData.prototype.setHtmlData(htmlData)
          $scope.permission = permission//获取权限
          var signData = {data: $scope.data, sign: $scope.sign}
          scopeData.prototype.setUserRole($scope.data)
          scopeData.prototype.setSignData(signData)
          scopeData.prototype.setPermissionData($scope.permission)
        }
        $scope.loaded = true
        //适配表单
        formCenter()
      }

      //请求成功后  共用
      function requestScuess(result) {
        $scope.cacheRequestData = result
        // $scope.goPostscript()
        var tempData = {}
        var dataList
        if (result.form) {
          dataList = JSON.parse(result.form)//返回的表单及数据及权限等
          // debugger
          if (dataList.list[0].ccstatus) {
            $scope.understandingList = dataList.list[0].ccstatus//返回的流程图信息
            //是否展示知会tab
            $scope.understandingList.forEach(function (item, index) {
              item.status == '已读' ? $scope.showUnderstandingList = true : null
            })
          }
        }
        // if (result.others) {
        //   var othersList = JSON.parse(result.others);//返回的附言 处理意见 及其附件
        // }


        // $scope.flagPostscript = othersList.flagPostscript;//是否有附言的标志 true就是有
        // $scope.flagApproval = othersList.flagApproval;//是否有处理意见的标志 true就是有
        var formData = dataList.list//进一步获取表单及数据 权限
        var listData = formData[0]
        var permission = listData.permission//返回的permission
        if (listData.form !== undefined) {
          var oneData = listData.form//返回的form
          var htmlData = oneData.formHtml
        } else {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('view-form.form-empty'))
          } else {
            alert(T.translate('view-form.form-empty'))
          }
        }
        // if (othersList.approvals){
        //   $scope.allAttachments = angular.fromJson(othersList.allAttachments);//获得所有附件加入到自定义所有附件数组
        // }

        tempData.data = listData.data
        $scope.data = sortSubTabelByXH(tempData.data)
        $scope.htmlContent = htmlData
        scopeData.prototype.setHtmlData(htmlData)
        $scope.permission = permission
        var signData = {data: $scope.data, sign: $scope.sign}
        scopeData.prototype.setUserRole($scope.data)
        scopeData.prototype.setSignData(signData)
        scopeData.prototype.setPermissionData($scope.permission)
        formCenter()

      }

      /*已办表单详情数据*/
      function requestDoneWorkFormData(account, procInstId, isLoading) {
        var url = serverConfiguration.baseApiUrl + 'app/done/v1/getDetail'
        var param = {account: account, procInstId: procInstId, isLoading: isLoading}
        //请求数据
        viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
          if (result.state == '0') {
            requestScuess(result)

          } else {
            // if (!$isMobile.isPC) {
            //   $cordovaToast.showShortBottom(T.translate(result.msg));
            // } else {
            //   alert(T.translate(result.msg))
            // }
            confirmBack(result, true)
          }
        }, function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /*已发表单详情数据*/
      function requestSendWorkFormData(account, procInstId, isLoading) {
        var url = serverConfiguration.baseApiUrl + 'app/sent/v1/getDetail'
        var param = {account: account, procInstId: procInstId, isLoading: isLoading}
        //请求数据
        viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
          if (result.state == '0') {
            requestScuess(result)
            //公文已阅功能start
            if (result.readers) {
              $scope.readers = angular.fromJson(result.readers)
              $scope.readerDatas = $scope.readers.data
              angular.forEach($scope.readerDatas, function (data, index, array) {
                if ($scope.readerDatas[index].status == '1') {
                  $scope.readerDatas[index].statusText = '已读'
                }
              })
            }
            //公文已阅功能end
          } else {
            // if (!$isMobile.isPC) {
            //   $cordovaToast.showShortBottom(T.translate(result.msg));
            // } else {
            //   alert(T.translate(result.msg));
            // }
            confirmBack(result, true)
          }
        }, function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /*跟踪表单详情数据*/
      function requestFollowWorkFormData(account, procInstId, isLoading) {
        var url = serverConfiguration.baseApiUrl + 'app/follow/v1/getDetail'
        var param = {account: account, procInstId: procInstId, isLoading: isLoading}
        //请求数据
        viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
          if (result.state == '0') {
            requestScuess(result)
          } else {
            // if (!$isMobile.isPC) {
            //   $cordovaToast.showShortBottom(T.translate(result.msg));
            // } else {
            //   alert(T.translate(result.msg))
            // }
            confirmBack(result, true)
          }
        }, function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /*公文表单详情数据*/
      function requestWorkDocDataFormData(account, procInstId, isLoading) {
        var url = serverConfiguration.baseApiUrl + 'app/document/v1/getDocumentData'
        var param = {account: account, procInstId: procInstId, isLoading: isLoading}
        //请求数据
        viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
          if (result.state == '0') {
            $scope.cacheRequestData = result
            if (result.list) {
              var dataList = JSON.parse(result.list)
              if (dataList.permission) {
                var permission = dataList.permission//返回的permission
              }
              if (dataList.form !== undefined) {
                var oneData = dataList.form//返回的form
                var htmlData = oneData.formHtml
              } else {
                if (!$isMobile.isPC) {
                  $cordovaToast.showShortBottom(T.translate('view-form.form-empty'))
                } else {
                  alert(T.translate('view-form.form-empty'))
                }
              }

              //表单放入页面start
              if (dataList.data) {
                $scope.data = dataList.data
                $scope.data = sortSubTabelByXH($scope.data)
              }
              $scope.htmlContent = htmlData
              scopeData.prototype.setHtmlData(htmlData)
              $scope.permission = permission

              var signData = {data: $scope.data, sign: $scope.sign}
              scopeData.prototype.setUserRole($scope.data)
              scopeData.prototype.setSignData(signData)
              scopeData.prototype.setPermissionData($scope.permission)
            } else {
              if (!$isMobile.isPC) {
                $cordovaToast.showShortBottom('公文表单返回为空')
              } else {
                alert('公文表单返回为空')
              }
            }
            if (result.others) {
              var othersList = JSON.parse(result.others)
              $scope.flagPostscript = othersList.flagPostscript
              $scope.flagApproval = othersList.flagApproval
              //获取附言列表start
              if (othersList.postscripts) {
                $scope.postscripts = JSON.parse(othersList.postscripts)
                angular.forEach($scope.postscripts, function (data, index, array) {
                  $scope.postscripts[index].postscriptsAttachments = angular.fromJson(array[index].attachments)
                  $scope.postscriptsAttachments = $scope.postscripts[index].postscriptsAttachments
                })
              }
              //获取附言列表end
              //获取意见列表start
              if (othersList.approvals) {
                $scope.approvals = angular.fromJson(othersList.approvals)
                $scope.allAttachments = angular.fromJson(othersList.allAttachments)
                angular.forEach($scope.approvals, function (data, index, array) {
                  $scope.approvals[index].replys = angular.fromJson(array[index].replys)
                  $scope.approvals[index].approvalAttachments = angular.fromJson(array[index].approvalAttachments)
                  $scope.replys = $scope.approvals[index].replys
                  $scope.approvalAttachments = $scope.approvals[index].approvalAttachments
                  angular.forEach($scope.replys, function (data, index, array) {
                    $scope.replys[index].replayAttachments = angular.fromJson(array[index].replayAttachments)
                  })
                })
              }

              //获取意见列表end
            }

            formCenter()
          } else {
            // if (!$isMobile.isPC) {
            //   $cordovaToast.showShortBottom(T.translate(result.msg));
            // } else {
            //   alert(T.translate(result.msg))
            // }
            confirmBack(result, true)
          }
        }, function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /*知会详情数据*/
      function requestUndDataFormData(account, procInstId, isLoading) {
        var url = serverConfiguration.baseApiUrl + 'app/understanding/v1/getDetail'
        var param = {account: account, procInstId: procInstId, isLoading: isLoading}
        //请求数据
        viewFormService.getViewFormData(url, param, isLoading, 'POST').then(function (result) {
          if (result.state == '0') {
            requestScuess(result)
          } else {
            // if (!$isMobile.isPC) {
            //   $cordovaToast.showShortBottom(T.translate(result.msg));
            // } else {
            //   alert(T.translate(result.msg))
            // }
            confirmBack(result, true)
          }
        }, function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      $scope.myNewTodo = '待办'
      $scope.done = '已办'
      $scope.sent = '已发'
      $scope.follow = '跟踪'
      $scope.document = '公文'
      $scope.understanding = '知会'
      $scope.viewOtherWaitWork = '其他人待办'
      $scope.urlMap = {
        '待办': 'app/myNewTodo/v2/getDetailForInfo',
        '已办': 'app/done/v2/getDetailForInfo',
        '已发': 'app/sent/v2/getDetailForInfo',
        '跟踪': 'app/follow/v2/getDetailForInfo',
        '公文': 'app/document/v1/getDocumentDataForInfo',
        '知会': 'app/understanding/v2/getDetailForInfo',
        '其他人待办': 'app/ctl/othertodo/v1/getOtherTodoDetailForInfo'
      }


      function getInfo(type, options, isCache, index) {
        var url = serverConfiguration.baseApiUrl + $scope.urlMap[type]
        var param = options
        if ($rootScope.viewOtherWaitWork) {
          url = serverConfiguration.baseApiUrl + $scope.urlMap[$scope.viewOtherWaitWork]
          param.todoUserCode = $rootScope.todoUserCode
          delete param.account
        }
        //请求数据
        viewFormService.getViewFormData(url, param, param.isLoading).then(function (result) {
          // $scope.getInfo = true
          if(isCache){
            $scope.detailInfoCache[index] = result
          }else {
            getInfoRequestSuccess(result)
          }
        }).catch(function (error) {
          console.log(error)
        })
      }

      // 获取detailInfo成功后公用
      function getInfoRequestSuccess(result){
        var othersList = result.others ? JSON.parse(result.others) : []//返回的附言 处理意见 及其附件
        // var understandingList = result.understanding ? JSON.parse(result.understanding) : [];//返回的知会列表
        $scope.historysList = result.history ? JSON.parse(result.history) : []//返回的流程图信息
        $scope.others = othersList
        // 查看其他人待办不展开附言
        // if(!$rootScope.viewOtherWaitWork){
        // 展开附言
        // }
        $scope.flagPostscript = othersList.flagPostscript//是否有附言的标志 true就是有
        // console.log($scope.flagPostscript) // 返回值明明是 1 ？？？？？？
        if($scope.flagPostscript) {
          goPostscript()
          $scope.postscriptFlag = true
        }
        $scope.flagApproval = othersList.flagApproval//是否有处理意见的标志 true就是有
        if (othersList.approvals) {
          $scope.allAttachments = angular.fromJson(othersList.allAttachments)//获得所有附件加入到自定义所有附件数组
        }
        //知会列表
        // $scope.understandingList = understandingList;
        //是否展示知会tab
        // understandingList.forEach(function (item, index) {
        //     item.status == "已读" ? $scope.showUnderstandingList = true : null
        // })
      }

      $scope.isRetrieve = false//判断取回弹出框是否弹出

      //已办取回
      function doneFormRetrieve(account, procInstId, reason, isLoading) {
        var url = serverConfiguration.baseApiUrl + 'app/done/v1/retrieve'
        var param = {account: account, procInstId: procInstId, reason: reason, isLoading: isLoading}
        //请求数据
        viewFormService.getViewFormData(url, param, isLoading).then(function (result) {
          if (result.state == '0') {
            if (!$isMobile.isPC) {
              $cordovaToast.showShortCenter(T.translate('view-form.retrieve-success'))
            }
            stateGoHelp.stateGoUtils(false, 'tab.doneWork', {
              retrieve: 'retrieve'
            }, 'left')
          } else {
            confirmBack(result, false)
          }
        }, function (error) {
          //目前后台传输的有时候是error  所以这样写
          if (error.state == '0') {
            if (!$isMobile.isPC) {
              $cordovaToast.showShortCenter(T.translate('view-form.retrieve-success'))
            }
          }
        })
      }

      /**
       * * 2018/4/8 14:23  CrazyDong
       *  变更描述：封装固定表单容器的高度代码
       *  功能说明：有两处使用同一段代码,封装成一个方法调用
       *  heightFlag :  boolen值,true为竖屏,false为横屏
       */
      function formContentHeight(heightFlag) {
        //固定表单容器高度 start
        var styleNode = document.createElement('style')
        var scrollInnerHeight = window.innerHeight
        if (heightFlag) {
          if (scrollInnerHeight > 1000) {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.75 + 'px!important}'
          } else if (window.innerWidth > 666 && window.innerWidth < 1000) {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.8 + 'px!important}'
          } else if (window.innerWidth > 1000) {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.55 + 'px!important}'
          } else {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.7 + 'px!important}'
          }
        } else {
          if (window.innerWidth < 600) {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.3 + 'px!important}'
          } else if (window.innerWidth > 600 && window.innerWidth < 1000) {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.45 + 'px!important}'
          } else if (window.innerWidth > 1000) {
            styleNode.innerHTML = '#heightScroll{height:' + scrollInnerHeight * 0.6 + 'px!important}'
          }
        }

        document.head.appendChild(styleNode)
        //固定表单容器高度 end
      }

      // 可配置的前后预加载数
      $scope.pre = 4
      $scope.next = 4
      $scope.preDetailCached = false
      $scope.preDetailInfoCached = false
      $scope.nextDetailCached = false
      $scope.nextDetailInfoCached = false

      // 初始化时，监听缓存数据 （包括表单数据和其他数据）
      // 前一条数据的表单数据和其他数据都缓存完毕，显示向上翻页按钮
      // 后一条数据的表单数据和其他数据都缓存完毕，显示向下翻页按钮
      $scope.$watch("detailCache", function(n, o){
        if(!angular.equals(n[$scope.cacheIndex - 1], o[$scope.cacheIndex - 1]) && n[$scope.cacheIndex - 1] && n[$scope.cacheIndex - 1] !== ''){
          $scope.preDetailCached = true
        }
        if(!angular.equals(n[$scope.cacheIndex + 1], o[$scope.cacheIndex + 1]) && n[$scope.cacheIndex + 1] && n[$scope.cacheIndex + 1] !== '') {
          $scope.nextDetailCached = true
        }
      },true)
      $scope.$watch("detailInfoCache", function(n, o){
        if(!angular.equals(n[$scope.cacheIndex - 1], o[$scope.cacheIndex - 1]) && n[$scope.cacheIndex - 1] && n[$scope.cacheIndex - 1] !== ''){
          $scope.preDetailInfoCached = true
        }
        if(!angular.equals(n[$scope.cacheIndex + 1], o[$scope.cacheIndex + 1]) && n[$scope.cacheIndex + 1] && n[$scope.cacheIndex + 1] !== ''){
          $scope.nextDetailInfoCached = true
        }
      },true)

      /**
       *  查看表单页
       *  获取当前表单前后 N 条数据（ N 默认为 4，可配置），缓存起来
       *  实现轮播效果，点击下一页或者上一页直接从缓存拿数据，
       *  如果没有缓存完成，则直接从后台接口拿数据
       */
      function getListDataCache(index) {
        // var param = {
        //   account: account,//用户账号，pkid
        //   currentPage: currentPage,//当前页码
        //   pageSize: pageSize,//每页记录数
        //   subject: subject,//标题
        //   taskStatus: taskStatus,//事项状态（暂存，退回，已读，未读）
        //   typeId: typeId,//事项分类
        //   createTimeFrom: createTimeFrom,//发起开始时间
        //   createTimeTo: createTimeTo,//发起结束时间
        //   creator: creator,//发起人
        //   orderField: orderField,//排序字段：默认create_time
        //   orderSeq: orderSeq,//排序方向：默认desc-[desc,asc]
        //   resubmitFlg: 0
        // };
        // index 从 0 开始 ，currentPage 从 1 开始，我也是醉了
        $scope.index = index - $scope.pre < 0 ? 0 : index - $scope.pre
        var pre = $scope.pre
        var next = $scope.next
        var pageSize = $scope.requestParam.pageSize  // 每页显示数
        var currentPage = Math.floor(index / pageSize) + 1 // 计算当前页
        var startPage = (index - pre <= 0) && (currentPage === 1) ? 1 : Math.floor((index - pre) / pageSize) + 1 // 计算开始页
        var endPage = Math.floor((index + next) / pageSize) + 1 // 计算结束页
        var requestParam = $scope.requestParam
        requestParam.currentPage = startPage
        $scope.resultList = new Array()
        $scope.listCache = new Array()
        $scope.current = index % pageSize + (currentPage - startPage) * pageSize  // current 当前页的索引
        $scope.cacheLength = pre + next + 1
        listCache(requestParam, startPage, endPage)
      }

      var urls = {
        'waitWorkList': 'app/myNewTodo/v2/getList',
        'viewOtherWaitWorkList': 'app/ctl/othertodo/v1/getOtherTodoList',
        'viewDoneWorkList': 'app/done/v2/getList'
      }

      /**
       * 获取分页数据
       * @param param
       * @param startPage
       * @param endPage
       */
      function listCache(param, startPage, endPage) {
        console.log(param.currentPage, startPage, endPage)
        var url = serverConfiguration.baseApiUrl + 'app/ctl/othertodo/v1/getOtherTodoList'
        viewFormService.getViewFormData(url, param, false).then(function (result) {
          $scope.resultList = $scope.resultList.concat(result.list)
          console.log($scope.resultList)
          if (startPage < endPage) {
            startPage++
            param.currentPage++
            listCache(param, startPage, endPage)
          } else {
            // 截取需要缓存的部分
            var start = $scope.current - $scope.pre < 0 ? 0 : $scope.current - $scope.pre
            var end = $scope.current + $scope.next
            var account = storageService.get(auth_events.userId, null)
            $scope.listCache = $scope.resultList.slice(start, end + 1)
            var index = $scope.index
            for (var key in $scope.listCache) {
              var taskId = $scope.listCache[key]['taskId']
              var procInstId = $scope.listCache[key]['procInstId']
              // 如果缓存对象的value为空字符串，说明该value正在请求中，则不再重复发请求
              if ($scope.detailCache[index] === undefined) {
                $scope.detailCache[index] = ''
                requestViewFormData(account, taskId, procInstId, false, true, index)
              }
              if($scope.detailInfoCache[index] === undefined){
                $scope.detailInfoCache[index] = ''
                getInfo($scope.myNewTodo, {
                  account: account,
                  taskId: taskId,
                  procInstId: procInstId,
                  isLoading: false
                }, true, index)
              }
              index++
            }
            // console.log($scope.detailCache)
            // console.log($scope.detailInfoCache)
          }
        })
      }

      /**
       * 下一页
       */
      $scope.nextPage = function () {
        clean()
        $scope.preDetailCached = true
        $scope.preDetailInfoCached = true
        $scope.nextDetailCached = false
        $scope.nextDetailInfoCached = false
        // 防止一直翻页，导致缓存数据过大，做一个类似队列操作
        delete $scope.detailCache[$scope.cacheIndex - $scope.pre]
        delete $scope.detailInfoCache[$scope.cacheIndex - $scope.pre]
        $scope.htmlContent = ''
        $scope.cacheIndex++

        if ($scope.detailCache[$scope.cacheIndex].state == -1) {
          confirmBack($scope.detailCache[$scope.cacheIndex], true)
          return
        }
        // 向下翻页后，再下一页如果有数据，让向下翻页按钮显示
        if($scope.detailCache[$scope.cacheIndex + 1]
          && $scope.detailCache[$scope.cacheIndex + 1] !== ''
          && $scope.detailInfoCache[$scope.cacheIndex + 1]
          && $scope.detailInfoCache[$scope.cacheIndex + 1] !== ''){
          $scope.nextDetailCached = true
          $scope.nextDetailInfoCached = true
        }
        $timeout(function () {
          waitWorkRequestSuccess($scope.detailCache[$scope.cacheIndex])
          getInfoRequestSuccess($scope.detailInfoCache[$scope.cacheIndex])
        }, 100)
        getListDataCache($scope.cacheIndex)
      }

      /**
       * 上一页
       */
      $scope.prePage = function () {
        clean()
        $scope.preDetailCached = false
        $scope.preDetailInfoCached = false
        $scope.nextDetailCached = true
        $scope.nextDetailInfoCached = true
        // 防止一直翻页，导致缓存数据过大，做一个类似队列操作
        delete $scope.detailCache[$scope.cacheIndex + $scope.next]
        delete $scope.detailInfoCache[$scope.cacheIndex + $scope.next]
        $scope.htmlContent = ''
        $scope.cacheIndex--
        // 向上翻页后，再上一页如果有数据，让向上翻页按钮显示
        if($scope.detailCache[$scope.cacheIndex - 1]
          && $scope.detailCache[$scope.cacheIndex - 1] !== ''
          && $scope.detailInfoCache[$scope.cacheIndex - 1]
          && $scope.detailInfoCache[$scope.cacheIndex - 1] !== ''){
          $scope.preDetailCached = true
          $scope.preDetailInfoCached = true
        }
        $timeout(function () {
          waitWorkRequestSuccess($scope.detailCache[$scope.cacheIndex])
          getInfoRequestSuccess($scope.detailInfoCache[$scope.cacheIndex])
        }, 100)
        getListDataCache($scope.cacheIndex)
      }

      function clean() {
        $scope.flagPostscript = false // 附言红点隐藏
        $scope.postscriptFlag = false // 合上附言
        $scope.postscripts = [] // 清空附言
        $scope.flagApproval = false // 处理意见红点隐藏
        $scope.opinionFlag = false // 合上处理意见
        $scope.approvals = [] // 清空处理意见
        $scope.nextP = false  // 存在前一页是长表单，显示加载更多按钮，这里让其不显示
        $scope.dataList = []
      }

    }])
})()

