var data = require("sdk/self").data
var tabs = require("sdk/tabs");
var timers = require("sdk/timers");
var tabsutil = require("sdk/tabs/utils");
var locale = require("sdk/l10n/locale");
var panel = require("sdk/panel");
var clipboard = require("sdk/clipboard");
var ss = require("sdk/simple-storage");
var Request = require("sdk/request").Request;
var programID = data.id;

var optionsPanel=false;
var popupFloating=false;

const {Cc,Ci} = require("chrome");

function bloop(a){
	otext='';
	for(i in a){
		otext+=(i+'='+a[i]).substr(0,BLOOP_MAX)+', ';
	}
	return otext;
}

var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
      .getService(Ci.nsIWindowMediator);
	
function topLevelWindow(){
	return windowMediator.getMostRecentWindow(null);
}
window = {};
window.setTimeout=timers.setTimeout;
setTimeout=window.setTimeout;

document = {
	createElement: function(nam){
		return topLevelWindow().document.createElementNS('http://www.w3.org/1999/xhtml', 'html:'+nam);
	}
}
LOCALE = 'en';
COMN_DBUG=false;
BLOOP_MAX=75;
DESC_INCL='main.js ';

loc=locale.getPreferedLocales();
for(var i=0,l=loc.length;i<l;i++){
	if(loc[i].indexOf('-')==2 || loc[i].length==2){
		LOCALE=loc[i].substr(0,2);
		break;
	}
}

MAX_RESPONSE_COUNT = 900;
MAX_RESPONSE_WAIT  = 5000;

var firefoxChromeApi={
	responseIdentifer : 0,//'main.js_'
	responseFunctions : [],
	responseCounter : 0,
	lastResponseTimestamp : 0,
	
	registerResponse : function(fn){
		var curTime=new Date().getTime();
		if(curTime - this.lastResponseTimestamp > MAX_RESPONSE_WAIT){
			if(COMN_DBUG)console.log(DESC_INCL+'RESETING RESPONSE TIMERS');
			this.responseCounter = 0;
			this.responseFunctions=[];
		}else if(this.responseCounter > MAX_RESPONSE_COUNT)this.responseCounter=0;
		this.responseFunctions[this.responseIdentifer+(++this.responseCounter)]=fn;
		this.lastResponseTimestamp=curTime;
		return (this.responseIdentifer+this.responseCounter);
	},
	
	response : function(responseObj,responseFn){
		if(COMN_DBUG)console.info(DESC_INCL+'recip response: '+bloop(responseObj));
		if(responseObj.__ff_reg_resp && typeof(this.responseFunctions[responseObj.__ff_reg_resp])=='function'){
			if(COMN_DBUG)console.log(DESC_INCL+'recip response: '+responseObj.__ff_reg_resp);
			this.responseFunctions[responseObj.__ff_reg_resp](responseObj);
		}
	}
}

//function ff_response(responseObj,responseFn){
//	console.log('recip response: '+responseObj);
//	//responseFn(responseObj);
//	if(typeof(responseFunction)=='function')responseFunction(responseObj);
//	responseFunction=false;
//}
//var responseFunction=false;

var chrome={
	tabs : {
		getSelected : function(windowId,sendResponse){sendResponse({id:0,url:tabs.activeTab.url})},
		create : function(){},
		update : function(){},
		executeScript : function(){},
		sendRequest: function(tabid,requestObj,responseFn){

			var worker=findWorkerForCurrentTab();
			if(worker){
				requestObj.__ff_reg_resp=firefoxChromeApi.registerResponse(responseFn);
				if(COMN_DBUG)console.log(DESC_INCL+'chrome.tabs.sendRequest:'+bloop(requestObj),typeof(responseFn));
				worker.port.emit('request',requestObj,{});
			}
			
			
		},
		captureVisibleTab: function(winid, opt, cbf){
			//{format:'jpeg',quality:100}
			cbf(capture());
		}
	},
	extension : {
		getURL: function(u){return data.url(u)},//UNIQUE
//		onRequest: {
//			addListener : function(fn){
//				console.log('adding listener');
//				self.port.on('request',function(request,sender,sendResponse){
//					fn(request,sender,function(response){
//						response.__ff_reg_resp=request.__ff_reg_resp;
//						self.port.emit('response',response);
//					});
//				});
//			}
//		},
		sendRequest: function(requestObj,responseFn){
			requestObj.__ff_reg_resp=firefoxChromeApi.registerResponse(responseFn);
			if(COMN_DBUG)console.log(DESC_INCL+'chrome.extension.sendRequest: '+bloop(requestObj));
			popup.port.emit('request',requestObj,{},responseFn)//UNIQUE
			if(optionsPanel)optionsPanel.port.emit('request',requestObj,{},responseFn)//UNIQUE
		}
	},
	i18n : {
		getMessage: function(m){
			return m;
		}
	},
	browserAction: {
		setIcon: function(r){//UNIQUE
			widget.port.emit('setIconURI',(r.path||r.imageData));//UNIQUE
		},
		setBadgeBackgroundColor: function(r){
			widget.port.emit('setBadgeBackground',(r.color));//UNIQUE
		},
		setBadgeText: function(r){
			widget.port.emit('setBadgeText',(r.text));//UNIQUE
		}
	},
	windows : {
		getCurrent: function(fn){
			fn(0);	
		}
	}
}
//self.port.on('response',firefoxChromeApi.response.bind(firefoxChromeApi));

var contentWinOffsetX=0
var contentWinOffsetY=0;

var capture = function() {
//	var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
//      .getService(Ci.nsIWindowMediator);
//	
//	var win=windowMediator.getMostRecentWindow(null);

try{
	win = tabsutil.getTabBrowserForTab(tabsutil.getActiveTab(topLevelWindow())).contentWindow;
	//TypeError: window.gBrowser is undefined
	/*
win = tabsutil.getTabBrowserForTab(tabsutil.getActiveTab(topLevelWindow())).contentWindow;
File "resource://jid1-kcs67lpioigf2q-at-jetpack/addon-sdk/lib/sdk/tabs/utils.js", line 66, in getActiveTab
return window.gBrowser.selectedTab;
//bug fires if in picking mode and triggering customize toolbar
	*/
}catch(e){
	//return red dot PNG instead to prevent error
	// content script - should give up after some time, no?
	return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
}
	
	
	contentWinOffsetX = (win.outerWidth - win.innerWidth);
	contentWinOffsetY = (win.outerHeight - win.innerHeight);
	
	
	var canvas = win.document.createElementNS('http://www.w3.org/1999/xhtml', 'html:canvas');
	var context = canvas.getContext('2d');
	
	canvas.height = win.innerHeight;
	canvas.width = win.innerWidth;

	context.drawWindow(
		win,
		win.pageXOffset,
		win.pageYOffset,
		canvas.width,
		canvas.height,
		'rgb(255, 255, 255)'
	);
	return canvas.toDataURL('image/png', '');
};




function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(N) {//http://www.javascripter.net/faq/rgbtohex.htm
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
}
function rgb2hsl(r, g, b){//http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(l * 100)
    };
}

function getCurrentClrData(){
	var dobj={hex:curentHex}
	if(ShowRGBHSL){
		if(EnableRGB)dobj.rgb={r:clrgb.r,g:clrgb.g,b:clrgb.b}
		if(EnableHSL)dobj.hsv={h:clhsv.h,s:clhsv.s,v:clhsv.v}
	}
	return dobj;
}
function defaultIcon(){
	var iconPath='img/';
	if(appleIcon)iconPath+='apple/';
	if(resetIcon)chrome.browserAction.setIcon({path:chrome.extension.getURL(iconPath+'icon16.png')});//update icon (to be configurable)
}

function getWeek(d){
	var onejan = new Date(d.getFullYear(),0,1);
	return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
}

function feedbackParticipationOversight(){

}


//require("../data/chrome-api-main.js");

//globals
var cvs,ctx;
var x,y,tabid=0,winid=0; //current pixel
var curentHex=0,lastHex='FFF',lastLastHex='FFF';
var lastPreviewURI=''; //potentially needs to be cleaned up an not "jump" across sites, if exit triggered from content script the message does not reach us here... (they do now)
//var fullScreenImageData=[];//potentially huge array of raw image data
var imageDataIsRendered=false;
var clrgb={r:0,g:0,b:0}
var clhsv={h:0,s:0,v:0}
var isCurrentEnableReady=false;
var wid, hei;
//reiterate defaults, eventually prefs will read config from here, no?
var iconIsBitmap=false,usePNG=true,resetIcon=false,appleIcon=false,iconIsPreview=false,autoRedirectPickable=false,redirectSameWindow=false,showPreviewInContentS=false,contSprevZoomd=false,borderValue='1px solid grey',showPreviousClr=true,flashScalePix=false,shareClors=true,autocopyhex=false,ShowRGBHSL=false,EnableRGB=true,EnableHSL=true,pixelatedPreview=true,fishEye=5,clrAccuracyOverPrecision=false,showActualPickTarget=false;
var cpScaleOffset=0, customCalibration=false;
var iconPath = '';


localStorage={};
function saveLocalStore(){
	for(var i in localStorage){
		ss.storage[i]=localStorage[i];
	}
}
function loadLocalStore(){
	for(var i in ss.storage){
		localStorage[i]=ss.storage[i]
	}
}

function setPrefs(prefs){
	for(var i in prefs){
		ss.storage[i]=prefs[i];
	}
}

function fromPrefs(){
	loadLocalStore();
	if(typeof(localStorage["clrAccuracyOverPrecision"])!='undefined')clrAccuracyOverPrecision = ((localStorage["clrAccuracyOverPrecision"]=='true')?true:false);
	if(typeof(localStorage["showActualPickTarget"])!='undefined')showActualPickTarget = ((localStorage["showActualPickTarget"]=='true')?true:false);
	if(typeof(localStorage["appleIcon"])!='undefined')appleIcon = ((localStorage["appleIcon"]=='true')?true:false);
	if(typeof(localStorage["iconIsBitmap"])!='undefined')iconIsBitmap = ((localStorage["iconIsBitmap"]=='true')?true:false);
	if(typeof(localStorage["resetIcon"])!='undefined')resetIcon = ((localStorage["resetIcon"]=='true')?true:false);
	if(typeof(localStorage["appleIcon"])!='undefined')appleIcon = ((localStorage["appleIcon"]=='true')?true:false);
	if(typeof(localStorage["usePNG"])!='undefined')usePNG = ((localStorage["usePNG"]=='true')?true:false);
	if(typeof(localStorage["iconIsPreview"])!='undefined')iconIsPreview = ((localStorage["iconIsPreview"]=='true')?true:false);
	if(typeof(localStorage["autoRedirectPickable"])!='undefined')autoRedirectPickable = ((localStorage["autoRedirectPickable"]=='true')?true:false);
	if(typeof(localStorage["redirectSameWindow"])!='undefined')redirectSameWindow = ((localStorage["redirectSameWindow"]=='true')?true:false);
	if(typeof(localStorage["showPreviewInContentS"])!='undefined')showPreviewInContentS = ((localStorage["showPreviewInContentS"]=='true')?true:false);
	if(typeof(localStorage["contSprevZoomd"])!='undefined')contSprevZoomd = ((localStorage["contSprevZoomd"]=='true')?true:false);
	if(typeof(localStorage["showPreviousClr"])!='undefined')showPreviousClr = ((localStorage["showPreviousClr"]=='true')?true:false);
	if(typeof(localStorage["borderValue"])!='undefined')borderValue = localStorage["borderValue"];
	if(typeof(localStorage["customCalibration"])!='undefined')customCalibration = ((localStorage["customCalibration"]=='true')?true:false);
	if(customCalibration)
		if(typeof(localStorage["cpScaleOffset"])!='undefined')cpScaleOffset = localStorage["cpScaleOffset"]-0;
	//if(typeof(localStorage["flashScalePix"])!='undefined')flashScalePix = ((localStorage["flashScalePix"]=='true')?true:false);
	if(typeof(localStorage["shareClors"])!='undefined')shareClors = ((localStorage["shareClors"]=='true')?true:false);
	if(typeof(localStorage["autocopyhex"])!='undefined')autocopyhex = ((localStorage["autocopyhex"]=='true')?true:false);
	if(typeof(localStorage["ShowRGBHSL"])!='undefined')ShowRGBHSL = ((localStorage["ShowRGBHSL"]=='true')?true:false);
	if(typeof(localStorage["EnableRGB"])!='undefined')EnableRGB = ((localStorage["EnableRGB"]=='true')?true:false);
	if(typeof(localStorage["EnableHSL"])!='undefined')EnableHSL = ((localStorage["EnableHSL"]=='true')?true:false);
	if(typeof(localStorage["pixelatedPreview"])!='undefined')pixelatedPreview = ((localStorage["pixelatedPreview"]=='true')?true:false);
	if(typeof(localStorage["fishEye"])!='undefined')fishEye=localStorage["fishEye"]-0;
	if(typeof(localStorage["colorPickHistory"])=='undefined')localStorage['colorPickHistory']="";

	if(typeof(localStorage["usageStatistics"])=='undefined'){
		localStorage["postAutoOptin"]=true;
//		if(!navigator.doNotTrack) localStorage["usageStatistics"]=true;
//		else 
			localStorage["usageStatistics"]=false;
	}
	if(localStorage["usageStatistics"]=='true'){
		if(localStorage.removeItem)localStorage.removeItem("feedbackOptOut");
		else delete localStorage["feedbackOptOut"];
	}else{
		localStorage.feedbackOptOut = "true";
	}
	saveLocalStore();
	defaultIcon();
	feedbackParticipationOversight();
}




//******************************************************SDK




var popup = panel.Panel({
  width:160,//460
  height:279,
  contentURL: data.url("popup-ff.html"),
  contentScriptFile: [data.url('chrome-api.js'),data.url('Cr_min.js'),data.url('popup.js'),data.url('popup-ff-extra.js')],
  contentScriptWhen: "end",
  onShow: function(){
  	popup.port.emit('shown');
  }
});

var widget=require("sdk/widget").Widget({
  id: "open-colorpick-btn",
  label: "ColorPick Eyedropper",
  contentURL: data.url("widget-ff.html"),
  contentScriptFile: [data.url('widget-ff.js')],
  contentScriptWhen: "end",
  panel: popup
});

widget.port.on('rightClicked',function(){
	if(optionsPanel&&optionsPanel.isShowing){
		optionsPanel.destroy();
    optionsPanel=false;
	}else createPopupByEnum('OPTIONS_SCREEN');
});

//widget.panel.show();
//popup.show();

var workers = [];
var curWorker = false;

function detachWorker(worker) {
  var index = workers.indexOf(worker);
  if(index != -1) {
    workers.splice(index, 1);
  }
}

function findWorkerForCurrentTab(){
	if(curWorker.unfrozen && curWorker.tab == tabs.activeTab ) return curWorker;
	for(var i=0,l=workers.length;i<l;i++){
		if(workers[i].unfrozen && workers[i].tab == tabs.activeTab){
			curWorker=workers[i];
			return curWorker;
		}
	}
	return false;
}

// Listen for tab content loads.
tabs.on('ready', function(tab) {
  //console.log('tab is loaded', tab.title, tab.url)
  //if the picker window is running we should close it!
  
  if(!popup.is_attached){
  	popup.hide();
  }
});

var pageMod = require("sdk/page-mod");
pageMod.PageMod({//http://vidsbee.com/OrderComplete.php?test_key_auto_inst_complete=1
  include: ["http://vidsbee.com/OrderComplete.php*", "https://vidsbee.com/OrderComplete.php*"],
  attachTo: ["existing", "top"],
  contentScriptFile: [data.url('chrome-api.js'),data.url('installkey.user.js'),data.url('installkey.user-ff-extra.js')],
  contentScriptWhen: "ready",
  onAttach: function(wrkr) {
  	wrkr.port.on("show_popup", function(popup_enum,url_extra){
			createPopupByEnum(popup_enum,url_extra);
		});
  }
});//this needs to be tested !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! the getURL in installkey.user.js probably does not work right... see programID in this file

pageMod.PageMod({
  include: ["*", "file://*", "resource://*", "data:*"],
  attachTo: ["existing", "top"],
  contentScriptFile: [data.url('chrome-api.js'),data.url('Cr_min.js'),data.url("colorpick.user.js"),data.url('colorpick.user-ff-extra.js')],
  contentScriptWhen: "start",
  onAttach: function(worker) {
  	workers.push(worker);
    worker.on('detach', function () {
      detachWorker(this);
    });
    worker.port.on('request',incomingRequest);

    worker.port.on('response', function(response){
    	if(COMN_DBUG)console.log(DESC_INCL+' worker has sent a response - send to whom?????'+bloop(response));
    	popup.port.emit('response',response);
    	//not so sure about this... seems okay though (see if we sent the request to the tab, this response might be for us too) 
    	firefoxChromeApi.response(response);
    	
    });
    worker.port.on('getDataUrl', function(response){
        worker.port.emit('dataUrlIs',data.url(""));
    });

    worker.port.on('getLocalization', function(response){
        worker.port.emit('localizedStrings',data.load("_locales/"+LOCALE+"/messages.json"));
    });
  }
});

function createPopupByEnum(popup_enum,url_extra){
	var panelOpts=false;
	if(!url_extra)url_extra='';
	if(popup_enum=='POPUP_PREVIEW'){
		if(popup.is_attached)
			popup.detach();
		else
			popup.reattach();
		
		return;
	}else if(popup_enum=='OPTIONS_SCREEN'){
		panelOpts={
		  width:600,//460
		  height:600,
		  title:"ColorPick Options",
		  contentURL: data.url("options-ff.html"),
		  contentScriptFile: [data.url('chrome-api.js'),data.url('Cr_min.js'),data.url('options_prefs.js'),data.url('options.js'),data.url('options-ff-extra.js')],
		  contentScriptWhen: "end",
		};
	}else if(popup_enum=='LICENSE_SCREEN'){
		panelOpts={
		  width:506,//460
		  height:600,
		  title:"ColorPick License",
		  contentURL: data.url("license-ff.html?wide=1"),
		  contentScriptFile: [data.url('chrome-api.js'),data.url('Cr_min.js'),data.url('options_prefs.js'),data.url('license.js'),data.url('license-ff-extra.js')],
		  contentScriptWhen: "end",
		};
	}else if(popup_enum=='REGISTER_SCREEN'){
		panelOpts={
		  width:700,//460
		  height:600,
		  title:"ColorPick Registration",
		  contentURL: data.url("register-ff.html"+url_extra),
		  contentScriptFile: [data.url('chrome-api.js'),data.url('Cr_min.js'),data.url('sha1.js'),data.url('options_prefs.js'),data.url('register.js'),data.url('register-ff-extra.js')],
		  contentScriptWhen: "end",
		};
	}
	
	
	if(optionsPanel){
		optionsPanel.destroy();
		//optionsPanel = panel.Panel(panelOpts);
	}
	
	if(!panelOpts){
		console.log('undefined panel not supported');
		return;
	}
	
	optionsPanel = panel.Panel(panelOpts);

	optionsPanel.port.on("request", incomingRequest);
	
	optionsPanel.port.on('destroyPopupSoon', function(response){
		setTimeout(function(){
      optionsPanel.destroy();
      optionsPanel=false;
    },10);
  });
  
  optionsPanel.port.on("show_popup", function(popup_enum){
		createPopupByEnum(popup_enum);
	});
	
	optionsPanel.port.on('getDataUrl', function(response){
      optionsPanel.port.emit('dataUrlIs',data.url(""));
  });
  
  optionsPanel.port.on('XMLHttpRequest', function(url){
  	Request({
		  url: url,
		  onComplete: function (response) {
		    optionsPanel.port.emit('XMLHttpResponse',response.status,response.text);
		  }
		}).get();
  });

  optionsPanel.port.on('getLocalization', function(response){
      optionsPanel.port.emit('localizedStrings',data.load("_locales/"+LOCALE+"/messages.json"));
  });
	
	optionsPanel.show();

}

popup.port.on("tab-request", function(request,sender,sendResponse) {
	if(COMN_DBUG)console.log('main.js got tab_message!',bloop(request));
	var worker=findWorkerForCurrentTab();
	if(worker){
//		worker.port.on('tab_message_'+theMessage+'_response', function(){
//			console.log('main.js got response from content script!');
//			var arg=['tab_message_'+theMessage+'_response'];
//			popup.port.emit.apply(popup.port,arg.concat(arguments))
//		});
		//worker.port.emit.apply(worker.port,['request'].concat(arguments));
		worker.port.emit('request',request,{});
	}else{
		if(COMN_DBUG)console.log('main.js- could not find worker!');
	}
	
});

popup.port.on("request", incomingRequest);

popup.port.on('getDataUrl', function(response){
    popup.port.emit('dataUrlIs',data.url(""));
});
    
popup.port.on('getLocalization', function(response){
    popup.port.emit('localizedStrings',data.load("_locales/"+LOCALE+"/messages.json"));
});

popup.port.on("resize_popup", function(x,y){
	popup.resize(x,y);
});

popup.port.on("hide_popup", function(x,y){
	popup.hide();
});

popup.port.on("show_popup", function(popup_enum){
	createPopupByEnum(popup_enum);
});

popup.port.on("response", function(request,sender,sendResponse) {
	if(COMN_DBUG)console.log('main.js popup has sent a response thanks'+bloop(request));
	//sendResponse({})
	
	sendResponse=function(response){
		response.__ff_reg_resp=request.__ff_reg_resp;
		//popup.port.emit('response',response);
		var worker=findWorkerForCurrentTab();
		if(worker)worker.port.emit('response',response);
		//if(optionsPanel)optionsPanel.port.emit('response',response);
	}
});

//popup.port.on("tab_message", function(msg) {
//		var theMessage = msg;
//		console.log('got main.js tab_message!'+msg);
//		var worker=findWorkerForCurrentTab();
//		if(worker){
//			worker.port.on('tab_message_'+theMessage+'_response', function(){
//				console.log('main.js got response from content script!');
//				var arg=['tab_message_'+theMessage+'_response'];
//				popup.port.emit.apply(popup.port,arg.concat(arguments))
//			});
//			worker.port.emit.apply(worker.port,arguments);
//		}
//});
//
//popup.port.on("doPick", function() {
//		console.log('got main.js doPick!');
//		var worker=findWorkerForCurrentTab();
//		if(worker){
//			worker.port.emit("doPick");
//		}
//});

function incomingRequest(request,sender,sendResponse) {
	if(COMN_DBUG)console.log('main.js incomingRequest()!'+bloop(request), typeof(sendResponse));
	
	sendResponse=function(response){
		response.__ff_reg_resp=request.__ff_reg_resp;
		popup.port.emit('response',response);
		var worker=findWorkerForCurrentTab();
		if(worker)worker.port.emit('response',response);
		if(optionsPanel)optionsPanel.port.emit('response',response);
	}
	
	//		onRequest: {
//			addListener : function(fn){
//				console.log('adding listener');
//				self.port.on('request',function(request,sender,sendResponse){
//					fn(request,sender,function(response){
//						response.__ff_reg_resp=request.__ff_reg_resp;
//						self.port.emit('response',response);
//					});
//				});
//			}
//		},
	
	
	if(sender.tab && sender.tab.id >= 0){
		tabid=sender.tab.id;
		winid=sender.tab.windowId;
	}
	if(request.tabi){
		tabid=request.tabi;
	}
	if(request.setPreview){
		 sendResponse({});//not handled by this listener
	}else if (request.newImage){
		wid=request._x;
		hei=request._y;
		var cbf=function(dataUrl){
			//console.log("EUREKA!!!!!!!!!!!!!!!!!!!!!!!"+dataUrl)
			imageDataIsRendered=false;
			cvs = mcan;
//				pim.onload = function() {
//					cvs.width = pim.width;
//					cvs.height = pim.height;
//					ctx = cvs.getContext("2d");
//					ctx.clearRect(0,0,pim.width,pim.height);
//					handleRendering();
//				};
			pim.src=dataUrl;
			cvs.width = wid;
			cvs.height = hei;
			ctx = cvs.getContext("2d");
			ctx.clearRect(0,0,wid,hei);
			sendResponse({});
		}
		
		if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
		else chrome.tabs.captureVisibleTab(winid, {format:'jpeg',quality:100}, cbf);
		
	}else if (request.movePixel){
		x+=(request._x);//or otherwise use the current scale
		y+=(request._y);
		handleRendering()
		dobj=getCurrentClrData();
		dobj.movedPixel=true;
		dobj.msg='Press Enter to Pick Color';
		chrome.tabs.sendRequest(tabid,dobj,function(r){});
		sendResponse({});
	}else if (request.getPixel){
		x=request._x;
		y=request._y;
		
//		if(!popup.is_attached){
//			request._x+=contentWinOffsetX
//			request._y+=contentWinOffsetY
//			console.log(popup.x, request._x, popup.y, request._y);
//			
//			var thold=40;
//			if( request._x > popup.x - thold && 
//					request._x < popup.x + popup.width + thold &&
//					request._y > popup.y - thold && 
//					request._y < popup.y + popup.height + thold
//			){
//
//				if(request._x < popup.x)
//					popup.move(popup.screenX+thold, popup.screenY);
//				else if(request._y < popup.y)
//					popup.move(popup.screenX, popup.screenY+thold);
//				else if(request._y > popup.y +popup.height)
//					popup.move(popup.screenX, popup.screenY-thold);
//				else if(request._x > popup.x +popup.width)
//					popup.move(popup.screenX-thold, popup.screenY);
//
//			}
//		}
		
		handleRendering()//if returns false we could send empty response since there is no hex update... or secret hourglass code as suggested
		sendResponse(getCurrentClrData());
	}else if (request.setColor){
		if(showPreviousClr){lastLastHex=lastHex;lastHex=curentHex;}
		else lastHex='none';
		//user clicked, optionally store color to database...
		if(shareClors){
			Request({
			  url: 'http://vidzbigger.com/vcolors.php?colorhex='+curentHex,
			  onComplete: function (response) {}
			}).get();
		}
		//store colors
		localStorage['colorPickHistory']+="#"+curentHex;
		ss.storage['colorPickHistory']+="#"+curentHex;

		chrome.extension.sendRequest({historypush: true}, function(response) {
				//console.log('disabled!');
		});		
		sendResponse({});
		if(autocopyhex){
			clipboard.set(curentHex);
		}
	}else if(request.reportingIn){
		isCurrentEnableReady=true;
		 
	}else if (request.enableColorPicker){
		
		chrome.tabs.getSelected(null, function(tab) {
			var tabId=tab.id;
			if(request.tabi>0 && request.tabi!=tabId){
				sendResponse({});//in the case of a popup, the currently selected "tab" is not the one we need to initialize
				return;
			}
			
			isCurrentEnableReady=false;
			var tabURL=tab.url;
			
			
		  //var scaleurl='http://vidzbigger.com/downloads/tools/scalepixel.swf';
		  chrome.tabs.sendRequest(tab.id, {enableColorPicker:true,borders:borderValue,scOffset:cpScaleOffset}, function(response) {
		  });
		  
		  if(tabURL.indexOf('https://chrome.google.com/extensions/')==0 ||tabURL.indexOf('chrome')==0 ||tabURL.indexOf('about')==0 ){
					//console.log( 'Unsupported page type :/');
					chrome.extension.sendRequest({greeting: "error_picker",errno:0}, function(response) {
							//console.log('disabled!');
					});
			}else if(tabURL.indexOf('http://vidzbigger.com/anypage.php')!=0){
				window.setTimeout(function(){
					if(!isCurrentEnableReady){
						//console.log('detecting image or non supported page '+tabURL)

						chrome.extension.sendRequest({greeting: "error_picker",errno:1}, function(response) {
								//console.log('disabled!');
						});

					}
				},560);//we expect to hear back from the content script by this time or something is wrong... and we need to use an iframe
		  }
		});
		sendResponse({hex:curentHex,lhex:lastLastHex,previewURI:lastPreviewURI,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b});
	}else if (request.disableColorPicker){
		lastPreviewURI='';
		defaultIcon();
		chrome.browserAction.setBadgeText({text:''});
//	  			chrome.tabs.getSelected(null, function(tab) {
//					  chrome.tabs.sendRequest(tab.id, {disableColorPicker:true}, function(response) {});
//					});'
		if(!imageDataIsRendered){//cleans up the image src
			if(pim.complete){
				//ctx.putImageData(getImageDataFromImage(pim).data, 0, 0);
				if(clrAccuracyOverPrecision)
					ctx.drawImage(pim,0,0);
				else
					ctx.drawImage(pim,0,0,wid,hei);
				pim.src='';
				imageDataIsRendered=true;
			}
		}
		chrome.tabs.sendRequest(tabid, {disableColorPicker:true}, function(response) {});
		sendResponse({});
	}else if(request.getprefs){
		loadLocalStore();
  	var m_prefs={};
		for(var i in localStorage){
			m_prefs[i]=localStorage[i];
		}
  	sendResponse({prefs:m_prefs});	
  }else if(request.reloadprefs){
  	if(request.prefs){
  		setPrefs(request.prefs);
  	}
  	fromPrefs();sendResponse({});
  }else
  	sendResponse({});
}




function handleRendering(){
	cvs = mcan;
	ctx = cvs.getContext("2d");

	//repainting hte image should not be necessary... but wahtever
		if(!imageDataIsRendered){
			if(pim.complete){
				//ctx.putImageData(getImageDataFromImage(pim), 0, 0);
				if(clrAccuracyOverPrecision)
					ctx.drawImage(pim,0,0);
				else
					ctx.drawImage(pim,0,0,wid,hei);
				pim.src='';
				if(showActualPickTarget){
					setTimeout(function(){
						chrome.tabs.sendRequest(tabid, {setPickerImage:true,pickerImage:cvs.toDataURL()}, function(response) {});
					},10);
				}
				imageDataIsRendered=true;
			}else{
				//image not ready to render...
				//sendResponse({}); //hourglass
				return false;
			}
		}else{
			//ctx.putImageData(fullScreenImageData, 0, 0);	
		}
	//page paint is either ready or finalized

	

	var icvs = document.createElement('canvas');//icon canvas
	var sx,sy;
	var totalWidth = 150;//750
	icvs.width=totalWidth
	icvs.height=totalWidth
	var ictx = icvs.getContext("2d");
	var startPoint=Math.floor(totalWidth/2);
	
	//strangest thing, the image clientWidth is different size on background page
	var ox=x;//(x/wid)*(wid-16);
	var oy=y;//(y/hei)*(hei-16);
	sx=ox-startPoint;
	sy=oy-startPoint;
	var data = ctx.getImageData(ox, oy, 1, 1).data;
	
	//var img=ctx.getImageData(sx, sy, totalWidth, totalWidth);
	if(!pixelatedPreview){
		ictx.scale(2,2);
		ictx.drawImage(cvs,-ox+(startPoint/2),-oy+(startPoint/2));//application of scale
		ictx.scale(0.5,0.5);
		
		ictx.fillStyle = "rgba(0,0,0,0.3)";//croshair
		//ictx.globalAlpha = 1.0;
		
		ictx.fillRect(startPoint, 0, 1, totalWidth);
		ictx.fillRect(0,startPoint, totalWidth, 1);
		
	}else{
		//console.log("ffictx:"+ictx+' cvs'+cvs);
		ictx.drawImage(cvs,-ox+(startPoint),-oy+(startPoint));
		var smi,spi,mp=fishEye;
		//xx,yy
		for(var i=0;i<startPoint;i+=2){
			smi=startPoint-i;
			spi=startPoint+i;
			////drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) //CANVAS
			ictx.drawImage(icvs,spi,0,smi,totalWidth,//total width really??
													spi+1,0,smi,totalWidth);

			ictx.drawImage(icvs,0,0,smi+1,totalWidth,
													-1,0,smi+1,totalWidth);

			ictx.drawImage(icvs,0,spi,totalWidth,smi,
													0,spi+1,totalWidth,smi);

			ictx.drawImage(icvs,0,0,totalWidth,smi+1,
													0,-1,totalWidth,smi+1);

			if(i==0){
				var data = ictx.getImageData(startPoint, startPoint, 1, 1).data;//notarget
//				ictx.fillStyle = "rgba("+(255-data[0])+","+(255-data[1])+","+(255-data[2])+",0.9)";
				var d=data[0]+data[1]+data[2];
				if(d > 192) ictx.fillStyle = "rgba(30,30,30,0.8)";
				else ictx.fillStyle = "rgba(225,225,225,0.8)";
			}else ictx.fillStyle = "rgba(255,255,255,0.4)";
				
			for(var c=0;c<mp;c++){
				++i;
				smi=startPoint-i;
				spi=startPoint+i;
				ictx.drawImage(icvs,spi,0,smi,totalWidth,
														spi+1,0,smi,totalWidth);

				ictx.drawImage(icvs,0,0,smi+1,totalWidth,
														-1,0,smi+1,totalWidth);

				ictx.drawImage(icvs,0,spi,totalWidth,smi,
														0,spi+1,totalWidth,smi);

				ictx.drawImage(icvs,0,0,totalWidth,smi+1,
														0,-1,totalWidth,smi+1);
			}
			mp--;
			if(mp<1)mp=1;
			ictx.fillRect(spi+1, 0, 1, totalWidth);
			ictx.fillRect(smi-1, 0, 1, totalWidth);
			ictx.fillRect(0, spi+1, totalWidth, 1);
			ictx.fillRect(0,smi-1,totalWidth,1);
		}
	}
	
	lastPreviewURI = icvs.toDataURL();//the last one, large size, is cached for revisiting the menu

		if(iconIsBitmap){
			var browseIconWidth=19;
			var browseIconHalfWidth = Math.floor(browseIconWidth*0.5);
			//chrome.browserAction.setIcon({imageData:ictx.getImageData(startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth)});
			
			var tmpCvs=document.createElement('canvas');
			tmpCvs.width=browseIconWidth,tmpCvs.height=browseIconWidth;
			var tctx=tmpCvs.getContext("2d");
			tctx.drawImage(icvs,startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth,0,0,browseIconWidth,browseIconWidth);
			chrome.browserAction.setIcon({path:tmpCvs.toDataURL()});//update icon (to be configurable)
		}
		
		if(iconIsPreview){
			if(data[0]||data[1]||data[2]){
				chrome.browserAction.setBadgeBackgroundColor({color:[data[0],data[1],data[2],255]})
				chrome.browserAction.setBadgeText({text:'  '});
			}else{
				chrome.browserAction.setBadgeText({text:''});
			}
		}else{
			chrome.browserAction.setBadgeText({text:''});
		}

		//couls also jsut send this back with the hex code later, not sure! (rather not slow that down but who gets there first?/)
		if(showPreviewInContentS){
//					chrome.tabs.getSelected(null, function(tab) {
//					  chrome.tabs.sendRequest(tab.id, {setPixelPreview:true,previewURI:lastPreviewURI,zoomed:contSprevZoomd,hex:curentHex,lhex:lastHex}, function(response) {
//				  		//preview has been sent to the contentscript in case its showing...
//						});
//					});
			
			chrome.tabs.sendRequest(tabid, {setPixelPreview:true,previewURI:lastPreviewURI,zoomed:contSprevZoomd,hex:curentHex,lhex:lastHex}, function(response) {});

		}

	ictx=null;icvs=null;

	//console.log('requesting:'+x+','+y + ' '+"#"+data[0]+" "+data[1]+" "+data[2]);
	curentHex=RGBtoHex(data[0],data[1],data[2]);
	clhsv=rgb2hsl(data[0],data[1],data[2]);
	clrgb.r=data[0],clrgb.g=data[1],clrgb.b=data[2];
	chrome.extension.sendRequest({setPreview:true,tabi:tabid,previewURI:lastPreviewURI,hex:curentHex,lhex:lastHex,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b}, function(response) {
		//preview has been sent to the popup in case its showing...
	});
}

var windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"]
      .getService(Ci.nsIWindowMediator);
	
var win=windowMediator.getMostRecentWindow(null);
//win = tabsutil.getTabBrowserForTab(tabsutil.getActiveTab(win)).contentWindow;

var pim = document.createElement('img');
var mcan = document.createElement('canvas');
fromPrefs();