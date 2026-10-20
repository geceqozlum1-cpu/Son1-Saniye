package com.sonbirsaniye.arcade;
import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.webkit.WebView;
import android.webkit.WebChromeClient;
import android.webkit.ConsoleMessage;
import android.util.Log;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.net.Uri;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
public final class MainActivity extends Activity {
 private WebView web;
 @Override public void onCreate(Bundle state) {
  super.onCreate(state);
  getWindow().setStatusBarColor(Color.rgb(8,14,28));
  getWindow().setNavigationBarColor(Color.rgb(8,14,28));
  web=new WebView(this);
  web.setBackgroundColor(Color.rgb(8,14,28));
  WebSettings s=web.getSettings();
  s.setJavaScriptEnabled(true);
  s.setDomStorageEnabled(true);
  s.setAllowFileAccess(false);
  s.setAllowContentAccess(false);
  s.setAllowFileAccessFromFileURLs(false);
  s.setAllowUniversalAccessFromFileURLs(false);
  s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onConsoleMessage(ConsoleMessage cm){
    Log.e("SON1_JS", cm.message()+" at "+cm.sourceId()+":"+cm.lineNumber());return true;
   }
  });
  web.setWebViewClient(new WebViewClient(){
   @Override public void onPageFinished(WebView v, String url){
    v.postDelayed(()->v.evaluateJavascript("(function(){return JSON.stringify({v10:typeof Son1V10,duel:typeof Son1DuelUI,lobby:!!document.getElementById('v10Lobby'),home:!!document.getElementById('v14Home'),mode:!!document.getElementById('menuView'),visible:document.getElementById('menuView')?.getBoundingClientRect().height,UA:navigator.userAgent});})()", value ->Log.i("SON1_DOM",value)),1200);
   }
   @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req){
    Uri u=req.getUrl();
    if(!"https".equals(u.getScheme())||!"appassets.androidplatform.net".equals(u.getHost()))return super.shouldInterceptRequest(view,req);
    if(!"/assets/index.html".equals(u.getPath()))return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));
    try{InputStream in=getAssets().open("index.html");return new WebResourceResponse("text/html","UTF-8",in);}
    catch(Exception e){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));}
   }
   @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req){
    return !"appassets.androidplatform.net".equals(req.getUrl().getHost());
   }
  });
  setContentView(web);
  web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
 }
 @Override public void onBackPressed(){
  if(web.canGoBack())web.goBack();else super.onBackPressed();
 }
}
