gulp build --env production_yk

#工程绝对路径
project_path=D:/code/zhongwang/oa-yk/zw-oa
exportApkPath=${project_path}/platforms/android/build/outputs

ionic build android --release --prod

echo ${project_path}/release_yk.keystore
echo ${exportApkPath}/apk/oa_yk.apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${project_path}/release_yk.keystore ${exportApkPath}/apk/android-release-unsigned.apk com.zhongwang_yk.community

C:/android-sdk-windows/build-tools/25.0.2/zipalign -v 4 ${exportApkPath}/apk/android-release-unsigned.apk ${exportApkPath}/apk/oa_yk.apk

# exit 0
