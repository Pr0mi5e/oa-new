(function () {
  'use strict';
  
  var app = angular.module('community.directive');
  
  app.directive('viewFormPopup', function ($ionicLoading,$isMobile,$cordovaFileOpener2,$cordovaToast,$cordovaFileTransfer) {
    return {
      restrict: 'EA',
      replace: true,
      scope:{
        pkid:'=pkid',
        type:'=type',
        format:'=format'
      },
      controller : function ($scope,$element,DateUtil,$filter,serverConfiguration,$ionicPopup,T,openFileUtils) {
        var pkId = $scope.pkid;
        var type = $scope.type;
        var img = $scope.pkid;
        var formatFlag = $scope.format;//文件名字
        this.getAttachment= function (){
          
          if(type=='' || type == undefined){
            
            $scope.img = img;
            var myPopup = $ionicPopup.show({template: '<div style="width: 100%;height: 100%;"> <div> <img style="width: 100%;height: auto" src="{{img}}" alt=""> </div><div ng-click="goDele()" style="text-align:center;font-size: 30px;font-weight: 600;margin-top:5px"><img style="width: 15%;height: auto" src="app/view-form/img/closeImg.png" alt=""></div>  </div>',
              title: '图片预览',
              scope: $scope
              
              
            });
            myPopup.then(function(res) {
            });
            
            
            //点击关闭预览图片
            $scope.goDele = function () {
              myPopup.close(); //由于某种原因3秒后关闭弹出
            }
          }else {
            if (type.indexOf('image') == 0) {//预览图片
              $scope.url = serverConfiguration.baseApiUrl + "app/attachment/showImage?pkid=" + pkId;
              
              
              //自定义弹窗
              var myPopup = $ionicPopup.show({
                template: '<div style="width: 100%;height: 100%;"> <div> <img imageonerror="imgonerror()" style="width: 100%;height: auto" src="{{url}}" alt=""> </div><div ng-click="goDele()" style="text-align:center;font-size: 30px;font-weight: 600;margin-top:5px"><img style="width: 15%;height: auto" src="app/view-form/img/closeImg.png" alt=""></div>  </div>',
                title:'图片预览',
                scope: $scope
                
                
              });
              myPopup.then(function (res) {
              });
              
              
              //点击关闭预览图片
              $scope.goDele = function () {
                myPopup.close(); //关闭弹出
              }
              
              $scope.imgonerror = function () {
                if ($scope.url.indexOf('showImage?') > -1) {
                  $scope.url = 'app/view-form/img/picture404.png';
                }
              }

            } else if (type == 'application/pdf') {//查看pdf文件
              if ($isMobile.IOS) {
                 $scope.url = serverConfiguration.baseApiUrl + "app/attachment/download?pkid=" + pkId;
                cordova.exec(null, null, "InAppBrowser",
                  "open", [encodeURI($scope.url), "_system"]);
              } else if ($isMobile.Android) {
                downloadFile("OApdf",pkId + '.pdf');//下载PDF

              }
            } else if (type == 'application/octet-stream') {//之前规定application/octet-stream查看pdf文件和exl表格,RAR格式也走这个,所以文件夹名字统一OAFile

              if ($isMobile.IOS) {
                $cordovaToast.showLongBottom(T.translate("view-form.view-error-attachment-ios"));

              } else if ($isMobile.Android) {
                  downloadFile("OAFile",formatFlag);//下载application/octet-stream格式文件

              }
            }else {
                //android全部下载,IOS给予提示
                if($isMobile.IOS){
                    $cordovaToast.showLongBottom(T.translate("view-form.view-error-attachment"));
                }else if($isMobile.Android){
                    downloadFile("OAFile",formatFlag);//下载其他附件
                }
            }
          }

            //android附件下载
            /*targetPath : 文件下载到SD卡中的文件夹名字,如"OAOther"
            * fileName : 文件名字,必须带后缀
            * */
           function downloadFile(targetPath,fileName){
              if ($isMobile.Android) {
                  $ionicLoading.show({
                      template: "正在下载,请您稍等..."
                  });
                  //创建文件夹
                  window.resolveLocalFileSystemURI(cordova.file.externalRootDirectory, function (fileEntry) {
                      fileEntry.getDirectory(targetPath, {create: true, exclusive: false}, function (exclusive) {

                          var downloadUrl = serverConfiguration.baseApiUrl + "app/attachment/download?pkid=" + pkId;
                          var sdTargetPath = "/sdcard/" + targetPath + "/" + fileName;//手机下载路径,默认为android路径Download文件夹里面
                          var uri = encodeURI(downloadUrl);
                          var fileTransfer = new FileTransfer();
                          /*下载*/
                          fileTransfer.download(uri, sdTargetPath, function (entry) {
                                  $cordovaToast.showLongBottom("文件已下载到SD卡下的"+ targetPath +"文件夹内");
                                  //如果是PDF,直接打开
                                  if(type == 'application/pdf'){
                                      //调用第三方打开PDF文件
                                      openFileUtils.openFilePDF(sdTargetPath);
                                  }else{
                                      $ionicLoading.hide();
                                  }


                              }, function (err) {
                                  $ionicLoading.hide();
                                  $cordovaToast.showShortBottom(T.translate("view-form.download-error"));
                              },
                              false, {
                                  headers: {
                                      "Authorization": "BasicdGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                  }
                              });

                      }, function () {
                          $ionicLoading.hide();
                          $cordovaToast.showShortBottom(T.translate("view-form.create-error"));
                      });

                  });
              }

          }

          
        }
        
        
      },
      controllerAs:'viewFormPopupController',
      link:function ($scope,$element,$attr,viewFormPopupController) {
        
        $element.on('click',function () {
          
          viewFormPopupController.getAttachment();
        });
      }
    };
  })
  
})();
