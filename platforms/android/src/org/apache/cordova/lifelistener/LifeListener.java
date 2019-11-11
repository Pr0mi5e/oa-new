package custom.cordova.life;


import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * Created by CrazyDong on 2018/4/24.
 * 监听android的生命周期
 */
public class LifeListener extends CordovaPlugin{
  private CallbackContext mCallbackContext;
  private String pluginFlag;
  private static String LIFE = "life";

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    mCallbackContext = callbackContext;
    pluginFlag = action;
    //备用
    if(action.equals(LIFE)){

      return true;
    }
    return false;
  }

  @Override
  public void onStart() {
    super.onStart();
    putValue("onStart");
  }

  @Override
  public void onPause(boolean multitasking) {
    super.onPause(multitasking);
    putValue("onPause");
  }

  @Override
  public void onResume(boolean multitasking) {
    super.onResume(multitasking);
    putValue("onResume");
  }

  @Override
  public void onStop() {
    super.onStop();
    putValue("onStop");
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    putValue("onDestroy");
  }

  @Override
  public void onReset() {
    super.onReset();
    putValue("onReset");
  }

  //返回周期值给js的方法
  public void putValue(String life){
    if(mCallbackContext != null){
      mCallbackContext.success(life);
    }

  }

}
