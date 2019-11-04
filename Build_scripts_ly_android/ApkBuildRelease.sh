gulp build --env production

#工程绝对路径
project_path=D:/code/zhongwang/oa-ly/zw-oa
exportApkPath=${project_path}/platforms/android/build/outputs

ionic build android --release --prod

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${project_path}/release_ly.keystore ${exportApkPath}/apk/android-release-unsigned.apk com.chinaZhongWang.community

C:/android-sdk-windows/build-tools/25.0.2/zipalign -v 4 ${exportApkPath}/apk/android-release-unsigned.apk ${exportApkPath}/apk/oa_ly.apk

exit 0
