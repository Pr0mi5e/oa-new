/**
 * @Description: 表单组件
 * 主要包含各种组件。比如：文本框、下拉列表等
 * @author: 闫一夫
 * @date: 2017年06月15日
 * @version: 1.0
 * @change log:
 */
var formDirective = angular.module('community.controllers.viewForm', ['base', 'formComponents'])

formDirective
  .directive('zwInput', ['$parse', function ($parse) {
    return {
      restrict: 'AE',
      priority: 1003,
      link: function (scope, element, attrs) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'r') {
          element.after(eval('scope.' + attrs.ngModel))
          element.remove()
        } else if (permission == 'w') {
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              // 如果存在初始值，则将初始值设置给scope中对应的属性
              var model = $parse(attrs.ngModel)
              model.assign(scope, attrs.init)
            }

            if (attrs.initModel) {
              // 如果存在初始化模型，则使用初始化模型的数据进行初始化
              var model = $parse(attrs.ngModel)
              var data = $parse(attrs.initModel)(scope)
              model.assign(scope, data)
            }
          }
        } else {
          $(element).remove()
        }
      }
    }
  }])
  .directive('zwTextarea', ['$parse', function ($parse) {
    return {
      restrict: 'AE',
      link: function (scope, element, attrs) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'r') {
          // element.after(eval("scope." + attrs.ngModel));
          var val = $parse(attrs.ngModel)(scope)
          if (val) {
            val = val.replace(/\n/g, '<br/>')
          }
          element.after(val)
          element.remove()
        }
        else if (permission == 'w') {
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              // 如果存在初始值，则将初始值设置给scope中对应的属性
              var model = $parse(attrs.ngModel)
              model.assign(scope, attrs.init)
            }
          }
        } else {
          $(element).remove()
        }
      }
    }
  }])
  .directive('zwDate', ['$parse', 'DateUtil', '$filter', function ($parse, DateUtil, $filter) {
    return {
      restrict: 'AE',
      //require: "ngModel",
      scope: {
        //ngModel: "=",
        modelDate: '=ngModel',
        title: '=?',
        subTitle: '=?',
        buttonOk: '=?',
        buttonCancel: '=?',
        monthStep: '=?',
        hourStep: '=?',
        minuteStep: '=?',
        secondStep: '=?',
        onlyValid: '=?'
      },
      controller: function ($scope, $attrs, $ionicPopup, $ionicPickerI18n, $timeout, GetRequestService, serverConfiguration, $filter, $stateParams) {
        //获取后台统一时间
        var permission = getPermission($attrs.permission, $scope)
        var typeE = $stateParams.enlargement
        if (typeE == 'enlargement') {

        } else {
          //2018-3-1修改初始化时间赋值问题 加了权限限制
          if (permission == 'w' || permission == 'b') {
            var url = serverConfiguration.baseApiUrl + 'app/common/loginInfo/user'
            GetRequestService.getRequestData(url, null, false, 'GET').then(function (result) {
              var str = result.sysdate
              //在firefox和chrome中可以直接支持Date.parse(YYYY-MM-DD HH:MM:SS)，但是safari无法支持，需要作如下转换
              var val = Date.parse(str.replace(/-/g, '/'))
              var newDate = new Date(val)
              var formatData = 'yyyy-MM-dd'
              var data_format_data = $attrs.zwDate
              if (data_format_data != '' && data_format_data.length != 0) {
                if (data_format_data.lastIndexOf('ss') > 0) {
                  formatData = 'yyyy-MM-dd HH:mm:ss'
                }
              }

              /**
               * * 2018/4/16 17:24  CrazyDong
               *  变更描述：当$scope.modelDate不存在的时候,在赋值,当用户选择默认值,即显示用户选择的值,如果没有赋默认值
               *  功能说明： 赋默认时间值
               */
              //                            $scope.modelDate = $filter('date')(newDate, formatData);
              if (!($scope.modelDate)) {
                $scope.modelDate = $filter('date')(newDate, formatData)
              }

            }, function (err) {

            })
          }
        }
        $scope.i18n = $ionicPickerI18n
        $scope.bind = {}

        $scope.rows = [0, 1, 2, 3, 4, 5]
        $scope.cols = [1, 2, 3, 4, 5, 6, 7]
        $scope.weekdays = [0, 1, 2, 3, 4, 5, 6]

        var lastDateSet = {
          year: $scope.year,
          month: $scope.month,
          day: $scope.day,
          hour: $scope.hour,
          minute: $scope.minute,
          second: $scope.second,
          date: new Date(),
          getDateWithoutTime: function () {
            var tempDate = new Date(this.date)
            tempDate.setHours(0, 0, 0, 0, 0)
            return tempDate
          }
        }

        $scope.showPopup = function (event) {
          event.preventDefault()

          $ionicPopup.show({
            templateUrl: 'lib/ion-datetime-picker/src/picker-popup.html',
            //                        templateUrl: "shared/directives/picker-popup.html",
            title: '请选择时间',
            subTitle: $scope.subTitle || '',
            scope: $scope,
            cssClass: 'ion-datetime-picker-popup',
            buttons: [
              {
                text: $scope.buttonOk || $scope.i18n.ok,
                type: $scope.i18n.okClass,
                onTap: function () {
                  $scope.commit()
                }
              }, {
                text: $scope.buttonCancel || $scope.i18n.cancel,
                type: $scope.i18n.cancelClass,
                onTap: function () {
                  $timeout(function () {
                    $scope.processModel()
                  }, 200)
                }
              }
            ]
          })
        }

        $scope.prepare = function () {
          //alert(1);  2017/8/14  设置默认时间  author：chris.zheng
          var date = new Date()
          $scope.year = $scope.dateEnabled ? date.getFullYear() : 0
          $scope.month = $scope.dateEnabled ? date.getMonth() : 0
          $scope.day = $scope.dateEnabled ? date.getDate() : 0
          $scope.hour = $scope.timeEnabled ? date.getHours() : 0
          $scope.minute = $scope.timeEnabled ? date.getMinutes() : 0
          $scope.second = $scope.secondsEnabled ? date.getSeconds() : 0
          changeViewData()

          if ($scope.mondayFirst) {
            $scope.weekdays.push($scope.weekdays.shift())
          }
        }

        $scope.processModel = function () {
          //var date = $scope.modelDate instanceof Date ? $scope.modelDate : new Date();  //2017/8/14  修改默认时间    author：chris.zheng
          var date = new Date()
          $scope.year = $scope.dateEnabled ? date.getFullYear() : 0
          $scope.month = $scope.dateEnabled ? date.getMonth() : 0
          $scope.day = $scope.dateEnabled ? date.getDate() : 0
          $scope.hour = $scope.timeEnabled ? date.getHours() : 0
          $scope.minute = $scope.timeEnabled ? date.getMinutes() : 0
          $scope.second = $scope.secondsEnabled ? date.getSeconds() : 0

          changeViewData()
        }

        function setNextValidDate(date, dayToAdd) {
          dayToAdd = dayToAdd || 0
          if (dayToAdd !== 0) {
            date.setDate(date.getDate() + dayToAdd)
          }

          lastDateSet.year = date.getFullYear()
          lastDateSet.month = date.getMonth()
          lastDateSet.day = date.getDate()
          lastDateSet.hour = date.getHours()
          lastDateSet.minute = date.getMinutes()
          lastDateSet.second = date.getSeconds()
          lastDateSet.date = date
        }

        function setLastValidDate() {
          var date = new Date($scope.year, $scope.month, $scope.day, $scope.hour, $scope.minute, $scope.second)
          if ($scope.isEnabled(date.getDate(), true)) {
            setNextValidDate(date)
          } else {
            $scope.year = lastDateSet.year
            $scope.month = lastDateSet.month
            $scope.day = lastDateSet.day
            $scope.hour = lastDateSet.hour
            $scope.minute = lastDateSet.minute
            $scope.second = lastDateSet.second
          }
        }

        var changeViewData = function () {
          setLastValidDate()
          var date = new Date($scope.year, $scope.month, $scope.day, $scope.hour, $scope.minute, $scope.second)

          if ($scope.dateEnabled) {
            $scope.year = date.getFullYear()
            $scope.month = date.getMonth()
            $scope.day = date.getDate()

            $scope.bind.year = $scope.year
            $scope.bind.month = $scope.month

            $scope.firstDay = new Date($scope.year, $scope.month, 1).getDay()
            if ($scope.mondayFirst) {
              $scope.firstDay = ($scope.firstDay || 7) - 1
            }
            $scope.daysInMonth = getDaysInMonth($scope.year, $scope.month)
          }

          if ($scope.timeEnabled) {
            $scope.hour = date.getHours()
            $scope.minute = date.getMinutes()
            $scope.second = date.getSeconds()
            $scope.meridiem = $scope.hour < 12 ? 'AM' : 'PM'

            $scope.bind.hour = $scope.meridiemEnabled ? ($scope.hour % 12 || 12).toString() : $scope.hour.toString()
            $scope.bind.minute = ($scope.minute < 10 ? '0' : '') + $scope.minute.toString()
            $scope.bind.second = ($scope.second < 10 ? '0' : '') + $scope.second.toString()
            $scope.bind.meridiem = $scope.meridiem
          }
        }

        var getDaysInMonth = function (year, month) {
          return new Date(year, month + 1, 0).getDate()
        }

        $scope.changeBy = function (value, unit) {
          if (+value) {
            // DST workaround
            if ((unit === 'hour' || unit === 'minute') && value === -1) {
              var date = new Date($scope.year, $scope.month, $scope.day, $scope.hour - 1, $scope.minute)
              if (($scope.minute === 0 || unit === 'hour') && $scope.hour === date.getHours()) {
                $scope.hour--
              }
            }
            $scope[unit] += +value
            if (unit === 'month' || unit === 'year') {
              $scope.day = Math.min($scope.day, getDaysInMonth($scope.year, $scope.month))
            }
            changeViewData()
          }
        }
        $scope.change = function (unit) {
          var value = $scope.bind[unit]
          if (value && unit === 'meridiem') {
            value = value.toUpperCase()
            if (value === 'AM' && $scope.meridiem === 'PM') {
              $scope.hour -= 12
            } else if (value === 'PM' && $scope.meridiem === 'AM') {
              $scope.hour += 12
            }
            changeViewData()
          } else if (+value || +value === 0) {
            $scope[unit] = +value
            if (unit === 'month' || unit === 'year') {
              $scope.day = Math.min($scope.day, getDaysInMonth($scope.year, $scope.month))
            }
            changeViewData()
          }
        }
        $scope.changeDay = function (day) {
          $scope.day = day
          changeViewData()
        }

        function createDate(stringDate) {
          var date = new Date(stringDate)
          var isInvalidDate = isNaN(date.getTime())
          if (isInvalidDate) {
            date = new Date()//today
          }
          date.setHours(0, 0, 0, 0, 0)
          return date
        }

        $scope.isEnabled = function (day, computeNextValidDate) {
          if (!$scope.onlyValid) {
            return true
          }

          var currentDate = new Date($scope.year, $scope.month, day)
          var constraints = $scope.onlyValid
          if (!(constraints instanceof Array)) {
            constraints = [constraints]
          }

          var isValid = true
          for (var i = 0; i < constraints.length; i++) {
            var currentRule = constraints[i]
            if (currentRule.after) {
              var afterDate = createDate(currentRule.after)
              if (currentRule.inclusive) {
                isValid = currentDate >= afterDate
                if (!isValid && computeNextValidDate) setNextValidDate(afterDate, 0)
              } else {
                isValid = currentDate > afterDate
                if (!isValid && computeNextValidDate) setNextValidDate(afterDate, 1)
              }
            } else if (currentRule.before) {
              var beforeDate = createDate(currentRule.before)
              if (currentRule.inclusive) {
                isValid = currentDate <= beforeDate
                if (!isValid && computeNextValidDate) setNextValidDate(beforeDate, 0)
              } else {
                isValid = currentDate < beforeDate
                if (!isValid && computeNextValidDate) setNextValidDate(beforeDate, -1)
              }
            } else if (currentRule.between) {
              var initialDate = createDate(currentRule.between.initial)
              var finalDate = createDate(currentRule.between.final)

              if (currentRule.inclusive) {
                isValid = currentDate >= initialDate && currentDate <= finalDate
                if (!isValid && computeNextValidDate) {
                  if (currentDate < initialDate) setNextValidDate(initialDate, 0)
                  if (currentDate > finalDate) setNextValidDate(finalDate, 0)
                }
              } else {
                isValid = currentDate > initialDate && currentDate < finalDate
                if (!isValid && computeNextValidDate) {
                  if (currentDate <= initialDate) setNextValidDate(initialDate, 1)
                  if (currentDate >= finalDate) setNextValidDate(finalDate, -1)
                }
              }
            } else if (currentRule.outside) {
              var initialDate = createDate(currentRule.outside.initial)
              var finalDate = createDate(currentRule.outside.final)

              if (currentRule.inclusive) {
                isValid = currentDate <= initialDate || currentDate >= finalDate
                if (!isValid && computeNextValidDate) {
                  var lastValidDate = lastDateSet.getDateWithoutTime()
                  if (lastValidDate <= initialDate) setNextValidDate(finalDate, 0)
                  if (lastValidDate >= finalDate) setNextValidDate(initialDate, 0)
                }
              } else {
                isValid = currentDate < initialDate || currentDate > finalDate
                if (!isValid && computeNextValidDate) {
                  var lastValidDate = lastDateSet.getDateWithoutTime()
                  if (lastValidDate < initialDate) setNextValidDate(finalDate, 1)
                  if (lastValidDate > finalDate) setNextValidDate(initialDate, -1)
                }
              }
            }
            if (!isValid) {
              break
            }
          }
          return isValid
        }
        $scope.changed = function () {
          changeViewData()
        }

        if ($scope.dateEnabled) {
          $scope.$watch(function () {
            return new Date().getDate()
          }, function () {
            var today = new Date()
            $scope.today = {
              day: today.getDate(),
              month: today.getMonth(),
              year: today.getFullYear()
            }
          })
          //                    $scope.goToToday = function() {
          //                        $scope.year = $scope.today.year;
          //                        $scope.month = $scope.today.month;
          //                        $scope.day = $scope.today.day;
          //
          //                        changeViewData();
          //                    };
        }

      },
      link: function ($scope, $element, $attrs, ngModelCtrl) {

        var format = 'yyyy-MM-dd'
        var data_format = $attrs.zwDate
        if (data_format != '' && data_format.length != 0) {
          if (data_format.lastIndexOf('ss') > 0) {
            format = 'yyyy-MM-dd HH:mm:ss'
          }
        }

        $element.attr('readOnly', 'true')
        $element.attr('style', 'background-color:#fff !important')

        var permission = getPermission($attrs.permission, $scope)
        var showCurrentDate = $attrs.showCurrentDate || false
        if (showCurrentDate && !ngModelCtrl.$modelValue.length) {
          //根据2017.6.30要求，initModel属性只能在w||b权限下生效
          if (permission == 'w' || permission == 'b') {
            //只有ng-model 不存在时候才使用初始化
            if (!$attrs.ngModel || !$parse($attrs.ngModel)($scope)) {

              if ($attrs.initModel) {
                // 如果存在初始化模型，则使用初始化模型的数据进行初始化
                $element.val(new DateUtil(new Date($scope.initModel)).format(format))
                $scope.ngModel = $element.val()
              }

            }

          }
        }

        $scope.dateEnabled = 'date' in $attrs && $attrs.date !== 'false'
        $scope.timeEnabled = 'time' in $attrs && $attrs.time !== 'false'
        if ($scope.dateEnabled === false && $scope.timeEnabled === false) {
          $scope.dateEnabled = $scope.timeEnabled = true
        }

        $scope.mondayFirst = 'mondayFirst' in $attrs && $attrs.mondayFirst !== 'false'
        $scope.secondsEnabled = $scope.timeEnabled && 'seconds' in $attrs && $attrs.seconds !== 'false'
        $scope.meridiemEnabled = $scope.timeEnabled && 'amPm' in $attrs && $attrs.amPm !== 'false'

        $scope.monthStep = +$scope.monthStep || 1
        $scope.hourStep = +$scope.hourStep || 1
        $scope.minuteStep = +$scope.minuteStep || 1
        $scope.secondStep = +$scope.secondStep || 1

        $scope.prepare()

        $attrs.$observe('zwDate', function (newVal, oldVal) {
          if (newVal) {
            if (data_format.lastIndexOf('hh') > 0) {
              format = 'yyyy-MM-dd HH:mm:ss'
            }
            // element.ZWDatetimeWithFormat(format);
            if (showCurrentDate && !ngModelCtrl.$modelValue.length) {
              //根据2017.6.30要求，initModel属性只能在w||b权限下生效
              if (permission == 'w' || permission == 'b') {

                //只有ng-model 不存在时候才使用初始化
                if (!$attrs.ngModel || !$parse($attrs.ngModel)($scope)) {
                  if ($attrs.initModel) {
                    // 如果存在初始化模型，则使用初始化模型的数据进行初始化
                    $element.val(new DateUtil(new Date($scope.initModel)).format(format))
                    $scope.ngModel = $element.val()
                  }
                }
              }
            }
          }
        })

        ngModelCtrl.$render = function () {
          $scope.modelDate = ngModelCtrl.$viewValue
          $scope.processModel()
        }

        $scope.commit = function () {
          $scope.modelDate = new Date($scope.year, $scope.month, $scope.day, $scope.hour, $scope.minute, $scope.second)
          $scope.modelDate = $filter('date')($scope.modelDate, format)
        }

        if (permission == 'w' || permission == 'b') {
          $element.on('click', $scope.showPopup)
        }
        if (permission == 'r') {
          $element.after($scope.modelDate)
          // setTimeout(function(){
          //     $element.parent().find("span").remove();
          // }, 0);
          $element.parent().find('span').remove()
          $element.remove()
        }
      }
    }
  }])
  /**
   * 使用jquery.validate库进行校验
   */
  .directive('zwValidate', ['$parse', function ($parse) {
    return {
      require: 'ngModel',
      priority: 9999,
      link: function (scope, element, attr, ctrl) {
        var validate = attr.zwValidate
        if (!validate) return
        //修正验证的bug。
        validate = validate.replace(/'/g, '"')

        var permission = getPermission(attr.permission, scope)
        //如果不必填且没有其他校验返回
        if (permission !== 'b' && validate == '{}') return
        var validateJson = eval('(' + validate + ')')

        if (permission == 'b') validateJson.required = true

        var customValidator = function (value) {
          if (!validate) return true
          handlTargetValue(validateJson)
          //如果元素不可见，那么不予校验，否则隐藏必须项目永远无法通过校验
          var validity = false
          if ($(element).is(':hidden')) {
            validity = true
          } else {
            //函数表达式特殊校验
            /*	if(attr.checkRefModel){
                     var targetNode = "";
                     var refModel = attr.checkRefModel;
                     if(refModel.indexOf('item')==0){
                     //向上递归找到 tr 之后 再向下找到 refModel
                     var tempNode = $(element);
                     while(tempNode.nodeName!='tr'){
                     tempNode = tempNode.parent();
                     }
                     targetNode = $(tempNode).children().find("[ng-model='"+attr.checkRefModel+"']");
                     }else{
                     targetNode = $("[ng-model='"+attr.checkRefModel+"']");
                     }
                     validity = $.fn.validRules(targetNode.val(),targetNode.attr("zw-validate"), targetNode,value);
                     }else{
                     validity = $.fn.validRules(value, validateJson, element,value);
                     }*/
            if (attr.zwExpValid !== undefined) {
              var refModel = $parse(attr.checkRefModel)(scope)
              validity = $.fn.validRules(value, validateJson, element, refModel)
            } else {
              validity = $.fn.validRules(value, validateJson, element)
            }
          }
          ctrl.$setValidity('customValidate', validity)
          return validity ? value : undefined
        }


        if (attr.zwExpValid !== undefined) {
          var refModel = attr.checkRefModel
          scope.$watch(refModel, function (nv, ov) {
            if (nv !== ov) {
              var val = $parse(attr.ngModel)(scope)
              customValidator(val)
            }
          })
        }

        ctrl.$formatters.push(customValidator)
        ctrl.$parsers.push(customValidator)
        ctrl.$viewChangeListeners.push(function () {

        })


        //获取比较目标字段的值。   所有比较的都包含target对象eg:{rule:{target:data.mian.name}}
        var handlTargetValue = function (validateJson) {
          for (key in validateJson) {
            if (validateJson[key].target) {
              validateJson[key].targetVal = eval('scope.' + validateJson[key].target)
            }
          }
        }
      }
    }
  }])

  /**
   *
   *    <span ng-if="permission.fields.input=='r'" ng-repeat="item in htRadios track by $id(item.code)">
   *        <input zw-Radios="" type='radio' ng-model="data.fff" data-init="data.ddd" ng-value={{item.code}}>{{item.name}}
   *    </span>
   *
   *    $scope.data = {
	* 		"fff":"2",
	*		"ddd":"1"
	*	};
   *
   **/
  .directive('zwRadios', ['$parse', '$injector', function ($parse, $injector) {
    return {
      restrict: 'A',
      priority: 1004,
      link: function (scope, element, attrs) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'n') {
          element.remove()
          return
        } else if (permission == 'r') {
          element.attr('disabled', 'disabled')
        } else if (permission == 'w') {
          //权限绑定在span上，这里无需权限控制
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              // 如果存在初始值，则将初始值设置给scope中对应的属性
              var model = $parse(attrs.ngModel)
              var data = $parse(attrs.init)(scope)
              model.assign(scope, data)
            }
          }
        }
      }
    }
  }])

  /**
   *
   *
   *   $scope.data = {
	*		"ck" : ["a","","c",""],
	*		"mk" : ["","b","","d"]
	*	};
   *
   */
  .directive('zwCheckboxs', ['$parse', '$injector', function ($parse, $injector) {
    return {
      restrict: 'A',
      priority: 1013,
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'n') {
          element.remove()
          return
        } else if (permission == 'r') {
          element.attr('disabled', 'disabled')
        } else if (permission == 'w') {
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              //replace操作为了解决freemarker生成的init为["bbbb","cccc"],可是初始化只需要 bbbb,cccc
              var initValue = attrs.init
              initValue = initValue.replace(/"/g, '')
              initValue = initValue.replace(/'/g, '')
              initValue = initValue.replace(/\[|]/g, '')
              var model = $parse(attrs.ngModel)
              //init 为常量
              model.assign(scope, initValue)
            }
          }
        }

        var checkValue = attrs.value
        //modelValue转viewValue的过程
        ctrl.$formatters.push(function (value) {
          if (!value) return false

          var valueArr = value.split(',')
          if (valueArr.indexOf(checkValue) == -1) return false

          return true
        })

        //viewValue转modelValue的过程
        ctrl.$parsers.push(function (value) {
          var valueArr = []
          if (ctrl.$modelValue) {
            valueArr = ctrl.$modelValue.split(',')
          }
          var index = valueArr.indexOf(checkValue)
          if (value) {
            // 如果checked modelValue 不含当前value
            if (index == -1) valueArr.push(checkValue)
          } else {
            if (index != -1) valueArr.splice(index, 1)
          }
          var model = $parse(attrs.ngModel)
          model.assign(scope, valueArr)
          return valueArr.join(',')
        })
      }
    }
  }])
  .directive('zwEnumsDataSource', ['$parse', '$injector', function ($parse, $injector) {
    return {
      restrict: 'A',
      priority: 1013,
      controller: function ($scope, $element, $attrs) {
        if ($attrs.source && $attrs.func) {
          //根据“(” 截断
          var splitArray = $attrs.func.split('(')
          //截取方法名，做模块归属判断
          var funcName = splitArray[0]
          //截取参数
          var param = splitArray[1].split(')')[0]
          //去掉参数的引号，否则通过url传递会有问题
          if (param.charAt(0) == '\'' || param.charAt(0) == '"') {
            param = param.substring(1, param.length - 1)
          }
          var paramArray = param.split('\',\'')
          //方法映射
          var funcMap = {
            'getEnum': 'enums.getById',
            'getAttachFileInfo': 'attachment.getAttachFileInfo',
            'generateTemplate': 'template.generateTemplate',
            'uploadTemplate': 'template.uploadTemplate'
          }
          //根据属性方法映射实际方法
          var func = funcMap[funcName]
          //方法未在映射列表直接返回
          if (!func) {
            return
          }
          //截取模块名称
          var moduleName = func.split('.')
          //注入模块
          var mouduleID = moduleName[0]
          if ($injector.has(mouduleID)) {
            var module = $injector.get(mouduleID)
            //方法调用
            var promise = module[moduleName[1]](paramArray[0], paramArray[1])
            if (promise) {
              promise.then(function (data) {
                $scope[$attrs.source] = data
                return data
              }, function () {

              })
            }
          }
        }
      }
    }
  }])

  /**
   * 格式化数字 zw-number
   *{
	*	"isShowCoin":true,
	*	"isShowComdify":true,  //是否格式化千分位
	*	"coinValue":"￥",
	*	"capital":false,       //是否转换大写金额
	*	"intValue":"2",        //整数位数
	*	"decimalValue":"2"     //小数位数
	*}
   *
   */
  .directive('zwNumber', ['$parse', '$filter', '$timeout', function ($parse, $filter, $timeout, APP) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1014,
      link: function (scope, element, attrs, inputCtrl) {
        var decimalValue = 0
        var tempValue = eval('(' + attrs.zwNumber + ')').decimalValue
        if (typeof(tempValue) !== undefined) {
          decimalValue = tempValue
        }
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'n') {
          element.remove()
          return
        } else if (permission == 'r') {
          //经过init 和 init-model处理后，ngModel的值已经可能发生改变
          var model = $parse(attrs.ngModel)(scope)
          if (!model && model !== 0) {
            element.remove()
            return
          }
          var formatVal = $filter('numberFormat')(model, attrs.zwNumber)
          element.before(formatVal)
          element.remove()
        } else if (permission == 'w') {
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              var model = $parse(attrs.ngModel)
              //init 为常量
              model.assign(scope, attrs.init)
            }
            if (attrs.initModel) {
              // 如果存在初始化模型，则使用初始化模型的数据进行初始化
              var model = $parse(attrs.ngModel)
              var data = $parse(attrs.initModel)(scope)
              model.assign(scope, data)
            }
          }
        }

        element.bind('focus', function () {
          var modelValue = $parse(attrs.ngModel)(scope)
          if (modelValue) {
            element.val(modelValue)
          }
        })
        element.bind('blur', function () {
          var zeroDict = '00000000000000000000000000000'
          var model = $parse(attrs.ngModel)
          var tempVal = model(scope)

          //如果tempVal 为  undefined，表明校验未通过，不予格式化
          if (tempVal) {
            try {
              if (typeof(tempVal) == 'number') {
                tempVal += ''//转成字符串
              }
              if (typeof(tempVal) == 'string' && typeof(tempVal['replace']) != 'undefined') {
                tempVal = String(tempVal).replace(/,/g, '')
              }
              //自动补精度(解决dirty bug)
              var tempArr = tempVal.split('.')
              if (tempArr[1] != undefined) {
                if (tempArr[1].length < decimalValue) {
                  tempVal += zeroDict.substring(0, decimalValue - tempArr[1].length)
                }
              } else {
                if (decimalValue > 0) {
                  tempVal = tempVal + '.' + zeroDict.substring(0, decimalValue)
                }
              }
              model.assign(scope, tempVal)
            } catch (e) {
              if (APP.devMode) {
                console.log(e)
              }
            }
            var formatVal = $filter('numberFormat')(tempVal, attrs.zwNumber)
            element.val(formatVal)
          }
        })

        scope.$watch(attrs.ngModel, function (newValue, oldValue) {
          //当前元素不是焦点
          if (newValue != oldValue && !$(element).is(':focus')) {
            //通过事件通知格式化，（延迟处理，等待双向绑定完成后再执行格式化。否则格式化结果会被双向绑定结果覆盖）
            $timeout(function () {
              scope.$emit('setElementVal') //事件通知
            })

          }
        })

        $timeout(function () {
          scope.$emit('setElementVal') //事件通知
        })
        scope.$on('setElementVal', function () {
          var tempVal = $parse(attrs.ngModel)(scope)
          var formatVal = $filter('numberFormat')(tempVal, attrs.zwNumber)
          element.val(formatVal)
        })
      }
    }
  }])

  /**
   *
   * @param permissionPath
   * @param scope
   * @returns
   */
  .directive('zwSelect', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1015,
      replace: true,//下拉列表
      link: function ($scope, $element, $attrs, controller) {
        var permission = getPermission($attrs.permission, $scope)
        if (permission == 'n') {
          $element.remove()
        } else if (permission == 'r') {
          var refName = $parse($attrs.refname)($scope)
          $element.after(refName)
          $element.remove()
        } else if (permission == 'w') {
          if (!$attrs.ngModel || !$parse($attrs.ngModel)($scope)) {
            if ($attrs.init) {
              // var model = $parse(attrs.ngModel);
              $parse($attrs.ngModel).assign($scope, $attrs.init)
            }
            if ($attrs.initModel) {
              // 如果存在初始化模型，则使用初始化模型的数据进行初始化
              // var model = $parse(attrs.ngModel);
              // var data = $parse(attrs.initModel)(scope);
              // model.assign(scope, data);
              $parse($attrs.ngModel).assign($scope, $parse($attrs.initModel)($scope))
            }

          }

          //修改选择器
          $scope.SelectFlag = $attrs.oiOptions// 请求下拉列表数据的参数
          $element.on('click', $scope.showPopupSelect)


        }
      },
      controller: function ($scope, $element, $attrs, $ionicPopup, serverConfiguration, $cordovaToast, $isMobile, enums, T) {
        var permission = getPermission($attrs.permission, $scope)
        $scope.$on('clearChildrenSelectedOption', function (event, data) {
          var targetDOM = $('oi-select[data-rel-path^=\'' + data + '\']')
          $(targetDOM).each(function (i, e) {
            var model = $parse($(e).attr('ng-model'))
            model.assign($scope, '')
          })
        })

        //下拉列表人名数组
        $scope.names = []

        //选择后的数据数组
        $scope.items = []

        //控制下拉框是否显示
        $scope.showSelect = true


        //添加选中的select信息
        $scope.addItem = function (item) {
          $scope.items.push(item)
          $scope.showSelect = false
        }
        //删除选中的select信息
        $scope.removeItem = function ($index) {
          $scope.items.splice($index, 1)
          $scope.showSelect = true
        }


        $scope.myPopup = ''
        $scope.showPopupSelect = function ($event) {
          // 下拉列表选中默认值，并隐藏下拉列表
          // if ($element[0].innerText !== '') {
            $scope.items = []
            $scope.showSelect = true
          // }
          $event.preventDefault()
          //隐藏io-select标签下拉内容
          $scope.attrs = $attrs
          $('.select-dropdown').hide()
          //input只读状态,避免出现软键盘.attr("readOnly",'true')
          $element[0].getElementsByTagName('input')[0].setAttribute('readOnly', 'true')
          //获取请求下拉列表参数

          var startPosition = $attrs.oiOptions.indexOf('(')
          var endPosition = $attrs.oiOptions.indexOf(')')
          var reallyParamStr = $attrs.oiOptions.substring(startPosition + 1, endPosition)
          var reallyParamArr = reallyParamStr.split(',')
          /**
           * * 2018/4/17 11:47  CrazyDong
           *  变更描述：component里面的获取enums的getById方法变更,返回数据类型改变
           *  功能说明：获取下拉列表集合
           */

          $scope.getSelectData(reallyParamArr[0].substring(1, reallyParamArr[0].length - 1),
            reallyParamArr[1].substring(1, reallyParamArr[1].length - 1)).then(function (result) {
            $scope.names = []
            for (var i = 0; i < result.length; i++) {
              $scope.names.push(result[i])
            }

            $scope.myPopup = $ionicPopup.show({
              templateUrl: 'shared/directives/select-template.html',
              title: '',
              subTitle: '',
              scope: $scope,
              cssClass: 'ion-search'

            })
          })


        }
        //完成
        $scope.goBackSearch = function () {
          var data = $scope.items
          console.log(data)
          $scope.modelDate = data
          if (data.length == 0) {
            if (!$isMobile.isPC) {
              $cordovaToast.showShortBottom(T.translate('view-form.please-select-staff'))
            } else {
              alert(T.translate('view-form.please-select-staff'))
            }
            return

          } else {
            if (permission == 'w') {
              // var innerArr = document.getElementsByClassName("select-search-list");
              // for(var i = 0; i > innerArr.length ; i++){
              //   innerArr[i].innerHTML = $scope.modelDate[0].name;//写入页面
              // }

              /**
               * * 2018/7/30 18:09  CrazyDong
               *  变更描述：
               *  功能说明：将修改code值
               */
              var model = $parse($scope.attrs.ngModel)
              model.assign($scope, data[0].code)
              /**
               * * 2018/7/30 18:10  CrazyDong
               *  变更描述：
               *  功能说明：修改属性中的name值
               */
              // var refName = $parse($scope.attrs.refname)
              // refName.assign($scope, data[0].name)
            }

            $scope.myPopup.close()
          }


        }
        /**
         * * 2018/4/17 11:47  CrazyDong
         *  变更描述：component里面的获取enums的getById方法变更,返回数据类型改变
         *  功能说明：获取下拉列表集合
         */
        $scope.getSelectData = function (id, param) {
          console.log(id)
          // var data = enums.getById(id, param);//调用component.js里面获取枚举的方法,获取下拉人员信息集合
          return enums.getById(id, param)
        }


      }
    }
  }])
  /**
   * 签章
   */
  .directive('zwSign', ['$parse', 'serverConfiguration', 'storageService', 'auth_events', '$filter', '$base64',
    function ($parse, serverConfiguration, storageService, auth_events, $filter, $base64) {
      return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1016,
        compile: function (element, attrs) {
          return {
            pre: function preLink(scope, element, attrs) {
            },
            post: function post(scope, element, attrs) {
              var permission = getPermission(attrs.permission, scope)
              if (permission == 'r') {//读权限无操作
              }
              else {
                //除了写权限之外全是读权限
                if (!scope.$parent.$parent.sign) {
                  scope.$parent.$parent.sign = []
                }
                scope.$parent.$parent.sign.push(attrs.ngModel)
              }

              function rot13(str) { // LBH QVQ VG!
                var n = 0
                var num = 0
                var arr = new Array()
                for (var i = 0; i < str.length; i++) {
                  n = str.charCodeAt(i)
                  if (n >= 65 && n <= 90) {
                    if (n >= 78 && n <= 90) {
                      num = n - 13
                      arr[i] = String.fromCharCode(num)
                    } else {
                      num = (90 - (13 - n + 65) + 1)
                      arr[i] = String.fromCharCode(num)
                    }

                  } else {
                    arr[i] = String.fromCharCode(n)
                  }
                }
                var string = arr.join('')
                return string
              }

              var model = $parse(attrs.ngModel)(scope.$parent.$parent)
              if (!model) {
                $(element).remove()
              } else {
                var user_Pkid = storageService.get(auth_events.userId, null)
                var authorization = storageService.get(auth_events.authorization, null)
                var timeStamp = $filter('date')((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss')
                var result = rot13($base64.encode('user_Pkid=' + user_Pkid + ';authorization=' + authorization + ';timeStamp=' + timeStamp))
                $(element).attr('src', serverConfiguration.domain + attrs.src + '?accessKey=' + result)
              }
            }
          }
        },
        controller: function ($scope, $element, $attrs) {
          $($element).error(function () {
            $($element).hide()
          })
        }
      }
    }])
  /**
   * 打印
   */
  .directive('zwPrint', ['$injector', function ($injector) {
    return {
      restrict: 'A',
      priority: 1017,
      link: function (scope, element, attrs, inputCtrl) {
        // var printPermission = $("#print_perm_72FA97E7").val();
        // if (printPermission) {
        //     if ($injector.has("print")) {
        //         var module = $injector.get("print");
        //         var promise = module.getPrintPerm();
        //         if (promise) {
        //             promise.then(function (dbRet) {
        //                     if (dbRet.result == 'false') {
        //                         $(element).remove();
        //                     }
        //                 }, function () {
        //                     $(element).remove();
        //                 }
        //             )
        //         }
        //     }
        // }
        /* var permission = getPermission(attrs.permission, scope);
                 if (permission == 'r') {
                 }
                 else if (permission == 'n') {
                 $(element).remove();
                 }*/
        $(element).remove() //2017/8/21  移动端屏蔽打印按钮  author：chris.zheng
      }
    }
  }])
  /**
   * 模板下载
   */
  //    .directive('zwTemplate', ['$injector', function ($injector) {
  //        return {
  //            restrict: 'A',
  //            priority: 1018,
  //            link: function (scope, element, attrs, inputCtrl) {
  //                var permission = getPermission(attrs.permission, scope);
  //                if (permission == 'r') {}
  //                else if (permission == 'n') {
  //                    $(element).remove();
  //                }
  //            },
  //            controller: function ($scope, $element, $attrs) {
  //                $scope.downLoad = function ($event) {
  //                    var aEle = $($event.target);
  //                    //取得隐藏域的值
  //                    var hiddenJSON = aEle.next().val();
  //                    if (!hiddenJSON) {
  //                        return;
  //                    }
  //                    $scope.postDownLoadFile({
  //                        url: ctx + '/api/form/template/downTemplate', //请求的url
  //                        data: {json: hiddenJSON}//要发送的数据
  //                    })
  //                }
  //                $scope.postDownLoadFile = function (options) {
  //                    var config = $.extend(true, {method: 'post'}, options);
  //                    var $iframe = $('<iframe id="down-file-iframe" />');
  //                    var $form = $('<form target="down-file-iframe" method="' + config.method + '" />');
  //                    $form.attr('action', config.url);
  //                    for (var key in config.data) {
  //                        $form.append('<input type="hidden" name="' + key + '" value="' + config.data[key] + '" />');
  //                    }
  //                    $iframe.append($form);
  //                    $(document.body).append($iframe);
  //                    $form[0].submit();
  //                    $iframe.remove();
  //                }
  //            }
  //        };
  //    }])

  /**
   * 模板上传
   */
  //.directive('zwDataUpload', ["$parse", '$injector', '$timeout', function ($parse, $injector, $timeout) {
  //    return {
  //        restrict: 'A',
  //        priority: 1019,
  //        link: function (scope, element, attrs, inputCtrl) {
  //            var permission = getPermission(attrs.permission, scope);
  //            if (permission == 'r') {
  //
  //            }
  //            else if (permission == 'n') {
  //                $(element).remove();
  //            }
  //        },
  //        controller: function ($scope, $element, $attrs) {
  //            $scope.initAttachment = function () {
  //                var options = {
  //                    multiple: false,
  //                    func: $scope.parseFile,
  //                    controllerElement: false,
  //                    attachModel: false,
  //                    //url : "/oa-web/api/sysAttachment/uploadAndGetUploadInfo"
  //                }
  //                //初始化默认参数
  //                options = initOptions(options);
  //
  //                var um = new uploadModule(options);
  //                um.bindShowTagEvent();
  //                um.bindUploadEvent();
  //                um.bindCancelEvent();
  //            },
  //                //扩展方法，主从表中的导入功能。附件上传成功后，通知方法解析excel
  //                $scope.parseFile = function (param, retData) {
  //                    var scope = $scope;
  //                    if (retData.data && retData.data.length > 0) {
  //                        //取上传结果的pkid
  //                        var fileId = retData.data[0].pkid;
  //                        //取得映射关系
  //                        //var mapping = $($element).prev().children().find("input[type='hidden']").val();
  //                        var sapElement = $(window.document).children().find("a[zw-material]")[0];
  //                        if(!sapElement){
  //                            ZW.Model.info("请设置物料数据","确认",function(){});
  //                            return
  //                        }
  //                        var func = $(sapElement).attr('ng-click');
  //                        //截取第三个参数
  //                        var mapping = func.split("[{").pop();
  //                        mapping = "[{" + mapping;
  //                        mapping = mapping.split(")").shift();
  //                        //取得工厂编号
  //                        if ($attrs.initModel) {
  //                            if ($injector.has("template")) {
  //                                var module = $injector.get("template");
  //                                var promise = module.materialUploadTemplate(fileId,mapping);
  //                                if (promise) {
  //                                    promise.then(function (dbRet) {
  //                                        if (dbRet) {
  //                                            $("tr[zw-subtable]").hide();
  //                                            var model = $parse("data." + $attrs.initModel);
  //                                            model.assign($scope, [])
  //                                            $timeout(function () {
  //                                                model.assign(scope, dbRet.data);
  //                                                $("tr[zw-subtable]").show();
  //                                            });
  //                                        }
  //                                    }, function (dbRet) {
  //                                        ZW.Model.info(dbRet.message||"解析失败","确认",function(){});
  //                                    })
  //                                }
  //                            }
  //                        }
  //                    }
  //                }
  //        }
  //    };
  //}])

  /**
   * sap上传
   */
  .directive('zwSapimp', ['$parse', '$injector', '$timeout', '$sce', function ($parse, $injector, $timeout, $sce) {
    return {
      restrict: 'A',
      priority: 1019,
      link: function (scope, element, attrs, inputCtrl) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'r') {

        }
        else if (permission == 'n') {
          $(element).remove()
        }
      },
      controller: function ($scope, $element, $attrs) {
        $scope.initAttachment = function () {
          var options = {
            multiple: false,
            func: $scope.parseFile,
            controllerElement: false,
            attachModel: false
            //url : "/oa-web/api/sysAttachment/uploadAndGetUploadInfo"
          }
          //初始化默认参数
          options = initOptions(options)

          var um = new uploadModule(options)
          um.bindShowTagEvent()
          um.bindUploadEvent()
          um.bindCancelEvent()
        },
          //扩展方法，主从表中的导入功能。附件上传成功后，通知方法解析excel
          $scope.parseFile = function (param, retData) {
            var scope = $scope
            if (retData.data && retData.data.length > 0) {
              //取上传结果的pkid
              var fileId = retData.data[0].pkid
              //取得映射关系
              //var mapping = $($element).prev().children().find("input[type='hidden']").val();
              var sapElement = $(window.document).children().find('a[zw-sap]')[0]
              if (!sapElement) {
                ZW.Model.info('请设置sap数据', '确认', function () {
                })
                return
              }
              var func = $(sapElement).attr('ng-click')
              //截取第三个参数
              var mapping = func.split('[{').pop()
              mapping = '[{' + mapping
              mapping = mapping.split(')').shift()
              //取得工厂编号
              if ($attrs.initModel) {
                if ($injector.has('template')) {
                  var module = $injector.get('template')
                  var promise = module.sapUploadTemplate(fileId, mapping)
                  if (promise) {
                    promise.then(function (dbRet) {
                      if (dbRet) {
                        $('tr[zw-subtable]').hide()
                        var model = $parse('data.' + $attrs.initModel)
                        model.assign($scope, [])
                        $timeout(function () {
                          dbRet.data = $.fn.sortSubTable(dbRet.data, 'seqnum', 'asc')
                          model.assign(scope, dbRet.data)
                          $('tr[zw-subtable]').show()
                        })
                      }
                    }, function (dbRet) {
                      ZW.Model.info(dbRet.message || '解析失败', '确认', function () {
                      })
                    })
                  }
                }
              }
            }
          }
      }
    }
  }])

  /**
   * material上传
   */
  //.directive('zwMaterialImp', ["$parse",'$injector','$timeout','$sce',function($parse,$injector,$timeout,$sce) {
  //  return {
  //    restrict: 'A',
  //    priority : 1019,
  //    link: function (scope, element, attrs, inputCtrl) {
  //      var permission = getPermission(attrs.permission, scope);
  //      if (permission == 'r') {
  //
  //      }
  //      else if (permission == 'n') {
  //        $(element).remove();
  //      }
  //    },
  //    controller : function($scope, $element, $attrs){
  //      $scope.initAttachment = function() {
  //        var options = {
  //          multiple  : false,
  //          func      : $scope.parseFile,
  //          controllerElement : false,
  //          attachModel : false,
  //          //url : "/oa-web/api/sysAttachment/uploadAndGetUploadInfo"
  //        }
  //        //初始化默认参数
  //        options = initOptions(options);
  //
  //        var um = new uploadModule(options);
  //        um.bindShowTagEvent();
  //        um.bindUploadEvent();
  //        um.bindCancelEvent();
  //      },
  //        //扩展方法，主从表中的导入功能。附件上传成功后，通知方法解析excel
  //        $scope.parseFile = function(param,retData){
  //          var scope = $scope;
  //          if(retData.data && retData.data.length>0){
  //            //取上传结果的pkid
  //            var fileId = retData.data[0].pkid;
  //            //取得映射关系
  //            //var mapping = $($element).prev().children().find("input[type='hidden']").val();
  //            var sapElement = $(window.document).children().find("a[zw-material]")[0];
  //            if(!sapElement){
  //              ZW.Model.info("请设置物料数据","确认",function(){});
  //              return
  //            }
  //            var func = $(sapElement).attr('ng-click');
  //            //截取第三个参数
  //            var mapping = func.split("[{").pop();
  //            mapping = "[{" + mapping;
  //            mapping = mapping.split(")").shift();
  //            //取得工厂编号
  //            if($attrs.initModel){
  //              if($injector.has("template")) {
  //                var module = $injector.get("template");
  //                var promise = module.materialUploadTemplate(fileId,mapping);
  //                if(promise){
  //                  promise.then(function(dbRet){
  //                    if(dbRet){
  //                      $("tr[zw-subtable]").hide();
  //                      var model = $parse("data."+$attrs.initModel);
  //                      model.assign($scope,[])
  //                      $timeout(function () {
  //                        dbRet.data = $.fn.sortSubTable(dbRet.data,'seqnum','asc');
  //                        model.assign(scope, dbRet.data);
  //                        $("tr[zw-subtable]").show();
  //                      });
  //                    }
  //                  },function(dbRet){
  //                    ZW.Model.info(dbRet.message||"解析失败","确认",function(){});
  //                  })
  //                }
  //              }
  //            }
  //          }
  //        }
  //    }
  //  };
  //}])

  /**
   * 流水号
   */
  .directive('zwSerial', [function () {
    return {
      restrict: 'A',
      // require: "ngModel",
      priority: 1020,
      link: function (scope, element, attrs, inputCtrl) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'r') {

        }
        else if (permission == 'n') {
          $(element).remove()
        }
      }
    }
  }])
  /**
   * 文本
   */
  .directive('zwLabel', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1021,
      link: function (scope, element, attrs, inputCtrl) {
        var permission = ''
        //大写金额可写时变蓝色的补丁
        if (!attrs.permission) {
          //根据ng-model 去取 permission
          var refPermission = $('input[ng-model=\'' + attrs.ngModel + '\']').attr('permission')
          if (!refPermission) {
            permission = 'r'
          } else {
            permission = getPermission(refPermission, scope)
          }
        } else {
          permission = getPermission(attrs.permission, scope)
        }
        if (permission == 'n') {
          $(element).remove()
        } else if (permission == 'w') {
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              // 如果存在初始值，则将初始值设置给scope中对应的属性
              var model = $parse(attrs.ngModel)
              model.assign(scope, attrs.init)
            }
            if (attrs.initModel) {
              // 如果存在初始化模型，则使用初始化模型的数据进行初始化
              var model = $parse(attrs.ngModel)
              var data = $parse(attrs.initModel)(scope)
              model.assign(scope, data)
            }
          }
          $(element).attr('style', 'color:black')
        } else if (permission == 'r') {
          $(element).removeAttr('style')
        }
      }
    }
  }])
  /**
   * 隐藏域
   */
  .directive('zwHidden', ['$parse', function ($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1022,
      link: function (scope, element, attrs, inputCtrl) {
        var permission = getPermission(attrs.permission, scope)
        if (permission != 'w') {
          //无写权限拒绝执行赋值动作
          return
        }
        if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
          if (attrs.init) {
            // 如果存在初始值，则将初始值设置给scope中对应的属性
            var model = $parse(attrs.ngModel)
            model.assign(scope, attrs.init)
          }
          if (attrs.initModel) {
            // 如果存在初始化模型，则使用初始化模型的数据进行初始化
            var model = $parse(attrs.ngModel)
            var data = $parse(attrs.initModel)(scope)
            model.assign(scope, data)
          }
        }
      }
    }
  }])
  .directive('zwAttachment', ['$parse', '$timeout', '$injector', 'net', '$ionicLoading', '$isMobile', '$cordovaFileOpener2', '$cordovaToast', '$cordovaFileTransfer',
    function ($parse, $timeout, $injector, net, $ionicLoading, $isMobile, $cordovaFileOpener2, $cordovaToast, $cordovaFileTransfer) {
      return {
        // require: "ngModel",
        restrict: 'A',
        priority: 1023,
        link: function (scope, element, attrs, inputCtrl) {
          var permission = ''
          if (attrs.permission) {
            permission = getPermission(attrs.permission, scope)
          } else {
            permission = 'not_exist'
          }
          // console.log(attrs);
          if (permission == 'n') {
            $(element).remove()
          } else if (permission == 'r') {
            $(element).prev().remove()
            $timeout(function () {
              scope.$emit('removeDelButton') //事件通知
            })

            scope.$on('removeDelButton', function () {
              $(element).children().find('a[type=\'button\']').hide()
            })
          } else {
            $timeout(function () {
              var iconMapper = {
                '.pdf': 'form_type_icon_pdf',
                '.img': 'form_type_icon_img',
                '.png': 'form_type_icon_img',
                '.jpeg': 'form_type_icon_img',
                '.office': 'form_type_icon_office'
              }
              var iElement = $(element).children().find('i')
              $(iElement).each(function (i, e) {
                var type = $(e).attr('data-type')
                var style = iconMapper[type] ? iconMapper[type] : 'form_type_icon_others'
                //由于移动端修改表单, 导致pc端图标无法正常显示,经过讨论决定删除图标.
                //$(e).addClass(style);
              })
            })
          }
        },
        controller: function ($scope, $element, $attrs, DateUtil, $filter, serverConfiguration, $ionicPopup, T, openFileUtils) {
          $scope.defaultOptions = function (attachModel) {
            var options = {
              attachModel: attachModel
            }
            //初始化配置项（对于没有配置的项进行默认配置）
            options = initOptions(options)
            //创建上传对象
            var um = new uploadModule(options)
            //绑定已选文件回显
            um.bindShowTagEvent()
            //绑定上传事件（弹窗的确定按钮）
            um.bindUploadEvent()
            //绑定取消上传事件(弹窗的取消按钮)
            um.bindCancelEvent()
          }
          $scope.delAttachment = function ($event, model) {
            var delId = $($event.target).prev().attr('id')
            for (var i = 0; i < model.length; i++) {
              if (model[i].pkid == delId) {
                model.splice(i, 1)
                $($event.target).parent().remove()
              }
            }
          }

          $scope.preview = function ($event, item) {
            var pkId = item.pkid
            var type = item.type
            var formatFlag = item.fileName//文件名字
            getAttachment()

            function getAttachment() {

              if (type == '.jpeg' || type == '.jpg' || type == '.png' || type.indexOf('image') == 0) {//预览图片
                $scope.url = serverConfiguration.baseApiUrl + 'app/attachment/showImage?pkid=' + pkId
                //自定义弹窗
                var myPopup = $ionicPopup.show({
                  template: '<div style="width: 100%;height: 100%;"> <div> <img imageonerror="imgonerror()" style="width: 100%;height: auto" src="{{url}}" alt=""> </div><div ng-click="goDele()" style="text-align:center;font-size: 30px;font-weight: 600;margin-top:5px"><img style="width: 15%;height: auto" src="app/view-form/img/closeImg.png" alt=""></div>  </div>',
                  title: '图片预览',
                  scope: $scope

                })
                myPopup.then(function (res) {
                })

                //点击关闭预览图片
                $scope.goDele = function () {
                  myPopup.close() //关闭弹出
                }

                $scope.imgonerror = function () {
                  if ($scope.url.indexOf('showImage?') > -1) {
                    $scope.url = 'app/view-form/img/picture404.png'
                  }
                }

              } else if (type == 'application/pdf' || type == '.pdf') {//查看pdf文件
                if ($isMobile.IOS) {
                  $scope.url = serverConfiguration.baseApiUrl + 'app/attachment/download?pkid=' + pkId
                  cordova.exec(null, null, 'InAppBrowser',
                    'open', [encodeURI($scope.url), '_system'])
                } else if ($isMobile.Android) {
                  downloadFile('OApdf', formatFlag)//下载PDF

                }
              } else if (type == 'application/octet-stream') {//之前规定application/octet-stream查看pdf文件和exl表格,RAR格式也走这个,所以文件夹名字统一OAFile

                if ($isMobile.IOS) {
                  $cordovaToast.showLongBottom(T.translate('view-form.view-error-attachment-ios'))

                } else if ($isMobile.Android) {
                  downloadFile('OAFile', formatFlag)//下载application/octet-stream格式文件

                }
              } else {
                //android全部下载,IOS给予提示
                if ($isMobile.IOS) {
                  $cordovaToast.showLongBottom(T.translate('view-form.view-error-attachment'))
                } else if ($isMobile.Android) {
                  downloadFile('OAFile', formatFlag)//下载其他附件
                }
              }


              //android附件下载
              /*targetPath : 文件下载到SD卡中的文件夹名字,如"OAOther"
               * fileName : 文件名字,必须带后缀
               * */
              function downloadFile(targetPath, fileName) {
                if ($isMobile.Android) {
                  $ionicLoading.show({
                    template: '正在下载,请您稍等...'
                  })
                  //创建文件夹
                  window.resolveLocalFileSystemURI(cordova.file.externalRootDirectory, function (fileEntry) {
                    fileEntry.getDirectory(targetPath, {create: true, exclusive: false}, function (exclusive) {

                      var downloadUrl = serverConfiguration.baseApiUrl + 'app/attachment/download?pkid=' + pkId
                      var sdTargetPath = '/sdcard/' + targetPath + '/' + fileName//手机下载路径,默认为android路径Download文件夹里面
                      var uri = encodeURI(downloadUrl)
                      var fileTransfer = new FileTransfer()
                      /*下载*/
                      fileTransfer.download(uri, sdTargetPath, function (entry) {
                        $cordovaToast.showLongBottom('文件已下载到SD卡下的' + targetPath + '文件夹内')
                        //如果是PDF,直接打开
                        if (type == 'application/pdf' || type == '.pdf') {
                          //调用第三方打开PDF文件
                          openFileUtils.openFilePDF(sdTargetPath)
                        } else {
                          $ionicLoading.hide()
                        }


                      }, function (err) {
                        $ionicLoading.hide()
                        $cordovaToast.showShortBottom(T.translate('view-form.download-error'))
                      }, false, {
                        headers: {
                          'Authorization': 'BasicdGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=='
                        }
                      })

                    }, function () {
                      $ionicLoading.hide()
                      $cordovaToast.showShortBottom(T.translate('view-form.create-error'))
                    })

                  })
                }

              }

            }

          }


        }
      }
    }])

  /**
   * 字段函数计算
   */
  /**
   * 2018-10-12 tyw
   * 问题描述：bug2768:
   *  采购内容申请表_20180228
   图1，明细行 数量5697.9X单价2.65=总价15099.435。 显示总价为15099.43。小数位第三位并没进位。
   图2，合计总价金额是按照15099.435求的和，而且做了四舍五入。金额正确。
   * 解决方法：参照pc端，重写toFixed方法，取精度后一位数字，再进行四舍五入
   */
  .directive('zwFuncexp', ['$parse', function ($parse) {
    var link = function ($scope, element, attrs, $ctrl) {
      var decimalValue = 3
      if (attrs.zwNumber) {
        var tempVal = eval('(' + attrs.zwNumber + ')').decimalValue
        if (typeof(tempVal) !== 'undefined') {
          decimalValue = tempVal
        }
      }

      var modelName = ''
      if (attrs.checkRefModel) {
        modelName = attrs.checkRefModel
      } else {
        modelName = attrs.ngModel
      }
      var watchArr = []
      var funcexp = attrs.zwFuncexp,
        watchField = getWatchField(funcexp)
      if (watchField.length > 0) {
        for (var i = 0, f; f = watchField[i++];) {
          //子表字段的监控
          var subMsg = f.split('.')
          if (subMsg.length > 3) {
            var fieldName = subMsg[3]
            var subTableSrc = f.replace('.' + fieldName, '')

            /* $scope.$watch(function($scope){
                        return eval("$scope."+subTableSrc+".map(function(obj){return obj."+fieldName+"})");
                        },function(newValue,oldValue,scope){
                        if(newValue!= oldValue){
                        formService.doMath(scope,modelName,funcexp);
                        }
                        });*/
            try {
              $scope.decimalValue = decimalValue
              $.fn.doMath($scope, modelName, funcexp)
            } catch (e) {

            }
            /**
             * * 2018/9/3 17:08  CrazyDong
             *  变更描述：监控数字计算的,手机端不用,连循环一起注释掉
             *  功能说明：
             */
              // 监控已存在的
            var length = eval('$scope.' + subTableSrc + '.length || 0')
            for (var int = 0; int < length; int++) {
              watch(subTableSrc + '[' + (int) + '].' + fieldName)
            }
            //监控新添加的
            var watched = $scope.$watch(subTableSrc + '.length', function (newValue, oldValue, scope) {
              scope.decimalValue = decimalValue
              if (newValue >= oldValue) {
                for (var start = oldValue; start < newValue; start++) {
                  watch(subTableSrc + '[' + (start) + '].' + fieldName)
                }
              } else {
                for (var start = newValue; start < oldValue; start++) {
                  watchArr.pop()()
                  $scope.decimalValue = decimalValue
                  $.fn.doMath($scope, modelName, funcexp)
                }
              }

              //			        		if(newValue>oldValue){
              //			        			watch(subTableSrc+"["+(newValue-1)+"]."+fieldName);
              //			        		}else if(newValue<oldValue){
              //			        			watchArr.pop()();
              //			        			$.fn.doMath($scope,modelName,funcexp);
              //			        		}
            })
          }
          else {
            /**
             * * 2018/9/3 17:10  CrazyDong
             *  变更描述：不需要计算
             *  功能说明：
             */
            //主表和子表单条运算
            watch(f)
          }
        }
      }

      // 监控
      function watch(path) {
        var watch = $scope.$watch(path, function (newValue, oldValue, scope) {
          //guanhao注释，解决从表导入过程中，oldValue和newValue值相同而导致的计算式未执行的bug
          //只有当newValue 和 oldValue 都不为空的时候执行
          if (newValue || oldValue) {
            scope.decimalValue = decimalValue
            $.fn.doMath(scope, modelName, funcexp)
          }
        })
        watchArr.push(watch)
      }

      function getWatchField(statFun) {
        var myregexp = /\(([data.main|data.sub|item].*?)\)/g
        var match = myregexp.exec(statFun)
        var arrs = []
        while (match != null) {
          var str = match[1]
          var has = false
          for (var i = 0, v; v = arrs[i++];) {
            if (v == str) has = true
          }
          if (!has) arrs.push(str)
          match = myregexp.exec(statFun)
        }
        return arrs
      }
    }
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 10000,
      compile: function () {
        return link
      }
    }
  }])
  /**
   * 从表
   */
  .directive('zwSubtable', ['$parse', '$timeout', '$injector', function ($parse, $timeout, $injector) {
    return {
      restrict: 'A',
      priority: 1030,
      link: function (scope, element, attrs, inputCtrl) {
        var model = $parse('data.' + attrs.ngModel)(scope)
        if (model && model.length == 0) {
          //如果model为空，
          scope.addRow(attrs.ngModel, 0)
        }

      },
      controller: function ($scope, $element, $attrs) {
        $scope.toggleIcon = function ($event) {
          var span = $($event.currentTarget).children().find('span')
          // var rowIndex = span.attr("data-row-index");
          span.toggle()
        }
        $scope.addRow = function (path, $index, noData) {
          var index = $index
          var arr = path.split('.')
          if (arr.length < 2) {
            alert('subtable path is error!')
          }
          var subTableName = arr[1].replace('sub_', '')
          var tempData = null
          if (!noData) {
            tempData = eval('$scope.data.' + $attrs.ngModel)[$index]
            // 关昊所加，修改PCbug，移除id属性
            for (var tv in tempData) {
              if (tv === 'id_' || tv === 'ref_id_') {
                delete tempData[tv]
              }
            }
          } else {
            tempData = $scope.data[arr[0]].initData[subTableName]
          }

          if (!tempData) tempData = {}

          var model = $parse('data.' + $attrs.ngModel)
          var data = JSON.parse(JSON.stringify(tempData))

          var tempArr = []
          angular.copy(model($scope), tempArr)
          tempArr.splice(index + 1, 0, data)
          model.assign($scope, [])
          $timeout(function () {
            model.assign($scope, tempArr)
          })
        }
        $scope.removeRow = function ($event, $index) {
          //删除tr
          var index = $index
          var model = $parse('data.' + $attrs.ngModel)($scope)
          if (model.length > 1) {
            model.splice(index, 1)
          }
        }
        $scope.setSapTriggerIndex = function (model, $index, binding, curr, size) {
          var tempScope = $scope
          while (tempScope.$parent) {
            tempScope = tempScope.$parent
          }
          tempScope.triggerInfo = {
            index: $index,
            model: model
          }
          //sap 控件中定义，sap控件加载后，初始化该方法。
          $scope.listSapData()
          tempScope.bindingMapping = binding
        }

        $scope.setMaterialTriggerIndex = function (model, $index, binding, curr, size) {
          var tempScope = $scope
          while (tempScope.$parent) {
            tempScope = tempScope.$parent
          }
          tempScope.triggerInfo = {
            index: $index,
            model: model
          }
          //sap 控件中定义，sap控件加载后，初始化该方法。
          $scope.listMaterialData()
          tempScope.bindingMapping = binding
        }
        /**
         * * 2018/4/8 14:10  add by wurina
         *  变更描述：与PC端指令合并
         *  功能说明：新增 $scope.pitchOn 双击事件 由于移动端不需要双击选择 所以我把里面内容注掉了
         */
        //从表双击变色.提示选中
        $scope.pitchOn = function ($event) {
          // $($event.currentTarget).children().addClass("tr_background");
          // $($event.currentTarget).siblings().children().removeClass("tr_background");
        }
      }
    }
  }])
  /**
   * 库位
   * 功能：sap从表中的库存数量，分库存数量，反件库存数量的计算由 库位 物料编号 工厂编号决定，其中库位、工厂编号为手工录入。
   */
  //.directive('zwStore', ["$parse",'$timeout',"$injector",function($parse,$timeout,$injector) {
  //    return {
  //        restrict: 'A',
  //        priority : 1030,
  //        link: function (scope, element, attrs, inputCtrl) {
  //            var storeStr = attrs.ngModel;
  //            var factoryStr = attrs.factory;
  //            var matnrStr = attrs.matnr;
  //            //监听库位
  //            scope.$watch(storeStr,function(newValue,oldValue){
  //                if(newValue != oldValue){
  //                    //库存
  //                    var store = newValue;
  //                    //工厂
  //                    var factoryNo = $parse(factoryStr)(scope);
  //                    //物料编号
  //                    var matnr = $parse(matnrStr)(scope);
  //                    scope.getSapStoreData(store,factoryNo,matnr);
  //                }
  //            });
  //            //监听工厂编号
  //            scope.$watch(factoryStr,function(newValue,oldValue){
  //                if(newValue != oldValue){
  //                    //库存
  //                    var store = $parse(storeStr)(scope);
  //                    //工厂
  //                    var factoryNo = newValue;
  //                    //物料编号
  //                    var matnr = $parse(matnrStr)(scope);
  //                    scope.getSapStoreData(store,factoryNo,matnr);
  //                }
  //            });
  //            //监听物料编号
  //            scope.$watch(matnrStr,function(newValue,oldValue){
  //                if(newValue != oldValue){
  //                    //库存
  //                    var store = $parse(storeStr)(scope);
  //                    //工厂
  //                    var factoryNo = $parse(factoryStr)(scope);
  //                    //物料编号
  //                    var matnr = newValue;
  //                    scope.getSapStoreData(store,factoryNo,matnr);
  //                }
  //            });
  //        },
  //        controller : function($scope,$element,$attrs){
  //            $scope.getSapStoreData = function(store,factoryNo,matnr){
  //                var modelValue  = $parse($attrs.model)($scope);
  //                //执行网络请求
  //                if($injector.has("store")) {
  //                    var module = $injector.get("store");
  //                    var promise = module.getStoreCount(matnr,factoryNo,store);
  //                    if(promise){
  //                        promise.then(function(data){
  //                            //库存数量
  //                            modelValue.storeNum = data.storeNum;
  //                            //分库存数量
  //                            modelValue.dStoreNum = data.dStoreNum;
  //                            //反库存数量
  //                            modelValue.bStoreNum = data.bStoreNum;
  //                        }).then(function(data){
  //
  //                        })
  //                    }
  //                }
  //            }
  //        }
  //    };
  //}])
  /**
   * 分页
   */
  //.directive('zwPager', ["$parse", "$timeout", "$compile", function ($parse, $timeout, $compile) {
  //    return {
  //        restrict: 'A',
  //        priority: 1031,
  //        link: function (scope, element, attrs, inputCtrl) {
  //            var model = attrs.ngModel;
  //            if (!scope[model]) {
  //                scope[model] = {};
  //                // return;
  //            }
  //            scope[model+"_size"] = scope[model].size || 10;
  //            scope[model].pagerMapper = {};
  //            scope[model].pagerMapper = {
  //                "first"		:'<li style="cursor:pointer" class="li_pointer paginate_button first" ng-click="firstPage($event)" id="'+model+'_PageBtn_first"><a>首页</a></li>',
  //                "previou"	:'<li style="cursor:pointer" class="li_pointer paginate_button previous" ng-click="prePage($event)" id="'+model+'_PageBtn_previou"><a>上一页</a></li>',
  //                "next"		:'<li style="cursor:pointer" class="li_pointer paginate_button next" id="'+model+'_PageBtn_next" ng-click="nextPage($event)"><a>下一页</a></li>',
  //                "last"		:'<li style="cursor:pointer" class="li_pointer paginate_button last" id="'+model+'_PageBtn_last" ng-click="lastPage($event)"><a>末页</a></li>',
  //                "size"  	:'<li style="cursor:pointer" class="disabled disablednone" id="'+model+'_size")"><a style="margin-right: 2px ! important;" href="##">每页</a></li><li class="disabled disablednone"> <select style="width:75px;float:left;" ng-model="'+model+'_size" class="pageing-form-select"><option value="10">10</option><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></li><li class="disabled disablednone"> <a style="margin-left: -7px ! important;" href="##">项</a></li>',
  //                "sum"		:'<li style="cursor:pointer" class="disabled disablednone"><a style="margin-left: 3px ! important;letter-spacing:2px ! important;" href="##">共{{'+model+'.total}}项</a></li>',
  //                "···"		:'<li style="cursor:pointer" class="paginate_button disabled"><a>···</a></li>'
  //            };
  //
  //            if (scope[model]) {
  //                scope.showPager(scope[model].total, scope[model].curr, scope[model + "_size"], model);
  //            }
  //
  //            scope.$watch(model + "_size", function (newValue, oldValue) {
  //                var calcuSum = scope[model].curr * oldValue
  //                if (calcuSum > scope[model].total) {
  //                    calcuSum = scope[model].total;
  //                }
  //                scope[model].curr = 1;//Math.floor(calcuSum / newValue); 与解晓明确认,每次切换页面固定跳转到第一页 2017年11月30日14:26:58
  //                //直接调用callback方法
  //                if (!scope[model].callback) {
  //                    return;
  //                }
  //                scope[model].callback.call(this, scope[model].total, scope[model].curr, scope[model + "_size"]);
  //            })
  //
  //        },
  //        controller: function ($scope, $element, $attrs) {
  //            //下一页
  //            $scope.nextPage = function ($event) {
  //                if ($($event.currentTarget).hasClass("disabled")) {
  //                    //如果disabled，禁止点击事件
  //                    return;
  //                }
  //                var model = $($event.currentTarget).attr("id").split("_")[0];
  //                $scope[model].curr = $scope[model].curr + 1;
  //                var lastPage = Math.ceil($scope[model].total / $scope[model + "_size"]);
  //                if ($scope[model].curr > lastPage) {
  //                    $scope[model].curr = lastPage;
  //                }
  //                $scope.clickPage($scope[model].curr, $event);
  //            }
  //            //上一页
  //            $scope.prePage = function ($event) {
  //                if(!$event.currentTarget){
  //                    //刷新主页面
  //                    $event.currentTarget = $event;
  //                }
  //                if ($($event.currentTarget).hasClass("disabled")) {
  //                    //如果disabled，禁止点击事件
  //                    return;
  //                }
  //                var model = $($event.currentTarget).attr("id").split("_")[0];
  //                $scope[model].curr = $scope[model].curr - 1;
  //                if ($scope[model].curr < 1) {
  //                    $scope[model].curr = 1;
  //                }
  //                $scope.clickPage($scope[model].curr, $event);
  //            }
  //            //首页
  //            $scope.firstPage = function ($event) {
  //                if ($($event.currentTarget).hasClass("disabled")) {
  //                    //如果disabled，禁止点击事件
  //                    return;
  //                }
  //                var model = $($event.currentTarget).attr("id").split("_")[0];
  //                $scope[model].curr = 1;
  //                $scope.clickPage(1, $event)
  //            }
  //            //最后页
  //            $scope.lastPage = function ($event) {
  //                if ($($event.currentTarget).hasClass("disabled")) {
  //                    //如果disabled，禁止点击事件
  //                    return;
  //                }
  //                var model = $($event.currentTarget).attr("id").split("_")[0];
  //                var lastPage = Math.ceil($scope[model].total / $scope[model + "_size"]);
  //                $scope[model].curr = lastPage;
  //                $scope.clickPage(lastPage, $event);
  //            }
  //            //各个页
  //            $scope.clickPage = function (currPage, $event) {
  //                var model = $($event.currentTarget).attr("id").split("_")[0];
  //                $scope[model].curr = currPage;
  //                $scope.showPager($scope[model].total, currPage, $scope[model + "_size"], model);
  //
  //                var callBack = null;
  //                if ($scope[model].callback && typeof($scope[model].callback) == 'function') {
  //                    callBack = $scope[model].callback;
  //                } else {
  //                    callBack = eval($scope[model].callback);
  //                }
  //
  //                callBack(this, $scope[model].total, $scope[model].curr, $scope[model + "_size"]);
  //
  //            }
  //
  //            /**
  //             * 生成模拟数组
  //             * totalCounts 总记录数
  //             * curentCount 当前页
  //             * size 每页条数
  //             */
  //            $scope.showPager = function (totalCounts, currentCount, size, model) {
  //                // 总页数  = 总记录数 / 每页条数;
  //                var totalPages = Math.ceil(totalCounts / size); //向上取整 4 / 3 = 2;
  //                //最后页超过最大页处理
  //                if(totalPages!=0 && currentCount > totalPages){
  //                    $scope.prePage($("#"+model+"_PageBtn_previou"));
  //                    return;
  //                }
  //                var realArray = [];
  //                //总数为7全部展示
  //                if (totalPages <= 7) {
  //                    for (var l = 1; l <= totalPages; l++) {
  //                        realArray.push(l + "");
  //                    }
  //                } else {
  //                    //左侧实际页处理
  //                    if (currentCount > 4) {
  //                        realArray.push("1");
  //                        realArray.push("···");
  //                        //交给右侧处理
  //                        if (currentCount <= totalPages - 4) {
  //                            realArray.push((currentCount - 1) + "");
  //                            realArray.push(currentCount + "");
  //                        }
  //
  //                    } else {
  //                        for (var m = 1; m <= 5; m++) {
  //                            var leftPages = totalPages - 4;
  //                            if (leftPages < 5) {
  //                                leftPages = 5;
  //                            }
  //                            if (m <= leftPages) {
  //                                realArray.push(m);
  //                            }
  //                        }
  //                    }
  //
  //                    //右侧实际页处理
  //                    if (totalPages > 5) {
  //                        if ((currentCount + 3) < totalPages) {
  //                            if (currentCount > 4) {
  //                                realArray.push((currentCount + 1) + "");
  //                            }
  //                            realArray.push("···");
  //                            realArray.push(totalPages + "");
  //                        } else {
  //                            for (var n = totalPages - 4; n <= totalPages; n++) {
  //                                if (n > 1) {
  //                                    realArray.push(n + "");
  //                                }
  //                            }
  //                        }
  //                    }
  //                }
  //                //公共部分
  //                realArray.splice(0, 0, "previou");//上一页
  //                realArray.splice(0, 0, "first");//首页
  //                realArray.push("next");//下一页
  //                realArray.push("last");//末页
  //                realArray.push("size");
  //                realArray.push("sum");
  //                // console.log(currentCount+"-->"+realArray);
  //
  //                //映射html
  //                var pagerHTML = "";
  //                for (var f = 0; f < realArray.length; f++) {
  //                    var mapperRet = $scope[model].pagerMapper[realArray[f]];
  //                    if (mapperRet) {
  //                        pagerHTML += mapperRet;
  //                    } else {
  //                        pagerHTML += '<li style="cursor:pointer" class="li_pointer paginate_button" id="'+model+'_PageBtn_'+realArray[f]+'" ng-click="clickPage('+realArray[f]+',$event)"><a>'+realArray[f]+'</a></li>';
  //                    }
  //                }
  //                // console.log(pagerHTML);
  //                $scope.pagerHTML = pagerHTML;
  //
  //                var content = $compile(pagerHTML)($scope);
  //                $("[ng-model='" + model + "']").next().html(content);
  //                //设置指定页选中状态
  //                $("#" + model + "_PageBtn_" + $scope[model].curr).addClass("active");
  //                //如果是第一页
  //                if ($scope[model].curr == 1) {
  //                    //设置首页和上一页不可点
  //                    $("#" + model + "_PageBtn_first").addClass("disabled");
  //                    $("#" + model + "_PageBtn_previou").addClass("disabled");
  //                }
  //                //如果是最后页
  //                var lastPage = Math.ceil($scope[model].total / $scope[model + "_size"]);
  //                if ($scope[model].curr == lastPage) {
  //                    //设置末页和下一页不可点
  //                    $("#" + model + "_PageBtn_last").addClass("disabled");
  //                    $("#" + model + "_PageBtn_next").addClass("disabled");
  //                }
  //                return pagerHTML;
  //            }
  //        }
  //    };
  //}])
  //.directive('zwSap', ["$parse","$injector",function($parse,$injector) {
  //    return {
  //        restrict: 'A',
  //        priority : 1030,
  //        link: function (scope, element, attrs, inputCtrl) {
  //            var permission = getPermission(attrs.permission, scope);
  //            // 以下注释, ghao 2017年12月8日17:03:07 因为默认返回权限修改为r ,导致SAP数据无法显示
  //            if (permission == 'r' && !attrs.tr) {
  //                //读权限拒绝执行
  //                $(element).remove();
  //                return;
  //            }
  //        },
  //        controller : function($scope,$element,$attrs){
  //            //窗体表格行点击事件
  //            $scope.sapRowClick=function(row,$index,$event){
  //                $scope.sap_row_checked= [];
  //
  //                $scope.sap_row_checked[$index] =  !$scope.sap_row_checked[$index];
  //                $scope.sap_selected_rowData = row;
  //
  //                $($event.currentTarget).parent().children().removeClass("custom_active");
  //                $($event.currentTarget).addClass("custom_active");
  //            }
  //            //窗体确认按钮
  //            $scope.sapSureBtn = function(){
  //                if($scope.sap_row_checked.length==0){
  //                    ZW.Model.info("请点击行选择数据","确认",function(){
  //                    })
  //                    return;
  //                }
  //                var index = $scope.triggerInfo.index;
  //                var model = $scope.triggerInfo.model;
  //                var row = $scope.sap_selected_rowData;
  //                //如果选中行，执行映射解析
  //                if(row){
  //                    //解析绑定关系
  //                    for(var n=0;n<$scope.bindingMapping.length;n++){
  //                        var temp = $scope.bindingMapping[n];
  //                        var target = eval("$scope."+model+"["+index+"]");
  //                        /**
  //                         * name 表示从表
  //                         * code 表示sap
  //                         */
  //                        target[temp.name] = row[temp.code];
  //                    }
  //                }
  //                //清空并且关闭窗体
  //                $scope.sapCancelBtn();
  //            }
  //            //窗体取消按钮
  //            $scope.sapCancelBtn = function(){
  //                $scope.sap_row_checked = [];
  //                //情况查询框内容
  //                $("#sap_query_value").val('');
  //                $("#sap_modal_dialog").modal("hide");
  //            }
  //            //窗体查询按钮
  //            $scope.sapSeachBtn = function(){
  //                $scope.listSapData();
  //            }
  //
  //            $scope.listSapData = function(){
  //                //取得窗体查询条件，如果窗体查询条件增加，需要同时增加这里。
  //                var queryKey = $("#sap_query_key").val();
  //                var queryValue = $("#sap_query_value").val();
  //
  //                //构造查询条件
  //                sapData = {};
  //                sapData[queryKey] = queryValue;
  //                sapData.curr = $scope["sapPager"].curr || 1;
  //                sapData.total = $scope["sapPager"].total;
  //                sapData.size = $scope["sapPager_size"];
  //
  //                //执行查询
  //                if($injector.has("sap")) {
  //                    var module = $injector.get("sap");
  //                    var promise = module.listSapData(sapData);
  //                    if(promise){
  //                        promise.then(function(dbRet){
  //                            if(dbRet){
  //                                //修改sap 的 model
  //                                $scope.sapData = dbRet.list;
  //                                //分页相关
  //                                $scope["sapPager"].curr =dbRet.currentPage;
  //                                $scope["sapPager"].total =dbRet.totalCount;
  //                                $scope["sapPager_size"] = dbRet.pageSize;
  //
  //                                $scope["sapPager"].callback = $scope.listSapData;
  //                                $scope.showPager(dbRet.totalCount,dbRet.currentPage,dbRet.pageSize,"sapPager");
  //                                $scope.sap_row_checked = [];
  //                            }
  //                        },function(dbRet){
  //                            ZW.Model.info("sap数据查询失败","确认",function(){
  //                                //清空并且关闭窗体
  //                                $scope.sapCancelBtn();
  //                            });
  //                        })
  //                    }
  //                }
  //            }
  //        }
  //    };
  //}])
  /**
   * 物料选择
   */
  //.directive('zwMaterial', ["$parse","$injector",function($parse,$injector) {
  //    return {
  //        restrict: 'A',
  //        priority : 1030,
  //        link: function (scope, element, attrs, inputCtrl) {
  //            var permission = getPermission(attrs.permission, scope);
  //            if (permission == 'r' && !attrs.tr) {
  //                //读权限拒绝执行
  //                $(element).remove();
  //                return;
  //            }
  //        },
  //        controller : function($scope,$element,$attrs){
  //            //窗体表格行点击事件
  //            $scope.materialRowClick=function(row,$index,$event){
  //              $scope.material_row_checked= [];
  //
  //              $scope.material_row_checked[$index] =  !$scope.material_row_checked[$index];
  //              $scope.material_selected_rowData = row;
  //              $($event.currentTarget).parent().children().removeClass("custom_active");
  //              $($event.currentTarget).addClass("custom_active");
  //            }
  //            //窗体确认按钮
  //            $scope.materialSureBtn = function(){
  //                if($scope.material_row_checked.length==0){
  //                    ZW.Model.info("请点击行选择数据","确认",function(){
  //                    })
  //                    return;
  //                }
  //                var index = $scope.triggerInfo.index;
  //                var model = $scope.triggerInfo.model;
  //                var row = $scope.material_selected_rowData;
  //                //如果选中行，执行映射解析
  //                if(row){
  //                    //解析绑定关系
  //                    for(var n=0;n<$scope.bindingMapping.length;n++){
  //                        var temp = $scope.bindingMapping[n];
  //                        var target = eval("$scope."+model+"["+index+"]");
  //                        /**
  //                         * name 表示从表
  //                         * code 表示物料
  //                         */
  //                        target[temp.name] = row[temp.code];
  //                    }
  //                }
  //                //清空并且关闭窗体
  //                $scope.materialCancelBtn();
  //            }
  //            //窗体取消按钮
  //            $scope.materialCancelBtn = function(){
  //              $scope.material_row_checked = [];
  //              //清空查询条件内容
  //              $("#material_query_value").val('');
  //              $("#material_modal_dialog").modal("hide");
  //            }
  //            //窗体查询按钮
  //            $scope.materialSeachBtn = function(){
  //              $scope.listMaterialData();
  //            }
  //
  //            $scope.listMaterialData = function(){
  //                //取得窗体查询条件，如果窗体查询条件增加，需要同时增加这里。
  //                var queryKey = $("#material_query_key").val();
  //                var queryValue = $("#material_query_value").val();
  //
  //                //构造查询条件
  //                materialData = {};
  //                materialData[queryKey] = queryValue;
  //                materialData.curr = $scope["materialPager"].curr || 1;
  //                materialData.total = $scope["materialPager"].total;
  //                materialData.size = $scope["materialPager_size"];
  //
  //                //执行查询
  //                if($injector.has("material")) {
  //                    var module = $injector.get("material");
  //                    var promise = module.listMaterialData(materialData);
  //                    if(promise){
  //                        promise.then(function(dbRet){
  //                            if(dbRet){
  //                                //修改sap 的 model
  //                                $scope.materialData = dbRet.list;
  //                                //分页相关
  //                                $scope["materialPager"].curr =dbRet.currentPage;
  //                                $scope["materialPager"].total =dbRet.totalCount;
  //                                $scope["materialPager_size"] = dbRet.pageSize;
  //
  //                                $scope["materialPager"].callback = $scope.listMaterialData;
  //                                $scope.showPager(dbRet.totalCount,dbRet.currentPage,dbRet.pageSize,"materialPager");
  //                                $scope.material_row_checked = [];
  //                            }
  //                        },function(dbRet){
  //                            ZW.Model.info("物料数据查询失败","确认",function(){
  //                              //清空并且关闭窗体
  //                              $scope.materialCancelBtn();
  //                            });
  //                        })
  //                    }
  //                }
  //            }
  //            //从表双击变色.提示选中
  //            $scope.pitchOn = function($event){
  //                //PC端双击变色事件  移动端没有用
  //                // $($event.currentTarget).children().addClass("tr_background");
  //                // $($event.currentTarget).siblings().children().removeClass("tr_background");
  //            }
  //        }
  //    };
  //}])
  /**
   * 物料提示图标
   */
  .directive('zwMaterialImg', ['$parse', 'serverConfiguration', function ($parse, serverConfiguration) {
    return {
      restrict: 'A',
      priority: 1030,
      compile: function (element, attrs) {
        return {
          pre: function preLink(scope, element, attrs) {

          },
          post: function post(scope, element, attrs) {
            //                        var ctx = '';
            //                        $(element).attr("src",ctx+ attrs.src);

            /**
             * * 2018/4/25 10:00  wurina
             *  变更描述：之前图标是请求  现在改用本地的
             *  功能说明：拆分图标字段 加载本地图标
             */
            var srcImg = attrs.src.split('/')
            srcImg = srcImg[srcImg.length - 1]
            //移动端使用
            // $(element).attr("src",serverConfiguration.domain + attrs.src);
            $(element).attr('src', 'app/view-form/img/' + srcImg)
          }
        }
      },
      controller: function ($scope, $element, $attrs) {
        $($element).error(function () {
          $($element).hide()
        })
        /* $scope.$watch($attrs.refModel,function(newValue,oldValue){
                 if(newValue){
                 $($element).show();
                 }else{
                 $($element).hide();
                 }
                 })*/
      }
    }
  }])
  /**
   * * 2018/4/20 15:00  wurina
   *  变更描述：合并PC端指令
   *  功能说明：增加表单标题图标
   */
  .directive('zwImg', ['$parse', 'serverConfiguration', function ($parse, serverConfiguration) {
    return {
      restrict: 'A',
      priority: 1030,
      compile: function (element, attrs) {
        return {
          pre: function preLink(scope, element, attrs) {

          },
          post: function post(scope, element, attrs) {
            // $(element).attr("src",serverConfiguration.domain + attrs.src);
            /**
             * * 2018/4/25 10:00  wurina
             *  变更描述：之前图标是请求  现在改用本地的
             *  功能说明：加载本地图标
             */
            $(element).attr('src', 'app/view-form/img/form_logo_lv.png')

          }
        }
      },
      controller: function ($scope, $element, $attrs) {
        $($element).error(function () {
          $($element).hide()
        })
        /* $scope.$watch($attrs.refModel,function(newValue,oldValue){
                 if(newValue){
                 $($element).show();
                 }else{
                 $($element).hide();
                 }
                 })*/
      }
    }
  }])
  /**
   * 主页检索条件
   */
  //.directive("zwQuery", ["$parse","$filter","$timeout", function($parse,$filter,$timeout) {
  //    return {
  //        restrict: 'E',
  //        replace: true,
  //        template:	'<div class="width200">'+
  //            '<div style="width:100px; float:left; text-align:center">'+
  //            '<input type="text" id="#{{item.id}}" style="visibility: hidden;" class="knob dial" value="" data-thickness="0.2" data-width="70" data-height="70" data-fgColor="#dd4b39 " readonly>'+
  //            '</div>'+
  //            '<div style="width:140px;margin-top: 28px; float:left;text-align:center">'+
  //            '<a href="#" ng-click="execQuery(item.name)">{{item.name}}</a>'+
  //            '</div>'+
  //            '</div>',
  //        priority : 1050,
  //        link: function (scope, element, attrs) {
  //            scope.$watch(attrs.list,function(newValue,oldValue){
  //                if(JSON.stringify(newValue) != JSON.stringify(oldValue)){
  //                    scope.showAll();
  //                }
  //            });
  //            attrs.$observe("condition",function(newValue,oldValue){
  //                if(JSON.stringify(newValue) != JSON.stringify(oldValue)){
  //                    $timeout(function () {
  //                        scope.showAll();
  //                    });
  //                }
  //            });
  //        },
  //        controller: function ($scope, $element, $attrs) {
  //            $scope.execQuery = function(name){
  //                $scope.data.queryFlag = "q";
  //                $scope.data.name = name;
  //                var condition = $attrs.condition;
  //                var aList = eval("$scope."+$attrs.list);
  //                var qList = $filter("customQuery")(aList,condition);
  //                $scope.data.qList = qList;
  //            };
  //            $scope.showAll = function(){
  //                $scope.data.queryFlag = "a";
  //                var condition = $attrs.condition;
  //                var aList = eval("$scope."+$attrs.list);
  //                var qList = $filter("customQuery")(aList,condition);
  //                $scope.data.qList = aList;
  //                $scope.data.showAll = $scope.showAll;
  //                var max = 0;
  //                var self = 0;
  //                //以下两个if用于判断当 alist 或者qlist有一个不存在时，禁止执行绘图操作，否则会出现bug
  //                if(aList && aList.length !== undefined){
  //                    max = aList.length;
  //                }else{
  //                    return;
  //                }
  //                if(qList && qList.length !== undefined){
  //                    self = qList.length;
  //                }else{
  //                    return;
  //                }
  //                $scope.knob(max,self);
  //            };
  //            $scope.knob = function(max,self){
  //                $('.dial').knob({
  //                    max : parseInt(max)
  //                });
  //                var ele = $($element).children().find(".dial").val(self);
  //                ele.trigger('change');
  //                $($element).children().find(".dial").css("visibility","visible");
  //            }
  //        }
  //    };
  //}])
  /**
   * 格式化银行账户 zw-bank="" formater = "{separator:" ",size:4}"
   * value 为分隔符，默认空格
   */
  .directive('zwBank', ['$parse', '$filter', '$timeout', function ($parse, $filter, $timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 1040,
      link: function (scope, element, attrs, inputCtrl) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'n') {
          element.remove()
          return
        } else if (permission == 'r') {
          //经过init 和 init-model处理后，ngModel的值已经可能发生改变
          var model = $parse(attrs.ngModel)(scope)
          if (!model) {
            element.remove()
            return
          }
          var formatVal = $filter('bankFormat')(model, attrs.formater)
          element.before(formatVal)
          element.remove()
        } else if (permission == 'w') {
          if (!attrs.ngModel || !$parse(attrs.ngModel)(scope)) {
            if (attrs.init) {
              var model = $parse(attrs.ngModel)
              //init 为常量
              model.assign(scope, attrs.init)
            }
            if (attrs.initModel) {
              // 如果存在初始化模型，则使用初始化模型的数据进行初始化
              var model = $parse(attrs.ngModel)
              var data = $parse(attrs.initModel)(scope)
              model.assign(scope, data)
            }
          }
        }

        element.bind('focus', function () {
          var modelValue = $parse(attrs.ngModel)(scope)
          if (modelValue) {
            element.val(modelValue)
          }
        })
        element.bind('blur', function () {
          var tempVal = $parse(attrs.ngModel)(scope)
          //如果tempVal 为  undefined，表明校验未通过，不予格式化
          if (tempVal) {
            var formatVal = $filter('bankFormat')(tempVal, attrs.formater)
            element.val(formatVal)
          }
        })


        //监听model
        scope.$watch(attrs.ngModel, function (newValue, oldValue) {
          //当前元素不是焦点
          if (newValue != oldValue && !$(element).is(':focus')) {
            //通过事件通知格式化，（延迟处理，等待双向绑定完成后再执行格式化。否则格式化结果会被双向绑定结果覆盖）
            $timeout(function () {
              scope.$emit('setElementVal') //事件通知
            })

          }
        })


        $timeout(function () {
          scope.$emit('setElementVal') //事件通知
        })

        scope.$on('setElementVal', function () {
          var tempVal = $parse(attrs.ngModel)(scope)
          var formatVal = $filter('bankFormat')(tempVal, attrs.formater)
          element.val(formatVal)
        })
      }
    }
  }])
  /**
   * 触发搜索框弹出按钮
   *
   * */
  .directive('zwUserSelector', ['$parse', '$filter', '$timeout', function ($parse, $filter, $timeout) {
    return {
      restrict: 'AE',
      require: 'ngModel',
      priority: 1040,
      link: function (scope, element, attrs, inputCtrl) {
        //转化
        var model = $parse(attrs.ngModel)(scope)
        var showLabel = []
        if (model) {
          var options = {}
          if (attrs.options) {
            //定义虚拟预处理和回调
            function preProcessOfSelect() {
            }

            function postProcessOfSelect() {
            }

            var options = eval('(' + attrs.options + ')')
          }
          //模拟下拉列表
          if (options && options.userSize == 1) {
            showLabel = $parse(attrs.refName)(scope)
          } else {
            for (var i = 0; i < model.length; i++) {
              if (model[i] && model[i].label) {
                showLabel.push(model[i].label)
              }
            }
          }
        }
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'n') {
          element.remove()
          return
        } else if (permission == 'r') {
          if (!model) {
            element.remove()
            return
          } else {
            if (typeof(showLabel) == 'string') {
              element.after(showLabel)
            } else {
              element.after(showLabel.join(','))
            }
            element.remove()
          }
        } else if (permission == 'w') {
          //显示名称
          //$("#"+attrs.refName).val(showLabel.join(","));
          //scope[attrs.refName] =  showLabel.join(",");
          if (attrs.refName) {
            var model = $parse(attrs.refName)
            /**
             * * 2018/4/8 14:20  add by wurina
             *  变更描述：与PC端指令合并 增加了条件判断
             *  功能说明：
             */
            if (typeof(showLabel) == 'string') {
              model.assign(scope, showLabel)
            } else {
              model.assign(scope, showLabel.join(','))
            }
          }
        }
      },
      controller: function ($scope, $element, $attrs) {
        //预处理
        function preProcess(data) {
          //预留方法，data格式确定，无需再次处理
          return data
        }

        //回调
        function postProcess(data) {
          //解决父子作用域问题，遍历自作用域，直到找到data属性
          while ($scope && $scope.data == undefined) {
            $scope = $scope.$$childHead
          }
          var model = $parse($attrs.ngModel)
          model.assign($scope, data)
          //显示名称
          var showLabel = []
          //如果没有选中数据,直接返回
          if (!data) {
            return
          }
          for (var i = 0; i < data.length; i++) {
            if (data[i].label) {
              showLabel.push(data[i].label)
            }
          }
          // $("#"+$attrs.refName).val(showLabel.join(","));
          var model = $parse($attrs.refName)
          model.assign($scope, showLabel.join(','))
          //return data;
        }

        //模拟下拉列表的预处理方法
        function preProcessOfSelect(data) {
          //如果没有选中数据,直接返回
          if (!data) {
            return
          }
          //解决父子作用域问题，遍历自作用域，直到找到data属性
          while ($scope && $scope.data == undefined) {
            $scope = $scope.$$childHead
          }
          if ($attrs.refName) {
            var name = $parse($attrs.refName)($scope)
            var id = $parse($attrs.ngModel)($scope)
            return [{id: id, label: name, type: $scope.options.class, typeName: $scope.options.className}]
          }
        }

        //模拟下拉列表的回调处理方法
        function postProcessOfSelect(data) {
          //如果没有选中数据,直接返回
          if (!data) {
            //解决父子作用域问题，遍历自作用域，直到找到data属性
            while ($scope && $scope.data == undefined) {
              $scope = $scope.$$childHead
            }
            var model = $parse($attrs.ngModel)
            model.assign($scope, '')
            var model = $parse($attrs.refName)
            model.assign($scope, '')
            return
          }
          //解决父子作用域问题，遍历自作用域，直到找到data属性
          while ($scope && $scope.data == undefined) {
            $scope = $scope.$$childHead
          }
          var model = $parse($attrs.ngModel)
          if (data.length >= 1) {
            //只有一条数据
            model.assign($scope, data[0].id)
          } else {
            // 在清空数据后将scope中数据清空
            model.assign($scope, '')
          }
          //显示名称
          var model = $parse($attrs.refName)
          if (data.length >= 1) {
            model.assign($scope, data[0].label)
          } else {
            model.assign($scope, '')
          }
        }

        $scope.trriger = function () {
          //如果在表单中配置了options,使用配置好的岗位
          var options = {}
          if ($attrs.options) {
            options = eval('(' + $attrs.options + ')')
          }
          //TODO 测试数据，需要注释
          //$scope.userModel = {class:"dept",users:[{id:"user1",label:"用户1",type:"user"},{id:"user2",label:"工会干部",type:"dept"},{id:"user3",label:"用户2",type:"user"},{id:"user4",label:"人力资源部",type:"dept"}]};
          var tempScope = $scope
          while (tempScope && tempScope.data == undefined) {
            tempScope = tempScope.$$childHead
          }
          if (tempScope) {
            options.data = $parse($attrs.ngModel)(tempScope)
          }
          if (!options.preProcess) {
            //传递函数
            options.preProcess = preProcess
          }
          if (!options.postProcess) {
            //传递函数
            options.postProcess = postProcess
          }
          x5_dialog_tab_dict = [{type: 'company', name: '公司'}, {type: 'dept', name: '部门'}, {
            type: 'post',
            name: '岗位'
          }, {type: 'group', name: '组'}]
          x5_dialog_custom_tab = x5_dialog_tab_dict
          if (options.class) {
            var custTab = options.class.split(',')
            x5_dialog_custom_tab = []
            for (var m = 0; m < custTab.length; m++) {
              for (var f = 0; f < x5_dialog_tab_dict.length; f++) {
                if (x5_dialog_tab_dict[f].type == custTab[m]) {
                  x5_dialog_custom_tab.push(x5_dialog_tab_dict[f])
                }
              }
            }
          }
          //为了解决父子作用域问题，将options绑定到最顶层作用域
          while ($scope.$parent) {
            $scope = $scope.$parent
          }
          $scope.options = options
          $scope.x5_dialog_custom_tab = x5_dialog_custom_tab
        }
      }
    }
  }])
  /***************************选择框开始***************************************/
  /**
   * 选择框tab
   */
  .directive('zwSelectorTab', ['$parse', '$filter', '$timeout', function ($parse, $filter, $timeout) {
    return {
      restrict: 'AE',
      replace: true,
      template: '<ul class="nav nav-tabs" id="myTab">' +
      '<li ng-repeat="item in x5_dialog_custom_tab track by $index"><a id = "{{item.type}}" data-toggle="tab" ng-click="clickTab($event)">{{item.name}}</a></li>' +
      '</ul>',
      priority: 1060,
      link: function (scope, element, attrs) {
      },
      controller: function ($scope, $element, $attrs) {
        $scope.clickTab = function ($event) {
          $scope.selectorTab = $($event.currentTarget).attr('id')
        }
      }
    }
  }])
  /**
   * 公司检索框bar
   */
  .directive('zwSelectorBar', ['$parse', '$filter', '$timeout', 'net', 'userSelector', function ($parse, $filter, $timeout, net, userSelector) {
    return {
      restrict: 'AE',
      replace: true,
      template: '<div class="box-header with-border form-inline" style="display:inline">' +
      '<table style="border:none">' +
      '<tr>' +
      '<td>' +
      '<label>公司选择:</label>' +
      '</td>' +
      '<td>' +
      '<oi-select style="width:250px" oi-options="item.id as item.label for item in CompanyList track by item.code" ng-model="searchBar" placeholder="请选择"></oi-select>' +
      '</td>' +
      '<td>' +
      '<input type="text" id="queryName" style="width:200px" name="queryName" placeholder="请输入用户名">' +
      '</td>' +
      '<td>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-primary" id="btnKeywordSearchIdOfBar">搜索</button>' +
      '</td>' +
      '</tr>' +
      '</table>' +
      '</div>',
      priority: 1060,
      link: function (scope, element, attrs) {
        //TODO 以下测试使用，需要删除
        /*scope.init={};
                 scope.init.user = {};
                 scope.init.user.compid='670869647114347';*/
        scope.$watch('init', function (newValue, oldValue) {
          if (newValue && scope.init.user) {
            userSelector.showCompanyList(scope.init.user.compid).then(function (data) {
              scope.CompanyList = data
              scope.searchBar = scope.init.user.compid
            })
          }
        }, true)
        scope.$watch('searchBar', function (newValue, oldValue) {
          //if(newValue!=oldValue){
          //激活页签为部门的时候,切换树的数据
          var activeTab = $('[class~=active]', '#myTab').find('a').attr('id')
          if (activeTab == 'dept') {
            scope.doing_async = true
            userSelector.showDepartTree(newValue).then(function (data) {
              scope.my_data = data
              //必须这么写，不然无法展开
              $timeout(function () {
                scope.my_tree.expand_all()
              })
              scope.doing_async = false
            })
          }
          if (activeTab == 'post') {
            scope.doing_async = true
            userSelector.showPostTree(newValue).then(function (data) {
              scope.my_data = data
              scope.doing_async = false
              //必须这么写，不然无法展开
              $timeout(function () {
                scope.my_tree.expand_all()
              })
              scope.doing_async = false
            })
          }
          //}
        })
        //增加回车事件
        $('#queryName').keyup(function (event) {
          if (event.keyCode == 13) {
            $('#btnKeywordSearchIdOfBar').trigger('click')
          }
        })
      },
      controller: function ($scope, $element, $attrs) {
        $('#btnKeywordSearchIdOfBar').unbind('click').bind('click', function () {
          if (!$scope.searchBar) {
            return
          }
          if (!$('#queryName').val()) {
            //搜索框未输入内容时候不予搜索
            return
          }
          //如果当前激活tab为公司时,跳转到部门tab,并且选中人员radio
          var activeTab = $('[class~=active]', '#myTab').find('a').attr('id')
          if (activeTab == 'company') {
            //激活部门
            $('#myTab #dept').click()
            $('#myTab li').removeClass('active')
            $('#myTab #dept').parent().addClass('active')
          }
          userSelector.showCompanyUser($scope.searchBar, $('#queryName').val()).then(function (data) {
            $scope.users = data
          })
        })
      }
    }
  }])
  /**
   * 选择框main container
   */
  .directive('zwSelectorMain', ['$parse', '$filter', '$timeout', 'net', 'userSelector', function ($parse, $filter, $timeout, net, userSelector) {
    return {
      restrict: 'AE',
      replace: true,
      template: '<div class="box-body">' +
      '<div class="row">' +
      '<div class="col-md-5">' +
      '<div id="myTabContent" class="tab-content" >' +
      '<br/>' +
      '<div class="tab-pane fade  in active"  id="deptUserTabId">' +
      '<div class="row border-gray pre-scrollable" style="max-height:555px">' +
      '<div id="treePanelOfModal">' +
      '<span ng-if="doing_async">...loading...</span>' +
      '<abn-tree tree-data="my_data" tree-control="my_tree" on-select="my_tree_handler(branch)" dbl-click="my_tree_dbl_click(branch)" expand-level="0" initial-selection=""></abn-tree>' +
      '</div>' +
      '</div>' +
      '<div id="userPanel" class="row" style="padding-top:10px;">' +
      '<div style="height:30px">' +
      '<div id="deptRadio" style="display:none">' +
      '<input type="radio" name = "deptType" id="deptUser" ng-model = "deptModel" ng-checked="true" value="true" required ng-click="changeCheck()" style="margin-left:120px"/><label for="deptUser">人员</label>' +
      '<input type="radio" name = "deptType" id="deptPost" ng-model = "deptModel" value="false"  ng-click="changeCheck()" style="margin-left:100px"/><label for="deptPost">岗位</label>' +
      '</div>' +
      '</div>' +
      '<select style="height:206px;" name="from" class="js-multiselect form-control" multiple="multiple" id="deptUserSeletPanelId" ng-click="setUserSelected()" ng-dblclick="userListDblClick()" ng-model="userList" ng-options="item.id as item.viewName for item in users"></select>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="col-sm-1" style="padding: 250px 15px;">' +
      '<button type="button" id="btnRightSelectedId" ng-click="pushToRight()" class="btn btn-block">' +
      '<i class="glyphicon glyphicon-chevron-right"></i>' +
      '</button>' +
      '<button type="button" id="btnLeftSelectedID" ng-click="removeFromRight()"  class="btn btn-block">' +
      '<i class="glyphicon glyphicon-chevron-left"></i>' +
      '</button>' +
      '</div>' +
      '<div class="col-sm-5">' +
      '<a href="#" id="saveAsGroup" style="float:right">保存为组</a>' +
      '<br/>' +
      '<select style="height:555px;" name="to" id="panelMultiselectedId" class="form-control" multiple="multiple" ng-dblclick="selectedListDblClick()" ng-model="selectedList" ng-options="item.id as (item.label+\' (\'+item.typeName+\')\') for item in selectedUsers"></select>' +
      '</div>' +
      '<div class="col-sm-1" style="padding: 250px 15px;">' +
      '<button type="button" id="btnMoveUpSelectedId" class="btn btn-block" ng-click="updown(-1)">' +
      '<i class="glyphicon glyphicon-chevron-up"></i>' +
      '</button>' +
      '<button type="button" id="btnMoveDownSelectedId" class="btn btn-block" ng-click="updown(1)">' +
      '<i class="glyphicon glyphicon-chevron-down"></i>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '</div>',
      priority: 1060,
      link: function (scope, element, attrs) {
      },
      controller: function ($scope, $element, $attrs) {
        //TODO 以下测试使用，需要删除
        /*$scope.init={};
                 $scope.init.user = {};
                 $scope.init.user.compid='670869647114347';*/
        //弹窗启动事件，注意这里是固定id
        //shown
        $('#x5_modal').on('shown.bs.modal', function () {
          if ($scope.options.preProcess) {
            if (!$scope.options.preProcess) {
              console.log('err : preProcess is not Function!')
            } else {
              //调用预处理函数
              var preFunction = eval($scope.options.preProcess)
              var preResult = preFunction.call(this, $scope.options.data)
              //激活对应 tab
              //$("#myTab #"+preResult.class).click();
              var activeTab = x5_dialog_custom_tab[0].type
              //设置已选人员
              $timeout(function () {
                //触发watch事件
                $scope.selectorTab = activeTab
                $scope.selectedUsers = preResult
              })
            }
          } else {
            $('#myTab #company').click()
          }
        })
        //监听页签变化
        $scope.$watch('selectorTab', function (newValue, oldValue) {
          //切换树的数据源
          //if(newValue != oldValue){
          if (!newValue) {
            return
          }
          //激活页签
          $('#myTab li').removeClass('active')
          $('#myTab #' + newValue).parent().addClass('active')
          $('#myTab #' + newValue).css('active')
          //显示人员列表
          $('#userPanel').show()
          $('#treePanelOfModal').height('32vh')
          //部门人员岗位复选框隐藏
          $('#deptRadio').hide()
          //清空人员列表数据
          $scope.users = []
          //清空选择的树节点
          $scope.treeSelected = []
          //清除用户选择标志
          $scope.userSelected = false
          //取消查询按钮禁用样式
          $('#btnKeywordSearchIdOfBar').removeAttr('disabled')
          if (newValue == 'company') {
            $scope.doing_async = true
            userSelector.showCompanyTree().then(function (data) {
              $scope.my_data = data
              //必须这么写，不然无法展开
              $timeout(function () {
                $scope.my_tree.expand_all()
              })
              $scope.doing_async = false
            })
            //隐藏user列表
            $('#userPanel').hide()
            $('#treePanelOfModal').height('100vh')
          }
          if (newValue == 'dept') {
            if ($scope.options.userPanel) {
              if (!$scope.options.userPanel.dept.user) {
                $('#userPanel').hide()
                $('#queryName').hide()
                $('#btnKeywordSearchIdOfBar').addClass('disabled')
                $('#treePanelOfModal').height('100vh')
              } else {
                $('#userPanel').show()
                $('#queryName').show()
                $('#btnKeywordSearchIdOfBar').removeClass('disabled')
                $('#treePanelOfModal').height('32vh')
              }
              //部门岗位复选框展示
              if (!$scope.options.userPanel.dept.post) {
                $('#deptRadio').hide()
              } else {
                $('#deptRadio').show()
              }
            } else {
              $('#userPanel').show()
              $('#queryName').show()
              $('#btnKeywordSearchIdOfBar').removeClass('disabled')
              $('#treePanelOfModal').height('32vh')
              $('#deptRadio').show()
            }
            $scope.doing_async = true
            if (!$scope.searchBar) {
              $scope.searchBar = $scope.init.user.compid
            }
            userSelector.showDepartTree($scope.searchBar).then(function (data) {
              $scope.my_data = data
              //必须这么写，不然无法展开
              $timeout(function () {
                $scope.my_tree.expand_all()
              })
              $scope.doing_async = false
            })
          }
          if (newValue == 'post') {
            if ($scope.options.userPanel) {
              if (!$scope.options.userPanel.post.user) {
                $('#userPanel').hide()
                $('#queryName').hide()
                $('#btnKeywordSearchIdOfBar').addClass('disabled')
                $('#treePanelOfModal').height('100vh')
              } else {
                $('#userPanel').show()
                $('#queryName').show()
                $('#btnKeywordSearchIdOfBar').removeClass('disabled')
                $('#treePanelOfModal').height('32vh')
              }
            }
            $scope.doing_async = true
            userSelector.showPostTree($scope.searchBar).then(function (data) {
              $scope.my_data = data
              $scope.doing_async = false
              //必须这么写，不然无法展开
              $timeout(function () {
                $scope.my_tree.expand_all()
              })
              $scope.doing_async = false
            })
          }
          if (newValue == 'group') {
            if ($scope.options.userPanel) {
              if (!$scope.options.userPanel.group.user) {
                $('#userPanel').hide()
                $('#queryName').hide()
                $('#btnKeywordSearchIdOfBar').addClass('disabled')
                $('#treePanelOfModal').height('100vh')
              } else {
                $('#userPanel').show()
                $('#queryName').show()
                $('#btnKeywordSearchIdOfBar').removeClass('disabled')
                $('#treePanelOfModal').height('32vh')
              }
            }
            $scope.doing_async = true
            userSelector.showTeamTree().then(function (data) {
              $scope.my_data = data
              //必须这么写，不然无法展开
              $timeout(function () {
                $scope.my_tree.expand_all()
              })
              $scope.doing_async = false
            })
          }
          // var h = $("#myTabContent").height()-$(window).height();
          $('#treePanelOfModal').parent().scrollTop(0)
          //	}
        })
        var apple_selected, tree, treedata_avm, treedata_geography
        //树点击事件
        $scope.my_tree_handler = function (branch) {
          $scope.users = []
          $scope.userSelected = false
          var tab = $scope.selectorTab
          //部门下人员
          if (tab == 'dept') {
            //查询节点下属人员
            //$scope.users=[{id:"id1",label:"someone"},{id:"id2",label:"sometwo"},{id:"id3",label:"somethree"},{id:"id4",label:"somefour"}];
            $scope.changeCheck(branch)
          }
          //岗位下人员
          if (tab == 'post') {
            userSelector.showPostUser($scope.compid, branch.pkid).then(function (data) {
              $scope.users = data
            })
          }
          //组人员
          if (tab == 'group') {
            userSelector.showTeamUser(branch.pkid).then(function (data) {
              $scope.users = data
            })
          }
          //树节点选择赋值
          $scope.treeSelected = branch
        }
        $scope.changeCheck = function (branch) {
          if (!branch) {
            //如果未选择树节点，不做处理
            if (!$scope.treeSelected) {
              return
            }
            branch = $scope.treeSelected
          }
          //当人员按钮选中时候
          if ($('#deptUser').is(':checked')) {
            userSelector.showDepartUser($scope.init.user.compid, branch.pkid).then(function (data) {
              $scope.users = data
            })
          }
          //当岗位按钮选中的时候
          if ($('#deptPost').is(':checked')) {
            userSelector.showDepartPost($scope.init.user.compid, branch.pkid).then(function (data) {
              $scope.users = data
            })
          }
        }
        //设置用户选择 标志
        $scope.setUserSelected = function () {
          $scope.userSelected = true
        }
        //树节点双击事件
        $scope.my_tree_dbl_click = function (branch) {
          if (!branch) {
            return
          }
          if (!$scope.selectedUsers) {
            $scope.selectedUsers = []
          }
          if (JSON.stringify($scope.selectedUsers).indexOf(branch.data.id) == -1) {
            //00表示虚拟根节点,没有节点编号是00的
            if (!branch.parentPkid || (branch.parentPkid && branch.parentPkid != '00')) {
              //判断选择人员数量是否超越配置数
              if ($scope.options.userSize) {
                if ($scope.selectedUsers.length >= $scope.options.userSize) {
                  ZW.Model.info('最多只能选中' + $scope.options.userSize + '条数据', '确认', function () {
                  })
                  return
                }
              }
              $scope.selectedUsers.push(branch.data)
            }
          }
        }
        //左侧用户列表双击事件
        $scope.userListDblClick = function () {
          $scope.users.forEach(function (e) {
            for (var i = 0; i < $scope.userList.length; i++) {
              if (e.id == $scope.userList[i]) {
                if (!$scope.selectedUsers) {
                  $scope.selectedUsers = []
                }
                //如果已经选中的列表中没有
                if (JSON.stringify($scope.selectedUsers).indexOf(e.id) == -1) {
                  //判断选择人员数量是否超越配置数
                  if ($scope.options.userSize) {
                    if ($scope.selectedUsers.length >= $scope.options.userSize) {
                      ZW.Model.info('最多只能选中' + $scope.options.userSize + '条数据', '确认', function () {
                      })
                      return
                    }
                  }
                  $scope.selectedUsers.push(e)
                }
              }
            }
          })
        }
        //右侧选中列表双击事件
        $scope.selectedListDblClick = function () {
          for (var i = 0; i < $scope.selectedUsers.length; i++) {
            //如果已选列表不存在
            if (!$scope.selectedList) {
              return
            }
            for (var j = 0; j < $scope.selectedList.length; j++) {
              if ($scope.selectedList[j] == $scope.selectedUsers[i].id) {
                $scope.selectedUsers.splice(i, 1)
              }
            }
          }
        }
        //向右箭头点击事件
        $scope.pushToRight = function () {
          if ($scope.userSelected) {
            //如果已经选中的列表中没有
            $scope.userListDblClick()
          } else if ($scope.treeSelected) {
            //如果树选择节点存在，则移动树节点
            if (!$scope.selectedUsers) {
              $scope.selectedUsers = []
            }
            //树节点无选择时候，直接返回
            if (!$scope.treeSelected.data) {
              return
            }
            if (JSON.stringify($scope.selectedUsers).indexOf($scope.treeSelected.data.id) == -1) {
              //00表示虚拟根节点,没有节点编号是00的(当选择组或者人员的时候,parentPkid不存在)
              if (!$scope.treeSelected.parentPkid || ($scope.treeSelected.parentPkid && $scope.treeSelected.parentPkid != '00')) {
                if ($scope.selectedUsers.length >= $scope.options.userSize) {
                  ZW.Model.info('最多只能选中' + $scope.options.userSize + '条数据', '确认', function () {
                  })
                  return
                }
                $scope.selectedUsers.push($scope.treeSelected.data)
              }
            }
          } else {
            return
          }
        }
        //向左箭头点击事件
        $scope.removeFromRight = function () {
          $scope.selectedListDblClick()
        }
        //上下箭头点击事件
        $scope.updown = function (step) {
          //右侧用户列表不存在
          if (!$scope.selectedUsers || $scope.selectedUsers.length == 0) {
            return
          }
          //右侧列表未选中
          if (!$scope.selectedList || $scope.selectedList.length == 0) {
            return
          }
          //处理挪动
          var origin = $scope.selectedUsers.slice()
          var tempArr = []
          var oldPos = 0
          var userNode = null
          while (origin.length > 0) {
            var o = 0
            var otherNode = origin.shift()
            if (!otherNode) {
              return
            }
            if (otherNode.id == $scope.selectedList[0]) {
              oldPos = $scope.selectedUsers.length - origin.length - 1
              userNode = otherNode
            } else {
              tempArr.push(otherNode)
            }
          }
          var startPos = oldPos + step < 0 ? 0 : oldPos + step
          if (userNode != null) {
            tempArr.splice(startPos, 0, userNode)
          }
          $scope.selectedUsers = tempArr
        }
        //保存为组
        $('#saveAsGroup').bind('click').click(function () {
          //检查已选列表是否全部为人员
          if (!$scope.selectedUsers) {
            ZW.Model.info('请选择数据人员', '确认', function () {
            })
            return
          }
          for (var s = 0; s < $scope.selectedUsers.length; s++) {
            if ($scope.selectedUsers[s].type && $scope.selectedUsers[s].type != 'User') {
              ZW.Model.info('已选数据[' + $scope.selectedUsers[s].label + ']不是人员,不能保存为组', '确认', function () {
              })
              return
            }
          }
          ZW.Model.audit('group_modal', '输入组名称', function () {
            var groupName = $('#groupNameOfModal').val()
            if (!groupName) {
              return
            }
            var groupData = {}
            groupData.name = groupName
            groupData.list = $scope.selectedUsers
            //保存为组
            userSelector.saveAsTeam(groupData).then(function (data) {
              ZW.Model.info('保存为组成功!', '确认', function () {
              })
              $('#groupNameOfModal').val('')
              $('#group_modal').modal('hide')
            })
          })
        })
        //回调函数
        $scope.closeWindow = function () {
          $scope.selectorTab = ''
          if ($scope.options.postProcess) {
            if ($scope.options.postProcess) {
              var postFunction = eval($scope.options.postProcess)
              postFunction.call(this, $scope.selectedUsers)
              //hide
              $('#x5_modal').on('hide.bs.modal', function () {
                //清空已选列表
                $scope.selectedUsers = []
              })
            } else {
              console.log('err : postProcess is not Function')
            }
          }
        }
        //清空查询条件
        $scope.clearCondition = function () {
          $('#queryName').val('')//清空搜索条件
          $scope.selectorTab = ''
        }
        //树初始化
        treedata_avm = []
        $scope.my_data = treedata_avm
        $scope.my_tree = tree = {}
      }
    }
  }])
  /***************************选择框完毕***************************************/
  /**
   * pdf预览
   */

  .directive('zwPdf', ['$parse', '$filter', '$timeout', 'serverConfiguration', '$rootScope', function ($parse, $filter, $timeout, serverConfiguration, $rootScope, APP) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        iframeId: '@',
        ngModel: '='
      },
      template: '<div> ' +
      '<a href="#" class="btn-primary" ' +
      'data-toggle="modal" data-target="#file_upload_modal" ng-click="initUploadOptionsForPDF($event)"> ' +
      '<button type="button" iframe-id="{{iframeId}}" class="btn btn-primary mybutton">上传PDF文件</button>' +
      '</a><br/> ' +
      '<iframe style="width:80%;height:70vh;display:none" name="iframeId" id="{{iframeId}}"></iframe>' +
      '</div>',
      priority: 1070,
      link: function (scope, element, attrs) {
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'n') {
          element.remove()
          return
        } else if (permission == 'r' || permission == 'w') {//移动端不需要打印按钮  所以合并
          $('a', element).hide()
          $timeout(function () {
            if (scope.ngModel) {
              setTimeout(function () {
                //pdf预览初始化居中
                iframeIdList = angular.element('ion-nav-view[nav-view="active"]').find('ion-view[nav-view="active"] iframe')
                /**
                 * * 2018/8/15 9:23  CrazyDong
                 *  变更描述：根据小明要求,将PDF地址从web端改为手机API
                 *  功能说明：
                 */
                //                                iframeIdList[0].src = serverConfiguration.domain+"/static/plugins/pdfjs/web/viewer.html?mobileFlag="+scope.mobileFlag+"&file==/sys/sysAttachment/showImage?pkid="+scope.ngModel;
                iframeIdList[0].src = serverConfiguration.baseApiUrl + 'static/plugins/pdfjs.mobile/web/viewer.html?mobileFlag=' + scope.mobileFlag + '&file==/app/attachment/showImage?pkid=' + scope.ngModel
                iframeIdList[0].style.display = ''
                var scaleWrapper = angular.element('ion-view[nav-view="active"]').find('.scaleWrapper')
                var form = document.getElementsByClassName('zw_formdata').length ? document.getElementsByClassName('zw_formdata') : [{clientWidth: 1}]
                var formwidth = form[form.length - 1].clientWidth
                var scale = (window.innerWidth - 20) / formwidth
                scaleWrapper.css({
                  'transform': 'scale(' + scale + ')',
                  'transform-origin': 'top left',
                  'overfolw': 'scroll'
                })
              }, 1000)
            }

          })
        }
      },
      controller: function ($scope, $element, $attrs) {
        $rootScope.isPdfFlag = true//是pdf公文  不可缩放
        if (!$scope.mobileFlag) {
          $scope.mobileFlag = 1//移动端使用1 后台处理了为1时 pdf文件上的打印下载按钮不显示
        }
        // 上传的弹窗（pdf）--靠回调函数直接完成预览。
        // $scope.initUploadOptionsForPDF = function($event) {
        //     var upload = new uploadModule(initOptions({
        //         multiple: false,
        //         controllerElement:$("[ng-controller=launchController]"),
        //         attachModel : false,
        //         funcParam: {iframe:$($event.target).attr("iframe-id")},
        //         func: function(param, data) {
        //             try{
        //                 if(!data || !data.data[0] || data.data[0].type != '.pdf'){
        //                     ZW.Model.info("请上传PDF格式文件!","确认",function(){});
        //                     return;
        //                 }else{
        //                     /**
        //                      * * 2018/8/15 9:23  郑晋
        //                      *  变更描述：根据小明要求,将PDF公用插件，改为手机端和PC端分离
        //                      *  功能说明：
        //                      */
        //                     $("#"+param.iframe,parent.document.body)[0].src = ctx+"/static/plugins/pdfjs.mobile/web/viewer.html?mobileFlag="+$scope.mobileFlag+"&file=="+ctx+"/sys/attachment/showImage?pkid="+data.data[0].pkid;
        //                     $("#"+param.iframe,parent.document.body).show();
        //
        //                     //绑定model
        //                     //$scope.ngModel = data.data[0].pkid;
        //                     var $parentScope = $scope;
        //                     while($parentScope && !$parentScope.data){
        //                       $parentScope = $scope.$parent;
        //                     }
        //                     var model = $parse($attrs.ngModel);
        //                     model.assign($parentScope,data.data[0].pkid);
        //                 }
        //             }catch(e){
        //                 if(APP.devMode){
        //                     console.log("PDF preview exception :"+e);
        //                 }
        //             }
        //         }
        //     }));
        //     upload.bindShowTagEvent();
        //     upload.bindUploadEvent();
        //     upload.bindCancelEvent();
        // }
      }
    }
  }])
  /**
   * Free coordination
   * 自由协同按钮权限组件
   */
  .directive('zwFcBtn', ['$rootScope', '$parse', '$filter', '$timeout', function ($rootScope, $parse, $filter, $timeout) {
    return {
      restrict: 'AE',
      replace: true,
      priority: 1080,
      link: function (scope, element, attrs) {
        //找到根节点作用用
        var parent = scope
        while (parent.$parent) {
          parent = parent.$parent
        }
        var permission = getPermission(attrs.permission, scope)
        if (permission == 'w') {
          // 0 : 可用
          $rootScope.enableBtn = 0
        } else {
          // 1 : 不可用
          $rootScope.enableBtn = 1
        }
      }
    }
  }])
  /**
   * help 页面使用
   */
  //.directive("dyCompile", ["$compile", function ($compile) {
  //    return {
  //        replace: true,
  //        restrict: 'EA',
  //        link: function (scope, elm, iAttrs) {
  //            var DUMMY_SCOPE = {
  //                    $destroy: angular.noop
  //                },
  //                root = elm,
  //                childScope,
  //                destroyChildScope = function () {
  //                    (childScope || DUMMY_SCOPE).$destroy();
  //                };
  //
  //            iAttrs.$observe("html", function (html) {
  //                if (html) {
  //                    destroyChildScope();
  //                    childScope = scope.$new(false);
  //                    var content = $compile(html)(childScope);
  //                    root.replaceWith(content);
  //                    root = content;
  //                }
  //                scope.$on("$destroy", destroyChildScope);
  //            });
  //        }
  //    };
  //}])
  /*******************以下为过滤器***************************/
  /**
   * 中文大写过滤器
   */
  .filter('cnCapital', function () {
    return function (input) {
      if (!input) return ''
      return $.fn.convertCurrency(input)
    }
  })
  /**
   * 格式化金额
   */
  .filter('numberFormat', function () {
    return function (input, formater) {
      if (!input && input !== 0) return ''
      var formaterJson = eval('(' + formater + ')')
      return $.fn.numberFormat(input, formaterJson) + ' '
    }
  })
  /**
   * 银行账户格式化
   */
  .filter('bankFormat', function () {
    return function (input, formater) {
      if (!input) return ''
      if (!formater) {
        formater = {}//默认用空格格式化
        formater.separator = ' '
        formater.size = 4
      } else {
        formater = eval('(' + formater + ')')
        if (!formater.separator) {
          formater.separator = ' '
        }
        if (!formater.size) {
          formater.size = 4
        }
      }

      var retStr = ''
      while (input.length > formater.size) {
        retStr += input.substr(0, formater.size) + formater.separator
        input = input.substr(formater.size)
      }
      retStr += input
      //console.log(retStr);
      return retStr
    }
  })
  /**
   * 首页自定义查询过滤数据filter
   *
   */
  .filter('customQuery', function () {
    return function (AList, param) {
      if (typeof(param) === 'string') {
        param = eval('(' + param + ')')
      }
      if (!AList || !AList.length) {
        return AList
      }
      var retList = AList.slice(0)

      //处理自定义日期
      if (param.custDate) {
        switch (param.custDate) {
          //本周
          case '0':
            var d = new Date()
            var w = d.getDay()
            var n = (w == 0 ? 7 : w) - 1
            var sd = d.setDate(d.getDate() - n)
            var sDay = d.getFullYear() + '-' + ((d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + ((d.getDate()) < 10 ? '0' + (d.getDate()) : (d.getDate()))
            var ed = d.setDate(d.getDate() + 6)
            var eDay = d.getFullYear() + '-' + ((d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + ((d.getDate()) < 10 ? '0' + (d.getDate()) : (d.getDate()))
            param.startDate = sDay
            param.endDate = eDay
            break
          //最近一周
          case '1':
            var startDate = $.fn.DateAdd('d', -6)
            var endDate = new Date()
            param.startDate = $.fn.DateFormat(startDate)
            param.endDate = $.fn.DateFormat(endDate)
            break
          //上一周
          case '2':
            var d = new Date()
            var w = d.getDay()//今天是本周的第几天
            var startDate = $.fn.DateAdd('d', -(6 + w))
            var endDate = $.fn.DateAdd('d', -w)
            param.startDate = $.fn.DateFormat(startDate)
            param.endDate = $.fn.DateFormat(endDate)
            break
          //最近一月 ""
          case '3':
            var startDate = $.fn.DateAdd('d', -30)
            var endDate = new Date()
            param.startDate = $.fn.DateFormat(startDate)
            param.endDate = $.fn.DateFormat(endDate)
            break
          //上一月
          case '4':
            var d = new Date()
            startDate = d.getFullYear() + '-' + d.getMonth() + '-1'
            //当前日期  减去 (当前天数 + 1) = 上月最后一天
            endDate = $.fn.DateFormat($.fn.DateAdd('d', -(d.getDate())))
            param.startDate = $.fn.DateFormat(startDate)
            param.endDate = $.fn.DateFormat(endDate)
            break
        }
      }
      //发起时间(开始时间)
      if (param.startDate) {
        //由于选择日期不带时分秒,而被过滤的数据带时分秒,导致过滤失败.
        param.startDate = param.startDate + ' 00:00:00'
        var tempStartDateList = []
        for (var s = 0; s < retList.length; s++) {
          if (retList[s].createDate >= param.startDate) {
            tempStartDateList.push(retList[s])
          }
        }
        angular.copy(tempStartDateList, retList)
      }

      //发起时间(结束时间)
      if (param.endDate) {
        //由于选择日期不带时分秒,而被过滤的数据带时分秒,导致过滤失败.
        param.endDate = param.endDate + ' 23:59:59'
        var tempEndDateList = []
        for (var e = 0; e < retList.length; e++) {
          if (retList[e].createDate <= param.endDate) {
            tempEndDateList.push(retList[e])
          }
        }
        angular.copy(tempEndDateList, retList)
      }

      //过滤事项状态(与解晓明确认，过滤事项必须单独一个，不可为多个，2017年8月8日17:01:29)
      if (param.taskStatus) {
        var tempTaskStatusList = []
        for (var t = 0; t < retList.length; t++) {
          if (retList[t].taskStatus == param.taskStatus) {
            tempTaskStatusList.push(retList[t])
          }
        }
        angular.copy(tempTaskStatusList, retList)
      }

      //过滤超期
      if (param.overDue) {
        var tempOverDueList = []
        for (var t = 0; t < retList.length; t++) {
          if (retList[t].overDue == param.overDue) {
            tempOverDueList.push(retList[t])
          }
        }
        angular.copy(tempOverDueList, retList)
      }
      //过滤事项分类
      if (param.typeId) {
        var tempTypeIdList = []
        for (var i = 0; i < retList.length; i++) {
          if (param.typeId.indexOf(retList[i].typeId) >= 0) {
            tempTypeIdList.push(retList[i])
          }
        }
        angular.copy(tempTypeIdList, retList)
      }

      //过滤关键字
      if (param.keyWord) {
        var tempKeyWordList = []
        for (var k = 0; k < retList.length; k++) {
          //与解晓明确认 关键字只匹配title 2017年11月13日09:59:33
          //以下代码为全部属性匹配
          /*for(var o in retList[k]){
                     if (retList[k][o] && retList[k][o].indexOf(param.keyWord) >= 0) {
                     tempKeyWordList.push(retList[k]);
                     break;
                     }
                     }*/
          if (retList[k].subject && retList[k].subject.indexOf(param.keyWord) >= 0) {
            tempKeyWordList.push(retList[k])
          }
        }
        angular.copy(tempKeyWordList, retList)
      }

      //过滤发起人
      if (param.creator) {
        var tempCreatorList = []
        for (var c = 0; c < retList.length; c++) {
          var json = JSON.stringify(param.creator)
          if (json.indexOf(retList[c].creatorId) >= 0) {
            tempCreatorList.push(retList[c])
          }
        }
        angular.copy(tempCreatorList, retList)
      }
      return retList
    }
  })
  /**
   * 发起时间过滤器 （首页列表发起时间计算）
   * author:刘天奇
   */
  .filter('retention', function () { //可以注入依赖
    return function (date) {
      var year = 0
      var month = 0
      var day = 0
      var hour = 0
      var minute = 0
      var second = 0
      var timearr = date.replace(' ', ':').replace(/\:/g, '-').split('-')
      // 单独提取传入时间的出年月日小时
      for (i = 0; i < timearr.length; i++) {
        if (i == 0) {
          year = timearr[i]
        }
        if (i == 1) {
          month = timearr[i]
        }
        if (i == 2) {
          day = timearr[i]
        }
        if (i == 3) {
          hour = timearr[i]
        }
        if (i == 4) {
          minute = timearr[i]
        }
        if (i == 5) {
          second = timearr[i]
        }
      }
      // 当前时间的年月日
      var curYear = new Date().getFullYear()
      var curMonth = new Date().getMonth() + 1
      var curDay = new Date().getDate()
      var curHour = new Date().getHours()
      var curMinute = new Date().getMinutes()
      var curSecond = new Date().getSeconds()
      // 当前时间的毫秒
      var currentTime = new Date(Date.UTC(curYear, curMonth, curDay, curHour, curMinute, curSecond))
      // jsp 传入时间的毫秒
      var dataTime = new Date(Date.UTC(year, month, day, hour, minute, second))
      // 时间差
      var time = currentTime - dataTime
      //计算出相差天数
      var days = Math.floor(time / (24 * 3600 * 1000))
      //计算天数后剩余的毫秒数
      var leave1 = time % (24 * 3600 * 1000)
      //计算出小时数
      var hours = Math.floor(leave1 / (3600 * 1000))
      return '已发起' + days + '天' + hours + '小时'
    }
  })


function getPermission(permissionPath, scope) {
  try {
    var permission = scope.permission || scope.$parent.permission || scope.$parent.$parent.permission
    if (!permission || !permissionPath) return 'w'
    var p = eval(permissionPath)
  } catch (e) {
    /*console.info("获取权限出现了异常 permissionPath:" + permissionPath)
         console.info(permission);
         console.info(e);*/
  }
  return p || 'r'
}
