/**
 * Created by developer on 2017/5/27.
 * 个人详情
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function() {
    'use strict';

    var app=angular.module('community.controllers.mine');
    app.controller('MineDetailsCtrl', ['$scope','$state','$ionicActionSheet','$timeout','$rootScope',
        '$ionicNativeTransitions','serverConfiguration','storageService','auth_events','MineService',
        'viewFormService','$cordovaToast','mine','$isMobile','T','stateGoHelp',
        function($scope,$state,$ionicActionSheet,$timeout,$rootScope,$ionicNativeTransitions,serverConfiguration,
                 storageService,auth_events,MineService,viewFormService,$cordovaToast,mine,$isMobile,T,stateGoHelp) {
            /*跳转个人资料*/

            //调用手机或相册时获取的图片
            $scope.myImage = '';
            //头像处显示的截取下来的图片
            $scope.showImage = '';

            $scope.account = storageService.get(auth_events.userId,null);

            $scope.pkidImg = '';
            var initScale = 1;
            // var crop_btn = document.querySelector("#crop_btn");
            var crop_result = document.querySelector("#crop_result");
            var avatarId = document.querySelector("#avatarId");
            $scope.personInfo = {};
            $rootScope.titleData = '我的资料';
            $scope.$on('$ionicView.beforeEnter', function (event,data) {
                $rootScope.titleData = '我的资料';
                $rootScope.hideTabs = true;
                $rootScope.bell = false;
                $rootScope.toBack = true;
                if(!$isMobile.isPC) {
                    if(!$isMobile.isPC && $isMobile.Android){
                        var transitionDirection = data.direction !== "back" ? "left" : "right";
                        window.plugins.nativepagetransitions.slide({
                            "direction": transitionDirection
                        });
                    }
                }
                getInfo();
            });

            /*获取个人信息*/
            function getInfo(){
                var url = serverConfiguration.baseApiUrl + "app/common/v1/getPersonInfo";
                var param = {
                    account : storageService.get(auth_events.userId,null) //用户id
                }

                MineService.getMineData(url,param).then(function(result){
                    $scope.personInfo = result;

                    if(result.picture != null){
                        $scope.showPicture = true;
                        $scope.showImage = serverConfiguration.baseApiUrl + 'app/attachment/showImage?pkid=' + result.picture;

                    }else {
                      $scope.showPicture = false;
                    }

                },function(err){
                    if(!$isMobile.isPC){
                      $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }
            $scope.imgonerror = function () {
                if ($scope.showImage.indexOf('showImage?') > -1) {
                    $scope.showImage = 'app/view-form/img/picture404.png';
                }
            }
            $scope.chooseHeadPicture = function(){
                if($isMobile.Android){

                  var perArr = ["android.permission.WRITE_EXTERNAL_STORAGE","android.permission.CAMERA"];
                  PermissionsPlugin.addPermissions("权限",function () {},function () {},perArr);

                }

                /*弹出popupWindow选择器*/
                var type = null;

                var  hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: '从相册选择' },
                        { text: '拍照' }
                    ],
                    titleText: '选择头像',
                    cancelText: '取消',
                    cancel: function() {
                    },
                    buttonClicked: function(index) {
                        if(index == 0){//相册
                            // type = 0
                            type = navigator.camera.PictureSourceType.PHOTOLIBRARY;


                        }else if(index == 1){//相机
                            // type = 1
                            type = navigator.camera.PictureSourceType.CAMERA;

                        }
                        if (type !== null) {
                            $scope.takePhoto(type);


                        }
                        return true;
                    }
                });
                //获取图片并上传
                $scope.takePhoto = function(sourceType){
                    var options = {
                        quality: 50,
                        destinationType: navigator.camera.DestinationType.DATA_URL,
                        sourceType: sourceType,
                        correctOrientation:true,
                        popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_RIGHT),
                        cameraDirection: navigator.camera.Direction.BACK
                    };
                    navigator.camera.getPicture(onImageSuccess, onFail, options);

                };
                function showToolPanel() {

                  crop_result.style.display = "block";

                }
                function hideToolPanel() {

                  crop_result.style.display = "none";

                  crop_result.innerHTML = "";
                }


                function onImageSuccess(imageData) {
                    var base64image = "data:image/png;base64," + imageData;
                    var fileNameTime = Date.parse(new Date()) + '.jpg';
                    $scope.$apply(function($scope){
                        $scope.myImage = base64image;
                    });
                    hideToolPanel();
                    new AlloyCrop({
                        image_src: $scope.myImage,
                        circle: true,
                        width: 200,
                        height: 200,
                        ok: function (base64, canvas) {
                            uploadBase64(null, $scope.account, fileNameTime, base64, true);

                            crop_result.appendChild(canvas);
                            crop_result.querySelector("canvas").style.borderRadius = "50%";
                            showToolPanel();
                            $scope.$apply(function ($scope) {
                                $scope.showPicture = true;
                                $scope.showImage = base64 ;
                            });

                        },
                        cancel: function () {
                            showToolPanel();
                        },

                        ok_text : '确认',
                        cancel_text : '取消'
                    });

                }
                function onFail(message) {
                  $cordovaToast.showShortBottom(message)
                }

            }


            //上传附件
            function uploadBase64(businessPkid, account, fileName, fileStream, isLoading) {
                var url = serverConfiguration.baseApiUrl + "app/attachment/uploadBase64";

                var param = {
                    businessPkid: businessPkid,
                    account: account,
                    fileName: fileName,
                    fileStream: fileStream

                };
                /**
                 * * 2018/7/6 14:23  tyw
                 *  重构附件上传
                 */
                //请求数据
                viewFormService.uploadData(url, param).then(function (result) {
                  $scope.pkidImg = result.data.attachment_pkid;
                  uploadAvatar($scope.account,$scope.pkidImg);
                }, function (error) {
                  $cordovaToast.showShortBottom(T.translate('mine.avatar-upload-fail'))
                });
            }
            //上传头像
            function uploadAvatar(account,attachPkid) {
                var url = serverConfiguration.baseApiUrl + "app/common/v1/editProfilePicture";

                var param = {
                  account: account,
                  attachPkid : attachPkid

                };

                //请求数据
                MineService.uploadAvatar(url, param).then(function (result) {
                  $scope.state = result.state;
                  if(result.state == '0'){
                    $cordovaToast.showShortBottom(T.translate('mine.avatar-upload-success'))
                  }else if(result.state == '-1'){
                    $cordovaToast.showShortBottom(T.translate('mine.avatar-upload-fail'))
                  }
                }, function (error) {
                  $cordovaToast.showShortBottom(T.translate('mine.avatar-upload-fail'))
                });
            }



          /*返回*/
            $rootScope.$ionicGoBack = function(){
                /*返回上一页*/
                stateGoHelp.stateGoUtils(false);
            }

        }]);

})();
