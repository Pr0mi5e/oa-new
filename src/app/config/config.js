angular.module("community.configs", [])

.constant("baseConfiguration", {
	"url": "https://www.example.com",
	"debug": false
})

.constant("APP", {
	"devMode": true,
	"VPNFlag": true,
	"forgetPwFlag": true,
	"notificationFlag": false
})

.constant("serverConfiguration", {
	"baseApiUrl": "http://172.16.9.23:8080/",
	"SSOUrl": "http://172.16.9.23:9090",
	"domain": "http://172.16.9.23:8080",
	"webSocket": "ws://172.16.9.23:8080/sys/webSocketServer"
})

;