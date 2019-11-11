(function ($) {
    Number.prototype.toFixed = function (digits) {
        if (!digits) {
            digits = 0;
        }
        return (parseInt(this * Math.pow(10, digits) + 0.5) / Math.pow(10, digits)).toString();
    };
    $.fn.extend({
        /**
         * 格式化数据
         * @param scope
         * @param modelName 目標modelName
         * @param exp     函数表达式
         * subFormDiv 子表div
         */
        doMath: function (scope, modelName, funcexp) {
            var value = this.replaceName2Value(funcexp, scope);
            try {
            /**
             * 2018-10-12 tyw 
             * 问题描述：bug2768:
             *  采购内容申请表_20180228
                图1，明细行 数量5697.9X单价2.65=总价15099.435。 显示总价为15099.43。小数位第三位并没进位。
                图2，合计总价金额是按照15099.435求的和，而且做了四舍五入。金额正确。
             * 解决方法：参照pc端，重写toFixed方法，取精度后一位数字，再进行四舍五入
             */
                // value = eval("("+value+")").toFixed(scope.decimalValue);
                var dd = Math.pow(10, scope.decimalValue + 1);
                value = ((eval("(" + value + ")") * dd + 0.5) / dd).toFixed(scope.decimalValue);
            }
            catch (e) {
                return true;
            }
            if (/^(Infinity|NaN)$j/i.test(value))return true;

            eval("scope." + modelName + "=value");
        },
        replaceName2Value: function (exp, scope) {
            //{手机数字(item.sj)}*2
            //FormMath.sum([合计(data.sub.zbcs.hj)])  //"FormMath.sum([人数(data.csbdjs.sub_myclass.rs)])"
            if (!exp)return 0;
			var that = this;
            var reg = /\{.*?\(([data.main|data.sub|item].*?)\)\}/g;
            exp = exp.replace(reg, function () {
                var name = arguments[1],
                    value = 0;
                var object;
                //子表
                if (scope) {
                    //子表统计计算情况。多行数据
                    if (name.split(".").length > 3) {
                        var valArray = [];
                        var subMsg = name.split(".");
                        var fieldName = subMsg[3];
                        var subTableSrc = name.replace("." + fieldName, "");
                        var rows = eval('scope.' + subTableSrc);
                        for (var i = 0, row; row = rows[i++];) {
                            valArray.push(row[fieldName]);
                        }
                        value = valArray.join(",");
                    } else {
                        var val = eval('scope.' + name);
						val = that.toCashNumber(val);
                        if (!isNaN(val) && "" != val) value = val;
                    }
                }
                return value;
            });
            return exp;
        },
        toCashNumber: function (x) {
            if (x === null || x === undefined || x === '')
                return '';
            if (typeof x == "string") {
                x = x.replace(/,/g, "");
            }
            var match = x.toString().match(/([$j|￥])\d+\.?\d*/);
            if (match) {
                x = x.replace(match[1], '');
            }
            return Number(x);
        },
        /**
         * 格式化金额
         */
        toNumber: function (v) {
            if (v && v != '') {
                v = v.toString();
                if (v.indexOf(',') == -1)
                    return v;
                var ary = v.split(',');
                var val = ary.join("");
                return val;
            }
            return 0;
        },
        /**
         * 數字格式化
         *        货币                千分位
         * {"isShowCoin":true,"isShowComdify":true,"coinValue":"￥","capital":false,"intValue":"2","decimalValue":"2"}
         * @returns {String} 返回的数据
         */
        numberFormat: function (value, formatorJson, nocomdify) {
            var coinvalue = formatorJson.coinValue,
                iscomdify = formatorJson.isShowComdify,
                decimallen = this.toNumber(formatorJson.decimalValue),
                intLen = this.toNumber(formatorJson.intValue);

            if (value == "undefined") return;
            value = this.toNumber(value) + "";

            if (intLen > 0) {
                var ary = value.split('.');
                var intStr = ary[0];
                var intNumberLen = intStr.length;
                if (intNumberLen > intLen) {
                    intStr = intStr.substring(intNumberLen - intLen, intNumberLen);
                }
                value = ary.length == 2 ? intStr + "." + ary[1] : intStr;
            }

            // 小数处理
            if (decimallen > 0) {
                if (value.indexOf('.') != -1) {
                    var ary = value.split('.');
                    var temp = ary[ary.length - 1];
                    if (temp.length > 0 && temp.length < decimallen) {
                        var zeroLen = '';
                        for (var i = 0; i < decimallen
                        - temp.length; i++) {
                            zeroLen = zeroLen + '0';
                        }
                        value = value + zeroLen;
                    } else if (temp.length > 0 && temp.length > decimallen) {
                        temp = temp.substring(0, decimallen);
                        ary[ary.length - 1] = temp;
                        value = ary.join(".");
                    }
                } else {
                    var zeroLen = '';
                    for (var i = 0; i < decimallen; i++) {
                        zeroLen = zeroLen + '0';
                    }
                    value = value + '.' + zeroLen;
                }
            }
            //处理千分位。
            if (iscomdify) {
                value = this.formatComdify(value);
            }

            // 添加货币标签
            if (coinvalue != null && coinvalue != '') {
                value = coinvalue + value;
            }

            return value;
        },
        /**
         * 格式化千分位
         */
        formatComdify: function (num) {
            //return (num + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$j)/g, '$j&,');
            return ("" + num).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, "$1,");
        },

        /**
         * 数字转成金额
         */
        convertCurrency: function (currencyDigits) {

            var tmp = this.toCashNumber(currencyDigits);
            if (isNaN(tmp))return currencyDigits;

            var MAXIMUM_NUMBER = 99999999999.99;
            var CN_ZERO = "零";
            var CN_ONE = "壹";
            var CN_TWO = "贰";
            var CN_THREE = "叁";
            var CN_FOUR = "肆";
            var CN_FIVE = "伍";
            var CN_SIX = "陆";
            var CN_SEVEN = "柒";
            var CN_EIGHT = "捌";
            var CN_NINE = "玖";
            var CN_TEN = "拾";
            var CN_HUNDRED = "佰";
            var CN_THOUSAND = "仟";
            var CN_TEN_THOUSAND = "万";
            var CN_HUNDRED_MILLION = "亿";
            var CN_SYMBOL = "";
            var CN_DOLLAR = "元";
            var CN_TEN_CENT = "角";
            var CN_CENT = "分";
            var CN_INTEGER = "整";
            var integral;
            var decimal;
            var outputCharacters;
            var parts;
            var digits, radices, bigRadices, decimals;
            var zeroCount;
            var i, p, d;
            var quotient, modulus;
            currencyDigits = currencyDigits.toString();
            if (currencyDigits == "") {
                return "";
            }
            if (currencyDigits.match(/[^,.\d]/) != null) {
                return "";
            }
            if ((currencyDigits)
                    .match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))/) == null) {
                    //.match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$j/) == null) {
                return "";
            }
            currencyDigits = currencyDigits.replace(/,/g, "");
            currencyDigits = currencyDigits.replace(/^0+/, "");

            if (Number(currencyDigits) > MAXIMUM_NUMBER) {
                return "";
            }

            parts = currencyDigits.split(".");
            if (parts.length > 1) {
                integral = parts[0];
                decimal = parts[1];

                decimal = decimal.substr(0, 2);
            } else {
                integral = parts[0];
                decimal = "";
            }

            digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE,
                CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
            radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
            bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
            decimals = new Array(CN_TEN_CENT, CN_CENT);

            outputCharacters = "";

            if (Number(integral) > 0) {
                zeroCount = 0;
                for (i = 0; i < integral.length; i++) {
                    p = integral.length - i - 1;
                    d = integral.substr(i, 1);
                    quotient = p / 4;
                    modulus = p % 4;
                    if (d == "0") {
                        zeroCount++;
                    } else {
                        if (zeroCount > 0) {
                            outputCharacters += digits[0];
                        }
                        zeroCount = 0;
                        outputCharacters += digits[Number(d)] + radices[modulus];
                    }
                    if (modulus == 0 && zeroCount < 4) {
                        outputCharacters += bigRadices[quotient];
                    }
                }
                outputCharacters += CN_DOLLAR;
            }

            if (decimal != "") {
                for (i = 0; i < decimal.length; i++) {
                    d = decimal.substr(i, 1);
                    /**
                     * * 2018/7/10 11:16  CrazyDong
                     *  变更描述：当"角"出现"0"时,显示"零"
                     *  功能说明：
                     */
                    if (d != "0") {
                        outputCharacters += digits[Number(d)] + decimals[i];
                    }else if(d == "0"){
                        outputCharacters += digits[Number(d)];
                    }
                }
            }

            if (outputCharacters == "") {
                outputCharacters = CN_ZERO + CN_DOLLAR;
            }
            //PC未改之前的版本start
            // if (decimal == "" || decimal == "0" || ((Number(decimal) * 100).toString()).substr(1,1) =="0") {
            //     outputCharacters += CN_INTEGER;
            // }
            //PC未改之前的版本end
          
          //新更改的  在金额上判断是否有 ‘整’ 字 
          if (decimal == "" || decimal == "0" || decimal == "00" || (decimal.toString().length==1)  || (decimal.toString().length>1 && (Number(decimal).toString()).substr(1,1) =="0")) {
            outputCharacters += CN_INTEGER;
          }
            outputCharacters = CN_SYMBOL + outputCharacters;
            return outputCharacters;
		},
        
		/**
		 * 日期加法
		 */
		DateAdd : function(strInterval, Number) {
		    var dtTmp = new Date();
		    var ret = "";
		    switch (strInterval) {
		        case 's' :ret = new Date(Date.parse(dtTmp) + (1000 * Number)); break;
		        case 'n' :ret = new Date(Date.parse(dtTmp) + (60000 * Number)); break;
		        case 'h' :ret = new Date(Date.parse(dtTmp) + (3600000 * Number)); break;
		        case 'd' :ret = new Date(Date.parse(dtTmp) + (86400000 * Number)); break;
		        case 'w' :ret = new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number)); break;
		        case 'q' :ret = new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); break;
		        case 'm' :ret = new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); break;
		        case 'y' :ret = new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds()); break;
        }
		    return ret.getFullYear() + "-" +(ret.getMonth()+1) + "-" +ret.getDate();
		},
		DateFormat : function(dataStr){
			if(dataStr instanceof Date){
				dataStr = dataStr.getFullYear() + "-" +(dataStr.getMonth()+1) + "-" +dataStr.getDate();
			}
			var arr = dataStr.split("-");
			if(arr[1] && arr[1].length == 1){
				arr[1] = '0' + arr[1];
			}
			if(arr[2] && arr[2].length == 1){
				arr[2] = '0' + arr[2];
			}
			return arr[0] + '-' + arr[1] + '-' + arr[2];
		},
		loadZwMask : function(){
			$("#zwMaskDiv").show();
		},
		removeZwMask : function(){
			$("#zwMaskDiv").hide();
		},
		//去掉数字字符串中的特殊字符(截取特殊字符前的数字)
		formatNumStr : function(numStr){
			if($.trim(numStr) == ''){
				return numStr;
			}
            var  arr = numStr.match(/^(\d+)\D?.*/);
            if(arr==null){
                return numStr;
            }else{
            	return arr[1];
			}
		},
		/*
		*从表数据排序, 以序号为排序依据, 对从表的数组对象排序
		* target 需要排序的数组对象
		* operator 排序方式 asc 升序, desc 降序,默认升序
		*/
		sortSubTable : function(target,sortCol,operator){
            var sortByXH_ASC = function(a,b){
                // return a.xh1 - b.xh1;
                return getSortColVal(a, sortCol) - getSortColVal(b, sortCol);
            };
            var sortByXH_DESC = function(a,b){
                return getSortColVal(b, sortCol) - getSortColVal(a, sortCol);
            };
            function getSortColVal(obj, sortCol) {
                return obj[sortCol];
            }
            if(operator == 'desc'){
                return target.sort(sortByXH_DESC);
            }else{
                return target.sort(sortByXH_ASC);
            }
		}
		/*sortByXH_ASC : function(a,b, sortCol){
			// return a.xh1 - b.xh1;
			return getSortColVal(a, sortCol) - getSortColVal(b, sortCol);
		},
		,
		*/
    })
})(jQuery)
