---
title: android life listener 
description: 监听android里面CordovaPlugin类的生命周期.
Installation: ionic plugin add https://github.com/liujingdong/LifeListener.git
Supported Platforms: android
usage:
 lifeListener();

function lifeListener(){
	LifeListener.lifeListener("life",function(msg){
		//App在后台时,执行
		if(msg == "onStop" || msg == "onPause"){
			//逻辑
		}else if(msg == "onResume" || msg == "onStart"){//App重新进入活跃状态时,执行
			//逻辑
		}
		lifeListener();//递归
	},null);
}

需要递归调取,不然只能监听一次
---

