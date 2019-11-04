/**
 * Created by developer on 2017/5/15.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function () {
  'use strict'

  var app = angular.module('community.controllers.mine')

  /*我*/
  app.controller('MineCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$ionicNativeTransitions',
    '$ionicHistory', 'authService', 'storageService', 'set_home_page', 'mine', 'serverConfiguration',
    'auth_events', 'MineService', 'T', '$isMobile', 'GetRequestService', '$cordovaToast', 'application', '$ionicPopup',
    'APP', '$ionicLoading', 'versionUpdate', 'wait_work', 'stateGoHelp', 'DBSingleInstance', 'mobileSocket', 'jdbc', '$timeout',
    function ($scope, $state, $stateParams, $rootScope, $ionicNativeTransitions, $ionicHistory, authService,
              storageService, set_home_page, mine, serverConfiguration, auth_events, MineService, T, $isMobile, GetRequestService,
              $cordovaToast, application, $ionicPopup, APP, $ionicLoading, versionUpdate, wait_work, stateGoHelp, DBSingleInstance, mobileSocket, jdbc, $timeout) {

      $scope.isShowGestureLockChange = false//切换开关
      var gestureLockFlag
      $scope.personInfo = {}//个人信息数据
      $rootScope.titleData = '我的'
      $scope.showDetailImg = false
      $scope.appDescription = null
      $scope.upDateFlag = false//new图标显示隐藏标识

      $scope.currentVersion = ''//当前版本号
      $scope.currentVersion = ''//当前版本号
      $scope.checkPW = false //设置登录手势前校验数字密码
      $scope.errMsg = ''
      $scope.canViewOtherWaitWork = false
      $scope.$on('$ionicView.beforeEnter', function (event, data) {
        $ionicHistory.clearCache()
        $ionicHistory.clearHistory()
        storageService.removeItem('searchDataStr')

        $rootScope.titleData = '我的'
        $rootScope.hideTabs = false
        $rootScope.bell = true
        $rootScope.toBack = false
        $scope.showTiemUpload = storageService.get(auth_events.logRecode, '0') == '1' ? true : false//控制上传时间的item显示
        //清空待办 工作待办的筛选状态
        storageService.set(wait_work.sizerWorkTypeKey, '')
        storageService.set(wait_work.sizerWorkStateKey, '')
        getInfo()//获取个人信息
        otherTodoCtl(); // 获取查看其他人待办权限
        /*首页设置,默认为待办*/
        if (storageService.get(set_home_page.setHomeKey, null) == undefined) {
          $scope.homePageText = '工作'
        } else {
          $scope.homePageText = storageService.get(set_home_page.setHomeKey, null)
        }

        /*单据设置*/
        //                if (window.localStorage.getItem("setBill") == null) {
        //                    $scope.setBillText = "原始单据";
        //                } else {
        //                    $scope.setBillText = window.localStorage.getItem("setBill");
        //                }

        /*手势密码*/
        gestureLockFlag = storageService.get(mine.gestureLockKey, 'false')//是否打开密码手势锁
        if (gestureLockFlag == 'true') {
          angular.element('input[type=\'checkbox\']').attr('checked', '')
          $scope.isShowGestureLockChange = true
        } else {
          $scope.isShowGestureLockChange = false
          angular.element('input[type=\'checkbox\']').removeAttr('checked')
        }

        if (!$isMobile.isPC && $isMobile.Android) {
          if (data.direction === 'back') {
            var transitionDirection = data.direction !== 'back' ? 'left' : 'right'
            window.plugins.nativepagetransitions.slide({
              'direction': transitionDirection
            })
          }
        }
        /*获取版本信息*/
        versionUpdate.getVersionInfo().then(function (mustUpdateData) {
          if (mustUpdateData.shouldUpdate) {
            $scope.upDateFlag = true
            $scope.appDescription = mustUpdateData
          }
        })

        //获取当前版本号
        versionUpdate.getCurrentVersion().then(function (currentVersion) {
          $scope.currentVersion = '(' + currentVersion + ')'
        })

        // application.getAlertNews();//获取新消息提示  即红点(底部tabs 工作 待办 消息  铃铛)
      })
      $scope.rotateIOSImg = false//ios头像翻转兼容问题
      /*获取个人信息*/
      function getInfo() {
        var url = serverConfiguration.baseApiUrl + 'app/common/v1/getPersonInfo'
        var param = {
          account: storageService.get(auth_events.userId, null) //用户id
        }

        MineService.getMineData(url, param).then(function (result) {
          $scope.personInfo = result
          if (result.dept == null) {
            $scope.personInfo.dept = T.translate('mine.mine-person-info-no-dept')
          }
          if (result.picture != null) {
            $scope.showDetailImg = true
            $scope.detailImg = serverConfiguration.baseApiUrl + 'app/attachment/showImage?pkid=' + result.picture
            if ($isMobile.IOS) {
              $scope.rotateIOSImg = true
            }
          } else {
            $scope.showDetailImg = false
          }
        }, function (err) {

        })
      }

      $scope.imgonerror = function () {
        if ($scope.detailImg.indexOf('showImage?') > -1) {
          $scope.detailImg = 'app/view-form/img/picture404.png'
        }
      }
      /*手势密码开关*/
      $scope.tabLockClick = function () {
        if (!$scope.isShowGestureLockChange) { // 设置手势密码，需要先验证登录数字密码
          $scope.checkPW = true
        } else {  // 取消手势密码，暂时不做验证
          $scope.isShowGestureLockChange = !$scope.isShowGestureLockChange
          storageService.removeItem(mine.gestureLockKey)
          storageService.set(mine.gestureLockKey, $scope.isShowGestureLockChange)
        }
      }

      /**
       * 校验登录数字密码
       */
      $scope.checkPWMethod = function () {
        var userLogin = authService.loadUserLogin()  // 获取当前登录用户信息
        var pwValue = document.querySelector('#pwValue').value
        if (userLogin.pw === pwValue) {
          $scope.checkPW = false  // 关闭dialog
          $scope.isShowGestureLockChange = !$scope.isShowGestureLockChange
          stateGoHelp.stateGoUtils(true, 'gesture.setGestureLock', {}, 'left')
        } else {
          $scope.errMsg = '密码校验失败'
          $timeout(function () {
            $scope.errMsg = ''
          }, 2000)
        }
      }

      /**
       * 取消登录密码验证
       */
      $scope.cancelCheck = function () {
        $scope.checkPW = false
        $scope.checkPW = ''
        angular.element('input[type=\'checkbox\']').removeAttr('checked')
      }

      /*跳转个人资料*/
      $scope.goMyDetails = function () {
        stateGoHelp.stateGoUtils(true, 'tab.mineDetails', {}, 'left')
      }
      /*跳转首页设置*/
      $scope.goHomePageSet = function () {
        stateGoHelp.stateGoUtils(true, 'tab.homePageSet', {}, 'left')
      }
      /*跳转单据设置*/
      $scope.goBillSet = function () {
        stateGoHelp.stateGoUtils(true, 'tab.billSet', {}, 'left')
      }
      /*跳转签章方式*/
      $scope.goSignatureWay = function () {
        stateGoHelp.stateGoUtils(true, 'tab.signatureWay', {}, 'left')
      }
      /*跳转修改手势密码*/
      $scope.goGestureLock = function () {
        stateGoHelp.stateGoUtils(true, 'gesture.resetGestureLock', {}, 'left')
      }
      /*跳转登录密码*/
      $scope.goSetPassword = function () {
        stateGoHelp.stateGoUtils(true, 'tab.setPassword', {}, 'left')
      }
      /*跳转签章密码页面*/
      $scope.goSignaturePassword = function () {
        stateGoHelp.stateGoUtils(true, 'tab.signaturePassword', {}, 'left')
      }
      /*跳转签章密码页面*/
      $scope.goFormHandle = function () {
        stateGoHelp.stateGoUtils(true, 'tab.form-handle', {}, 'left')

      }
      /*跳转通知页面*/
      $rootScope.clickLiftMessage = function () {
        stateGoHelp.stateGoUtils(true, 'tab.mineNotification', {type: 'mine'}, 'left')
      }

      /*清理缓存 (暂时只清理TIME数据库_请求时间记录)*/
      $scope.clearCache = function () {
        var Pop = $ionicPopup.confirm({
          title: T.translate('publicMsg.popTitle'),
          template: T.translate('mine.clear-cache-content'),
          cancelText: T.translate('publicMsg.cancel'),
          cancelType: 'button-assertive',
          okText: T.translate('publicMsg.sure'),
          okType: 'button-positive'
        })

        //popupWindow确定的回调
        Pop.then(function (res) {
          if (res) {
            var Pop = $ionicPopup.alert({
              title: '友好提示',
              template: '清理成功',
              okText: T.translate('publicMsg.sure'),
              okType: 'button-positive'
            })
            if (APP.devMode) {
              /**
               *  2018/9/7 chris.zheng
               *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
               *  功能说明：使用websql创建数据库
               */
              if ($isMobile.Android) {
                /**
                 * * 2018/4/10 15:12  CrazyDong
                 *  变更描述：使用单例方式获取
                 *  功能说明：获取手机日志数据库对象
                 */
                var timeDB = DBSingleInstance.getTimeDb()
                /*清空db*/
                timeDB.transaction(function (tx) {
                  tx.executeSql('DELETE FROM TimeData', [], function (tx, res) {
                  }, function (tx, err) {
                  })
                })
              } else {
                jdbc.findAll('syncData').then(function (response) {
                  if (response) {
                    response.forEach(function (element) {
                      jdbc.remove('syncData', element.id)
                    })
                  }
                })
              }
            }
          }
        })
      }

      /*版本更新*/
      $scope.versionUpdate = function () {
        /**
         * * 2018/5/15 9:56  CrazyDong
         *  变更描述：
         *  功能说明：未做完
         */
        //                stateGoHelp.stateGoUtils(true, 'tab.mineAboutSystem', {systemData:angular.toJson($scope.appDescription)}, 'left');


        $scope.descriptionArr = $scope.appDescription.description.split('\n')
        /*判断是否需要更新*/
        if ($scope.upDateFlag) {
          var Pop = $ionicPopup.confirm({
            title: '更新提示',
            template: '<div ng-repeat="item in descriptionArr"><p>{{item}}</p></div>',
            cancelText: '取消',
            cancelType: 'button-assertive',
            okText: '确定',
            okType: 'button-positive',
            scope: $scope
          })

          //popupWindow确定的回调
          Pop.then(function (res) {
            if (res) {
              versionUpdate.upDateVersion($scope.appDescription)//下载Apk
            }
          })

        }
      }

      /*退出登录*/
      $scope.exitLogin = function () {
        versionUpdate.exitLogin(true).then(function (successData) {
          angular.element('input[type=\'checkbox\']').removeAttr('checked')
        }, function (err) {
          if (!$isMobile.isPC) {
            $cordovaToast.showShortBottom(T.translate('mine.exit-login-err'))
          } else {
            alert(T.translate('mine.exit-login-err'))
          }

        })
      }

      /*上传时间数据*/
      $scope.uploadTimeData = function () {

        /**
         * * 2018/4/10 15:14  CrazyDong
         *  变更描述：使用单例方式获取
         *  功能说明：获取手机日志数据库对象
         */
        var timeDB = DBSingleInstance.getTimeDb()
        var uploadNumber = 2000//一次上传数据数量

        var Pop = $ionicPopup.confirm({
          title: '上传提示',
          template: '您确定上传日志数据吗?',
          cancelText: T.translate('publicMsg.cancel'),
          cancelType: 'button-assertive',
          okText: T.translate('publicMsg.sure'),
          okType: 'button-positive'
        })

        //popupWindow确定的回调
        Pop.then(function (res) {
          if (res) {

            var timeDbArr = []
            /*查询*/
            timeDB.transaction(function (tx) {
              tx.executeSql('SELECT * FROM TimeData', [], function (tx, result) {
                if (result.rows.length != 0) {
                  if (result.rows.length < uploadNumber) {
                    for (var i = result.rows.length - 1; i >= 0; i--) {
                      timeDbArr.push(result.rows.item(i))
                    }
                  } else {
                    for (var i = result.rows.length - 1; i >= result.rows.length - uploadNumber; i--) {
                      timeDbArr.push(result.rows.item(i))
                    }
                  }

                  var timeDataParam = {
                    list: timeDbArr
                  }

                  /*上传数据*/
                  var url = serverConfiguration.baseApiUrl + 'app/log/logUpload'
                  GetRequestService.getRequestDataJson(url, timeDataParam, true, 'POST', 'application/json').then(function (result) {

                    /*判断平台*/
                    if (!$isMobile.isPC) {
                      $cordovaToast.showShortBottom('成功上传' + timeDbArr.length + '条数据')
                    } else {
                      alert('成功上传' + timeDbArr.length + '条数据')
                    }

                    /*删除已经上传的数据*/
                    delDb()
                  }, function (err) {
                    /*判断平台*/
                    if (!$isMobile.isPC) {
                      $cordovaToast.showShortBottom('上传失败')
                    } else {
                      alert('上传失败')
                    }
                  })
                } else {
                  if (!$isMobile.isPC) {
                    $cordovaToast.showShortBottom('无日志数据可上传')
                  } else {
                    alert('无日志数据可上传')
                  }
                }
              })
            })
          }
        })

        /*删除方法*/
        function delDb() {
          timeDB.transaction(function (tx) {
            tx.executeSql('DELETE FROM TimeData WHERE makeTime IN (SELECT makeTime FROM TimeData ORDER BY makeTime DESC LIMIT (?))',
              [uploadNumber], function (tx, res) {

              }, function (tx, err) {
              })
          })
        }
      }

      /*返回*/
      $rootScope.$ionicGoBack = function () {
        /*返回上一页*/
        stateGoHelp.stateGoUtils(false)
      }
      // 查看其他人待办列表
      $scope.viewOtherWaitWorkVisible = false

      $scope.viewOtherWaitWorkDialogShow = function () {
        $scope.viewOtherWaitWorkVisible = true
      }

      $scope.viewOtherWaitWorkDialogHide = function () {
        $scope.viewOtherWaitWorkVisible = false
      }

      $scope.viewOtherWaitWork = function () {
        var todoUserCode = document.querySelector('#user-code').value
        $rootScope.todoUserCode = todoUserCode
        /*utils跳转样例*/
        $scope.viewOtherWaitWorkDialogHide()
        stateGoHelp.stateGoUtils(true, 'tab.mineOtherWaitWork', {
          titleName: todoUserCode + '待办事项' , typeId: '',
          workFlag: 'isWork',viewOtherWaitWork: true, todoUserCode: todoUserCode
        }, 'left')
      }

      function otherTodoCtl() {
        var url = serverConfiguration.baseApiUrl + 'app/ctl/othertodo/v1/otherTodoCtl'
        var param = {
          account: storageService.get(auth_events.userId, null) //用户id
        }

        MineService.getOtherTodoCtl(url, param).then(function (result) {
          $scope.canViewOtherWaitWork = result
        }, function (err) {

        })
      }
    }])
})()
