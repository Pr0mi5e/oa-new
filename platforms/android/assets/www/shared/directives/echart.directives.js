/**
 *  2018/5/16 CrazyDong
 *  变更描述：
 *  功能说明：echart功能指令
 */
(function () {
    'use strict';
    var app = angular.module('community.controllers.echarts',[]);
    app.directive('pieCharts',function($timeout,appUtils){
        return{
            restrict:'AE',
            scope :{
                source:'=',
                width:'='
            },
            template:'<div></div>',
            controller: function($scope){

            },
            link:function(scope,element,attr){
                var formData = scope.source;
                var colorArr = ["#588cd5","#f5994e","#c15150","#59678c","#caab02",
                                 "#7eb00a","#6f5453","#c14089","#f79c4e","#df68aa",
                                 "#2ec8ca","#b6a2df","#5bb0f0","#4d5e8c","#ffb880",
                                 "#d87b80","#6f5554","#8d99b3","#f58d39","#dc69aa"];
                var formDataArr = [];
                var radiusSize = '70%';//默认手机70%  ipad展示2为80% ipad展示4为56%
                var centerPosition = ['46%', '50%'];//默认手机['50%', '50%'],ipad展示2为['42%', '50%'] ipad展示4为['50%', '50%']
                for (var i = 0; i < formData.length; i++) {
                   formDataArr.push({value: formData[i].CALSUM, name: formData[i].GYBZBD,itemStyle:{
                       normal:{
                           color: colorArr[i]
                       }
                   }});
                }
                var chart =  element.find('div')[0];
                if(ionic.Platform.isIPad()){
                    chart.style.height =230+'px';//ipad 200px
                    switch (window.orientation){
                        case 0:
                            chart.style.width =scope.width * 0.5 + 'px';
                            radiusSize = '80%';
                            centerPosition = ['42%', '50%'];
                            break;
                        case 90:
                            chart.style.width =scope.width * 0.25 +'px';
                            radiusSize = '40%';
                            centerPosition = ['42%', '50%'];
                            break;
                        case -90:
                            chart.style.width =scope.width * 0.25 +'px';
                            radiusSize = '40%';
                            centerPosition = ['42%', '50%'];
                            break;
                    }
                }else{
                    chart.style.width =scope.width +'px';
                    chart.style.height =300+'px';//手机300px
                }
                initEchart();

                function initEchart(){
                    chart.style.margin ='0 auto';
                    var myChart = echarts.init(chart);
                    var option = {
//                        tooltip : {
//                            trigger: 'item',
//                            formatter: "{b} <br/> {c} ({d}%)"
//                        },
                        calculable : true,
                        series : [
                            {
                                name:'访问来源',
                                type:'pie',
                                radius : radiusSize,
                                center: centerPosition,
                                data : formDataArr
                            }
                        ]
                    };
                    myChart.setOption(option);
                    myChart.resize();
                    //点击事件
                    myChart.on("click", function (param){
                        appUtils.tips(param.data.name + ":" +appUtils.outputMoney(param.value.toString()) + "(" +param.percent + "%)",1)
                    });
                }

                //监听横竖屏
                window.addEventListener("orientationchange", function(){
                    $timeout(function () {
                        if(ionic.Platform.isIPad()){
                            switch (window.orientation){
                                case 0:
                                    chart.style.width =scope.width * 0.5 +'px';
                                    radiusSize = '80%';
                                    centerPosition = ['42%', '50%'];
                                    break;
                                case 90:
                                    chart.style.width =scope.width * 0.25 +'px';
                                    radiusSize = '40%';
                                    centerPosition = ['42%', '50%'];
                                    break;
                                case -90:
                                    chart.style.width =scope.width * 0.25 +'px';
                                    radiusSize = '40%';
                                    centerPosition = ['42%', '50%'];
                                    break;
                            }

                            initEchart();
                        }
                    },100)

                });


            }
        };
    });
})();
