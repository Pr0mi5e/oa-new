#创建目录
#if [ ! -d ./IPADir ];
#then
#mkdir -p IPADir;
#fi

#工程绝对路径
#project_path=$(cd `/Users/apple/Downloads/trunk/platforms/ios $0`; pwd)
project_path=/Users/zwmac/Documents/code/oa-yk/zw-oa

cd ${project_path}

cp -r ${project_path}/resources_yk/ios ${project_path}/resources
cp -r ${project_path}/resources_yk/icon.png ${project_path}/resources

#生成js版本
#gulp build --env production_yk
gulp build --env staging_yk
ionic build ios --release --prod


#工程名 将XXX替换成自己的工程名
project_name=OA

#scheme名 将XXX替换成自己的sheme名
scheme_name=OA

#打包模式 Debug/Release
development_mode=Release

#build文件夹路径
build_path=${project_path}/platforms/ios

#plist文件所在路径
#exportOptionsPlistPath=${project_path}/exportTest.plist

#导出.ipa文件所在路径
exportIpaPath=${project_path}/Build_scripts_yk_ios/IPADir/${development_mode}

echo "Delete history files："${exportIpaPath}
rm -rf ${exportIpaPath}

##配置脚本
#echo "Place enter the number you want to export ? [ 1:Developer 2:Enterprise] "

#read number
#while([[ $number != 1 ]] && [[ $number != 2 ]])
#do
#echo "Error! Should enter 1 or 2"
#echo "Place enter the number you want to export ? [ 1:Developer 2:Enterprise] "
#read number
#done

#if [ $number == 1 ];then
#development_mode=Release
#plist文件所在路径
exportOptionsPlistPath=${project_path}/Build_scripts_yk_ios/ExportOptions_dev.plist
#else
#development_mode=Release
#exportOptionsPlistPath=${project_path}/exportTest.plist
#fi

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
#-archivePath ${build_path}/${project_name}.xcarchive  -quiet  || exit

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

#echo '///-------------'
#echo '/// 开始发布ipa包 '
#echo '///-------------'

#if [ $number == 1 ];then

#验证并上传到App Store
# 将-u 后面的XXX替换成自己的AppleID的账号，-p后面的XXX替换成自己的密码
#altoolPath="/Applications/Xcode.app/Contents/Applications/Application Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Versions/A/Support/altool"
#"$altoolPath" --validate-app -f ${exportIpaPath}/${scheme_name}.ipa -u XXX -p XXX -t ios --output-format xml
#"$altoolPath" --upload-app -f ${exportIpaPath}/${scheme_name}.ipa -u  XXX -p XXX -t ios --output-format xml
#else

#上传到Fir
# 将XXX替换成自己的Fir平台的token
#fir login -T XXX
#fir publish $exportIpaPath/$scheme_name.ipa
#
#fi

exit 0


