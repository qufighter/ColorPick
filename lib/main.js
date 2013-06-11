var data = require("sdk/self").data
var tabs = require("sdk/tabs");
var timers = require("sdk/timers");
var tabsutil = require("sdk/tabs/utils");
var locale = require("sdk/l10n/locale");
var panel = require("sdk/panel");
var clipboard = require("sdk/clipboard");
var ss = require("sdk/simple-storage");
var Request = require("sdk/request").Request;
const {Cc,Ci} = require("chrome");
var programID = data.id;

var optionsPanel=false;
var popupFloating=false;
var workers = [];
var curWorker = false;

function detachWorker(worker) {
  var index = workers.indexOf(worker);
  if(index != -1) {
    workers.splice(index, 1);
  }
}
//
//function findWorkerForCurrentTab(){
//	if(curWorker.unfrozen && curWorker.tab == tabs.activeTab ) return curWorker;
//	for(var i=0,l=workers.length;i<l;i++){
//		if(workers[i].unfrozen && workers[i].tab == tabs.activeTab){
//			curWorker=workers[i];
//			return curWorker;
//		}
//	}
//	return false;
//}

function findWorkerForCurrentTab(){
	if(curWorker.tab == tabs.activeTab ){
		try{
			curWorker.port.emit('are-you-frozen');
			return curWorker;
		}catch(e){}
	}
	for(var i=0,l=workers.length;i<l;i++){
		if(workers[i].tab == tabs.activeTab){
			try{
				workers[i].port.emit('are-you-frozen');
				curWorker=workers[i];
				return curWorker;
			}catch(e){}
		}
	}
	return false;
}

var currentWorker = {
	port : {
		emit : function(){
			var w=findWorkerForCurrentTab();
			if(w)w.port.emit.apply(this, arguments);
		}
	}
}

//debug function
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
//document = {
//	createElement: function(nam){
//		return topLevelWindow().document.createElementNS('http://www.w3.org/1999/xhtml', 'html:'+nam);
//	}
//}
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

var contentWinOffsetX=0,contentWinOffsetY=0;
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

//function fromPrefs(){
//	loadLocalStore();
//	//have them...
//	saveLocalStore();
//}

var bgPage = require("sdk/page-worker").Page({
	contentURL: data.url("background-ff.html"),
	contentScriptFile: [data.url('chrome-api.js'),data.url('options_prefs.js'),data.url('background.js'),data.url('background-ff-extra.js')],
	contentScriptWhen: "end",
});

var popup = panel.Panel({
  width:160,//460
  height:279,
  contentURL: data.url("popup-ff.html"),
  contentScriptFile: [data.url('chrome-api.js'),data.url('Cr_min.js'),data.url('options_prefs.js'),data.url('popup.js'),data.url('popup-ff-extra.js')],
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

bgPage.port.on('request',function(request,sender,sendResponse){
	if(COMN_DBUG)console.log(DESC_INCL+' background.js has sent a request?????'+bloop(request));
	popup.port.emit('request',request,sender,sendResponse);
	if(optionsPanel)optionsPanel.port.emit('request',request,sender,sendResponse);
});

bgPage.port.on('tab-request',function(request,sender,sendResponse){
	if(COMN_DBUG)console.log(DESC_INCL+' background.js has sent a tab-request?????'+bloop(request));
	currentWorker.port.emit('request',request,{});
});

bgPage.port.on('response', function(response){
	if(COMN_DBUG)console.log(DESC_INCL+' background.js has sent a response - send to whom?????'+bloop(response));
	popup.port.emit('response',response);
	currentWorker.port.emit('response',response);
	if(optionsPanel)optionsPanel.port.emit('response',response);
});
bgPage.port.on('getDataUrl', function(response){
    bgPage.port.emit('dataUrlIs',data.url(""));
});

bgPage.port.on('getLocalization', function(response){
    bgPage.port.emit('localizedStrings',data.load("_locales/"+LOCALE+"/messages.json"));
});

bgPage.port.on('setClipboardText', function(txt){
   clipboard.set(txt);
});

bgPage.port.on('captureVisibleTab_Req', function(){
    bgPage.port.emit('captureVisibleTab_Resp',capture());
});

bgPage.port.on('browserAction_setIcon_Req', function(r){
    widget.port.emit('setIconURI',r);
});

bgPage.port.on('browserAction_setBadgeBackgroundColor_Req', function(r){
		widget.port.emit('setBadgeBackground',(r.color));
});

bgPage.port.on('browserAction_setBadgeText_Req', function(r){
   widget.port.emit('setBadgeText',(r.text));
});


popup.port.on('request',function(request,sender,sendResponse){
	if(COMN_DBUG)console.log(DESC_INCL+' POPUP has sent a request?????'+bloop(request));
	bgPage.port.emit('request',request,sender,sendResponse);
	if(optionsPanel)optionsPanel.port.emit('request',request,sender,sendResponse);
});

popup.port.on("tab-request", function(request,sender,sendResponse) {
	if(COMN_DBUG)console.log('main.js got tab_message!',bloop(request));
	currentWorker.port.emit('request',request,{});
});
	
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
//popup only sends empty responses... do not bother processing them!
//	currentWorker.port.emit('response',response);
//	if(optionsPanel)optionsPanel.port.emit('response',response);
//	bgPage.port.emit('response',response);
});


// Listen for tab content loads.
//tabs.on('ready', function(tab) {
//  //console.log('tab is loaded', tab.title, tab.url)
//  //if the picker window is running we should close it!
//  
//  //this is suppose to work however there is no is_attached property yet
////  if(!popup.is_attached){
////  	popup.hide();
////  }
//});

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
});

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
		worker.port.on('request',function(request,sender,sendResponse){
			if(COMN_DBUG)console.log(DESC_INCL+' worker has sent a request?????'+bloop(request));
			bgPage.port.emit('request',request,sender,sendResponse);
			popup.port.emit('request',request,sender,sendResponse);
			if(optionsPanel)optionsPanel.port.emit('request',request,sender,sendResponse);
		});

    worker.port.on('response', function(response){
    	if(COMN_DBUG)console.log(DESC_INCL+' worker has sent a response - send to whom?????'+bloop(response));
    	popup.port.emit('response',response);
    	bgPage.port.emit('response',response);
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
	}
	
	if(!panelOpts){
		console.log('undefined panel not supported');
		return;
	}
	
	optionsPanel = panel.Panel(panelOpts);

	optionsPanel.port.on('request',function(request,sender,sendResponse){
		if(COMN_DBUG)console.log(DESC_INCL+' optionsPanel has sent a request?????'+bloop(request));
		bgPage.port.emit('request',request,sender,sendResponse);
		popup.port.emit('request',request,sender,sendResponse);
	});
	
	//OPTIONS PANEL DOES NOT EMIT TAB REQUESTS...
	
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
