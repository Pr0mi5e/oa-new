/**
 * Created by chris.zheng on 2017/4/10.
 */

(function () {
  'use strict';

  var app = angular.module('community.constant', []);

  app.constant('auth_events', {
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized',
    notServiceResponse: 'service-not-response',
    notNetConnected: 'net-not-connected',
    notVpnConnected: 'vpn-not-connected',
    successSysErr: "success-err-state",
    systemErr: 'system-error',
    token: 'token',
    userId: 'user-id',
    name: 'name',
    inputName: "input-name",
    authorization: "user-authorization",
    loginEnglishName: "login-name",

    followed: "followed",
    roleList: "roleList",
    logRecode: "log-recode",
    setSignature: "set-signature"
  });

  app.constant('user_roles', {
    admin: 'admin-role',
    public: 'public-role'
  });
  app.constant('timeout', {
    max: 50000,
    timeOut: 50500,
    pullDown: 200,
    animDuration: 300
  });

  /*显示设置常量*/
  app.constant('set_home_page', {
    waitWork: '待办',
    work: '工作',
    information: '消息',
    mine: '我的',

    setHomeKey: 'set-home-page',
    requestTimeDbKey: 'request-time-db-key'
  });

  /*待办常量*/
  app.constant('wait_work', {
    sizerStateKey: 'sizer_state_key',
    sizerTypeKey: 'sizer_type_key',
    sizerWorkStateKey: 'sizer_work_state_key',
    sizerWorkTypeKey: 'sizer_work_type_key'
  });
  /*待办常量*/
  app.constant('work', {
    sizerStateKey: 'sizer_state_key',
    sizerTypeKey: 'sizer_type_key'
  });

  /*我的常量*/
  app.constant('mine', {
    "gestureLockKey": "gesture_lock_key",
    "approveSwitchKey": "approve_switch_key",
    "signatureSwitchKey": "signature_switch_key",
    "pictureAvatar": "picture_avatar",
    "userName": "user_name",
    "pwLockKey": "pw_lock_key",
    "isPW": "is_pw",
    "isOne": "is_one",
    "jPushId": "jPush_id"
  });

  /*公用常量*/
  app.constant("public_constant", {
    "responseError400": "response_error_400",
    "loginOnce": 'already-login',
    "tokenErr": 'token_err',
    "serviceErr": 'service_err'
  });

  /*表单常量*/
  app.constant("form_constant", {
    "formWidth": "form-width"
  });

  app.constant('DB_CONFIG', {
    jPush: {
      id: 'key',
      pushId: {type: 'text', null: false}
    }
  });
})();
