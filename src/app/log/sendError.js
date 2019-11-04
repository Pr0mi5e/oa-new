/**
 * 前台日志抓取
 * @type {(message?: any, ...optionalParams: any[]) => void}
 */
// var consoleError = window.console.error;
// window.console.error = function () {
//   'use strict'
//   var waitWork = 'tab/view-form/';  // 从‘待办列表’进入表单详情页
//   var doneWork = 'tab/viewFormWork/work/';  // 从‘已办列表’和‘其他应用中列表页’进入表单详情页
//   var search = 'tab/searchWork/'
//   if(window.location.hash.indexOf(search) > 0){
//     // var oldErrorMsg = localStorage.getItem('errorMsg') ? localStorage.getItem('errorMsg') : '';
//     // var errorMsg = oldErrorMsg + arguments[0];
//     // localStorage.setItem('errorMsg', errorMsg);
//     // console.log(errorMsg);
//     window.alert(arguments[0]);
//   }
//   consoleError && consoleError.apply(window, arguments);
// };
