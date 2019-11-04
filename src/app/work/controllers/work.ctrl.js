/**
 * Created by developer on 2017/5/16.
 */
/**
 * * 2019/2/27 14:28  CrazyDong
 *  变更描述：
 *  功能说明：记录交接js
 */
(function () {
    'use strict';

    var app = angular.module('community.controllers.work');

    /*工作*/
    app.controller('WorkCtrl', ['$scope', '$state', '$rootScope', '$ionicNativeTransitions', '$ionicHistory', '$isMobile',
        'WaitHomeService', 'serverConfiguration', 'storageService', 'auth_events', '$cordovaToast', 'T', 'GetRequestService',
        'application', 'wait_work', 'timeout', 'stateGoHelp', 'DBSingleInstance', '$timeout', 'appUtils', 'jdbc',
        function ($scope, $state, $rootScope, $ionicNativeTransitions, $ionicHistory, $isMobile, WaitHomeService, serverConfiguration,
                  storageService, auth_events, $cordovaToast, T, GetRequestService, application, wait_work, timeout, stateGoHelp, DBSingleInstance,
                  $timeout, appUtils, jdbc) {

            /**
             * * 2018/4/11 14:53  CrazyDong
             *  变更描述：待办工作给予默认值
             *  功能说明：给予默认值,避免待办位置空缺
             */
            $scope.workHomeData = WaitHomeService.getVirtualData.list;
            $scope.workHomeDataa = []
            $scope.alreadyWorkHomeData = WaitHomeService.getVirtualData.alreadyList;//已办分类数据
            for (var i = 0; i < 4; i++) {
                $scope.workHomeData[i].bgFlag = false;
                $scope.workHomeData[i].imgUrl = [
                    "app/work/img/finance-approval.png",
                    "app/work/img/purchase-approval.png",
                    "app/work/img/pay-approval.png",
                    "app/work/img/other-approval.png"][i];
                $scope.workHomeData[i].titleName = "数据加载中";

                $scope.alreadyWorkHomeData[i].bgFlag = false;
                $scope.alreadyWorkHomeData[i].imgUrl = [
                    "app/work/img/al-finance-approval.png",
                    "app/work/img/al-purchase-approval.png",
                    "app/work/img/al-pay-approval.png",
                    "app/work/img/al-other-approval.png"][i];
                $scope.alreadyWorkHomeData[i].titleName = "数据加载中";


            }
            var isOnClick = false; //判断待办显示"数据加载中"时,是否可以点击,默认不可以点击
            var syncData = {};//同步后存储同步数据对象j
            var haveNewsFlag = false;//有没有新消息提示,即小红点
            $scope.isShowForm = false;//控制时候显示报表,默认不显示
            $scope.isTotalMoney = true;//显示本年度付款金额,当无付款时,显示0
            if (storageService.get(auth_events.roleList, "") != "") {
                var roleList = angular.fromJson(storageService.get(auth_events.roleList, ""));//获取角色权限列表
                //判断角色权限,是否显示报表,mobile-dashboard-purchase展示采购报表
                for (var i = 0; i < roleList.length; i++) {
                    switch (roleList[i].roleCode) {
                        case "mobile-dashboard-purchase" :
                            $scope.isShowForm = true;
                            break;
                    }
                }
            }

            /*点击同步时候的10中图标集合*/
            var syncImg = [
                "app/work/img/custom-img-one.png",
                "app/work/img/custom-img-two.png",
                "app/work/img/custom-img-three.png",
                "app/work/img/custom-img-four.png",
                "app/work/img/custom-img-five.png",
                "app/work/img/custom-img-six.png",
                "app/work/img/custom-img-seven.png",
                "app/work/img/custom-img-eight.png",
                "app/work/img/custom-img-nine.png",
                "app/work/img/custom-img-ten.png"
            ]
            $scope.workTotalNum = "";//待办工作总数
            $scope.formData = {};//图表的数据对象
            $scope.showIpadHr = false;//控制金额右边的竖线高度,false为30px,true为50px
            $scope.widthValue = screen.width;
            $scope.done = "";//已办工作的数量
            $scope.otherAppplications = ""; //其他应用总数

            /**
             * * 2018/5/16 16:41  CrazyDong
             *  变更描述：
             *  功能说明：饼状图假数据
             */
            //var formDataTemp = {"state":"0","msg":"操作成功","list":[{"total":{"CALSUM":1234567891.25,"BZBD":"人民币"},"detail":[{"GYBZBD":"关志成","CALSUM":1025.12,"BZBD":"人民币"},{"GYBZBD":"刁维明","CALSUM":9400,"BZBD":"人民币"},{"GYBZBD":"姜利刚","CALSUM":4415.82,"BZBD":"人民币"},{"GYBZBD":"李宝锋","CALSUM":676.62,"BZBD":"人民币"},{"GYBZBD":"李崇旭","CALSUM":3495.04,"BZBD":"人民币"},{"GYBZBD":"王乃泉","CALSUM":459.48,"BZBD":"人民币"},{"GYBZBD":"王雷","CALSUM":259.04,"BZBD":"人民币"},{"GYBZBD":"黄大为","CALSUM":29142.88,"BZBD":"人民币"},{"GYBZBD":"黄大为","CALSUM":800,"BZBD":"欧元"}]},{"total":{"CALSUM":321.77,"BZBD":"美元"},"detail":[{"GYBZBD":"关志成美元","CALSUM":321.77,"BZBD":"美元"},{"GYBZBD":"刁维明美元","CALSUM":9400,"BZBD":"美元"},{"GYBZBD":"姜利刚美元","CALSUM":4415.82,"BZBD":"美元"},{"GYBZBD":"李宝锋美元","CALSUM":676.62,"BZBD":"人民币美元"},{"GYBZBD":"李崇旭美元","CALSUM":3495.04,"BZBD":"美元"},{"GYBZBD":"王乃泉美元","CALSUM":459.48,"BZBD":"美元"},{"GYBZBD":"王雷美元","CALSUM":259.04,"BZBD":"美元"},{"GYBZBD":"黄大为美元","CALSUM":29142.88,"BZBD":"美元"},{"GYBZBD":"黄大为美元","CALSUM":800,"BZBD":"欧元"}]},{"total":{"CALSUM":321.77,"BZBD":"欧元"},"detail":[{"GYBZBD":"关志成欧元","CALSUM":321.77,"BZBD":"欧元"},{"GYBZBD":"刁维明欧元","CALSUM":9400,"BZBD":"欧元"},{"GYBZBD":"姜利刚欧元","CALSUM":4415.82,"BZBD":"欧元"},{"GYBZBD":"李宝锋欧元","CALSUM":676.62,"BZBD":"欧元"},{"GYBZBD":"李崇旭欧元","CALSUM":3495.04,"BZBD":"欧元"},{"GYBZBD":"王乃泉欧元","CALSUM":459.48,"BZBD":"欧元"},{"GYBZBD":"王雷欧元","CALSUM":259.04,"BZBD":"欧元"},{"GYBZBD":"黄大为欧元","CALSUM":29142.88,"BZBD":"欧元"},{"GYBZBD":"黄大为欧元","CALSUM":800,"BZBD":"欧元"}]},{"total":{"CALSUM":321.77,"BZBD":"日元"},"detail":[{"GYBZBD":"关志成日元","CALSUM":321.77,"BZBD":"日元"},{"GYBZBD":"刁维明日元","CALSUM":9400,"BZBD":"日元"},{"GYBZBD":"姜利刚日元","CALSUM":4415.82,"BZBD":"日元"},{"GYBZBD":"李宝锋日元","CALSUM":676.62,"BZBD":"日元"},{"GYBZBD":"李崇旭日元","CALSUM":3495.04,"BZBD":"日元"},{"GYBZBD":"王乃泉日元","CALSUM":459.48,"BZBD":"日元"},{"GYBZBD":"王雷日元","CALSUM":259.04,"BZBD":"日元"},{"GYBZBD":"黄大为日元","CALSUM":29142.88,"BZBD":"日元"},{"GYBZBD":"黄大为日元","CALSUM":800,"BZBD":"欧元"}]}]}
            //setFormData(formDataTemp);

            $scope.$on('$ionicView.beforeEnter', function (event, data) {
                $ionicHistory.clearCache();
                $ionicHistory.clearHistory();
                /*把App设置成竖屏*/
                if (!$isMobile.isPC) {
                    screen.orientation.lock('default');
                }
                //TODO 报表功能,有权限再获取数据
                if ($scope.isShowForm) {
                    getFormData();//获取报表数据
                }

                data.enableBack = true;
                $rootScope.bell = true;
                $rootScope.toBack = false;
                $rootScope.hideTabs = false;
                $rootScope.titleData = '工作';
                storageService.set(wait_work.sizerWorkTypeKey, "");
                storageService.set(wait_work.sizerWorkStateKey, "");
                storageService.set("viewFormCacheWork", null);
                storageService.removeItem('searchDataStr');
                /**
                 * * 2018/5/15 10:49  CrazyDong
                 *  变更描述：
                 *  功能说明：横竖屏显示初始化
                 */
                if (ionic.Platform.isIPad()) {
                    $scope.showIpadHr = true;
                    switch (window.orientation) {
                        case 0:
                            initFormView(true, false, false, false, true, false);
                            break;
                        case 90:
                            initFormView(true, false, false, true, false, false);
                            break;
                        case -90:
                            initFormView(true, false, false, true, false, false);
                            break;
                    }
                } else {
                    $scope.showIpadHr = false;
                    initFormView(false, true, false, false, false, true);
                }

                /*跳转通知*/
                $rootScope.clickLiftMessage = function () {
                    stateGoHelp.stateGoUtils(true, 'tab.workNotification', {type: "work"}, 'left');
                };

                // 获取自定义条目
                var syncOperate = function () {
                    var urlSync = serverConfiguration.baseApiUrl + "app/home/v1/custom";
                    var param = {
                        account: storageService.get(auth_events.userId, null)
                    }
                    GetRequestService.getRequestData(urlSync, param, true, 'POST').then(function (result) {
                        // return result
                        // function syncWorkHomeData(syncData) {
                        //   isOnClick = true;
                        //   debugger
                        //   $scope.workHomeDataa = syncData;
                        //   customCount();//获取待办数量
                        //   for (var i = 0; i < $scope.workHomeDataa.length; i++) {
                        //     // $scope.workHomeDataa[i].imgUrl = syncImg[i % 10];
                        //     $scope.workHomeDataa[i].name = $scope.workHomeDataa[i].name;
                        //     // if ($scope.workHomeDataa[i].num != 0) {
                        //     //   $scope.workHomeDataa[i].bgFlag = true;
                        //     //   haveNewsFlag = true;
                        //     // } else {
                        //     //   $scope.workHomeDataa[i].bgFlag = false;
                        //     // }
                        //   }
                        //
                        //   $rootScope.tabWork = haveNewsFlag;
                        //   $rootScope.tabWaitWork = haveNewsFlag;
                        // }
                        isOnClick = true;
                        $scope.workHomeDataa = JSON.parse(result.list);
                        if($scope.workHomeDataa.length > 0){
                          $scope.flagStatusOne = []
                          $scope.flagStatusTwo = []
                          for (var i = 0; i < $scope.workHomeDataa.length; i++) {
                            // 拆分成自定义待办和自定义知会
                            if ($scope.workHomeDataa[i].flagStatus === 1) {
                              $scope.flagStatusOne.push($scope.workHomeDataa[i])
                            } else {
                              $scope.flagStatusTwo.push($scope.workHomeDataa[i])
                            }
                          }
                          customCount();//获取自定义数量
                        }
                        // $rootScope.tabWork = haveNewsFlag;
                        // $rootScope.tabWaitWork = haveNewsFlag;

                    }, function (err) {
                        if (!$isMobile.isPC) {
                            $cordovaToast.showShortBottom(T.translate('mine.remarks-fail'));
                        }
                    });
                }
                // // syncOperate()
                // if ($isMobile.Android) {
                //   /**
                //    *  2018/9/7 chris.zheng
                //    *  变更描述：解决ios的WKWebView在ios部分平台不支持websql的问题
                //    *  功能说明：使用websql创建数据库
                //    */
                //   var db = DBSingleInstance.getSyncDb();
                //   /*查询*/
                //   db.transaction(function (tx) {
                //     tx.executeSql('select * from SyncData', [], function (tx, result) {
                //       // if(result.rows.length != 0){
                //       //     syncData = angular.fromJson(result.rows.item(0).name);
                //       //     syncWorkHomeData();
                //       // }else{
                //       //     requestWorkHomeData();
                //       // }
                //
                //       syncData = angular.fromJson(result.rows.item(0).name);
                //       console.log(syncData);
                //
                //       syncOperate();
                //       requestWorkHomeData();
                //     })
                //   });
                // } else {
                //   jdbc.findAll("syncData").then(function (response) {
                //     // if (response && response.length===0) {
                //     //     requestWorkHomeData();
                //     // }else {
                //     //     syncData = angular.fromJson(response[response.length-1].syncValue);
                //     //     syncWorkHomeData();
                //     // }
                //     syncOperate();
                //     requestWorkHomeData();
                //
                //   });
                // }


                // application.getAlertNews();//获取新消息提示  即红点(底部tabs 工作 待办 消息  铃铛)
                //已办数量请求
                requestMyStatisticsDone();
                syncOperate();
                requestWorkHomeData();
                getMessageNum(); // 获取消息通知数量
                // customCount();
            });


            /*跳转新建事项(暂时不加此功能)*/
//            $scope.goMatter=function () {
//                $ionicNativeTransitions.stateGo('tab.matter',{});
//            }

            /**
             * * 2018/5/18 9:43  CrazyDong
             *  变更描述：参数为boolean
             *  功能说明：初始化报表页面排版的方法
             * @param text25 钱数文字一行显示4个
             * @param text50 钱数文字一行显示2个
             * @param text100 钱数文字一行显示1个
             * @param form25 饼形图一行显示4个
             * @param form50 饼形图一行显示2个
             * @param form100 饼形图一行显示1个
             */
            function initFormView(text25, text50, text100, form25, form50, form100) {
                $scope.col25 = text25;
                $scope.col50 = text50;
                $scope.col100 = text100;
                $scope.colForm25 = form25;
                $scope.colForm50 = form50;
                $scope.colForm100 = form100;
            }

            /**
             * * 2018/5/18 13:33  CrazyDong
             *  变更描述：
             *  功能说明：设置报表的数据
             */
            function setFormData(formData) {
                if (formData.list === "[]") {
                    $scope.isTotalMoney = false;
                    return;
                }
                $scope.formData = formData;
                var tempFormList = angular.fromJson(formData.list);
                $scope.formData.list = tempFormList;
                for (i = 0; i < $scope.formData.list.length; i++) {
                    /*
                     *1 控制金额旁边的竖线,ipad最后一条不显示,手机单数显示
                     * */
                    if (ionic.Platform.isIPad()) {
                        if (i === $scope.formData.list.length - 1) {
                            $scope.formData.list[i].hrShow = false;
                        } else {
                            $scope.formData.list[i].hrShow = true;
                        }
                    } else {
                        if (i % 2 === 1) {
                            $scope.formData.list[i].hrShow = false;
                        } else {
                            $scope.formData.list[i].hrShow = true;
                        }
                    }
                    /*
                     * 控制金额显示 ,先判断是否超过十位,超过十位以上去掉小数点,去掉小数点还超过十位,修改字体大小
                     * */
                    //替换掉字符串中"符号
                    var tempStrOld = angular.toJson($scope.formData.list[i].total.CALSUM).replace(/"/g, "");
                    var tempStr = appUtils.outputMoney(tempStrOld);


                    if (tempStr.length > 10) {
                        var indexPosition = tempStr.indexOf(".");
                        if (indexPosition > 0) {
                            tempStr = tempStr.substring(0, indexPosition);

                        }

                        if (tempStr.length > 10) {
                            $scope.formData.list[i].changeSize = true;//控制金额字体大小,false为默认,true为10px
                            //控制是否显示省略号
                            if ($scope.widthValue < 321 && tempStr.length > 11) {
                                tempStr = tempStr.substring(0, 9) + "...";
                            }

                        } else {
                            $scope.formData.list[i].changeSize = false;//控制金额字体大小,false为默认,true为10px
                        }

                    }
                    $scope.formData.list[i].total.CALSUM = tempStr;


                    //控制金钱图标
                    switch ($scope.formData.list[i].total.BZBD) {
                        case "人民币":
                            $scope.formData.list[i].imgSrc = "app/work/img/rmb-icon.png";
                            break;
                        case "美元":
                            $scope.formData.list[i].imgSrc = "app/work/img/dolla-iconr.png";
                            break;
                        case "欧元":
                            $scope.formData.list[i].imgSrc = "app/work/img/Euro-icon.png";
                            break;
                        case "日元":
                            $scope.formData.list[i].imgSrc = "app/work/img/yen-icon.png";
                            break;
                    }

                }
            }

            /*获取报表数据*/
            function getFormData() {
                var url = serverConfiguration.baseApiUrl + "app/dashboard/v1/purchasingStatistics";
                var param = {
                    userPkid: storageService.get(auth_events.userId, null),//用户id
                    time_from: null,//统计开始时间，格式：yyyy-MM-dd，不设置时，无开始时间
                    time_to: null,//统计结束时间
                    orderby: 1,//排序规则【1】，人民币， 美元，欧元，日元
                    time_unit: null//统计时间单位，时间类型单位：不设置时视同【1】0：流程开始时间1：流程结束时间
                };

                GetRequestService.getRequestData(url, param, false, 'GET').then(function (result) {
                    setFormData(result);
                }, function (err) {

                });
            }

            /*待办*/
            function requestWorkHomeData() {
                // var url = serverConfiguration.baseApiUrl + "app/common/v1/getCountInfo";
                /**
                 * * 2018/5/11 14:25  tyw
                 *  变更描述：bug306:首页接口更改-增加已发已办跟踪三个字段
                 *  功能说明：
                 */
                var url = serverConfiguration.baseApiUrl + "app/common/v2/getMyStatistics";

                var param = {
                    account: storageService.get(auth_events.userId, null)
                };
                GetRequestService.getRequestData(url, param, true, 'POST').then(function (result) {
                    console.log(result);
                    // var resultList = JSON.parse(result.list)
                    $scope.workHomeData = JSON.parse(result.list)
                    var totalNum = result.other + result.money + result.goods + result.staff;
                    if (totalNum > 0) {
                        $scope.workTotalNum = "[ " + totalNum + " ]";
                    }
                    $scope.documentNum = result.documentNum;//公文数量
                    $scope.followNum = result.followNum;//跟踪数量
                    $scope.request = result.sentNum;//已发数量
                    $scope.understandingNum = result.understandingNum;//知会数量
                    var totalNums = $scope.documentNum + $scope.followNum + $scope.request + $scope.understandingNum
                    if (totalNums > 0) {
                        $scope.otherAppplications = "[ " + totalNums + " ]";
                    }
                    if (result.state === -1) {
                        $scope.workHomeData = WaitHomeService.getVirtualData.list;
                        for (var i = 0; i < 4; i++) {
                            $scope.workHomeData[i].bgFlag = false;
                            $scope.workHomeData[i].imgUrl = [
                                "app/work/img/finance-approval.png",
                                "app/work/img/purchase-approval.png",
                                "app/work/img/pay-approval.png",
                                "app/work/img/other-approval.png"][i];
                            $scope.workHomeData[i].titleName = "数据出错";
                        }
                        /*判断平台*/
                        if (!$isMobile.isPC) {
                            $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                        }
                    } else {
                        isOnClick = true;
                        var totalCnt = 0
                        console.log($scope.workHomeData);
                        $scope.workHomeData.forEach(function (e, i) {
                            totalCnt = totalCnt + e.CNT;
                            if (totalCnt > 0) {
                                $scope.workTotalNum = "[ " + totalCnt + " ]";
                            }
                            $scope.workHomeData[i].imgUrl = [
                                "app/work/img/finance-approval.png",
                                "app/work/img/purchase-approval.png",
                                "app/work/img/pay-approval.png",
                                "app/work/img/other-approval.png"][i];
                        });

                        // $rootScope.tabWork = haveNewsFlag;
                        // $rootScope.tabWaitWork = haveNewsFlag;
                      $rootScope.documentNum = Number($scope.documentNum)
                        // $rootScope.tabIonNotification = result.messageNum > 0;//是否显示"消息"的红点提示
                        // $rootScope.bellRed = result.messageNum > 0;//是否显示铃铛的红点提示
                        $rootScope.tabWaitWork = totalCnt > 0;  // 待办红点提示
                        $rootScope.tabWork  = (totalCnt + $rootScope.documentNum) > 0;  // 工作红点是否显示 待办+公文
                    }

                }, function (err) {
                    /*判断平台*/
                    if (!$isMobile.isPC) {
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            /*同步后 获取用户自定义查询的待办数量*/
            function customCount() {
                var url = serverConfiguration.baseApiUrl + "app/home/v3/customCount";
                var param = {
                    account: storageService.get(auth_events.userId, null)
                };
                var authorization = storageService.get(auth_events.authorization, null);
                var userId = storageService.get(auth_events.userId, null)
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: param,
                    headers: {'Authorization': authorization, 'User_Pkid': userId},
                    success: function (resultNum) {
                        var numListStr = JSON.parse(resultNum).list;
                        var numList = JSON.parse(numListStr)
                        $scope.numDataObj = {}
                        var zhNum = 0
                        var dbNum = 0
                        for (var i = 0; i < numList.length; i++) {
                            $scope.numDataObj[numList[i].pkid] = numList[i].num
                        }
                        for (var a = 0; a < Math.max($scope.flagStatusOne.length, $scope.flagStatusTwo.length); a++) {
                            dbNum += a < $scope.flagStatusOne.length ? $scope.numDataObj[$scope.flagStatusOne[a].pkid] : 0
                            zhNum += a < $scope.flagStatusTwo.length ? $scope.numDataObj[$scope.flagStatusTwo[a].pkid] : 0
                        }
                        $scope.flagOneNum = "[ " + dbNum + " ]"
                        $scope.flagTwoNum = "[ " + zhNum + " ]"
                        $scope.$apply()
                      console.log(resultNum);
                      // $rootScope.tabIonNotification = !!resultNum.messageNum;//是否显示"消息"的红点提示
                      //   $rootScope.bellRed = resultNum.messageNum;//是否显示铃铛的红点提示
                        var db = DBSingleInstance.getSyncDb();
                        /*清空db*/
                        db.transaction(function (tx) {
                            tx.executeSql('DELETE FROM SyncData', [], function (tx, res) {
                            }, function (tx, err) {
                            })
                        });
                        db.transaction(function (tx) {
                            /*插入数据*/
                            tx.executeSql('INSERT INTO SyncData VALUES(?)', [angular.toJson($scope.workHomeData)], function (tx) {
                                },
                                function (tx, err) {
                                });
                        });
                    },
                    error: function (error) {
                        console.log(error);
                        $scope.flagStatusOne = 0
                        $scope.flagStatusTwo = 0
                    }
                })

            }

            /*已办分类数量请求*/
            function requestMyStatisticsDone() {
                var url = serverConfiguration.baseApiUrl + "app/common/v1/getMyStatisticsDone";

                var param = {
                    account: storageService.get(auth_events.userId, null)
                };
                GetRequestService.getRequestData(url, param, true, 'POST').then(function (resultDone) {
                    console.log(resultDone.list);
                    isOnClick = true;
                    var totalNumDone = 0
                    $scope.alreadyWorkHomeData = JSON.parse(resultDone.list)
                    $scope.alreadyWorkHomeData.forEach(function (item, i) {
                        totalNumDone = totalNumDone + item.CNT;
                        if (totalNumDone > 0) {
                            $scope.done = "[ " + totalNumDone + " ]";
                        }
                        $scope.alreadyWorkHomeData[i].imgUrl = [
                            "app/work/img/al-finance-approval.png",
                            "app/work/img/al-purchase-approval.png",
                            "app/work/img/al-pay-approval.png",
                            "app/work/img/al-other-approval.png"][i];
                    });
                    // var totalNumDone = resultDone.other + resultDone.money + resultDone.goods + resultDone.staff;
                    // if (totalNumDone > 0) {
                    //   $scope.done = "[ " + totalNumDone + " ]";
                    // }
                    // $scope.alreadyWorkHomeData = WaitHomeService.getVirtualData.alreadyList;
                    // console.log($scope.alreadyWorkHomeData);
                    // $scope.alreadyWorkHomeData.forEach(function (e) {
                    //   e.imgUrl = listMap[e.id].imgUrl;
                    //   e.titleName = listMap[e.id].titleName;
                    //   e.num = resultDone[listMap[e.id].num];
                    // });

                }, function (err) {
                    /*判断平台*/
                    if (!$isMobile.isPC) {
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    }
                });
            }

            //监听横竖屏
            window.addEventListener("orientationchange", function () {
                $timeout(function () {
                    if (ionic.Platform.isIPad()) {
                        switch (window.orientation) {
                            case 0:
                                initFormView(true, false, false, false, true, false);
                                break;
                            case 90:
                                initFormView(true, false, false, true, false, false);
                                break;
                            case -90:
                                initFormView(true, false, false, true, false, false);
                                break;
                        }
                    }
                }, 100);
            });

            // 代办工作
            $scope.goWaitWork = function (itemData) {
                if (isOnClick) {
                    /*utils跳转样例*/
                    stateGoHelp.stateGoUtils(true, 'tab.myWorkWaitWork', {
                        titleName: itemData.NAME_, typeId: itemData.TYPE_ID_,
                        workFlag: "isWork", condition: itemData.condition
                    }, 'left');
                } else {
                    if (!$isMobile.isPC) {
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    } else {
                        alert(T.translate("publicMsg.requestErr"));
                    }
                }
            };

            $scope.DBMsg = '自定义待办'
            $scope.ZHMsg = '自定义知会'
            // 代办 知会
            $scope.daibanzhihui = function (itemData, type) {
              if (isOnClick) {
                    /*utils跳转样例*/
                    // console.log('$88888888%O, --- %O', $scope.workHomeDataa, itemData)
                var router = type === $scope.DBMsg ? 'tab.myWorkWaitWork' : 'tab.doneWork'
                console.log(router);
                stateGoHelp.stateGoUtils(true, router, {
                        titleName: itemData.name, typeId: itemData.pkid,
                        workFlag: "isWork", condition: itemData.condition,
                        custom: JSON.stringify(itemData),
                        titleFlag: '5'
                    }, 'left');
                } else {
                    if (!$isMobile.isPC) {
                        $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                    } else {
                        alert(T.translate("publicMsg.requestErr"));
                    }
                }
            };

            //已办分类跳转
            $scope.goAlreadyWork = function (itemData) {
                console.log(itemData);
                stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
                    titleName: itemData.NAME_, titleFlag: '1', typeId: itemData.TYPE_ID_
                }, 'left');
            }
            /*其他应用*/
            /*跳转到待发事项列表*/
            $scope.goAwait = function () {
                stateGoHelp.stateGoUtils(true, 'tab.waitNews', {
                    titleName: "待发事项", titleFlag: '3'
                }, 'left');
            };
            /*跳转已发事项*/
            $scope.goSend = function () {
                stateGoHelp.stateGoUtils(true, 'tab.waitNews', {
                    titleName: "已发事项", titleFlag: '0'
                }, 'left');
            };
            /*跳转已办事项*/
            $scope.goAlready = function () {
                stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
                    titleName: "已办事项", titleFlag: '1'
                }, 'left');
            };
            /*跳转跟踪事项*/
            $scope.goTracking = function () {
                stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
                    titleName: "跟踪事项", titleFlag: '2'
                }, 'left');
            };
            /*跳转公文查询*/
            $scope.goWorkDoc = function () {
                stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
                    titleName: "公文查询", titleFlag: '4'
                }, 'left');
            };
            /*跳转知会事项*/
            $scope.goUnderstanding = function () {
                stateGoHelp.stateGoUtils(true, 'tab.doneWork', {
                    titleName: "知会事项", titleFlag: '5'
                }, 'left');
            }

            /*
             标题下拉，遮罩。  开始
             */
            /*工作-点击标题，显示下拉*/
            $scope.waitWorkMask = false;
            $scope.selectTitleOption = function () {
                $scope.isUnfoldtitle = !$scope.isUnfoldtitle;
                $scope.waitWorkMask = true;
            }

            $scope.clientSideList = [
                {text: "忠旺集团大连", value: "忠旺集团大连"},
                {text: "忠旺集团上海", value: "忠旺集团上海"},
                {text: "忠旺集团天津", value: "忠旺集团天津"}
            ];
            $scope.data = {
                clientSide: '忠旺集团大连'
            };
            //标题点击
            $scope.serverSideChange = function (item) {
                $scope.isUnfoldtitle = !$scope.isUnfoldtitle;
                $scope.waitWorkMask = false;
            };
            //工作-取消遮罩
            $scope.noMask = function () {
                $scope.waitWorkMask = false;
                $scope.isUnfoldtitle = false;
            }

            //判断平台、标题显示位置
            if (/iphone/i.test(navigator.userAgent) || /ipad/i.test(navigator.userAgent)) {
                //ios调整样式
                $scope.platform = 'ios';
                $scope.platformComboBox = 'ios';
            } else {
                $scope.platform = 'android';
                $scope.platformComboBox = 'android';
            }
            /*
             标题下拉，遮罩。 结束
             */

            //toggleMenu
            $scope.isShow = true;
            $scope.toggleMenu = function () {
                $scope.isShow = !$scope.isShow;
            }
            $scope.isShows = true;
            $scope.toggleMenus = function () {
                $scope.isShows = !$scope.isShows;
            };

            function getMessageNum () {
              var url = serverConfiguration.baseApiUrl + "app/common/v2/getMessageNum";
              var param = {
                userCode: JSON.parse(storageService.get('userLogin', null)).name
              };
              GetRequestService.getRequestData(url, param, false, 'POST').then(function (result) {
                console.log(result);
                if(result.state === 0) {
                  $rootScope.tabIonNotification = result.messageNum > 0;//是否显示"消息"的红点提示
                  $rootScope.bellRed = $rootScope.tabIonNotification;// 是否显示"铃铛"红点提示
                }
              }).catch(function (error) {
                /*判断平台*/
                if (!$isMobile.isPC) {
                  $cordovaToast.showShortBottom(T.translate("publicMsg.requestErr"));
                }
              });
            }

        }]);
})();
