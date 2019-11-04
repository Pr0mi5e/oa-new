(function () {
  'use strict'

  var app = angular.module('community.controllers.waitWork')

  /*待办*/
  app.controller('WaitWorkCtrl', ['$scope', '$state', '$stateParams', '$ionicHistory', '$ionicNativeTransitions', '$rootScope',
    '$ionicLoading', '$timeout', '$ionicActionSheet', 'WaitWorkListService', 'serverConfiguration', 'scopeData',
    'storageService', 'auth_events', 'timeout', '$ionicScrollDelegate', 'wait_work', '$isMobile', '$cordovaToast', 'T', 'application', 'stateGoHelp', 'GetRequestService',
    function ($scope, $state, $stateParams, $ionicHistory, $ionicNativeTransitions, $rootScope, $ionicLoading, $timeout,
              $ionicActionSheet, WaitWorkListService, serverConfiguration, scopeData, storageService, auth_events,
              timeout, $ionicScrollDelegate, wait_work, $isMobile, $cordovaToast, T, application, stateGoHelp, GetRequestService) {

      $scope.waitWorkListData = []//待办列表数据
      $scope.mapList = []
      $scope.createDate = 'createDate'
      $scope.createTime = 'create_time_'
      $scope.titleMaxLength = 8
      $scope.procInstIdArray = []
      $scope.handlingList = []  // 处理中
      $scope.handledList = []  // 处理完成
      $scope.approveFlags = []
      // 调用接口获取typeIdMap下的Id
      var typeIdMapFunc = function () {
        var urlSync = serverConfiguration.baseApiUrl + 'app/common/v1/getTypeId'
        var param = {
          account: storageService.get(auth_events.userId, null)
        }
        WaitWorkListService.getWaitWorkListData(urlSync, param, true, 'POST').then(function (result) {
          $scope.mapList = result.list
          // var listId = result.list;
          // listId.forEach(function (item, index) {
          //   typeIdMap = {
          //     "typeAllBtn": null,
          //     "typeBuyBtn": "10000000070037",
          //     "typeFinanceBtn": "10000003330043",
          //     "typeHRBtn": "10000000070035",
          //     "typeOtherBtn": "10000000070034"
          //   };
          // });

        }, function (err) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('mine.remarks-fail'))
          }
        })
      }
      typeIdMapFunc()

      var taskStatusMap = {
        'allBtn': null,
        'pauseBtn': 3,
        'backBtn': 2,
        'readBtn': 1,
        'unreadBtn': 0
      }
      // , typeIdMap = {
      //   "typeAllBtn": null,
      //   "typeBuyBtn": "10000000070037",
      //   "typeFinanceBtn": "10000003330043",
      //   "typeHRBtn": "10000000070035",
      //   "typeOtherBtn": "10000000070034"
      // }

      var userId = storageService.get(auth_events.userId, null)
      var taskStatus = taskStatusMap[storageService.get(wait_work.sizerWorkStateKey, 'allBtn')]//事项状态（0-未读 1-已读 2-退回 3-暂存待办）
      var typeId = storageService.get(wait_work.sizerWorkTypeKey, null)//事项分类
      var subjectSearch = null//标题
      var createTimeFromSearch = null//发起开始时间
      var createTimeToSearch = null//发起结束时间
      var creatorSearch = null//发起人
      storageService.removeItem('backReply')
      $scope.sizerImgShow = true//控制是否过滤，默认显示过滤图标
      $scope.searchImgShow = true//控制时候筛选，默认显示筛选图标
      /**
       * * 2018/4/19 14:23  tyw
       *  变更描述：添加空数据展示页面
       *  功能说明：当请求数据为空时展示一个空数据图标
       */
      $scope.isEmptyData = true//是否显示空数据界面


      var titleFlag = $stateParams.titleFlag
      console.log('=============== %O', $stateParams)
      if (!($stateParams.workWaitData == undefined || $stateParams.workWaitData == '')) {
        //你还记得在工作页也有待办的吧  这就是那跳到列表 然后又搜索了
        $scope.workWaitData = angular.fromJson($stateParams.workWaitData)

        var isWorkFlag = $scope.workWaitData.workFlag

        var titleName = $scope.workWaitData.title

        var condition = $scope.workWaitData.condition//同步信息的condition
        if (isWorkFlag == 'isWork') {
          typeId = $scope.workWaitData.typeId
        }

      } else if ($stateParams.workFlag == 'isWork') {
        var isWorkFlag = $stateParams.workFlag

        var titleName = $stateParams.titleName

        var condition = $stateParams.condition//同步信息的condition

        typeId = $stateParams.typeId
        console.log(typeId)


        $scope.workWaitData = {
          title: titleName,
          typeId: typeId,
          workFlag: isWorkFlag,
          condition: condition
        }

        /*控制过滤图标、筛选图标是否显示是否显示,自定义的隐藏*/
        if (condition.length != 0) {
          $scope.sizerImgShow = false
          $scope.searchImgShow = false
        }

      } else {

        $scope.workWaitData = undefined

      }

      $scope.noti = {}
      var currentPageFlag = 1
      var pageSize = 10
      $scope.$on('$ionicView.enter', function (event, data) {
        if (isWorkFlag == 'isWork') {
          $rootScope.hideTabs = true
          $rootScope.bell = false
          $rootScope.toBack = true
        }

      })

      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        console.log($stateParams.viewOtherWaitWork)
        $rootScope.viewOtherWaitWork = JSON.parse($stateParams.viewOtherWaitWork|| 'false') || false
        // 如果formHandleID存在，说明是从表单处理页面审批（同意/不同意）后返回到本页，
        // 需要从列表数据中删除formHandleID对应的数据
        // 2019-7-3 需求变更 如果 FORM_HANDLE_ID 存在说明是同步情况
        var formHandleID = storageService.get('FORM_HANDLE_ID', null)
        if (formHandleID && $scope.waitWorkListData.length > 0) {
          for (var key in $scope.waitWorkListData) {
            if ($scope.waitWorkListData[key].procInstId === formHandleID) {
              console.log($scope.waitWorkListData[key])
              $scope.waitWorkListData.splice(key, 1)
            }
          }
          storageService.removeItem('FORM_HANDLE_ID')
        }
        /**
         * * 2018/10/31 14:23  tyw
         *  变更描述：bug2814:增加审批后回到待办列表，保存之前搜索条件和滚动位置
         *  功能说明：
         1.记录搜索条件：

         在筛选和搜索界面，点击确认进行搜索时，缓存当前搜索条件
         在待办页面加载时获取之前缓存的条件，进行请求数据

         2.记录滚动位置：

         点击进入详情页的时候，记录当前位置、搜索条件以及当前列表数据的数量，处理完成后判断是否需要进行滚动
         {
                    needRemberPosition：是否记录当前位置,
                    selectedFormIndex：选中表单在列表中的序号，
                    verticalScrollOffset：当前滚动距离
                }
         */
        var searchDataStr = storageService.get('searchDataStr', '')
        taskStatus = taskStatusMap[storageService.get(wait_work.sizerWorkStateKey, 'allBtn')]//事项状态（0-未读 1-已读 2-退回 3-暂存待办）
        typeId = storageService.get(wait_work.sizerWorkTypeKey, null)//事项分类
        if (!(searchDataStr == undefined || searchDataStr == '')) {
          searchDataStr = angular.fromJson(searchDataStr)
          subjectSearch = searchDataStr.searchTitle//标题
          createTimeFromSearch = searchDataStr.searchStartTime//发起开始时间
          createTimeToSearch = searchDataStr.searchEndTime//发起结束时间
          if (createTimeFromSearch == '开始时间') {
            createTimeFromSearch = null
          }
          if (createTimeToSearch == '结束时间') {
            createTimeToSearch = null
          }
          creatorSearch = searchDataStr.searchName//发起人

        }

        var currentViewData = $ionicHistory.backView() || {}
        var currentForwardViewData = $ionicHistory.forwardView() || {}
        storageService.removeItem('backReply')


        // if (!(currentViewData == null)) {
        if (currentViewData !== null) {
          if (currentViewData.stateName == 'tab.view-form' || currentViewData.stateName == 'tab.viewFormWork') {
            data.direction = 'back'
            if (!$isMobile.isPC && $isMobile.Android) {
              if (data.direction === 'back') {
                var transitionDirection = 'right'
                window.plugins.nativepagetransitions.slide({
                  'direction': transitionDirection
                })
              }
            }
          }
        }
        if (!(currentForwardViewData == null)) {
          if (currentForwardViewData.stateName == 'tab.view-form' || currentForwardViewData.stateName == 'tab.viewFormWork') {
            data.direction = 'back'
            if (!$isMobile.isPC && $isMobile.Android) {
              if (data.direction === 'back') {
                var transitionDirection = 'right'
                window.plugins.nativepagetransitions.slide({
                  'direction': transitionDirection
                })
              }
            }
          }
        }

        if (isWorkFlag != 'isWork') {
          $ionicHistory.clearCache()
          $ionicHistory.clearHistory()
          $rootScope.bell = true
          $rootScope.toBack = false
          $rootScope.titleData = '待办'
        } else {
          typeId = $scope.workWaitData.typeId
          $ionicHistory.clearCache()
          $rootScope.titleData = titleName.length > $scope.titleMaxLength ? titleName.slice(0, $scope.titleMaxLength) + '...' : titleName
          $rootScope.bell = false
          $rootScope.toBack = true
          data.enableBack = true//交叉路由
          if ($isMobile.Android) {
            /*解决下方bar有时会显示2-3秒才隐藏的问题*/
            angular.element(document.querySelectorAll('.tabs-icon-top')).addClass('tabs-item-hide')
          }

        }

        // 获取处理中数据列表;
        if (data.direction !== 'back') {
          var needRemberPosition = storageService.get('needRemberPosition', null)
          currentPageFlag = 1
          pageSize = currentPageFlag * 10
          if (needRemberPosition) {
            var selectedFormIndex = storageService.get('selectedFormIndex', 1)
            var top = storageService.get('verticalScrollOffset', 0)
            currentPageFlag = Math.ceil(selectedFormIndex / 10)
            pageSize = currentPageFlag * 10

          }
          // $ionicScrollDelegate.scrollTop();
          if (isWorkFlag != 'isWork') {
            $rootScope.bell = true
            $rootScope.toBack = false
            $rootScope.titleData = '待办'

            requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
              creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)

          } else {
            console.log($scope.map[$scope.isBtn.name])
            $rootScope.titleData = titleName.length > $scope.titleMaxLength ? titleName.slice(0, $scope.titleMaxLength) + '...' : titleName
            $rootScope.bell = false
            $rootScope.toBack = true
            taskStatus = taskStatusMap[storageService.get(wait_work.sizerWorkStateKey, 'allBtn')]//事项状态（0-未读 1-已读 2-退回 3-暂存待办）
            console.log($scope.waitWorkListData)
            requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
              creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
          }
          storageService.removeItem('sizerBackRequest')
        } else {
          // 返回到列表页 处理中的数据是否处理完成
          getSyncDataList()
          if ($scope.handlingList.length > 0) {
            getHandledList()
          }
          var backRequest = storageService.get('sizerBackRequest', null)
          //backRequest为筛选 sizer页时点击确定存的字段 retrieve为取回操作后存的字段 不是这俩的时候不让请求
          // 避免 请求数据在第二页以上页面时从下一页返回到本页而出现的最后一条数据为null的问题
          if (backRequest == 'backRequest' || $stateParams.retrieve == 'retrieve' || backRequest == 'backRequestSave') {
            if (isWorkFlag == 'isWork' || $stateParams.retrieve == 'retrieve') {
              taskStatus = taskStatusMap[storageService.get(wait_work.sizerWorkStateKey, 'allBtn')]//事项状态（0-未读 1-已读 2-退回 3-暂存待办）
              $ionicScrollDelegate.scrollTop()
              requestWaitWorkData(userId, 1, 10, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
                creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
              storageService.set('sizerBackRequest', null)
            } else if (backRequest == 'backRequestSave') {
              $ionicScrollDelegate.scrollTop()
              requestWaitWorkData(userId, 1, 10, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
                creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
            }
          }
        }

        // application.getAlertNews();//获取新消息提示  即红点(底部tabs 工作 待办 消息  铃铛)

        scopeData.prototype.setStateCurrentViewDataName($ionicHistory.currentView().stateName)
        scopeData.prototype.setStateCurrentViewParams($ionicHistory.currentView().stateParams)

        $rootScope.$ionicGoBack = function () {
          var currentViewData = $ionicHistory.currentView()

          var stateName = $rootScope.viewOtherWaitWork ? 'tab.mine' : 'tab.work'
          stateGoHelp.stateGoUtils(true, stateName, {titleFlag: titleFlag}, 'right')
        }

      })

      //按钮（时间，标题）名称
      $scope.buttons = [
        {name: '发起时间'},
        {name: '接收时间'},
        {name: '标题'}
      ]
      //按钮（时间，标题）点击事件
      $scope.isBtn = {'name': storageService.get('buttonName', '发起时间')}
      // storageService.set("chooseBtn",$scope.map[$scope.isBtn.name])
      $scope.chooseBtn = function (index) {
        $scope.isBtn = index
        currentPageFlag = 1
        storageService.set('buttonName', $scope.isBtn.name)
        if ($scope.isBtn.name === '标题') {
          requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
            creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
        } else if ($scope.isBtn.name === '发起时间') {
          requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
            creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
        } else if ($scope.isBtn.name === '接收时间') {
          requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
            creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
        }
      }
      //按钮（正序，倒序）点击事件
      $scope.isDesc = storageService.get('btnName', 'true') === 'true'
      $scope.map = {
        '标题': 'subject_',
        '发起时间': $scope.createDate,
        '接收时间': $scope.createTime
      }
      $scope.chooseBtns = function () {
        $scope.isDesc = !$scope.isDesc
        storageService.set('btnName', $scope.isDesc)
        currentPageFlag = 1
        if ($scope.isDesc) {
          console.log($scope.isBtn.name)
          // 降序
          requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
            creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
        } else {
          // 升序
          requestWaitWorkData(userId, 1, pageSize, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
            creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', true)
        }
      }
      //下拉刷新
      $scope.doRefresh = function () {
        currentPageFlag = 1
        $timeout(function () {
          requestWaitWorkData(userId, 1, 10, subjectSearch, taskStatus, typeId, createTimeFromSearch, createTimeToSearch,
            creatorSearch, $scope.map[$scope.isBtn.name], $scope.isDesc ? 'desc' : 'asc', false)
          $scope.$broadcast('scroll.refreshComplete')
        }, timeout.pullDown)

      }

      //上拉加载
      $scope.loadMore = function () {
        var num = ++currentPageFlag
        var url = serverConfiguration.baseApiUrl + (($stateParams.custom !== '' && $stateParams.custom !== undefined) ? 'app/myNewTodo/v1/getCustomQueryList' : 'app/myNewTodo/v2/getList')
        var requestParam = {}//请求的参数对象
        // var self_typeId = typeId ? typeId : storageService.get(wait_work.sizerWorkTypeKey, null)//事项分类
        // self_typeId = self_typeId === 'null' ? null : self_typeId
        var param = {
          account: userId,//用户账号，pkid
          currentPage: num,//当前页码
          pageSize: 10,//每页记录数
          subject: subjectSearch,//标题
          taskStatus: taskStatus,//事项状态（暂存，退回，已读，未读）
          typeId: typeId,//事项分类
          createTimeFrom: createTimeFromSearch,//发起开始时间
          createTimeTo: createTimeToSearch,//发起结束时间
          creator: creatorSearch,//发起人
          // orderField: "",//排序字段：默认create_time
          orderField: $scope.map[$scope.isBtn.name],//排序字段：默认create_time

          // orderSeq: "desc",//排序方向：默认desc-[desc,asc]
          orderSeq: $scope.isDesc ? 'desc' : 'asc',//排序方向：默认desc-[desc,asc]
          resubmitFlg: 0
        }
        console.log(num)

        if ($stateParams.custom !== '' && $stateParams.custom !== undefined) {
          requestParam = JSON.parse($stateParams.custom)
          requestParam['condition'] = encodeURIComponent(requestParam['condition'])
          requestParam['account'] = userId
          requestParam['currentPage'] = num
          requestParam['pageSize'] = 10
        } else if (typeof (condition) === 'undefined' || condition.length == 0) {
          requestParam = param

        } else {
          /*同步后加载*/
          var paramCondition = angular.fromJson(condition)
          paramCondition.account = userId
          paramCondition.currentPage = num
          paramCondition.pageSize = 10
          requestParam = paramCondition
        }
        requestParam.orderField = param.orderField
        requestParam.orderSeq = param.orderSeq
        // 查看其他人待办
        if ($rootScope.viewOtherWaitWork) {
          url = serverConfiguration.baseApiUrl + 'app/ctl/othertodo/v1/getOtherTodoList'
          requestParam.todoUserCode = $stateParams.todoUserCode
        }
        WaitWorkListService.getWaitWorkListData(url, requestParam, false).then(function (result) {
          $scope.waitWorkListData = $scope.waitWorkListData.concat(result.list ? result.list : [])
          console.log($scope.waitWorkListData)
          $scope.isHasNextPage = result.flagNextPage
          for (var i = 0; i < $scope.waitWorkListData.length; i++) {
            if ($scope.waitWorkListData[i].taskStatus == '未读') {
              $scope.waitWorkListData[i].imgUrl = 'app/wait-work/img/wait-work-unread.png'
            } else if ($scope.waitWorkListData[i].taskStatus == '已读') {
              $scope.waitWorkListData[i].imgUrl = 'app/wait-work/img/wait-work-read.png'
            } else if ($scope.waitWorkListData[i].taskStatus == '退回') {
              $scope.waitWorkListData[i].imgUrl = 'app/work/img/my-work-matter-send_back.png'
            } else if ($scope.waitWorkListData[i].taskStatus == '暂存待办') {
              $scope.waitWorkListData[i].imgUrl = 'app/wait-work/img/wait-work-pause-save.png'
            }
            if ($scope.waitWorkListData[i].subject && $scope.waitWorkListData[i].subject.split('¤※').length > 1) {
              $scope.waitWorkListData[i].totalNum = $scope.waitWorkListData[i].subject.split('¤※')[1]
              $scope.waitWorkListData[i].totalLetter = convertCurrency($scope.waitWorkListData[i].totalNum)
              $scope.waitWorkListData[i].totalNum = fmoney($scope.waitWorkListData[i].totalNum)
            }
          }
          $scope.$broadcast('scroll.infiniteScrollComplete')
        }, function (err) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })

      }

      // 数字金额大写转换(可以处理整数,小数,负数)
      // function smalltoBIG(n) {
      //   var fraction = ['角', '分'];
      //   var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
      //   var unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
      //   var head = n < 0 ? '欠' : '';
      //   n = Math.abs(n);
      //
      //   var s = '';
      //
      //   for (var i = 0; i < fraction.length; i++) {
      //     s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
      //   }
      //   s = s || '整';
      //   n = Math.floor(n);
      //
      //   for (var i = 0; i < unit[0].length && n > 0; i++) {
      //     var p = '';
      //     for (var j = 0; j < unit[1].length && n > 0; j++) {
      //       p = digit[n % 10] + unit[1][j] + p;
      //       n = Math.floor(n / 10);
      //     }
      //     s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
      //   }
      //   return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
      // }
      function convertCurrency(currencyDigits) {

        var tmp = _toCashNumber(currencyDigits)
        if (isNaN(tmp)) return currencyDigits

        var MAXIMUM_NUMBER = 99999999999.99
        var CN_ZERO = '零'
        var CN_ONE = '壹'
        var CN_TWO = '贰'
        var CN_THREE = '叁'
        var CN_FOUR = '肆'
        var CN_FIVE = '伍'
        var CN_SIX = '陆'
        var CN_SEVEN = '柒'
        var CN_EIGHT = '捌'
        var CN_NINE = '玖'
        var CN_TEN = '拾'
        var CN_HUNDRED = '佰'
        var CN_THOUSAND = '仟'
        var CN_TEN_THOUSAND = '万'
        var CN_HUNDRED_MILLION = '亿'
        var CN_SYMBOL = ''
        var CN_DOLLAR = '元'
        var CN_TEN_CENT = '角'
        var CN_CENT = '分'
        var CN_INTEGER = '整'
        var integral
        var decimal
        var outputCharacters
        var parts
        var digits, radices, bigRadices, decimals
        var zeroCount
        var zeroLast = false
        var i, p, d
        var quotient, modulus
        currencyDigits = currencyDigits.toString()
        if (currencyDigits == '') {
          return ''
        }
        if (currencyDigits.match(/[^,.\d]/) != null) {
          return ''
        }
        if ((currencyDigits)
          .match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
          return ''
        }
        currencyDigits = currencyDigits.replace(/,/g, '')
        currencyDigits = currencyDigits.replace(/^0+/, '')

        if (Number(currencyDigits) > MAXIMUM_NUMBER) {
          return ''
        }

        parts = currencyDigits.split('.')
        if (parts.length > 1) {
          integral = parts[0]
          decimal = parts[1]

          decimal = decimal.substr(0, 2)
        } else {
          integral = parts[0]
          decimal = ''
        }

        digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE,
          CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE)
        radices = new Array('', CN_TEN, CN_HUNDRED, CN_THOUSAND)
        bigRadices = new Array('', CN_TEN_THOUSAND, CN_HUNDRED_MILLION)
        decimals = new Array(CN_TEN_CENT, CN_CENT)

        outputCharacters = ''

        if (Number(integral) > 0) {
          zeroCount = 0
          //最后一位是否为0
          zeroLast = false
          for (i = 0; i < integral.length; i++) {
            p = integral.length - i - 1
            d = integral.substr(i, 1)
            quotient = p / 4
            modulus = p % 4
            if (d == '0') {
              zeroCount++
            } else {
              if (zeroCount > 0) {
                outputCharacters += digits[0]
              }
              zeroCount = 0
              outputCharacters += digits[Number(d)] + radices[modulus]
            }
            if (modulus == 0 && zeroCount < 4) {
              outputCharacters += bigRadices[quotient]
            }
            //200.1 显示贰佰元零一角
            if (i == integral.length - 1 && d == '0') {
              zeroLast = true
            }
          }
          outputCharacters += CN_DOLLAR
          if (zeroLast && Number(decimal) > 10) {
            outputCharacters += CN_ZERO
          } else {
            if (decimal != '') {
              if (zeroLast && Number(decimal.substr(0, 1)) > 0) {
                outputCharacters += CN_ZERO
              }
            }
          }
        }

        if (decimal != '') {
          for (i = 0; i < decimal.length; i++) {
            d = decimal.substr(i, 1)
            if (d != '0') {
              if (i != 0) {
                var dtemp = decimal.substr(0, 1)
                if (Number(integral) > 0 && Number(decimal.substr(0, 1) == 0)) {
                  outputCharacters += digits[0]
                }
              }
              outputCharacters += digits[Number(d)] + decimals[i]
            }
          }
        }
        if (outputCharacters == '') {
          outputCharacters = CN_ZERO + CN_DOLLAR
        }
        if (decimal == '' || decimal == '0' || decimal == '00' || (decimal.toString().length == 1) || (decimal.toString().length > 1 && (Number(decimal).toString()).substr(1, 1) == '0')) {
          outputCharacters += CN_INTEGER
        }
        outputCharacters = CN_SYMBOL + outputCharacters
        return outputCharacters
      }

      function _toCashNumber(x) {
        if (x === null || x === undefined || x === '')
          return ''
        if (typeof x == 'string') {
          x = x.replace(/,/g, '')
        }
        var match = x.toString().match(/([$|￥])\d+\.?\d*/)
        if (match) {
          x = x.replace(match[1], '')
        }
        return Number(x)
      }

      // fmoney
      function fmoney(num) {
        return (num + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
      }

      // 加载第一页
      function requestWaitWorkData(account, currentPage, pageSize, subject, taskStatus, typeId, createTimeFrom, createTimeTo,
                                   creator, orderField, orderSeq, isLoading) {
        var url = serverConfiguration.baseApiUrl + (($stateParams.custom !== '' && $stateParams.custom !== undefined) ? 'app/myNewTodo/v1/getCustomQueryList' : 'app/myNewTodo/v2/getList')
        var requestParam = {}//请求的参数对象
        // if(currentPage == 1){
        //   currentPageFlag = 1;
        // }

        var taskStatus = taskStatus ? taskStatus : taskStatusMap[storageService.get(wait_work.sizerWorkStateKey, 'allBtn')]//事项状态（0-未读 1-已读 2-退回 3-暂存待办）
        var typeId = typeId ? typeId : storageService.get(wait_work.sizerWorkTypeKey, null)//事项分类
        typeId = typeId === 'null' ? null : typeId
        var param = {
          account: account,//用户账号，pkid
          currentPage: currentPage,//当前页码
          pageSize: pageSize,//每页记录数
          subject: subject,//标题
          taskStatus: taskStatus,//事项状态（暂存，退回，已读，未读）
          typeId: typeId,//事项分类
          createTimeFrom: createTimeFrom,//发起开始时间
          createTimeTo: createTimeTo,//发起结束时间
          creator: creator,//发起人
          orderField: orderField,//排序字段：默认create_time
          orderSeq: orderSeq,//排序方向：默认desc-[desc,asc]
          resubmitFlg: 0
        }

        if ($stateParams.custom !== '' && $stateParams.custom !== undefined) {
          requestParam = JSON.parse($stateParams.custom)
          requestParam['condition'] = encodeURIComponent(requestParam['condition'])
          requestParam['account'] = account
          requestParam['currentPage'] = currentPage
          requestParam['pageSize'] = pageSize
        } else if (typeof (condition) === 'undefined' || condition.length == 0) {
          requestParam = param
        } else {
          var paramCondition = angular.fromJson(condition)
          paramCondition.account = account
          paramCondition.currentPage = currentPage
          paramCondition.pageSize = pageSize
          paramCondition.orderSeq = orderSeq
          // paramCondition.typeId = $stateParams.typeId;
          // paramCondition.resubmitFlg = 0;
          if (createTimeFrom != null) {
            paramCondition.createTimeFrom = createTimeFrom
          }
          if (createTimeTo != null) {
            paramCondition.createTimeTo = createTimeTo
          }
          if (creator != null) {
            paramCondition.creator = creator
          }
          if (subject != null) {
            paramCondition.subject = subject
          }
          requestParam = paramCondition
        }
        requestParam.orderField = orderField
        requestParam.orderSeq = orderSeq
        // requestParam.typeId = null
        // 查看其他人待办
        if ($rootScope.viewOtherWaitWork) {
          url = serverConfiguration.baseApiUrl + 'app/ctl/othertodo/v1/getOtherTodoList'
          requestParam.todoUserCode = $stateParams.todoUserCode
        }
        $scope.requestParam = requestParam
        WaitWorkListService.getWaitWorkListData(url, requestParam, isLoading).then(function (result) {
          $scope.totalCount = result.totalCount;  // 记录总记录数，用于传递到明细页
          if (result.list && result.list.length > 0) {
            $scope.handlingList = []
            $scope.handledList = []
            getSyncDataList()
          }
          $scope.waitWorkListData = result.list
          $scope.isHasNextPage = result.flagNextPage

          if (result.list == null) {
            $scope.noti.text = '没有数据可以更新'
            $scope.isEmptyData = true
            $rootScope.tabWaitWork = false  // 待办红点提示
            $rootScope.tabWork = $rootScope.documentNum > 0  // 工作红点是否显示 待办+公文 此时自判断公文数量
          } else {
            $rootScope.tabWaitWork = true  // 待办红点提示
            $rootScope.tabWork = true  // 工作红点是否显示 待办+公文
            $scope.isEmptyData = false
            $scope.noti.text = '成功更新' + result.list.length + '条信息'
            for (var i = 0; i < $scope.waitWorkListData.length; i++) {
              if ($scope.waitWorkListData[i].taskStatus == '未读') {
                $scope.waitWorkListData[i].imgUrl = 'app/wait-work/img/wait-work-unread.png'
              } else if ($scope.waitWorkListData[i].taskStatus == '已读') {
                $scope.waitWorkListData[i].imgUrl = 'app/wait-work/img/wait-work-read.png'
              } else if ($scope.waitWorkListData[i].taskStatus == '退回') {
                $scope.waitWorkListData[i].imgUrl = 'app/work/img/my-work-matter-send_back.png'
              } else if ($scope.waitWorkListData[i].taskStatus == '暂存待办') {
                $scope.waitWorkListData[i].imgUrl = 'app/wait-work/img/wait-work-pause-save.png'
              }
              $scope.procInstIdArray.push($scope.waitWorkListData[i].procInstId)
              // 待办合计
              // var num = $scope.waitWorkListData[i].subject.split('¤※')[1]
              // var letter = smalltoBIG(num)
              // $scope.waitWorkListData[i].total = num + letter
              // console.log($scope.waitWorkListData);
              if ($scope.waitWorkListData[i].subject && $scope.waitWorkListData[i].subject.split('¤※').length > 1) {
                $scope.waitWorkListData[i].totalNum = $scope.waitWorkListData[i].subject.split('¤※')[1]
                $scope.waitWorkListData[i].totalLetter = convertCurrency($scope.waitWorkListData[i].totalNum)
                $scope.waitWorkListData[i].totalNum = fmoney($scope.waitWorkListData[i].totalNum)
              }
            }
            var procInstIds = $scope.procInstIdArray.join(',')
            var url = serverConfiguration.baseApiUrl + 'app/common/v1/getListApprove'
            var param = {
              procInstIds: procInstIds
            }
            var isLoading = false
            WaitWorkListService.getWaitWorkListData(url, param, isLoading).then(function (result) {
              console.log(result)
              if (result.state === 0) {
                $scope.approveFlags = result.list
              }
            }).catch(function (error) {

            })

          }

          if (storageService.get('needRemberPosition', null)) {
            $timeout(function () {
              $ionicScrollDelegate.$getByHandle('myScroll').scrollTo(0, storageService.get('verticalScrollOffset', 0))
              storageService.removeItem('needRemberPosition')
              storageService.removeItem('selectedFormIndex')
              storageService.removeItem('verticalScrollOffset')
            }, 1000)
          }

        }, function (err) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }


      /*跳转通知*/
      $rootScope.clickLiftMessage = function () {
        /*backFlag:用于判断goBack标记*/
        stateGoHelp.stateGoUtils(true, 'tab.notification', {
          titleFlag: titleFlag, backFlag: 'back'
        }, 'left')
      }

      /*跳转过滤*/
      $scope.goSizer = function () {
        if (isWorkFlag == 'isWork') {
          stateGoHelp.stateGoUtils(true, 'tab.myWorkSizer', {
            // titleName: titleName, titleFlag: titleFlag, workFlag: 'isWork'
            titleName: titleName, titleFlag: titleFlag, workFlag: 'isWork'
          }, 'left')
        } else {
          stateGoHelp.stateGoUtils(true, 'tab.sizer', {mapList: JSON.stringify($scope.mapList)}, 'left')
        }

      }

      /*跳转搜索*/
      $scope.goSearch = function () {
        if (isWorkFlag == 'isWork') {
          stateGoHelp.stateGoUtils(true, 'tab.searchWork', {
            workFlag: 'isWork',
            titleName: titleName,
            titleFlag: titleFlag,
            condition: condition,
            typeId: typeId,
            viewOtherWaitWork: $rootScope.viewOtherWaitWork,
            todoUserCode: $stateParams.todoUserCode
          }, 'left')
        } else {
          stateGoHelp.stateGoUtils(true, 'tab.search', {}, 'left')
        }

      }


      /*跳转详情*/
      $scope.goDetails = function (result, index) {
        if ($scope.handlingList.indexOf(result.procInstId) > -1 || $scope.handledList.indexOf(result.procInstId) > -1) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom('已移交处理表单不可查看')
          } else {
            alert('已移交处理表单不可查看')
          }
          return false
        }
        var waitWorkPassDate = {
          taskId: result.taskId,
          procInstId: result.procInstId
        }
        $scope.requestParam.index = index;  // 当前索引
        $scope.requestParam.totalCount = $scope.totalCount; // 列表页总记录数
        storageService.set('selectedFormIndex', index + 1)
        storageService.set('verticalScrollOffset', $ionicScrollDelegate.$getByHandle('myScroll').getScrollPosition().top)
        stateGoHelp.stateGoUtils(true, 'tab.view-form', {
          waitWorkPassDate: angular.toJson(waitWorkPassDate),
          workWaitData: angular.toJson($scope.workWaitData), workFlag: 'isWork', titleFlag: titleFlag,
          requestParam: angular.toJson($scope.requestParam)
        }, 'left')

        if (!$rootScope.viewOtherWaitWork && result.taskStatus == '未读') {
          result.imgUrl = 'app/wait-work/img/wait-work-read.png'
        }
      }

      /**
       * 获取处理中数据
       */
      function getSyncDataList() {
        console.log($scope.handlingList)
        var url = serverConfiguration.baseApiUrl + 'app/syncdata/v1/getList'
        var param = {
          account: storageService.get(auth_events.userId, null)
        }
        var isLoading = false
        WaitWorkListService.getWaitWorkListData(url, param, isLoading).then(function (result) {
          $scope.handlingList = $scope.handlingList.concat(result.list) // 会有重复数据
          console.log($scope.handlingList)
        }).catch(function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

      /**
       * 获取处理完成数据
       */
      function getHandledList() {
        var url = serverConfiguration.baseApiUrl + 'app/syncdata/v1/getPorceedList'
        var param = {
          account: storageService.get(auth_events.userId, null),
          procInstIds: $scope.handlingList.join(',')
        }
        var isLoading = false
        WaitWorkListService.getWaitWorkListData(url, param, isLoading).then(function (result) {
          if (result.list.length > 0) {
            for (var key in result.list) {
              // 将处理完成的数据从处理中的数组中移除
              $scope.handlingList.splice($scope.handlingList.indexOf(result.list[key]), 1)
            }
            console.log($scope.handlingList)
          }
          $scope.handledList = $scope.handledList.concat(result.list) // 会有重复数据
        }).catch(function (error) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('publicMsg.requestErr'))
          }
        })
      }

    }])

})()


