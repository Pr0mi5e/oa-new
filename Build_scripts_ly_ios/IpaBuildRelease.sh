#工程绝对路径
project_path=/Users/zwmac/Documents/code/oa-ly/zw-oa

cd ${project_path}

cp -r ${project_path}/resources_ly/ios ${project_path}/resources
cp -r ${project_path}/resources_ly/icon.png ${project_path}/resources

#生成js版本
gulp build --env production
ionic build ios --release --prod


#工程名 将XXX替换成自己的工程名
project_name=OA

#scheme名 将XXX替换成自己的sheme名
scheme_name=OA

#打包模式 Debug/Release
development_mode=Release

#build文件夹路径
build_path=${project_path}/platforms/ios

#导出.ipa文件所在路径
exportIpaPath=${project_path}/Build_scripts_ly_ios/IPADir/${development_mode}

echo "Delete history files："${exportIpaPath}
rm -rf ${exportIpaPath}

#plist文件所在路径
exportOptionsPlistPath=${project_path}/Build_scripts_ly_ios/ExportOptions.plist

echo '///-----------'
echo '/// 正在清理工程:'${build_path}/${project_name}.xcodeproj
echo '///-----------'
xcodebuild \
clean \
-project ${build_path}/${project_name}.xcodeproj || exit

echo '///--------'
echo '/// 清理完成'
echo '///--------'
echo ''

echo '///-----------'
echo '/// 正在编译工程:'${development_mode}
echo '///-----------'
xcodebuild \
archive -project ${build_path}/${project_name}.xcodeproj \
-scheme ${scheme_name} -allowProvisioningUpdates \
-configuration ${development_mode} \
-archivePath ${build_path}/${project_name}.xcarchive || exit

echo '///--------'
echo '/// 编译完成'
echo '///--------'
echo ''

echo '///----------'
echo '/// 开始ipa打包:'${exportOptionsPlistPath}
echo '///----------'
xcodebuild -exportArchive -archivePath ${build_path}/${project_name}.xcarchive \
-configuration ${development_mode} \
-exportPath ${exportIpaPath} \
-exportOptionsPlist ${exportOptionsPlistPath} \
-quiet || exit

if [ -e $exportIpaPath/$scheme_name.ipa ]; then
echo '///----------'
echo '/// ipa包已导出'
echo '///----------'
open $exportIpaPath
else
echo '///-------------'
echo '/// ipa包导出失败 '
echo '///-------------'
fi
echo '///------------'
echo '/// 打包ipa完成  '
echo '///-----------='
echo ''

exit 0


