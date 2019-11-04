keytool -genkey -alias com.chinaZhongWang.community -keyalg RSA -validity 40000 -keystore demo.keystore

gulp build --env production

ionic build android --release --prod

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release_ly.keystore platforms\android\build\outputs\apk\android-release-unsigned.apk com.chinaZhongWang.community

zipalign -v 4 D:\ProjectCode\OA\Mobile\trunk\platforms\android\build\outputs\apk\android-release-unsigned.apk D:\ProjectCode\OA\Mobile\trunk\platforms\android\build\outputs\apk\oa.apk




keytool -genkey -alias com.zhongwang_yk.community -keyalg RSA -validity 40000 -keystore release_yk.keystore

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release_yk.keystore platforms\android\build\outputs\apk\android-release-unsigned.apk com.zhongwang_yk.community

https://zwoa.geshuinfo.cn:1443/file/oa.1.1.plist