/**
 * @Description: 表单组件服务
 * 主要包含指定数据请求模块，比如获取枚举内容、获取公司人员、获取部门人员等
 * @author: 闫一夫
 * @date: 2017年06月15日
 * @version: 1.0
 * @change log:
 */

// 实现基本功能
/**
 * 所有的返回列表的数据格式
 * [{"id":"val", "name":"val", "parent":"parentid-parentid"},
 * {"id":"val", "name":"val", "parent":"parentid-parentid"}]
 * id:项目id
 * name：项目名称
 * parent：父结点id，用于分组。多层父节点时，需要将其调整为祖父id-父id形式
 */
angular.module('formComponents', ['base','community.configs','community.services.utils','community.constant','base64']).factory("enums", ['net', 'serverConfiguration', 'storageService', 'auth_events', '$base64', '$filter',
function (net, serverConfiguration, storageService, auth_events, $base64 ,$filter) {
    var enums = {
        /**
         * 获取指定枚举
         * @param id 枚举id
         */
        getById: function (id, param) {
            function rot13(str) { // LBH QVQ VG!
                var n = 0;
                var num = 0;
                var arr = new Array();
                for (var i = 0; i < str.length; i++) {
                    n = str.charCodeAt(i);
                    if (n >= 65 && n <= 90) {
                        if (n >= 78 && n <= 90) {
                            num = n - 13;
                            arr[i] = String.fromCharCode(num);
                        } else {
                            num = (90 - (13 - n + 65) + 1);
                            arr[i] = String.fromCharCode(num);
                        }

                    } else {
                        arr[i] = String.fromCharCode(n);
                    }
                }
                var string = arr.join("");
                return string;
            }
            var user_Pkid = storageService.get(auth_events.userId, null);
            var authorization = storageService.get(auth_events.authorization, null);
            var timeStamp = $filter('date')((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss');
            var result = rot13($base64.encode("user_Pkid=" + user_Pkid + ";authorization=" + authorization + ";timeStamp=" + timeStamp))
            var url = serverConfiguration.domain + "/api/enum/" + id + "/dictCode=" + param +"?accessKey="+result;
            /**
             * * 2018/4/17 11:46  CrazyDong
             *  变更描述：取消ajax请求，恢复原来的promise
             *  功能说明：获取表单内枚举数据
             */
//            var data;
            return net.get(url,true);
//            $.ajax({
//                type : "GET",
//                url : url,
//                async : false,
//                dataType : 'json',
//                success : function(result){
//                    data = result;
//                }
//            });
//            return data;
        },
        /**
         * 获取全部枚举
         */
        getAllEnum: function () {
            var url = serverConfiguration.domain + "/api/enum";
            return net.get(url);
        }
    };
    return enums;
}]).factory("attachment", ['net', 'serverConfiguration', function (net, serverConfiguration) {
    var attachInfo = {
        /**
         * 查询附件列表
         * @param ids 附件id数组
         */
        getAttachFileInfo: function (ids) {
            var url = serverConfiguration.domain + "/api/attachment/" + ids;
            return net.get(url);
        },
        delAttachFileInfo: function (id) {
            var url = serverConfiguration.domain + "/api/attachment/del/" + id;
            return net.get(url);
        },
        downloadAttach: function (id) {
            var url = serverConfiguration.domain + "/api/sysAttachment/down/" + id;
            return net.get(url);
        }
    };
    return attachInfo;
}]).factory("template", ['net', 'serverConfiguration', function (net, serverConfiguration) {
    var templateInfo = {
        /**
         * 查询附件列表
         * @param ids 附件id数组
         */
        generateTemplate: function (json) {
            var url = serverConfiguration.domain + "/api/form/template/downTemplate";
            return net.post(url, json);
        },
        uploadTemplate: function (id) {
            var url = serverConfiguration.domain + "/api/form/template/upload/" + id;
            return net.get(url);
        },
        sapUploadTemplate: function (id, mapping, factory) {
            var url = serverConfiguration.domain + "/api/form/template/upload/" + id + "/" + mapping;
            return net.get(url);
        },
        materialUploadTemplate: function (id, mapping, factory) {
            var url = serverConfiguration.domain + "/api/form/template/upload/material/" + id + "/" + mapping;
            return net.get(url);
        }
    };
    return templateInfo;
}]).factory("serial", ['net', 'serverConfiguration', function (net, serverConfiguration) {
    var serialInfo = {
        /**
         * 取得流水号
         */
        getSerial: function () {
            var url = serverConfiguration.domain + "/api/serial";
            return net.get(url);
        },
        /**
         * 显示流水号细节信息
         */
        getSerialById: function () {
            var url = serverConfiguration.domain = "/api/serial/" + id;
            return net.get(url);
        },
        /**
         * 申请流水号，失败时抛出异常
         */
        getSerialByIdApproval: function () {
            var url = serverConfiguration.domain = "/api/serial/" + id + "/approval";
            return net.get(url);
        }
    }
    return serialInfo;

}]).factory("print", ['net', 'serverConfiguration', function (net, serverConfiguration) {
    var printInfo = {
        /**
         * 查询打印权限
         */
        getPrintPerm: function () {
            var url = serverConfiguration.domain + "/api/printPerm";
            return net.get(url);
        }
    };
    return printInfo;
}]);

// 绑定功能至页面
$(function () {
    var $injector = angular.injector(['formComponents', 'ng']);
    setTimeout(function() {
        //var injector = angular.injector(['formComponents', 'ng']);
        //var rootScope = $injector.get("$rootScope");
        var scope = $("[ng-app^='community']").scope();
        var rootScope = scope.$parent;
        rootScope.$apply(function () {
            //rootScope.myObject = { value: 6 };
            rootScope.getEnum = function (id, param,isSub) {
                var name = "enums";
                if ($injector.has(name)) {
            if(param !=''){
                    var tempArr = $injector.get(name).getById(id, param);
                angular.copy(tempArr.code, tempArr.name, tempArr.category);
                return $injector.get(name).getById(id, param);
            }else{
                if(isSub !='' && isSub == '-bindRequired-'){

                }else{
                    var tempArr = $injector.get(name).getById(id, param);
                    angular.copy(tempArr.code, tempArr.name, tempArr.category);
                    return $injector.get(name).getById(id, param);
                }
            }
        }
                return [];
            };
        });
    }, 100);

    // $scope.getAttachFileInfo = function (ids) {
    //     var name = "attachment";
    //     if ($injector.has(name)) {
    //         return $injector.get(name).getAttachFileInfo(ids);
    //     }
    // };
    //
    // $scope.uploadTemplate = function (id) {
    //     var name = "template";
    //     if ($injector.has(name)) {
    //         return $injector.get(name).uploadTemplate(id);
    //     }
    // };
});