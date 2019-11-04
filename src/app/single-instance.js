/**
 *  2018/4/9 CrazyDong
 *  变更描述：创建单例类
 *  功能说明：应用的单例写在这个,例如:数据库
 */
(function () {
    'use strict';

    var app = angular.module('community.services');

    /**
     * * 2018/4/9 14:46  CrazyDong
     *  变更描述：实现单例模式
     *  功能说明：添加数据库单例
     */
    app.factory("DBSingleInstance", function (APP) {

        var OAdb = null;//同步数据库对象
        var timeDB = null;//手机日志数据库对象

        //初始化数据库
        function initDb(){
            //初始化同步数据库
            OAdb = openDatabase('OA', '1.0', 'test db', 2 * 1024 * 1024);//创建数据库
            //建立SyncData表
            OAdb.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS SyncData(name TEXT)', [], function (tx, res) {

                }, function (tx, err) {

                })
            });

            //初始化手机日志数据库
            timeDB = openDatabase('TIME','1.0','time db',20 * 1024 * 1024);
            timeDB.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS TimeData(userPkid TEXT,' +
                    'userName TEXT,platform TEXT,url TEXT,makeTime TEXT,logType TEXT)', [], function (tx, res) {

                }, function (tx, err) {

                })
            });

        }

        //同步功能时,返回同步数据库的对象
        function getSyncDb(){
            if(OAdb == null){
                OAdb = openDatabase('OA', '1.0', 'test db', 2 * 1024 * 1024);//创建同步数据库
            }
            return OAdb;
        }

        //返回手机日志数据库对象
        function getTimeDb(){
            if(timeDB == null){
                timeDB = openDatabase('TIME','1.0','time db',20 * 1024 * 1024);//创建手机日志数据库
            }
            return timeDB;
        }

        return {
            initDb : initDb, // 初始化数据库
            getSyncDb : getSyncDb , // 同步功能时,返回同步数据库的对象
            getTimeDb : getTimeDb //返回手机日志数据库对象
           };
    });

})();
