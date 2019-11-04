gulp build --env staging_yk

#工程绝对路径
set project_path=D:/code/zhongwang/oa-yk/zw-oa/
exportApkPath=${project_path}/platforms/android/build/outputs

#echo ${project_path}/resources_default ${project_path}/resources /s /e
#C:/WINDOWS/system32/xcopy /A /Y ${project_path}/resources_default ${project_path}/resources /s /e
#xcopy /A /Y D:\ProjectCode\OA\Mobile\trunk\resources_default D:\ProjectCode\OA\Mobile\trunk\resources /s /e
#echo "Delete history files："${exportApkPath}
#rmdir /s/q ${exportApkPath}

ionic build android --release --prod

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${project_path}/demo.keystore ${exportApkPath}/apk/android-release-unsigned.apk com.chinaZhongWang.community

C:/android-sdk-windows/build-tools/25.0.2/zipalign -v 4 ${exportApkPath}/apk/android-release-unsigned.apk ${exportApkPath}/apk/oa_uat.apk

exit 0
