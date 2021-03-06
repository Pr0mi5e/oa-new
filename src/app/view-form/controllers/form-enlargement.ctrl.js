(function () {
  'use strict'

  var app = angular.module('community.controllers.formEnlargement', [])
  app.controller('FormEnlargementCtrl', ['$scope', '$state', '$rootScope', '$ionicNativeTransitions', '$ionicHistory', '$isMobile',
    '$stateParams', 'storageService', 'auth_events', 'serverConfiguration', 'scopeData', '$timeout', 'viewFormService', 'timeout', 'stateGoHelp',
    'form_constant', 'clone', '$cordovaToast', 'APP', 'application', '$ionicScrollDelegate',
    function ($scope, $state, $rootScope, $ionicNativeTransitions, $ionicHistory, $isMobile, $stateParams, storageService,
              auth_events, serverConfiguration, scopeData, $timeout, viewFormService, timeout, stateGoHelp, form_constant, clone, $cordovaToast
      , APP, application, $ionicScrollDelegate) {

      $rootScope.bell = false//小铃铛不显示
      $rootScope.toBack = true//返回按钮显示
      $scope.workWaitData = $stateParams.workWaitData
      $scope.zoomFlag = false//表单竖屏的时候,用来缩放适配的标识
      $scope.tableFlagE = true//表单显示
      var titleFlag = $stateParams.titleFlag
      var tableWidth//表单宽度
      var viewScrollForm = $ionicScrollDelegate.$getByHandle('viewFormScrollHandleChild')//控制表单点击更多时,表单数据向上滚动
      $scope.subTablePage = $stateParams.subTablePage
      $scope.dataList = []
      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        storageService.set('viewFormCacheWork', 'viewFormCacheWork')//写一个标识符用来判断是放大表单页面返回
        var Type = $stateParams.type
        $rootScope.hideTabs = true//最下面的小白条bug不显示
        $rootScope.bell = false//小铃铛不显示
        $rootScope.toBack = true//返回按钮显示
        $rootScope.titleData = '放大表单'//标题
        $scope.saveOption = false//保存按钮默认不显示
        data.enableBack = true//交叉路由 不知道你就去查百度 我解释不清
        $scope.nextP = false//长表单上拉显示 默认不显示
        $scope.tableFlagE = true//表单显示
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
        $rootScope.dataListENew = []//长表单查看也处理用保存的
        //消息或者通知跳过来的
        /**
         * * 2018/6/28 9:36  CrazyDong
         *  变更描述：改用权限来判断保存按钮是否显示
         *  功能说明：
         */
        //        if(!($stateParams.NotificationItem == undefined || $stateParams.NotificationItem == '')){
        //          if(angular.fromJson($stateParams.NotificationItem).jumpType == '0'){
        //            $rootScope.titleData = '放大表单';//标题
        //            $scope.saveOption = false;//保存按钮不显示
        //          }else if(angular.fromJson($stateParams.NotificationItem).jumpType == '1'){
        //            $rootScope.titleData = '放大表单';//标题
        //            $scope.saveOption = true;//保存按钮显示
        //          }
        //        }else {
        //          if (Type == 'work') {//从工作页跳过来的
        //            $rootScope.titleData = '放大表单';//标题
        //            $scope.saveOption = false;//保存按钮不显示
        //          } else {
        //            $rootScope.titleData = '放大表单';//标题
        //            $scope.saveOption = true;//保存按钮显示
        //          }
        //        }

        scopeData.prototype.setCheckFlag(false)
        //在pad上显示20条数据 点击每次加载20条数据 其他设备上10条start
        var xList = 10
        var xListOnly = 11
        if (ionic.Platform.isIPad()) {
          xList = 20
          xListOnly = 21
        }
        //在pad上显示20条数据 点击每次加载20条数据 其他设备上10条end
        /**
         * * 2018/6/28 10:49  CrazyDong
         *  变更描述：判断是否显示保存按钮
         *  功能说明：获取表单总权限数组和签章权限数组,在总权限数组去除和签章数组重复的key,剩余数组中value == "w"
         *            时,显示保存btn,并跳出for循环
         */
        var permissionData = scopeData.prototype.getPermissionData()//总权限
        var signPermission = scopeData.prototype.getSignData()//签章权限
        $scope.htmlContent = scopeData.prototype.getHtmlData()//获取页面的html
        $scope.permission = scopeData.prototype.getPermissionData()//获取页面的验证
        Object.keys(permissionData.fields).forEach(function (key) {
          if (signPermission.sign.length > 0) {
            for (var i = 0; i < signPermission.sign.length; i++) {
              for (var temp in permissionData.fields[key]) {
                /**
                 * * 2018/7/26 14:28  CrazyDong
                 *  变更描述：如果有签章权限,在总权限里面去除签章的权限,剩下的权限如果含有W,即显示保存按钮
                 *  功能说明：
                 */
                if (signPermission.sign[i].indexOf(temp) == -1 && permissionData.fields[key][temp] == 'w') {
                  $scope.saveOption = true//保存按钮显示
                  break
                }
              }
            }
          } else {
            /**
             * * 2018/7/27 10:20  CrazyDong
             *  变更描述：如果没有签章权限,即signPermission.sign = [] ;signPermission.sign.length = 0
             *            则在总权限里面如果含有W,即显示保存按钮
             *  功能说明：
             */
            for (var temp in permissionData.fields[key]) {
              if (permissionData.fields[key][temp] == 'w') {
                $scope.saveOption = true//保存按钮显示
                break
              }
            }
          }
        })

        $scope.sign = signPermission.sign
        // 深拷贝表单数据和从表数据，将本页数据与module里的数据隔离，
        // 防止有修改权限的用户，修改了数据后，不想保存直接点击返回，详情页数据改变
        // 如需修改数据只能点击保存按钮，在保存方法内，执行scopeData.prototype.setSignData()，保证修改后数据同步到module上
        $scope.formData = JSON.parse(JSON.stringify(signPermission.data))
        $scope.data = sortSubTableByXH($scope.formData, $scope.subTablePage)
      })
      $rootScope.$ionicGoBack = function () {
        if (scopeData.prototype.getCheckFlag()) {
          scopeData.prototype.setCheckFlag(true)
        }
        /*把App设置成竖屏*/
        if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
          screen.orientation.lock('default')
        }
        // 如果放大页点击了加载更多，此时返回到详情页，
        // 要显示加载更多后的从表数据，而不是从详情页跳转过来时的从表数据
        // 场景：在详情页显示十条从表数据，在放大页点击加载更多，显示了20条数据，返回到详情页也要显示20条数据
        // 这里和跳转到回复和处理页不同，那两页的$scope.data为完整数据，而本页还是分开的
        storageService.set('subTablePage', $scope.subTablePage)
        stateGoHelp.stateGoUtils(false)
      }
      $scope.$on('$ionicView.enter', function () {//$ionicView.afterEnter
        $rootScope.hideTabs = true
        var formTranslate = false//抽象出一个布尔值 用来判断需不需要加位移 false就不需要位移  true就需要位移
        var formContext = angular.element('#grid_height').find('.scroll')
        var tableDiv = document.getElementById('tableDiv')//表格容器
        var formTable = angular.element('#grid_height').find('table')//表单数组
        var x//声明变量用来位移
        /*设置横屏*/
        tableWidth = formTable[formTable.length - 1].clientWidth//是对象的实际内容的宽，不包边线宽度
        if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
          //表单宽度大于屏幕宽度+50则进行横竖屏转换
          if (typeof(tableWidth) !== 'undefined') {
            if ((window.innerHeight + 50) < tableWidth) {
              screen.orientation.lock('default')
              storageService.set(form_constant.formWidth, tableWidth)//存储表单宽度
            } else {
              //不横屏,表单缩小0.55
              // document.getElementById("grid_height").style.zoom=0.55;
              document.getElementById('grid_height').style.zoom = 0.9

              $scope.zoomFlag = true
            }
          } else {
            if ((window.innerHeight + 50) < storageService.get(form_constant.formWidth, null)) {
              screen.orientation.lock('default')
            } else {
              //不横屏,表单缩小0.55
              document.getElementById('grid_height').style.zoom = 0.9
              // document.getElementById("grid_height").style.zoom=0.55;
              $scope.zoomFlag = true
            }
          }
        }
        //如果表单内table的宽度超出了外面容器的宽度
        if (formTable[formTable.length - 1].clientWidth > tableDiv.clientWidth) {
          //位移的变量就等于  超出的宽度除以2 再除以容器的宽度 算出百分比
          x = ((formTable[formTable.length - 1].clientWidth - tableDiv.clientWidth) / 2) / (tableDiv.clientWidth + 50) * 100 + '%'
          //抽象出一个布尔值 用来判断需不需要加位移 false就不需要位移  true就需要位移
          formTranslate = true
        }
        if (formTranslate == true) {
          formContext.css({'transform': 'translate3d(-' + x + ', 0px, 0px) scale(1)'})
        } else {
          formContext.css({'transform': 'translate3d(0px, 0px, 0px) scale(1)'})
        }

        $timeout(function () {
          if ($scope.dataList.length > 0) {
            if (!$isMobile.isPC) {
              $cordovaToast.showLongBottom('此表单为长数据表单，共' + $scope.subTableLength + '条数据,点击获取更多数据')
            } else {
              alert('此表单为长数据表单，共' + $scope.subTableLength + '条数据,点击加载获取更多数据')
            }
          }
        }, 100)

      })

      var heightHandle = window.innerHeight//获取屏幕的高度
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
      //加载数据
      $scope.loadMore = function () {
        //loading图 上拉时显示
        $scope.subTablePage++
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
                  if ($scope.data[p][sub_p].length === Number($stateParams.subTableLength)) {
                    $timeout(function () {
                      $scope.nextP = false
                    }, 1000)
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

      $timeout(function () {
        angular.element('span[class=\'form_text_color_blue tab_download noprint\']').remove()
      }, 200)

      //保存
      $scope.clickRightSave = function () {
        storageService.set('viewFormCacheWork', null)//标识符表示不是放大表单页返回
        scopeData.prototype.setUserRole($scope.data)
        scopeData.prototype.setHtmlData($scope.htmlContent)
        scopeData.prototype.setPermissionData($scope.permission)
        // for (var p in $scope.data) {
        //   for (var sub_p in $scope.data[p]) {
        //     if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
        //       if ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > xListSub && $scope.dataList.length > xList) {
        //         $scope.dataList.splice(0, $scope.data[p][sub_p].length)
        //         $scope.dataList = $scope.data[p][sub_p].concat($scope.dataList)
        //         scopeData.prototype.setLongFormEnlargementData($scope.dataList)//长表单数据存成新的 用于放大表单
        //         $scope.data[p][sub_p] = $scope.dataList
        //         $rootScope.dataListENew = clone.cloneData($scope.data[p][sub_p])
        //         $scope.tableFlagE = false
        //       }
        //     }
        //   }
        // }
        if (viewFormService.form_check($scope, 1)) {
          scopeData.prototype.setCheckFlag(true)
          var waitWorkPassDate = ''
          if (!($stateParams.waitWorkPassDate == undefined || $stateParams.waitWorkPassDate == '')) {
            waitWorkPassDate = {
              taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
              procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId
            }
          }
          /*把App设置成竖屏*/
          if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
            screen.orientation.lock('default')
          }
          concatSubTableData()
          scopeData.prototype.setSignData({data: $scope.data, sign: $scope.sign})
          scopeData.prototype.setLongFormEnlargementData($scope.dataList)
          stateGoHelp.stateGoUtils(true, 'tab.view-form', {
            waitWorkPassDate: angular.toJson(waitWorkPassDate),
            enlargement: 'enlargement',
            titleFlag: titleFlag,
            workWaitData: $scope.workWaitData,
            notification: $stateParams.notification,
            type: $stateParams.type,
            information: $stateParams.information,
            NotificationItem: $stateParams.NotificationItem,
            notificationDetail: $stateParams.notificationDetail
          }, 'left')
        } else {
          for (var p in $scope.data) {
            for (var sub_p in $scope.data[p]) {
              if ($scope.data[p].hasOwnProperty(sub_p) && sub_p.indexOf('sub_') == 0) {
                $scope.tableFlagE = true
                if ($scope.data[p][sub_p] != undefined && $scope.data[p][sub_p].length > 0) {
                  $scope.data[p][sub_p] = $scope.data[p][sub_p].slice(0, xList)
                  if ($scope.dataList.length == 0) {
                    $scope.nextP = false
                  } else if ($scope.dataList.length < xListOnly) {//如果这个数组的长度小于11 就直接让数据显示赋值给$scope.data
                    $scope.data[p][sub_p] = $scope.dataList
                    $scope.nextP = false
                  } else if ($scope.dataList.length > xList) {//list数组内数据大于10 让他显示前10个
                    $scope.data[p][sub_p] = $scope.dataList.slice(0, xList)
                    $scope.nextP = true
                    if (!$isMobile.isPC) {
                      $cordovaToast.showLongBottom('此表单为长数据表单，共' + $scope.dataList.length + '条数据,上拉获取更多数据')
                    } else {
                      alert('此表单为长数据表单，共' + $scope.dataList.length + '条数据,点击加载获取更多数据')
                    }
                  }
                }
              }
            }
          }
        }
      }

      $scope.$on('$ionicView.afterLeave', function () {//$ionicView.afterEnter
        /*把App设置成竖屏*/
        if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
          screen.orientation.lock('default')
        }
      })

      $scope.$on('$ionicView.unloaded', function () {//$ionicView.afterEnter
        /*把App设置成竖屏*/
        if (!$isMobile.isPC && !ionic.Platform.isIPad()) {
          screen.orientation.lock('default')
        }
      })

      /**
       * * 2018/5/7 15:56  CrazyDong
       *  变更描述：
       *  功能说明：监听手机横竖屏
       */
      window.addEventListener('orientationchange', function (result) {
        $timeout(function () {
          viewScrollForm.scrollTop()//旋转屏幕时候,让表单滚到顶部,否则会出现表单滚出可视窗口的现象
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
        }, 100)

      })

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
                $scopeData[p][sub_p] = $scope.dataList.splice(0, length)
              }
            }
          }
        }
        return $scopeData
      }

    }])
})()

