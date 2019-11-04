(function () {
  'use strict';

  var app = angular.module('community.controllers.formHandle', []);

  app.controller('FormHandleController', ['$scope', '$state', '$ionicNativeTransitions', '$rootScope',
    '$timeout', '$stateParams', '$ionicScrollDelegate', '$isMobile', '$interval', 'auth_events', 'storageService','timeout','stateGoHelp',
    'serverConfiguration', 'viewFormService', 'scopeData', '$ionicActionSheet','$ionicPopup','T','mine','$cordovaToast','Camera','MineService','md5',
      '$ionicHistory','GetRequestService',
    function ($scope, $state, $ionicNativeTransitions, $rootScope,$timeout, $stateParams, $ionicScrollDelegate, $isMobile, $interval,
              auth_events, storageService,timeout,stateGoHelp, serverConfiguration, viewFormService, scopeData, $ionicActionSheet,
              $ionicPopup,T,mine,$cordovaToast,Camera,MineService,md5,$ionicHistory,GetRequestService) {

      $rootScope.hideTabs = true;//隐藏底部导航
      $rootScope.toBack = true;//显示返回按钮
      $scope.hasTop = false;//判断是否有has-tabs-top，has-tabs-top是IONIC的className
      $scope.userName = storageService.get(auth_events.name,null);//获取用户名
      $scope.workWaitData = $stateParams.workWaitData;//待办带来的数据
      $scope.recording = false
      if(!($stateParams.workWaitData == undefined || $stateParams.workWaitData == "") ){
        $scope.workWaitData = angular.fromJson($scope.workWaitData);
      }
        /**
         * * 2018/4/8 15:15  CrazyDong
         *  变更描述：把判断条件换成android,避免IOS执行
         *  功能说明：避免IOS执行此代码,造成错误
         */
      //在进入该页面时先调用录音功能  因为部分手机在录音时再调用会有问题
      if($isMobile.Android) {
        var src = "/sdcard/OAdemo/demo_myrecord.m4a";
        var myMedia = new Media(src,
          function () {},
          function (err) {}
        );
        myMedia.startRecord();
        $timeout(function () {
          myMedia.stopRecord();
          myMedia.release();//释放对象
        },100);
      }
      $scope.$on('$ionicView.beforeEnter', function (event,data) {
        data.enableBack = true;//交叉路由 不懂去百度 解释不清
        $rootScope.hideTabs = true;//tabs的底部导航栏不显示
        $rootScope.bell = false;//小铃铛不显示
        $rootScope.toBack = true;//返回按钮显示
        $scope.documents = [];//处理内发表的审批的意见附件音频 供页面用
        $scope.replyContents = [];//处理内发表的审批的意见
        $scope.attachmentPkids = [];//附件返回pkid
        $scope.attachmentPkidList = '';//附件pkid的串
        $scope.actionName = '';//是否同意审批
        $scope.opinion = '';//审批意见
        $scope.endReason = '';//终止原因
        $scope.messageType = '';//终止信息类型
        $scope.newData = {};
        $scope.signList ;//拆分数组得出单个字段的数组
        $scope.signatureId = '';//签章ID
        $scope.opinionFlag = '';//审批是否同意的控制器
        $scope.opinionType = '';//审批类型  包括 同意 不同意 暂存 终止
        $scope.isTemporary = false;/*控制暂存点击时出现遮罩*/
        $scope.maskTitle = ''; /*弹出的确定框的标题*/
        $scope.maskContent = '';/*弹出的确定框的内容*/

        var reply = $stateParams.reply;//意见回复页面跳转的
        if (reply == 'reply') {//从回复意见过来的
          $scope.hasTop = false;//审批页的同意不同意按钮那个位置后面的白色背景不显示 因为这个是回复页面
          $scope.isReply = false;//审批页的同意不同意按钮不显示
          $scope.replyOption = true;//回复页保存显示
          $rootScope.toBack = true;//返回按钮显示
          storageService.set("backReply","backReply");//存个标签证明是回复页直接返回的
          $rootScope.titleData = T.translate("form-handle.form-reply-title");//标题
        } else {//不是回复页 是审批页
          $scope.hasTop = true;//审批页的同意不同意按钮那个位置后面的白色背景显示 因为这个是审批页面
          $scope.isReply = true;//审批页的同意不同意按钮显示
          $scope.replyOption = false;//回复页保存不显示 显示三个点的下拉选择按钮
          $rootScope.titleData = T.translate("form-handle.form-handle-title");//标题
        }
        $rootScope.$ionicGoBack = function () {
          if($scope.documents.length == 0){//如果没有意见和附件就可以直接返回
              stateGoHelp.stateGoUtils(false);
          }else {
            //如果页面有消息和附件 返回时弹出确认框
            $scope.item = T.translate("form-handle.attachment-undisposed-alert");
            var Pop = $ionicPopup.confirm({
              title : T.translate("publicMsg.popTitle"),
              template: "<div><p>{{item}}</p></div>",
              cancelText:T.translate("publicMsg.cancel"),
              cancelType:'button-assertive',
              okText:T.translate("publicMsg.sure"),
              okType:'button-positive',
              scope: $scope
            });
            Pop.then(function(res){
              if(res){
                  stateGoHelp.stateGoUtils(false);
              }else {}
            });
          }
        }
        if($isMobile.Android){
          /*解决下方bar有时会显示2-3秒才隐藏的问题*/
          angular.element(document.querySelectorAll(".tabs-icon-top")).addClass("tabs-item-hide");
        }
      });
      $scope.$on('$ionicView.enter', function () {//$ionicView.afterEnter
        $rootScope.hideTabs = true;//tabs的底部导航栏不显示
        $rootScope.bell = false;//小铃铛不显示
        $rootScope.toBack = true;//返回按钮显示
        if($isMobile.Android){
          /*解决下方bar有时会显示2-3秒才隐藏的问题*/
          angular.element(document.querySelectorAll(".tabs-icon-top")).addClass("tabs-item-hide");
        }
      });
      $scope.workType = $stateParams.type;//从工作模块中跳转过来,所带的flag
      $scope.reply = $stateParams.reply;//回复页面带来的
      $scope.title = $stateParams.title;//标题
      $scope.titleFlag = $stateParams.titleFlag;//0已发  1已办 2跟踪 4公文
      /*请求用各类数据*/
      var waitWorkPassDate = $stateParams.waitWorkPassDate;
      if(!(waitWorkPassDate == undefined || waitWorkPassDate == "")){
        var paramData = angular.fromJson(waitWorkPassDate);
        var taskId = paramData.taskId;
        var procInstId = paramData.procInstId;
        var pkid = paramData.pkid;
      }
      var account = storageService.get(auth_events.userId, null);
      var data = scopeData.prototype.getSignData();//获取表单数据
      if(!(data == undefined || data == "")){//如果表单数据存在
        var sign = data.sign;//签章字段数组
        var newFandleData = data.data;//表单数据
      }
      var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
      $scope.hasMsg = false;//控制发送与加号转换
      var textareaId = document.getElementById('textareaId');//底部输入框
      $scope.isShowDialog = false;//控制下拉列表时候显示,,默认不显示

        /**
         * * 2018/5/16 9:15  CrazyDong
         *  变更描述：增加默认跟踪功能
         *  功能说明：根据后台followed,设置开关
         */
        var followedFlag = storageService.get(auth_events.followed, "0");//控制"默认跟踪"的切换按钮的开关, 0:关闭 1:打开
        if(followedFlag == "0"){
            $scope.isFollow = false;//跟踪开关控制,默认为关
            $scope.isFollowText = "关";//跟踪开关内容,默认为关
            $scope.follow = '0';//跟踪开关flag
        }else if(followedFlag == "1"){
            $scope.isFollow = true;//跟踪开关控制,默认为关
            $scope.isFollowText = "开";//跟踪开关内容,默认为关
            $scope.follow = '1';//跟踪开关flag
        }



      $scope.isTemporary = false;//控制暂存点击时出现遮罩
      var agreeImgFlag = true;//图片审批flag
      var agreeVoiceFlag = true;//录音审批flag
      //下拉菜单
      $scope.selectOption = function(data){
        if(data == "跟踪"){
          $scope.isFollow = !$scope.isFollow;
          if($scope.isFollow){
            $scope.isFollowText = "开";
            $scope.follow = '1';//跟踪开关flag
          }else{
            $scope.isFollowText = "关";
            $scope.follow = '0';//跟踪开关flag
          }
        } else if (data == "暂存") {
          if($rootScope.enableBtn == '0'){//zwfcbtn指令控制权限  控制审批页的暂存 终止 不同意是否可以点击 0可以点击 1不可以点击
            agreeImgFlag = true;//图片审批flag
            agreeVoiceFlag = true;//录音审批flag
            isTrue($scope.documents);//判断审批权限 如果有录音和照片没上传成功则不让审批
            if(agreeImgFlag&&agreeVoiceFlag){
              $scope.opinionType = 'temporary';//审批类型暂存
              $scope.isTemporary = true;//确认选择框弹出
              $scope.maskTitle = T.translate('form-handle.temporary-title');//选择框的标题
              $scope.maskContent = T.translate('form-handle.temporary-content');//选择框的内容
            }else {
              if(!$isMobile.isPC){
                $cordovaToast.showShortBottom(T.translate("form-handle.agree-opinion-err"));
              }
            }
          }else {
            if(!$isMobile.isPC){
              $cordovaToast.showShortBottom(T.translate("form-handle.hasPermission"));
            }else {
              alert(T.translate("form-handle.hasPermission"))
            }
          }

        } else if (data == "终止") {
          if($rootScope.enableBtn == '0'){//zwfcbtn指令控制权限  控制审批页的暂存 终止 不同意是否可以点击 0可以点击 1不可以点击
            agreeImgFlag = true;//图片审批flag
            agreeVoiceFlag = true;//录音审批flag
            isTrue($scope.documents);//判断审批权限 如果有录音和照片没上传成功则不让审批
            if(agreeImgFlag&&agreeVoiceFlag){
              $scope.opinionType = 'stop';//审批类型终止
              $scope.isTemporary = true;//确认选择框弹出
              $scope.maskTitle = T.translate('form-handle.stop-title');//选择框的标题
              $scope.maskContent = T.translate('form-handle.stop-content');//选择框的内容
            }else {
              if(!$isMobile.isPC){
                $cordovaToast.showShortBottom(T.translate("form-handle.agree-opinion-err"));
              }
            }
          }else {
            if(!$isMobile.isPC){
              $cordovaToast.showShortBottom(T.translate("form-handle.hasPermission"));
            }else {
              alert(T.translate("form-handle.hasPermission"))
            }
          }

        }
        $scope.isShowDialog = !$scope.isShowDialog;
      }
      /*点击更多按钮*/
      $scope.selectMoreOption = function () {
        $scope.isShowDialog = !$scope.isShowDialog;
      }
      //判断审批权限 如果有录音和照片没上传成功则不让审批
      function isTrue(documents) {
          for(var i =0,l=documents.length;i<l;i++){
              if(typeof (documents[i].img) != "undefined"  && documents[i].img.length != 0){
                  //imgFail是图片发送失败  imgSuccess是正在发送的loading  如果这俩都有 说明图片没有上传成功
                  if(documents[i].img.imgFail == true || documents[i].img.imgSuccess ==true){
                      agreeImgFlag = false
                  }
              }else if(typeof (documents[i].audio) != "undefined"  && documents[i].audio.length != 0){
                  //voiceFail是语音发送失败  voiceSuccess是正在发送的loading  如果这俩都有 说明语音没有上传成功
                  if(documents[i].audio.voiceFail == true || documents[i].audio.voiceSuccess ==true){
                      agreeVoiceFlag = false
                  }
              }
          }
      }
      /*审批意见 同意 不同意 终止 已阅*/
      $scope.getOpinion = function (opinionFlag) {
        agreeImgFlag = true;//图片审批flag
        agreeVoiceFlag = true;//录音审批flag
        isTrue($scope.documents);//判断审批权限 如果有录音和照片没上传成功则不让审批
        if(agreeImgFlag&&agreeVoiceFlag){//判断附件是不是都上传完成 没完成就不让审批
          if (opinionFlag == 'agree') {//同意
            $scope.opinionFlag = 'agree';
            $scope.actionName = 'agree';
            var paramData = {
              account : account,
              taskId: taskId,
              procInstId: procInstId,
              actionName : $scope.actionName,
              opinion : $scope.opinion,
              // data : angular.toJson(data).toString().replace(/\"/g, "\""),
              attachmentPkidList :  $scope.attachmentPkidList,
              follow : $scope.follow
            };
            $scope.approveFlag = storageService.get(mine.approveSwitchKey,false);//我的页面的免签 false就是没开
            $scope.signatureFlag = storageService.get(mine.signatureSwitchKey,false);//我的页面的手势签章 false就是没开
            if($scope.approveFlag == 'false'){$scope.approveFlag = false}//在我的里直接存的是字符串 这要转换一下
            if($scope.signatureFlag == 'false'){$scope.signatureFlag = false}
            if(sign.length == 0){//权限数组没有数据说明不需要签章
              $scope.isTemporary = true;//不需要签章 直接弹出确认模板
              $scope.maskTitle = T.translate('form-handle.agree-title');
              $scope.maskContent = T.translate('form-handle.agree-content');
            }else {
              if($scope.approveFlag == false){//我的页面没有开启免签
                if($scope.signatureFlag){//开启手势签章密码
                  $scope.workWaitData = $stateParams.workWaitData;
                    stateGoHelp.stateGoUtils(true,'gesture.signInGestureLock',{
                        workWaitData:$scope.workWaitData,
                        paramData: angular.toJson(paramData),
                        flagType:'0',webType:"formHandle",
                        titleFlag:$scope.titleFlag},
                        'left');
                }else if($scope.signatureFlag == false ){//未开启手势签章密码 使用文字签章密码
                  $scope.isChangePW = true;//要输入文字签章的模板
                  $scope.maskTitle = T.translate('form-handle.signature-text');
                }
              }else if($scope.approveFlag){//我的页面开启了免签
                $scope.isTemporary = true;
                $scope.maskTitle = T.translate('form-handle.agree-title');
                $scope.maskContent = T.translate('form-handle.agree-content');
              }
            }
          } else if (opinionFlag == 'reject') {//不同意 不需要签章
            if($rootScope.enableBtn == '0'){//zwfcbtn指令控制权限  控制审批页的暂存 终止 不同意是否可以点击 0可以点击 1不可以点击
              $scope.opinionFlag = 'reject';
              $scope.isTemporary = true;
              $scope.actionName = 'reject';
              $scope.maskTitle = T.translate('form-handle.reject-title');
              $scope.maskContent = T.translate('form-handle.reject-content');
            }else {
              if(!$isMobile.isPC){
                $cordovaToast.showShortBottom(T.translate("form-handle.hasPermission"));
              }else {
                alert(T.translate("form-handle.hasPermission"))
              }
            }

          }
        }else {
          if(!$isMobile.isPC){
            $cordovaToast.showShortBottom(T.translate("form-handle.agree-opinion-err"));
          }
        }
      };
      /*审批文字签章密码*/
      $scope.goPwDash = function () {
        var url = serverConfiguration.baseApiUrl + "app/common/v1/signatureValidate";
        var changePassword = document.getElementById("handlePassword").value;
        var param = {
          account : storageService.get(auth_events.userId,null),//用户id
          signaturePwd : md5.createHash(changePassword)
        }
        MineService.getMineData(url,param).then(function(result){
          if(result.state == '0'){//审批请求  同意或不同意
            $scope.newData = signManage(result,true);//要传给后台的data数据
            approveData(account, taskId, procInstId, $scope.actionName, $scope.opinion, $scope.newData, $scope.attachmentPkidList,'1',param.signaturePwd, $scope.follow, true);
            $scope.isChangePW = false;//签章密码输入框不显示
          }else {
            if(!$isMobile.isPC) {
              $cordovaToast.showShortBottom (T.translate("form-handle.gesture-error"));
            }else {
              alert(T.translate("form-handle.gesture-error"))
            }
            $scope.isChangePW = false;
          }
        },function(err){});
      };
      $scope.pwCancel = function () {//取消弹出框
        $scope.isChangePW = false;
        document.getElementById("handlePassword").value = '';
      }
      /*不需要签章的审批确定*/
      $scope.goDash = function () {
        $scope.isTemporary = false;//确认框不显示
        $scope.opinionFlag = 'agree';
        if ($scope.opinionType == 'temporary') {//暂存
          temporaryData(account, taskId, procInstId, $scope.opinion, newFandleData,  $scope.attachmentPkidList, true);
        } else if ($scope.opinionType == 'stop') {//终止
          terminateData(account,procInstId, taskId, $scope.opinion,  $scope.attachmentPkidList,$scope.messageType, true);
        } else if ($scope.actionName == 'agree') {//同意
          if(sign.length == 0){
            //无签章
            approveData(account, taskId, procInstId, $scope.actionName, $scope.opinion, newFandleData,  $scope.attachmentPkidList,'-1','', $scope.follow, true);

          }else {
            //免签获取签章id  start
            var url = serverConfiguration.baseApiUrl + "app/common/v1/signatureValidate";
            var param = {
              account: storageService.get (auth_events.userId, null),//用户id
              signaturePwd: T.translate("form-handle.need-not-signature-pwd")//免签就跟后台定义好了一个密码
            };
            MineService.getMineData (url, param).then (function (result) {
              if (result.state == '0') {//审批请求  同意或不同意
                $scope.newData = signManage(result,true);//要传给后台的data数据
                approveData (account, taskId, procInstId, $scope.actionName, $scope.opinion, $scope.newData, $scope.attachmentPkidList, '-1', param.signaturePwd, $scope.follow, true);
              }
            }, function (err) {})
          }
          //免签获取签章id  end
        } else if ($scope.actionName == 'reject') {//不同意
          $scope.newData = signManage(null,false);//要传给后台的data数据
          approveData(account, taskId, procInstId, $scope.actionName, $scope.opinion, $scope.newData,  $scope.attachmentPkidList,'-1','', $scope.follow, true);
        }else {
          storageService.set('needRemberPosition',true)
          stateGoHelp.stateGoUtils(true,'tab.waitWork',{titleFlag:$scope.titleFlag,workWaitData:angular.fromJson($scope.workWaitData)},'left');
        }
      };
      /*不需要签章的审批取消*/
      $scope.cancel = function () {
        $scope.isTemporary = false;
      };
      //弹出的表情框获取 imgDiv为点击弹出的div
      var imgDiv = document.getElementById('imgDiv');
      $scope.audioShow = false;//控制录音与输入框的显示隐藏
      //点击后输入框隐藏  录音框出现
      $scope.goShowAudio = function () {
        $scope.audioShow = !$scope.audioShow;
        $scope.hasMsg = false;//加号按钮显示
        $scope.emoFlag = false;//footer部分的样式控制
        $scope.emoFlagA = false;//兼容安卓的样式
      };
      //录音部分start
      var medioRec;
      var timer;//定时器
      var intervalTimer;//定时器
      var imgCount = 10;//图片src
      $scope.isVoice = false;//音频重发确认
      $scope.changeTime = false;//录音倒计时
      $scope.voiceHint = false;//动图显示
      var flagBack = false;//抽象录音的开关 false时才可以录音
      //音频图标显示
      function recordAudio() {
        /*新建文件夹*/
        if ($isMobile.IOS) {
          /*开始录制*/
          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            fs.root.getDirectory('xbrother', {create: true}, function (dirEntry) {
              var s, ss; // 声明变量。
              s = cordova.file.documentsDirectory.substr(7, cordova.file.documentsDirectory.length - 7);
              ss = dirEntry.fullPath.substr(1, dirEntry.fullPath.length - 1); // 获取子字符串。
              var src = s + ss + (new Date()).getTime() + "myrecord.m4a";
              medioRec = new Media(src,// success callback
                function () {
                  audioSuccess(src,count,$scope.documents.length);
                },
                function (err) {
                  audioFail();
                });
              runAudio(src,$scope.documents.length);
            }, onErrorCreateFile);
          }, onErrorLoadFs);
        } else if ($isMobile.Android) {
          window.resolveLocalFileSystemURI(cordova.file.externalRootDirectory, function (fileEntry) {
            fileEntry.getDirectory("OAdemo", {create: true, exclusive: false}, function (exclusive) {
              var src = "/sdcard/OAdemo/" + (new Date()).getTime() + "myrecord.m4a";
              medioRec = new Media(src,
                function () {
                  audioSuccess(src,count,$scope.documents.length);
                },
                function (err) {
                  audioFail();
                });
              runAudio(src,$scope.documents.length);

            }, function () {
              flagBack = false;
              if(!$isMobile.isPC) {
                $cordovaToast.showShortBottom (T.translate("view-form.create-error"));
              }

            });
          });
        }
      }
      /*播放音频的方法*/
      var my_media;
      var timeCount60 = 60000;//演示器的时间
      function playAudio(url,timeCount60) {
        my_media = new Media(url,
          function () {},
          function (err) {}
        );
        my_media.play();
        /*60.5s后结束播放,默认为循环播放*/
        $timeout(function () {
          my_media.stop();
          my_media.release();//释放对象
        }, timeCount60);
      }
      var count;//数字计时  到60就停止
      /*开始录音*/
      $scope.recordAudio = function () {
        if($isMobile.Android){
            myMedia.stopRecord();//一进页面的时候调用了权限  有些手机不支持关闭 在这再关闭一次 为了容错
            myMedia.release();//释放对象
        }

        count = 0;
        $scope.voiceHint = true;//录音的logo图片
        if(!flagBack){
          recordAudio ();//调用开始录音的方法
        }else {
          if(!$isMobile.isPC) {
            $cordovaToast.showShortCenter(T.translate('form-handle.media-no-next-text'));
          }
        }
      }
      //开始录制 并且定时计时
      function runAudio(src,index) {
        if($scope.recording){
          return
        }
        if(!flagBack){
          /*开始录制*/
          flagBack = true;
          medioRec.startRecord();
          $timeout(function () {
            flagBack = false;
          },1500)
        }else {
          if(!$isMobile.isPC) {
            $cordovaToast.showShortCenter(T.translate('form-handle.media-no-next-text'));
          }
        }
        intervalTimer = $interval(function () {
          count = count+1;
          if(count>50){
            $scope.changeTime = true;
            $scope.voiceHint = false;
            imgCount = imgCount-1;//倒计时图片
            $scope.changeImg = 'app/view-form/img/'+imgCount+'.png';
            if(count>59){
              $scope.changeTime = false;
              medioRec.stopRecord();
              imgCount = 10;
              $scope.documents.push({msg: '', img: '', audio: {src:src,num:count,voiceSuccess:true,voiceFail:false},index:index});
              uploadAudio('busisssssId', account, 'myrecord.m4a', src);
              $interval.cancel(intervalTimer);
            }
          }
        },1000);
        /*最长录音60s*/
        timer = $timeout(function () {
          medioRec.stopRecord();
          imgCount = 10;
          $scope.changeTime = false;
          $interval.cancel(intervalTimer);
          $timeout.cancel(timer);
        }, timeCount60);
      }
      //录音成功的回调
      function audioSuccess(src,count,index) {
        flagBack = false;
        if(count>0&&count<60){
          $scope.documents.push({msg: '', img: '', audio: {src:src,num:count,voiceSuccess:true,voiceFail:false},index:index});
          uploadAudio('busisssssId', account, 'myrecord.m4a', src);
        }else {
          $scope.voiceHint = false;
          $scope.changeTime = false;
          flagBack = true;
          $timeout(function () {
            flagBack = false;
          },700);
          if(!$isMobile.isPC) {
            $cordovaToast.showShortCenter (T.translate('form-handle.media-text'));
          }
        }
        $timeout.cancel(timer);
        $interval.cancel(intervalTimer);
        medioRec.stopRecord();
        medioRec.release();//释放对象
      }
      //录音失败的回调
      function audioFail() {
        $scope.voiceHint = false;
        $scope.changeTime = false;
        flagBack = false;
        $timeout.cancel(timer);
        $interval.cancel(intervalTimer);
        medioRec.stopRecord();
        medioRec.release();//释放对象
        if(!$isMobile.isPC) {
          $cordovaToast.showShortBottom (T.translate('form-handle.media-err'));
        }
      }
      /*松开按钮*/
      $scope.onReleaseRecord = function () {
        $scope.recording = true
        $scope.voiceHint = false;
        $scope.changeTime = false;
        flagBack = true;
        $timeout(function () {
          //兼容不同手机所以写两次
          medioRec.stopRecord();
          medioRec.release();//释放对象
          $timeout.cancel(timer);
          $interval.cancel(intervalTimer);
          $timeout(function () {
            medioRec.stopRecord();
            medioRec.release();//释放对象
            flagBack = false;
            $timeout.cancel(timer);
            $interval.cancel(intervalTimer);
            $timeout(function () {
              $scope.recording = false
            },500)
          },1000);
        },500);


      }
      /*播放录音*/
      $scope.playerAudio = function (src) {
        playAudio(src,timeCount60);
      }
      //文件创建失败回调
      function onErrorCreateFile(error) {
        flagBack = false;
        if(!$isMobile.isPC) {
          $cordovaToast.showShortBottom (T.translate("view-form.file-error"));
        }
      }
      function onErrorLoadFs(error) {
        if(!$isMobile.isPC) {
          $cordovaToast.showShortBottom (T.translate("view-form.file-loading-error"));
        }
      } //录音部分end
      var inputText = document.getElementById('offsetHeight');//获取footer的id
      var heightOther = 11;//footer弹出时会有小白边 减去11Px可以解决
      var imgDivHeight = 244;//加号点击后弹出的相机 图片选择的上弹框的高度
      var bottomScroll = function(){//多处使用
        $timeout (function () {
          viewScroll.scrollBottom();
        }, 50)
      };
      if ($isMobile.Android) {
        /*设置focus时候表情框消失*/
        $scope.emoFlagA = false;//判断content用哪个样式 兼容安卓
      }
      if ($isMobile.IOS) {
        var inputHeight = inputText.offsetHeight;//footer的高度
        //弹出框的top
        imgDiv.style.top = inputHeight - heightOther + 'px';
      }

        if(!$isMobile.isPC){
            //控制表情框弹出
            $scope.emoFlag = false;//判断footer用哪个样式
            /*contentID为内容区*/
            var contentID = document.getElementById('message-detail-content');
        }
      /*底部输入框右侧的加号按钮*/
      $scope.showEmoFlag = function () {
        if($isMobile.Android){
          /*footerbar的高度*/
          var oHeight = inputText.offsetHeight;
          /*弹出框的top*/
          imgDiv.style.top = oHeight - heightOther + 'px';
          $scope.emoFlag = !$scope.emoFlag;
          var imgDivHeight = imgDiv.offsetHeight;//上拉弹框的高度
          if (!$scope.emoFlag) {//相册 相机选择框不弹出
              contentID.style.bottom = oHeight + 'px';
            $scope.emoFlagA = false;
          } else if ($scope.emoFlag) {//相册 相机选择框弹出
              contentID.style.bottom = oHeight + imgDivHeight + 'px !important;';
            $scope.emoFlagA = true;
            $scope.audioShow = false;
          }
          bottomScroll();

          var perArr = ["android.permission.WRITE_EXTERNAL_STORAGE","android.permission.CAMERA"];
          PermissionsPlugin.addPermissions("权限",function () {},function () {},perArr);

        }else if($isMobile.IOS){
          $scope.emoFlag = !$scope.emoFlag;
          $scope.emoFlag ? (contentID.style.bottom = inputHeight + 'px') : (contentID.style.bottom = inputHeight + 'px');
          if ($scope.emoFlag) {
            $scope.audioShow = false;
          }
          bottomScroll();
        }
      };
      /*点击输入框时触发*/
      $scope.hide = function () {
        if($isMobile.Android){
          $scope.emoFlag = false;
          $scope.emoFlagA = false;
          bottomScroll();
        }else if($isMobile.IOS){
          window.addEventListener('native.keyboardshow',function(e) {//软键盘弹出的时候
            $scope.emoFlag = false;
            contentID.style.bottom = e.keyboardHeight + inputHeight + 'px';
            viewScroll.scrollBottom();
          })
          window.addEventListener('native.keyboardhide', function (e) {//软键盘关闭的时候
            $scope.emoFlag ? (contentID.style.bottom = inputHeight + imgDivHeight + 'px') : (contentID.style.bottom = inputHeight + 'px');
            viewScroll.scrollBottom();
          });
        }
      };
      window.addEventListener('native.keyboardshow', function (e) {
        if($isMobile.Android){
          $scope.emoFlag = false;
          viewScroll.scrollBottom();
        } else if ($isMobile.IOS) {
          $scope.emoFlag = false;
          contentID.style.bottom = e.keyboardHeight + inputHeight + 'px';
          bottomScroll();
        }
      });
      window.addEventListener('native.keyboardhide', function (e) {
        if($isMobile.Android){
          viewScroll.scrollBottom();
        } else if ($isMobile.IOS) {
          $scope.emoFlag ? (contentID.style.bottom = inputHeight + 'px') : (contentID.style.bottom = inputHeight + 'px');
          bottomScroll();
        }
      });
      //判断平台、下拉显示位置
      if (/iphone/i.test(navigator.userAgent) || /ipad/i.test(navigator.userAgent)) {
        //ios调整样式
        $scope.formPulldown = 'ios';
      } else {
        $scope.formPulldown = 'android';
      }

      // var ndata;//图片base64
      /**
       * * 2018/7/10 14:23  tyw
       *  重构压缩图片方法，用promise的方式返回压缩之后的base64图片码，方便使用.then()进行后续调用，避免延时取ndata有时候取不到的问题
       */
      //压缩图片
      function compress(imga) {
        var img = new Image();
        // 改变图片的src
        img.src = imga;
        return new Promise(function(resolve,reject){
        img.onload = function () {
          if (img.src.length) {
            var initSize = img.src.length;
            //alert('initSize:'+initSize);
          }

          var width = img.width;
          var height = img.height;

          //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
          var ratio;
          if ((ratio = width * height / 4000000) > 1) {
            ratio = Math.sqrt(ratio);
            width /= ratio;
            //alert('width:'+width);
            height /= ratio;
            //alert('height:'+height);
          } else {
            ratio = 1;
          }

          var canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          var ctx = canvas.getContext("2d");

          //铺底色
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          //瓦片canvas
          var tCanvas = document.createElement("canvas");
          var tctx = tCanvas.getContext("2d");

          //如果图片像素大于100万则使用瓦片绘制
          var count;
          if ((count = width * height / 1000000) > 1) {
            count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片

            //计算每块瓦片的宽和高
            var nw = ~~(width / count);
            var nh = ~~(height / count);

            tCanvas.width = nw;
            tCanvas.height = nh;

            for (var i = 0; i < count; i++) {
              for (var j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);

                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
              }
            }
          } else {
            ctx.drawImage(img, 0, 0, width, height);
          }

          //进行最小压缩
          var ndata = canvas.toDataURL('image/jpeg', 0.3);
          tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
          resolve(ndata);
        };
      })
      }

      //调用手机相机
        var fileNameTime = Date.parse(new Date()) + '.jpg';//默认为时间命名
      $scope.chooseMedia = function (mediaType) {
        switch (mediaType) {
          case 'photoLibrary':
            mediaType = navigator.camera.PictureSourceType.CAMERA;
            break;
          case 'takePhoto':
            mediaType = navigator.camera.PictureSourceType.PHOTOLIBRARY;
            break;
          default:
            mediaType = navigator.camera.PictureSourceType.PHOTOLIBRARY;
            break;
        }
        if (mediaType == navigator.camera.PictureSourceType.PHOTOLIBRARY) {//图库选取
          var options = {
            quality: 80,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            correctOrientation: true,
            sourceType: mediaType,
            cameraDirection: navigator.camera.Direction.BACK
          };
          Camera.getPicture(options).then(function (imageData) {

              if($isMobile.Android){
                  /**
                   * * 2018/5/16 10:23  CrazyDong
                   *  变更描述：android使用相册里面的名字,IOS使用时间命名
                   *  功能说明：获取图片在相册中的名字
                   */
                  var strStart = imageData.lastIndexOf("/");
                  var strEnd = imageData.lastIndexOf("?");
                  var strName = imageData.substring(strStart + 1,strEnd);

                  fileNameTime = strName;
              }else{
                  fileNameTime = Date.parse(new Date()) + '.jpg';//时间命名
              }
              if ($isMobile.IOS) {
                  /**
                   *  2018/9/7 chris.zheng
                   *  变更描述：解决ios的WKWebView不支持file协议的问题
                   *  功能说明：将file:///去掉
                   */
                  imageData = window.Ionic.normalizeURL(imageData);
              }
              compress(imageData).then(function(base64image){
              // var base64image = ndata;

            // $timeout(function () {
              // base64image = ndata;
              $scope.documents.push({
                msg: '',

                img: {src: base64image, imgSuccess: true, imgFail: false, imgName:fileNameTime},
                audio: '',
                index: $scope.documents.length
              });
              $scope.replyContents.push($scope.send_content);
              uploadBase64(null, account, fileNameTime, base64image, true);
              $scope.emoFlag = false;
              $scope.emoFlagA = false;

            // }, 2000)
          })
          }, function (err) {
          });
        } else {//拍照功能不变
        /**
         * * 2018/7/10 14:23  tyw
         *  1.相机调用参数destinationType从DATA_URL变为FILE_URI，之前返回的是base64码，修改后返回图片的路径地址，方便compress函数调用
         *  2.增加参数correctOrientation：true，调整ios照片的方向
         *  参考文档：https://github.com/apache/cordova-plugin-camera#module_Camera.DestinationType
         */
          var options = {
            quality: 80,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            correctOrientation:true,
            sourceType: mediaType,
            cameraDirection: navigator.camera.Direction.BACK
          };
          Camera.getPicture(options).then(function (imageData) {
            // var base64image = "data:image/png;base64," + imageData;
            fileNameTime = Date.parse(new Date()) + '.jpg';

              if ($isMobile.IOS) {
                  /**
                   *  2018/9/7 chris.zheng
                   *  变更描述：解决ios的WKWebView不支持file协议的问题
                   *  功能说明：将file:///去掉
                   */
                imageData = window.Ionic.normalizeURL(imageData);
              }
            compress(imageData).then(function(base64image){
            $scope.documents.push({
              msg: '',

              img: {src: base64image, imgSuccess: true, imgFail: false,imgName:fileNameTime},
              audio: '',
              index: $scope.documents.length
            });
            $scope.replyContents.push($scope.send_content);
            uploadBase64(null, account, fileNameTime, base64image, true);
            $scope.emoFlag = false;
            $scope.emoFlagA = false;
          }, function (err) {
          });

        })
      }
      };
      //重新发送失败录音
      $scope.repeatVoice = function (result) {
        $scope.documentVoice = result;
        $scope.isVoice = true;
        $scope.voiceTitle = T.translate('form-handle.repeat-voice-title');
        $scope.voiceContent = T.translate('form-handle.repeat-voice-content');
      }
      //点击重发图片
      $scope.repeatImg = function (result) {
        $scope.documentImg = result;
        $scope.isVoice = true;//弹出重发模板
        $scope.voiceTitle = T.translate('form-handle.repeat-voice-title');
        $scope.voiceContent = T.translate('form-handle.repeat-voice-content');
      }
      //重发确认
      $scope.goVoice = function () {
        if($scope.documentVoice){
          $scope.documentVoice.audio.voiceSuccess = true;
          $scope.documentVoice.audio.voiceFail = false;
          uploadAudio('businessPkid',account,'myrecord.m4a', $scope.documentVoice.audio.src);
        }
        if($scope.documentImg){
          $scope.documentImg.img.imgSuccess = true;
          $scope.documentImg.img.imgFail = false;
//          var fileNameTime = Date.parse(new Date()) + '.jpg';
            fileNameTime = $scope.documentImg.img.imgName;
          uploadBase64(null, account, fileNameTime, $scope.documentImg.img.src, true);
        }
        $scope.isVoice = false;
      }
      //重发返回
      $scope.voiceCancel = function () {
        $scope.isVoice = false;
      }
      $scope.send_content = '';//输入框内容
      $scope.msgLength = 0;//发送的信息的字数长度
      $scope.allLength = 0;//输入框信息与发送的信息的字数长度总和
      $scope.$watch('send_content', function (newValue, oldValue, scope) {
        $scope.allLength = newValue.length + $scope.msgLength;
        if ($scope.allLength > 500) {
          $scope.send_content = oldValue;
          if(!$isMobile.isPC) {
            $cordovaToast.showShortBottom (T.translate ("form-handle.text-error"));
          }
        }
      });
      //发送消息
      $scope.sent = function () {
        $scope.msgLength = $scope.msgLength + $scope.send_content.length;//获取发送的信息字数
        $scope.documents.push({msg: $scope.send_content, img: '', audio: '',index:$scope.documents.length});
        $scope.replyContents.push($scope.send_content);
        $scope.opinion = $scope.replyContents.join(',');
        $scope.endReason = $scope.send_content;
        textareaId.value = '';
        $scope.send_content = '';
        if (textareaId.value == '') {
          $scope.hasMsg = false;
          $scope.send_content = '';
        }
      };
      //输入框改变的时候
      $scope.textChange = function (which) {
        if (!$scope.send_content) {
          $scope.hasMsg = false;
        } else {
          $scope.hasMsg = true;
        }
        $scope.length = 0;
      };
      //如果是从点击回复跳过来的
      if ($scope.reply == 'reply') {
        $rootScope.hideTabs = true;
        $scope.clickRightSave = function () {//回复保存
          $rootScope.hideTabs=true;
          agreeImgFlag = true;//图片审批flag
          agreeVoiceFlag = true;//录音审批flag
          isTrue($scope.documents);
          if(agreeImgFlag&&agreeVoiceFlag){
            if($scope.opinion != '' ||  $scope.attachmentPkidList != ''){//意见或附件不能为空
              saveReply(account, pkid, $scope.opinion, $scope.attachmentPkidList, true);
            }else {
              if(!$isMobile.isPC) {
                $cordovaToast.showShortBottom (T.translate ("form-handle.save-error"));
              }else {
                alert(T.translate ("form-handle.save-error"));
              }
            }
          }else {
            if(!$isMobile.isPC){
              $cordovaToast.showShortBottom(T.translate("form-handle.agree-opinion-err"));
            }
          }

        }
      }
      //图片上传失败的显示Loading
      function isIndexOf(index) {
        if($scope.documents.indexOf($scope.documentImg) == -1){
          $timeout(function () {
            $scope.$apply(function () {
                /**
                 * * 2018/8/7 9:33  CrazyDong
                 *  变更描述：解决附件上传网络慢时,一直loading的问题
                 *  功能说明：
                 */
              $scope.documents[index-1].img.imgSuccess = false;
              $scope.documents[index-1].img.imgFail = true;
              $scope.documentImg = '';
            });
          },100);
        }else if($scope.documents.indexOf($scope.documentImg) > -1){
          $scope.documentImg.img.imgSuccess = true;
          $scope.documentImg.img.imgFail = false;
          $timeout(function () {
            $scope.$apply(function () {
              $scope.documentImg.img.imgSuccess = false;
              $scope.documentImg.img.imgFail = true;
              $scope.documentImg = '';
            });
          },100);
        }
      }
      //上传附件
      function uploadBase64(businessPkid, account, fileName, fileStream) {
          /**
           * * 2018/8/7 9:34  CrazyDong
           *  变更描述：解决附件上传网络慢的,一直显示loading的问题
           *  功能说明：在app/attachment/v2/uploadBase64中增加fileIndex字段
           */
        var url = serverConfiguration.baseApiUrl + "app/attachment/v2/uploadBase64";
        var param = {
          businessPkid: businessPkid,
          account: account,
          fileName: fileName,
          fileStream: fileStream,
          fileIndex:$scope.documents.length
        };
        //请求数据
        /**
         * * 2018/7/6 14:23  tyw
         *  重构附件上传
         */
        viewFormService.uploadData(url, param).then(function (result) {
          $scope.attachmentPkids.push(result.data.attachment_pkid);
          $scope.attachmentPkidList = $scope.attachmentPkids.join(',');
          if(result.status == '0'){
            //判断原数组中是否已经含有当前的数据  -1为不包含  >-1为已经包含
            if($scope.documents.indexOf($scope.documentImg) == -1){
              //将当前数据加入数组
              $timeout(function () {
                $scope.$apply(function () {
                    /**
                     * * 2018/8/7 9:31  CrazyDong
                     *  变更描述：解决附件上传网络慢,一直显示loading的问题
                     *  功能说明：
                     */
                  $scope.documents[result.data.fileIndex - 1].img.imgSuccess = false;
                  $scope.documentImg = '';
                });
              },100);
            }else if($scope.documents.indexOf($scope.documentImg) > -1){//失败重发时成功已包含则不再继续向数组内添加
              $scope.documentImg.img.imgSuccess = true;//图片的发送成功的loading图显示
              $scope.documentImg.img.imgFail = false;//  失败的图不显示
              $timeout(function () {
                $scope.$apply(function () {
                  $scope.documentImg.img.imgSuccess = false;//图片的发送成功的loading图不显示
                  $scope.documentImg = '';
                });
              },100);
            }
          }else {
            isIndexOf(result.data.fileIndex - 1);
          }
        }, function (error) {
          isIndexOf($scope.documents.length - 1);
        });
      }
      //上传录音
      function uploadAudio(businessPkid,account,fileName,src) {
        var fileURL = 'cdvfile://' + src;//fileEntry.toURL();
        var win = function (r) {
          var result = eval ("(" + r.response + ")");
          $scope.attachmentPkids.push (result.data.attachment_pkid);
          $scope.attachmentPkidList = $scope.attachmentPkids.join (',');
          //判断原数组中是否已经含有当前的数据  -1为不包含  >-1为已经包含
          if($scope.documents.indexOf($scope.documentVoice) == -1){
            $timeout(function () {
              $scope.$apply(function () {
                  /**
                   * * 2018/8/7 9:42  CrazyDong
                   *  变更描述：附件上传网络慢时,一直显示loading的问题
                   *  功能说明：
                   */
                  $scope.documents[result.data.fileIndex - 1].audio.voiceSuccess = false;
                $scope.documentVoice = '';
              });
            },100);
          }else if($scope.documents.indexOf($scope.documentVoice) > -1){//失败重发时成功已包含则不再继续向数组内添加
            $scope.documentVoice.audio.voiceSuccess = true;
            $scope.documentVoice.audio.voiceFail = false;
            $timeout(function () {
              $scope.$apply(function () {
                $scope.documentVoice.audio.voiceSuccess = false;
                $scope.documentVoice = '';
              });
            },100);
          }
        }
        var fail = function (error) {
          if($scope.documents.indexOf($scope.documentVoice) == -1){
            $timeout(function () {
              $scope.$apply(function () {
                var voiceList = [];
                var index ;
                for(var i = 0;i<$scope.documents.length;i++){//遍历带过来的数组
                  voiceList.push($scope.documents[i]);
                  for(var j = 0;j<voiceList.length;j++){//遍历拆分后返回的数组 得到每个字段
                    if(voiceList[j].audio.src==src) {//判断是否含有该属性
                      index = voiceList[j].index;
                    }
                  }
                }
                $scope.documents[index].audio.voiceSuccess = false;
                $scope.documents[index].audio.voiceFail = true;
                $scope.documentVoice = '';
              });
            },100);
          }else if($scope.documents.indexOf($scope.documentVoice) > -1){
            $scope.documentVoice.audio.voiceSuccess = true;
            $scope.documentVoice.audio.voiceFail = false;
            $timeout(function () {
              $scope.$apply(function () {
                $scope.documentVoice.audio.voiceSuccess = false;
                $scope.documentVoice.audio.voiceFail = true;
                $scope.documentVoice = '';
              });
            },100);
          }
        }

          /**
           * * 2018/8/6 9:24  CrazyDong
           *  变更描述：解决附件上传网络慢时,一直显示loading的问题
           *  功能说明：改用接口app/attachment/v2/upload,增加字段fileIndex
           */
        var url = serverConfiguration.baseApiUrl + "app/attachment/v2/upload";
        var fileNameTime = Date.parse (new Date ()) + '.m4a';
        var param = {
          businessPkid: businessPkid,
          account: account,
          fileName: fileNameTime,
          fileIndex:$scope.documents.length
        };
        var options = new FileUploadOptions ();
        options.params = param;/*请求参数*/
        options.mimeType = "video/mp4"; /*文件种类*/
        options.fileName = fileNameTime + '.mp4'; /*文件名字*/
        options.fileKey = "fileStream"; /*文件对应的key值*/
        var ft = new FileTransfer (); /*建立传输对象*/
        ft.upload (fileURL, encodeURI (url), win, fail, options);
      }
      //暂存
      function temporaryData(account, taskId, procInstId, opinion, data, attachmentPkids, isLoading) {
        var url = serverConfiguration.baseApiUrl + "app/approve/v1/temporarySave";
        var param = {
          account: account,
          taskId: taskId,
          procInstId: procInstId,
          opinion: opinion,
          data: angular.toJson(data).toString().replace(/\"/g, "\""),
          attachmentPkids: attachmentPkids,
          isLoading:isLoading
        };
        GetRequestService.getRequestDataJson(url, param, isLoading,'POST','application/json').then(function (result) {
          $scope.state = result.state;
          if($scope.state == '0'){
            /**
            * * 2018/7/19 14:23  tyw
            *  在退出表单详情，审批通过之后清空储存的表单数据
            */
            $scope.$emit('clearStorageFormData');
            $scope.workWaitData = $stateParams.workWaitData;
            storageService.set('needRemberPosition',true)
            stateGoHelp.stateGoUtils(true,'tab.waitWork', {titleFlag:$scope.titleFlag,workWaitData:$scope.workWaitData},'left');
          }
        }, function (error) {
          if(!$isMobile.isPC) {
            $cordovaToast.showShortBottom (T.translate ("publicMsg.requestErr"));
          }
        });
      }
      //终止
      function terminateData(account,procInstId, taskId, opinion, attachmentPkids,messageType, isLoading) {
        var url = serverConfiguration.baseApiUrl + "app/approve/v1/terminate";
        var param = {
          account: account,
          procInstId:procInstId,
          taskId: taskId,
          opinion: opinion,
          attachmentPkids:attachmentPkids,
          messageType: messageType,
          isLoading:isLoading
        };

        GetRequestService.getRequestDataJson(url, param, isLoading,'POST','application/json').then(function (result) {
          $scope.state = result.state;
          if($scope.state == '0'){
            $scope.workWaitData = $stateParams.workWaitData;
            storageService.set('needRemberPosition',true)
              stateGoHelp.stateGoUtils(true,'tab.waitWork', {
                  titleFlag:$scope.titleFlag,workWaitData:$scope.workWaitData
              },'left');
          }
        }, function (error) {
          if(!$isMobile.isPC) {
            $cordovaToast.showShortBottom (T.translate ("publicMsg.requestErr"));
          }
        });
      }
      //保存
      function saveReply(account, headPkid, content, attachmentPkids, isLoading) {
        var url = serverConfiguration.baseApiUrl + "app/approve/v1/saveReply";
        var param = {
          account: account,
          headPkid: headPkid,
          content: content,
          attachmentPkids: attachmentPkids,
          isLoading : isLoading
        };

        GetRequestService.getRequestDataJson(url, param, isLoading,'POST','application/json').then(function (result) {
          if(result.state == '0'){
            var waitWorkPassDate = {
              taskId: angular.fromJson($stateParams.waitWorkPassDate).taskId,
              procInstId: angular.fromJson($stateParams.waitWorkPassDate).procInstId
            };
            $scope.workType = $stateParams.type;
            $scope.title = $stateParams.title;
            $scope.titleFlag = $stateParams.titleFlag;
            $scope.workWaitData = $stateParams.workWaitData;
            storageService.set("sizerBackRequest","backRequestSave");//待办页面back后刷新的标识
            stateGoHelp.stateGoUtils(true,'tab.view-form', {savereply:'savereply',workWaitData:$scope.workWaitData,
                waitWorkPassDate: angular.toJson(waitWorkPassDate),type:$stateParams.type,titleName:$scope.title,
                titleFlag : $scope.titleFlag,notification:$stateParams.notification,information:$stateParams.information,
                NotificationItem:$stateParams.NotificationItem,notificationDetail:$stateParams.notificationDetail},'left');

          }else {
            if(!$isMobile.isPC) {
              $cordovaToast.showShortBottom (T.translate ("form-handle.reply-err"));
            }else {
              alert(T.translate ("form-handle.reply-err"))
            }
          }
        }, function (error) {
          if(!$isMobile.isPC) {
            $cordovaToast.showShortBottom (T.translate ("publicMsg.requestErr"));
          }
        });
      }
      //同意或不同意  表单审批的请求
      function approveData(account, taskId, procInstId, actionName, opinion, data, attachmentPkids,flagType,password, follow, isLoading) {
        // var url = serverConfiguration.baseApiUrl + "app/approve/v1/approve";
        var url = serverConfiguration.baseApiUrl + "app/approve/v2/approve";
        var param = {
          account: account,
          taskId: taskId,
          procInstId: procInstId,
          actionName: actionName,
          opinion: opinion,
          data: angular.toJson(data).toString().replace(/\"/g, "\""),
          attachmentPkids: attachmentPkids,
          flagType : flagType,
          password : password,
          follow: follow
        };
        GetRequestService.getRequestDataJson(url, param, isLoading,'POST','application/json').then(function (result) {
          $scope.state = result.state;
          console.log($scope.state);
          var stateMap = {
            'isSync': '0',  // 同步 其他人员公用
            'isAsync': '100'  // 异步 董事长等特殊人员专用
          }
          if($scope.state === stateMap.isSync || $scope.state === stateMap.isAsync){
         /**
         * * 2018/7/19 14:23  tyw
         *  在退出表单详情，审批通过之后清空储存的表单数据
         */
            $scope.$emit('clearStorageFormData');
            // wy 这个账号在连续审批时，会出现某一表单的主表数据和前一次审批的主表数据重复，这里清除表单数据（主表和从表一起）,清除全局变量 dataTimeNewNow
            // 上面的clearStorageFormData方法里并没有调用setSignData(null)，因为clearStorageFormData在其他多个地方有调用，不确定其他地方是否都需要setSignData(null)
            // 所以这里单独做处理
            $rootScope.dataTimeNewNow = ''
            scopeData.prototype.setSignData(null);
            if(!$isMobile.isPC) {
              $cordovaToast.showShortBottom (T.translate ("form-handle.handle-success"));
            }
            $scope.workWaitData = $stateParams.workWaitData;
            // storageService.set('needRemberPosition',true)
            // 审批后，返回两页到列表页，
            // 同步情况下，记录审批ID，返回列表页后将审批ID对应数据从列表中删除
            if($scope.state === stateMap.isSync){
              storageService.set('FORM_HANDLE_ID', procInstId)
            }
            $ionicNativeTransitions.goBack(-2);
            // stateGoHelp.stateGoUtils(true,'tab.waitWork', {titleFlag : $scope.titleFlag,title:$scope.title,workWaitData:$scope.workWaitData},'left')
          }
        }, function (error) {
          if(!$isMobile.isPC) {
            $cordovaToast.showShortBottom (T.translate ("publicMsg.requestErr"));
          }
        });
      }

        /**
         * * 2018/4/9 10:16  CrazyDong
         *  变更描述：封装签章管理的方法
         *  功能说明：获取签章字段,并将其加入到newFandleData表单数据中
         * @param result 获取到签章图片的id,当isShowSign为false时,传null即可
         * @param isShowSign 控制是否显示签章,不显示时候置空
         * @returns {*}
         */
        function signManage(result,isShowSign){
          for (var i = 0; i < sign.length; i++) {//遍历权限数组 权限数组是前面页面带过来的 对象套对象的结构
              $scope.signList = sign[i].split (".");//拆分数组得出单个字段  得出每个对象的字段 其实就是为了把签章图片对应的那个字段加到最里面的一层
              //遍历拆分后返回的数组 得到每个字段 0字段的是data 所以从1开始遍历
              for (var j = 1; j < $scope.signList.length; j++) {
                  //含有该属性  判断带过来的数据里包不包含第一层的字段 包括就用空对象 $scope.newData接收这个对象
                  //第二次的时候如果不包括这个字段了就把这个字段加到对象$scope.newData里 这个时候$scope.newData对象指向的是newFandleData[$scope.signList[j]]
                  //所以就修改了newFandleData[$scope.signList[j]]对象内的newFandleData[$scope.signList[j]][$scope.signList[j]]属性的值
                  if (newFandleData.hasOwnProperty ($scope.signList[j]) == true) {
                      $scope.newData = newFandleData[$scope.signList[j]];
                  } else {
                      if(isShowSign){
                          $scope.newData[$scope.signList[j]] = result.signatureId;//获取到签章图片的id
                      }else{
                          $scope.newData[$scope.signList[j]] = '';
                      }

                  }
              }
          }

           return newFandleData;//要传给后台的data数据
      }
    }]);
})();
