// Dash controller
// Using javaScript closures, wrap Angular components in an Immediately Invoked Function Expression(IIFE).
// Why?: An IIFE removes variables from the global scope. This helps prevent variables and function declarations from living longer than expected in the global scope, which also helps avoid variable collisions.

(function () {
  'use strict'

  var app = angular.module('community.controllers.notification')

  /*通知*/
  app.controller('NotificationCtrl', ['$scope', '$state', '$rootScope', '$ionicNativeTransitions', '$stateParams', '$ionicPopup', '$ionicHistory',
    'NotificationService', 'auth_events', 'storageService', '$timeout', 'serverConfiguration', 'timeout', '$isMobile', 'T', '$cordovaToast', 'stateGoHelp', 'GetRequestService',
    function ($scope, $state, $rootScope, $ionicNativeTransitions, $stateParams, $ionicPopup, $ionicHistory, NotificationService,
              auth_events, storageService, $timeout, serverConfiguration, timeout, $isMobile, T, $cordovaToast, stateGoHelp, GetRequestService) {

      $scope.$on('$ionicView.beforeEnter', function (event, data) {

        $rootScope.titleData = '通知'//标题
        $rootScope.toBack = true//返回按钮显示
        $rootScope.hideTabs = true//tabs导航栏不显示
        data.enableBack = true//交叉路由
        $rootScope.bell = false//小铃铛不显示
        var account = storageService.get(auth_events.userId, null)
        getNotificationData(account, 1, 10, true)//获取通知列表
        $rootScope.$ionicGoBack = function () {
          var currentViewData = $ionicHistory.currentView()
          if (currentViewData.stateName === 'tab.workNotification') {
            stateGoHelp.stateGoUtils(true, 'tab.work', {}, 'right')
          } else if (currentViewData.stateName === 'tab.notification') {
            if ($stateParams.backFlag) {
              $ionicNativeTransitions.goBack()//从待办过来时使用,不然data.direction返回值为forward,切换动画就出错
            } else {
              stateGoHelp.stateGoUtils(true, 'tab.waitWork', {}, 'right')
            }
          } else if (currentViewData.stateName === 'tab.notification-item') {
            stateGoHelp.stateGoUtils(true, 'tab.information', {}, 'right')
          } else if (currentViewData.stateName === 'tab.mineNotification') {
            stateGoHelp.stateGoUtils(true, 'tab.mine', {}, 'right')
          }
        }

        if ($isMobile.Android) {
          /*解决下方bar有时会显示2-3秒才隐藏的问题*/
          angular.element(document.querySelectorAll('.tabs-icon-top')).addClass('tabs-item-hide')
        }


      })
      $scope.$on('$ionicView.enter', function () {//$ionicView.afterEnter
        angular.element(document.querySelectorAll('.tabs-icon-top')).addClass('tabs-item-hide')
        $rootScope.hideTabs = true
        $rootScope.toBack = true


      })


      $scope.checkFlag = false//通知列表后小圆圈选择框  没选中
      $scope.type = $stateParams.type
      $scope.titleFlag = $stateParams.titleFlag
      var currentPageFlag = 1//上拉加载页数重置
      /**
       * * 2018/4/19 14:23  tyw
       *  变更描述：添加空数据展示页面
       *  功能说明：当请求数据为空时展示一个空数据图标
       */
      $scope.isEmptyData = true//是否显示空数据界面

      $scope.changeChecked = function ($index) {
        this.checkFlag = !this.checkFlag
      }
      //进入通知详情
      $scope.goNotificationData = function (NotificationItem) {

        NotificationItem.showFlag = true
        clickStatus(account, NotificationItem.pkid)
        stateGoHelp.stateGoUtils(true, 'tab.notification-work', {
          NotificationItem: angular.toJson(NotificationItem),
          titleFlag: $scope.titleFlag, type: $stateParams.type, information: $stateParams.information
        }, 'left')

      }


      var account = storageService.get(auth_events.userId, null)
      $scope.NotificationData = []
      $scope.noti = {}
      //下拉刷新
      $scope.doRefresh = function () {
        currentPageFlag = 1
        $timeout(function () {
          getNotificationData(account, 1, 10, false)
          $scope.$broadcast('scroll.refreshComplete')
        }, timeout.pullDown)
      }


      /**
       * * 2018/4/8 14:23  tyw
       *  变更描述：封装toast提示
       *  功能说明：有两处使用同一段代码,封装成一个方法调用
       */
      var toastUtil = function (toastText) {
        toastText ? toastText : 'publicMsg.requestErr'
        if (!$isMobile.isPC) {
          $cordovaToast.showShortBottom(T.translate(toastText))
        }
      }

      //上拉加载

      $scope.loadMore = function () {
        var num = ++currentPageFlag
        var url = serverConfiguration.baseApiUrl + 'app/message/v1/inquire'
        var param = {
          account: account,//用户账号，pkid
          pageNum: num,//当前页码
          pageSize: 10//每页记录数
        }
        GetRequestService.getRequestData(url, param, false, 'POST').then(function (result) {

            $scope.NotificationData = $scope.NotificationData.concat(result.list)
            $scope.isHasNextPage = result.flagNextPage

            $scope.$broadcast('scroll.infiniteScrollComplete')
          },
          toastUtil
        )
      }

      //选中
      $scope.pkids = []
      $scope.checkRudio = function (pkid) {
        // console.log(this.checkFlag);
        // $scope.pkids.push(pkid);
        // $scope.pkids.join(',');
        if (this.checkFlag) {
          $scope.pkids.splice($scope.pkids.indexOf(pkid), 1)
        } else {
          $scope.pkids.push(pkid)
        }
        console.log($scope.pkids, $scope.checkFlag)
      }
      //标记已读
      $scope.clickRightMarkRead = function () {
        // if($scope.pkids ==''){
        if ($scope.pkids.length === 0) {
          toastUtil('notification.batch-text')
        } else {
          changeStatus(account, $scope.pkids)
        }

      }

      //全部标记
      $scope.batch = function () {
        $scope.batchText = '确认要全部标记吗？'
        var Pop = $ionicPopup.confirm({
          title: '提示',
          template: '<div><p>{{batchText}}</p></div>',
          cancelText: '取消',
          cancelType: 'button-assertive',
          okText: '确定',
          okType: 'button-positive',
          scope: $scope
        })
        Pop.then(function (res) {
          if (res) {
            batchStatus(account)
          } else {

          }
        })

      }

      //全部清空
      $scope.msgClean = function () {
        $scope.item = '确认要全部清空吗？'
        var Pop = $ionicPopup.confirm({
          title: '提示',
          template: '<div><p>{{item}}</p></div>',
          cancelText: '取消',
          cancelType: 'button-assertive',
          okText: '确定',
          okType: 'button-positive',
          scope: $scope
        })
        Pop.then(function (res) {
          if (res) {
            msgCleanStatus(account)
          } else {

          }
        })

      }

      //获取列表数据
      function getNotificationData(account, pageNum, pageSize, isLoading) {
        $scope.pkids = []
        var url = serverConfiguration.baseApiUrl + 'app/message/v1/inquire'
        if (pageNum == 1) {
          currentPageFlag = 1
        }
        var param = {
          account: account,
          pageNum: pageNum,
          pageSize: pageSize

        }

        //请求数据
        GetRequestService.getRequestData(url, param, isLoading, 'POST').then(function (result) {

            $scope.NotificationData = result.list

            $scope.isHasNextPage = result.flagNextPage

            if ($scope.NotificationData != null) {
              if ($scope.NotificationData.length == 0) {
                $scope.noti.text = '没有数据可以更新'
                $scope.isEmptyData = true
              } else {
                $scope.noti.text = '成功更新' + $scope.NotificationData.length + '条信息'
                $scope.isEmptyData = false
              }
            } else {
              $scope.noti.text = '没有数据可以更新'
              $scope.isEmptyData = true
            }

          },
          toastUtil
        )
      }

      //修改状态
      function changeStatus(account, headPkids) {
        var url = serverConfiguration.baseApiUrl + 'app/message/v1/msgStatus'

        var param = {
          account: account,
          headPkids: headPkids

        }

        //请求数据
        NotificationService.getNotificationData(url, param).then(function (result) {
            if (result.state == '0') {
              getNotificationData(account, 1, 10, true)
            } else {
              toastUtil('notification.batch-error')
            }
          },
          toastUtil
        )
      }

      function clickStatus(account, headPkids) {
        var url = serverConfiguration.baseApiUrl + 'app/message/v1/msgStatus'

        var param = {
          account: account,
          headPkids: headPkids

        }

        //请求数据
        NotificationService.getNotificationData(url, param).then(function (result) {


          },
          toastUtil
        )
      }

      //修改全部状态
      function batchStatus(account) {
        var url = serverConfiguration.baseApiUrl + 'app/message/v1/msgStatus/batch'

        var param = {
          account: account

        }

        //请求数据
        NotificationService.getNotificationData(url, param).then(function (result) {

            if (result.state == '0') {
              getNotificationData(account, 1, 10, true)
            } else {
              toastUtil('notification.all-batch-error')
            }

          },

          toastUtil
        )
      }

      //清空
      function msgCleanStatus(account) {
        var url = serverConfiguration.baseApiUrl + 'app/message/v1/msgClean'

        var param = {
          account: account

        }

        //请求数据
        NotificationService.getNotificationData(url, param).then(function (result) {

            if (result.state == '0') {
              getNotificationData(account, 1, 10, true)
            } else {
              toastUtil('notification.clean-error')
            }

          },
          toastUtil
        )
      }


    }])

})()
