@echo off
echo 替换ICON图标，请稍等...

set project_path=D:/code/zhongwang/oa-yk/zw-oa/
xcopy /A /Y  %project_path%\resources_yk %project_path%\resources /s /e

rmdir /q /s %project_path%\platforms\android\build

echo 编译发版
%project_path%\Build_scripts_yk_android\ApkBuildRelease.sh

echo 编译发版完成，按任意键退出...
pause>echo.

:end
exit