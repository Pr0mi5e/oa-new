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
      $scope.showUnderstandingList = false //是否展示只会tab栏
      $scope.loaded = false
      $scope.isRetrieve = false//判断取回弹出框是否弹出
      /**
       * * 2018/8/10 16:15  tyw
       *  变更描述：新增两个变量：isios-是否为ios，isLongForm-是否为长表单，动态修改表单详情页容器的overflow-scroll值
       *  功能说明：ios设备overflow-scroll=false时查看pdf无法切换tab页，需要根据平台和表单类型动态修改
       */
      $scope.isios = ionic.Platform.isIOS()
      $scope.isLongForm = false
      $scope.detailCache = {}
      $scope.detailInfoCache = {}
      $rootScope.hideTabs = true // 底部导航栏的显示与否
      $scope.getDetailUrlMap = {
        '': $rootScope.viewOtherWaitWork ? 'app/ctl/othertodo/v1/getOtherTodoDetail' : 'app/myNewTodo/v1/getDetail',
        '1': 'app/done/v1/getDetail',
        '0': 'app/sent/v1/getDetail',
        '2': 'app/follow/v1/getDetail',
        '4': 'app/document/v1/getDocumentData',
        '5': 'app/understanding/v1/getDetail'
      }
      // before
      $rootScope.hideTabs = true
      $rootScope.toBack = true
      $scope.readers = [] // 表单已阅人员数组
      $scope.isTemporary = false // 判断弹出框是否弹出
      $scope.zoomingFlag = true // 判断表单是否可以缩放
      $rootScope.enableBtn = '0'// zwfcbtn指令控制权限  控制审批页的暂存 终止 不同意是否可以点击
      $scope.dataList = [] // 长表单查看表单页面UI数据
      $scope.data = '' // 数据清空
      $scope.tableFlag = {'display': ''}
      $scope.noneStyle = {'display': 'none'}
      $scope.nextP = false// 判断长表单的上拉显示 默认不显示
      $rootScope.jump = true// 表单显示  用于测试长表单卡顿
      $rootScope.titleData = T.translate('form-handle.form-see-title') // 查看表单标题
      $scope.rightHandle = $stateParams.titleFlag === ''
      $scope.rightBack = $stateParams.titleFlag === '1'
      $scope.approvals = []// 审批意见
      // before end
      $scope.itemFlag = '0' //*控制分栏数据显示
      $scope.rightShow = storageService.get(auth_events.userId, null)//判断是不是当前用户 用于处理意见时显示在左还是右  当前用户在右
      $scope.approvalAttachments = []//意见附件
      $scope.replys = []//意见回复
      $scope.allAttachments = []//文档
      $scope.postscriptsAttachments = []//附言附件
      $scope.nowTime = new Date()//流程图当前时间
      $scope.readers = []//表单已阅人员数组
      $scope.dataList = []//长表单查看表单页面UI数据
      $scope.nextP = false//判断长表单的上拉显示 默认不显示
      $scope.mask_content = ''//输入框内容
      $scope.msgMaskLength = 0//发送的信息的字数长度
      $scope.allMaskLength = 0//输入框信息与发送的信息的字数长度总和
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
      // 可配置的前后预加载数
      $scope.pre = 4
      $scope.next = 4
      $scope.preDetailCached = false
      $scope.preDetailInfoCached = false
      $scope.nextDetailCached = false
      $scope.nextDetailInfoCached = false
      $scope.subTableLength = 0 // 从表长度
      $scope.formDataId = '' // 主表id
      $scope.subTablePage = 1 // 长表单从表显示第几页
      $scope.sendLog = false // 是否向后台发送log

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
      var heightHandle = window.innerHeight//获取屏幕的高度
      var type = '0'//tab页index：0表单，1流程图，2相关文档
      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        data.enableBack = true//交叉路由
        $rootScope.titleData = T.translate('form-handle.form-see-title')//查看表单标题
        viewScrollForm.scrollTop()//进入时,让表单滚到顶部,否则会出现表单滚出可视窗口的现象
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
        if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
          screen.orientation.lock('default')
        }
        var Type = $stateParams.type // 首页 undefined,已办,消息 work tab待办 undefined
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
        /** ------------------------------new------------------------------------
         *
         *
         */
        // 查看其他人待办
        if ($rootScope.viewOtherWaitWork) {
          $scope.requestParam = angular.fromJson($stateParams.requestParam)// 从列表页带过来的查询条件
          $scope.totalCount = $scope.requestParam.totalCount
          if (!$scope.cacheIndex) {
            $scope.cacheIndex = $scope.requestParam.index  // 全部数据中的索引
          }
          getListDataCache($scope.cacheIndex)
        }

        var waitWorkPassDate = $stateParams.waitWorkPassDate
        if (waitWorkPassDate) {
          var paramData = angular.fromJson(waitWorkPassDate)
          var taskId = paramData.taskId
          var procInstId = paramData.procInstId
        }
        var account = storageService.get(auth_events.userId, null)
        if (data.direction === 'forward') {
          // 有修改权限的用户，在放大页修改表单数据，保存后跳转到本页，不请求接口，直接从module取表单数据,从localStorage取其他数据
          if ($stateParams.enlargement === 'enlargement') {
            var formData = scopeData.prototype.getSignData().data
            $scope.data = sortSubTableByXH(formData, 1)
            $scope.htmlContent = scopeData.prototype.getHtmlData()
            $scope.permission = scopeData.prototype.getPermissionData()
            var formInfoData = JSON.parse(storageService.get('formInfoData'))
            $scope.loaded = true // 显示处理按钮
            getInfoRequestSuccess(formInfoData)
          } else {
            cleanScopeData()
            var param = {
              url: $scope.getDetailUrlMap[$stateParams.titleFlag],
              account: account,
              taskId: taskId,
              procInstId: procInstId,
              isLoading: true
            }
            getDetail(param)
            getInfo($scope.myNewTodo, {
              account: account,
              taskId: taskId,
              procInstId: procInstId,
              isLoading: false
            })
          }
        } else { // 返回，回复返回，放大返回，处理返回
          var subTablePage = storageService.get('subTablePage', null)
          storageService.removeItem('subTablePage')
          var formData = scopeData.prototype.getSignData().data
          $scope.subTablePage = subTablePage ? Number(subTablePage) : $scope.subTablePage
          $scope.data = sortSubTableByXH(formData, $scope.subTablePage)
          $scope.tableFlag = {'display': ''}
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

      /**
       * 切换tab页
       * @param flag
       */
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

      /**
       * tab 页 active 状态
       * @param flag
       * @returns {boolean}
       */
      $scope.isActiveTab = function (flag) {
        return flag == type ? true : false
      }

      /**
       * 监听手机横竖屏
       */
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

      /**
       * 加载长表单数据
       */
      $scope.loadMore = function () {
        //loading图 上拉时显示
        application.showLoading(true)
        $scope.subTablePage++
        $timeout(function () {
          application.hideLoading()
        }, timeout.max)
        $timeout(function () {//让loading先出来再更新数据
          //判断数据里是不是含有子表  并且子表数据大于10 大于10就分页显示
          for (var p in $scope.data) {
            for (var sub_p in $scope.data[p]) {
              if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
                if ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > 0) {
                  // 如果未展示的从表数据小于xList，则将其全部截给$scope.data[p][sub_p]
                  if ($scope.dataList.length < xList) {
                    $scope.data[p][sub_p] = $scope.data[p][sub_p].concat($scope.dataList.splice(0, $scope.dataList.length))
                    viewScrollForm.scrollBy(0, heightHandle * 1 / 5, true)//使整个content上移屏幕的1/5
                  } else {
                    $scope.data[p][sub_p] = $scope.data[p][sub_p].concat($scope.dataList.splice(0, xList))
                    if ($scope.dataList.length === 0) {
                      //数据全部加载完毕
                    } else {
                      viewScrollForm.scrollBy(0, heightHandle * 1 / 4, true)//使整个content上移屏幕的1/4
                    }
                  }
                  if ($scope.data[p][sub_p].length === $scope.subTableLength) {
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
          console.log($scope.data)
        }, 10)

      }

      /**
       * 待办表单，右上角处理操作
       */
      $scope.clickRightHandle = function () {
        if ($scope.dataList.length > 0) {
          concatSubTableData() // 长表单数据全部赋给$scope.data，因为是浅拷贝机制，回复页直接通过scopeData.prototype.getSignData()即可获取完整的表单数据
        }
        if($scope.sendLog) {
          // 向后台发送待办表单数据
          $scope.commitError(JSON.stringify($scope.data))
        }
        // 表单数据校验
        if (!verifyData()) {
          appUtils.showTips('view-form.form-data-null', true, 2)
          application.hideLoading()
          return false
        }
        var waitWorkPassDate = {
          taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
          procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId
        }
        stateGoHelp.stateGoUtils(true, 'tab.form-handle', {
          workWaitData: angular.toJson($scope.workWaitData),
          waitWorkPassDate: angular.toJson(waitWorkPassDate),
          titleFlag: '3',
          notification: $stateParams.notification,
          information: $stateParams.information,
          type: $stateParams.type,
          notificationDetail: $stateParams.notificationDetail
        }, 'left')
      }

      /**
       * 已办表单，右上角取回操作
       */
      $scope.clickRightBack = function () {
        $scope.rightHandle = false//处理不显示
        $scope.rightBack = true//取回显示
        $scope.isTemporary = true//取回模板弹出
        $scope.noneStyle = {//解决 多次点击取回  取回按钮不触发 的问题
          'display': ''
        }
      }

      /**
       * 监听取回时附言的长度
       */
      $scope.$watch('mask_content', function (newValue, oldValue, scope) {
        $scope.allMaskLength = newValue.length + $scope.msgMaskLength
        if ($scope.allMaskLength > 30) {//总长度不得大于30
          $scope.mask_content = oldValue
          appUtils.showTips('view-form.mask-max-err', true, 2)
        }
      })

      /**
       * 取回 dialog， 确认
       */
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

      /**
       * 取回 dialog， 取消
       */
      $scope.goCancel = function () {//取消取回模板
        $scope.isTemporary = false//取回模板不显示
      }

      /**
       * 处理意见-回复
       * @param pkid
       */
      $scope.replyData = function (pkid) {
        if ($scope.dataList.length > 0) {
          concatSubTableData() // 长表单数据全部赋给$scope.data，因为是浅拷贝机制，回复页直接通过scopeData.prototype.getSignData()即可获取完整的表单数据
        }
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

      /**
       * 表单双指缩放
       * @param init
       * @returns {boolean}
       */
      $scope.onFormScroll = function (init) {
        var scaleWrapper = angular.element('ion-view.need-form[nav-view="active"]').find('.scaleWrapper')//获取控制缩放的包裹容器
        if (!scaleWrapper.parent()[0]) {
          formCenter()
          return false
        }
        var transform = init ? scaleWrapper.parent()[0].style.transform : 'transform:scale(1)'
        var scaleNum = parseFloat(transform.substring(transform.indexOf('scale(') + 6))//获取父容器缩放比例
        var form = document.getElementsByClassName('zw_formdata').length ? document.getElementsByClassName('zw_formdata') : [{clientWidth: 1}]//获取表单长度
        // 有的已办表单，接口返回的表单模板会有多个table，这里取第一个 修改前代码为 formwidth = form[form.length - 1].clientWidth
        // 原代码取的是最后一个表单，它的宽度为 0 ，导致下面formwidth为除数时报错
        var formwidth = form[0].clientWidth
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

      /**
       * 跳转到放大表单页
       * 长表单数据，如果点击了加载更多，此时跳转到放大页，显示详情页展示的从表数据，而不是全部从表数据
       */
      $scope.goEnlargement = function () {
        if ($scope.dataList.length > 0) {
          concatSubTableData() // 长表单数据全部赋给$scope.data，因为是浅拷贝机制，回复页直接通过scopeData.prototype.getSignData()即可获取完整的表单数据
        }
        var waitWorkPassDate = {
          taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
          procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId
        }
        $scope.tableFlag = {'display': 'none'}
        stateGoHelp.stateGoUtils(true, 'tab.form-enlargement', {
          waitWorkPassDate: angular.toJson(waitWorkPassDate),
          information: $stateParams.information,
          titleFlag: $scope.titleFlag,
          notification: $stateParams.notification,
          type: $stateParams.type,
          NotificationItem: $stateParams.NotificationItem,
          notificationDetail: $stateParams.notificationDetail,
          subTableLength: $scope.subTableLength,
          subTablePage: $scope.subTablePage
        }, 'left')
      }

      /**
       * 展开或收起附言
       */
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

      /**
       * 渲染附言
       */
      function goPostscript() {
        var othersList = $scope.others//返回的附言 处理意见 及其附件
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

      /**
       * 处理意见
       */
      $scope.goOpinionProcessing = function () {
        var othersList = $scope.others //返回的附言 处理意见 及其附件
        if (othersList.approvals) {//如果处理意见存在
          var tempApprovals = [], tempReplys = [], tempApprovalAttachments = []
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

      /**
       * 播放录音
       * @param pkid
       */
      $scope.getAudio = function (pkid) {
        $scope.url = serverConfiguration.baseApiUrl + 'app/attachment/showVideo?pkid=' + pkid
        var myMedia = new Media($scope.url)//播放这个路径的语音
        myMedia.play()
      }

      /**
       * 提交 bug 信息
       */
      $scope.commitError = function (errorMsg) {
        // var errorMsg = localStorage.getItem('errorMsg')
        // console.log(errorMsg)
        var url = serverConfiguration.baseApiUrl + 'app/common/uploadError'

        var param = {
          errorMsg: errorMsg,
          account: storageService.get(auth_events.userId, null)
        }
        GetRequestService.getRequestData(url, param, true, 'POST').then(function (result) {
          console.log(result)
          // if (result.success) {
          //   var alertPopup = $ionicPopup.alert({
          //     title: '提示',
          //     template: '提交成功'
          //   })
          // } else {
          //   var alertPopup = $ionicPopup.alert({
          //     title: '提示',
          //     template: '提交失败'
          //   })
          // }
        }, function (err) {
          /*判断平台*/
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /**
       * 适配表单
       */
      function formCenter() {
        $timeout(function () {
          $scope.onFormScroll('init')
        }, 100)
      }

      /**
       * * 处理从表数据
       * 在跳转到回复页和审批页之前，
       * 需要把未显示的从表数据连接到了$scope.data上，
       * 下一页直接取完整表单数据，
       * 所以返回时，需要显示跳转前的从表数据，而不是完整数据
       * @param $scopeData
       * @param page 用于从（放大页、回复页和处理页）返回时，页面显示长表单的几页数据
       * @returns {*}
       */
      function sortSubTableByXH($scopeData, page) {
        var length = page ? page * 10 : xList
        for (var p in $scopeData) {
          $scope.formDataId = $scopeData[p]['id_']
          for (var sub_p in $scopeData[p]) {
            if ($scopeData[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
              $scope.subTableLength = $scopeData[p][sub_p].length
              //有子表就进行子表排序
              $scopeData[p][sub_p] = $.fn.sortSubTable($scopeData[p][sub_p], 'seqnum', 'asc')
              //获取子表长度依次显示
              if ($scopeData[p][sub_p] != undefined && $scopeData[p][sub_p].length > 0) {
                //放大页保存回来的直接取dataList值
                $scope.dataList = $scopeData[p][sub_p].splice(0) // 截取从表数据
                $scope.nextP = $scope.dataList.length > length
                $scope.isLongForm = $scope.dataList.length > length
                // if ($scope.dataList.length < xListOnly) {//如果这个数组的长度小于11,把从表数据整个截给页面数据$scopeData[p][sub_p]
                //   $scopeData[p][sub_p] = $scope.dataList.splice(0, $scope.dataList.length)
                // } else if ($scope.dataList.length > length) {//list数组内数据大于10,截取前十条给页面数据$scopeData[p][sub_p]
                $scopeData[p][sub_p] = $scope.dataList.splice(0, length)
                if ($scope.dataList.length > 0) {
                  if (!$isMobile.isPC) {
                    $cordovaToast.showLongBottom('此表单为长数据表单，共' + $scope.subTableLength + '条数据,点击获取更多数据')
                  } else {
                    alert('此表单为长数据表单，共' + $scope.subTableLength + '条数据,点击加载获取更多数据')
                  }
                }
                // }
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
       * 表单详情报错弹窗提示，点击确认返回列表页
       * 判断依据 result.state 为 -1
       */
      function confirmBack(result, isBack) {
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

      /**
       * 获取表单数据（表单Html模板和模板数据）
       * @param param
       */
      function getDetail(param, isCache, index) {
        var url = serverConfiguration.baseApiUrl + param.url
        delete param.url
        if ($rootScope.viewOtherWaitWork) {
          // param = {
          //   todoUserCode: $rootScope.todoUserCode,
          //   taskId: param.taskId,
          //   procInstId: paramprocInstId,
          //   isLoading: param.isLoading
          // }
          param.todoUserCode = $rootScope.todoUserCode
          delete param.account
        }
        viewFormService.getViewFormData(url, param, param.isLoading, 'POST').then(function (result) {
          if (isCache) {
            $scope.detailCache[index] = result
          } else {
            if (result.state == '0') {
              requestSuccess(result)
            } else if (result.state == -1) {
              confirmBack(result, true)
            }
          }
        }, function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /**
       * getDetail 成功后处理数据
       * @param result
       */
      function requestSuccess(result) {
        if ($stateParams.titleFlag === '4') { // 公文
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
            if (dataList.data) {
              $scope.data = dataList.data
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
        } else {
          var tempData = {}
          var dataList = result.form ? JSON.parse(result.form) : ''
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
          tempData.data = listData.data
          if($stateParams.titleFlag === '' && $scope.sendLog) {
            // 向后台发送待办表单数据
            $scope.commitError(JSON.stringify(tempData.data))
          }
          $scope.data = sortSubTableByXH(tempData.data, $scope.subTablePage)
          $scope.htmlContent = htmlData
          scopeData.prototype.setHtmlData(htmlData)
          $scope.permission = permission
          var signData = {data: $scope.data, sign: $scope.sign}
          scopeData.prototype.setUserRole($scope.data)
          scopeData.prototype.setSignData(signData)
          scopeData.prototype.setPermissionData($scope.permission)
          formCenter()
          $scope.loaded = true
        }
      }

      /**
       * 获取表单其他信息 - 附言，处理意见，流程图等
       * @param type
       * @param options
       * @param isCache
       * @param index
       */
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
          storageService.set('formInfoData', JSON.stringify(result))
          if (isCache) {
            $scope.detailInfoCache[index] = result
          } else {
            getInfoRequestSuccess(result)
          }
        }).catch(function (error) {
          console.log(error)
        })
      }

      /**
       * getInfo成功后处理数据
       * @param result
       */
      function getInfoRequestSuccess(result) {
        var othersList = result.others ? JSON.parse(result.others) : []//返回的附言 处理意见 及其附件
        // var understandingList = result.understanding ? JSON.parse(result.understanding) : [];//返回的知会列表
        $scope.historysList = result.history ? JSON.parse(result.history) : []//返回的流程图信息
        $scope.others = othersList
        $scope.flagPostscript = othersList.flagPostscript//是否有附言的标志 true就是有
        if ($scope.flagPostscript) {
          goPostscript()
          $scope.postscriptFlag = true
        }
        $scope.flagApproval = othersList.flagApproval//是否有处理意见的标志 true就是有
        if (othersList.approvals) {
          $scope.allAttachments = angular.fromJson(othersList.allAttachments)//获得所有附件加入到自定义所有附件数组
        }
      }

      /**
       * 已办表单取回api
       * @param account
       * @param procInstId
       * @param reason
       * @param isLoading
       */
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

      /**
       * 初始化时，监听缓存数据 （包括表单数据和其他数据）
       * 前一条数据的表单数据和其他数据都缓存完毕，显示向上翻页按钮
       * 后一条数据的表单数据和其他数据都缓存完毕，显示向下翻页按钮
       */
      $scope.$watch('detailCache', function (n, o) {
        if (!angular.equals(n[$scope.cacheIndex - 1], o[$scope.cacheIndex - 1]) && n[$scope.cacheIndex - 1] && n[$scope.cacheIndex - 1] !== '') {
          $scope.preDetailCached = true
        }
        if (!angular.equals(n[$scope.cacheIndex + 1], o[$scope.cacheIndex + 1]) && n[$scope.cacheIndex + 1] && n[$scope.cacheIndex + 1] !== '') {
          $scope.nextDetailCached = true
        }
      }, true)
      $scope.$watch('detailInfoCache', function (n, o) {
        if (!angular.equals(n[$scope.cacheIndex - 1], o[$scope.cacheIndex - 1]) && n[$scope.cacheIndex - 1] && n[$scope.cacheIndex - 1] !== '') {
          $scope.preDetailInfoCached = true
        }
        if (!angular.equals(n[$scope.cacheIndex + 1], o[$scope.cacheIndex + 1]) && n[$scope.cacheIndex + 1] && n[$scope.cacheIndex + 1] !== '') {
          $scope.nextDetailInfoCached = true
        }
      }, true)

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

      /**
       * 获取分页数据
       * @param param
       * @param startPage
       * @param endPage
       */
      function listCache(param, startPage, endPage) {
        console.log(param, startPage, endPage)
        var selfParam = param
        var url = serverConfiguration.baseApiUrl + 'app/ctl/othertodo/v1/getOtherTodoList'
        viewFormService.getViewFormData(url, param, false).then(function (result) {
          $scope.resultList = $scope.resultList.concat(result.list)
          console.log($scope.resultList, selfParam)
          if (startPage < endPage) {
            startPage++
            selfParam.currentPage++
            listCache(selfParam, startPage, endPage)
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
                var param = {
                  url: $scope.getDetailUrlMap[$stateParams.titleFlag],
                  account: account,
                  taskId: taskId,
                  procInstId: procInstId,
                  isLoading: false
                }
                getDetail(param, true, index)
              }
              if ($scope.detailInfoCache[index] === undefined) {
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
        $scope.cacheIndex++

        if ($scope.detailCache[$scope.cacheIndex].state == -1) {
          confirmBack($scope.detailCache[$scope.cacheIndex], true)
          return
        }
        // 向下翻页后，再下一页如果有数据，让向下翻页按钮显示
        if ($scope.detailCache[$scope.cacheIndex + 1]
          && $scope.detailCache[$scope.cacheIndex + 1] !== ''
          && $scope.detailInfoCache[$scope.cacheIndex + 1]
          && $scope.detailInfoCache[$scope.cacheIndex + 1] !== '') {
          $scope.nextDetailCached = true
          $scope.nextDetailInfoCached = true
        }
        $timeout(function () {
          requestSuccess($scope.detailCache[$scope.cacheIndex])
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
        $scope.cacheIndex--
        // 向上翻页后，再上一页如果有数据，让向上翻页按钮显示
        if ($scope.detailCache[$scope.cacheIndex - 1]
          && $scope.detailCache[$scope.cacheIndex - 1] !== ''
          && $scope.detailInfoCache[$scope.cacheIndex - 1]
          && $scope.detailInfoCache[$scope.cacheIndex - 1] !== '') {
          $scope.preDetailCached = true
          $scope.preDetailInfoCached = true
        }
        $timeout(function () {
          requestSuccess($scope.detailCache[$scope.cacheIndex])
          getInfoRequestSuccess($scope.detailInfoCache[$scope.cacheIndex])
        }, 100)
        getListDataCache($scope.cacheIndex)
      }

      /**
       * 清空页面数据
       */
      function clean() {
        $scope.flagPostscript = false // 附言红点隐藏
        $scope.postscriptFlag = false // 合上附言
        $scope.postscripts = [] // 清空附言
        $scope.flagApproval = false // 处理意见红点隐藏
        $scope.opinionFlag = false // 合上处理意见
        $scope.approvals = [] // 清空处理意见
        $scope.nextP = false  // 存在前一页是长表单，显示加载更多按钮，这里让其不显示
        $scope.dataList = []
        $scope.data = ''
        $scope.htmlContent = ''
        $rootScope.dataTimeNew = ''
        $rootScope.dataTimeNewNow = ''
        cleanScopeData()
      }

      /**
       * 清空module数据
       */
      function cleanScopeData() {
        scopeData.prototype.setLongFormEnlargementData(null)
        scopeData.prototype.setUserRole(null)
        scopeData.prototype.setSignData(null)
        scopeData.prototype.setPermissionData(null)
        scopeData.prototype.setHtmlData(null)
      }

      /**
       * 把页面未展示的从表数据拼接到 $scope.data 的从表数据后面
       */
      function concatSubTableData() {
        for (var p in $scope.data) {
          for (var sub_p in $scope.data[p]) {
            if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
              if ($scope.data[p][sub_p] != undefined && $scope.dataList.length > 0) {
                $scope.data[p][sub_p] = $scope.data[p][sub_p].concat($scope.dataList)
                $scope.dataList.length = 0
              }
            }
          }
        }
      }

      /**
       * 校验表单数据，包括：
       *  a.校验主表id是否改变，
       *  b.从表长度是否改变，
       *  c.以及每条从表数据的 ref_id_ 和主表 id_ 是否相等
       * @returns {boolean}
       */
      function verifyData() {
        var temp = scopeData.prototype.getSignData().data
        for (var p in temp) {
          // 校验主表id
          if (temp[p]['id_'] !== $scope.formDataId) return false
          for (var sub_p in temp[p]) {
            if (temp[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
              var subTable = temp[p][sub_p]
              // 校验从表长度
              if (subTable.length !== $scope.subTableLength) return false
              // 校验主表 id_ 和从表每条数据的 ref_id_ 是否相等
              for (var subKey in subTable) {
                var item = subTable[subKey]
                // 子表 id_ 和 ref_id_ 同时为空，则该条数据为新增数据，目前pc端可以新增数据，预留
                // if (item['id_'] !== '' && item['ref_id_'] !== '') {
                if (item['ref_id_'] !== temp[p]['id_']) return false
                // }
              }
            }
          }
        }
        return true
      }


    }])
})()

