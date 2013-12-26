
function fromPrefs(){
	//remove defunct options
	//localStorage.removeItem("autoRedirectPickable");

	//future additions -
	//storage.remove(['','',''], function(){})

	var iconWasCustom = window.iconIsBitmap || window.appleIcon;

	for(var i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			window[i] = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
		else
			window[i] = ((localStorage[i])?localStorage[i]:pOptions[i].def);
	}

	for(var i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			window[i] = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pAdvOptions[i].def));
		else
			window[i] = ((localStorage[i])?localStorage[i]:pAdvOptions[i].def);
	}

	if(typeof(localStorage["usageStatistics"])=='undefined'){
		//if(!navigator.doNotTrack) localStorage["usageStatistics"]=true;
		//else
		localStorage["usageStatistics"]=false;
	}

	if(localStorage["usageStatistics"]=='true' && !navigator.doNotTrack){
		localStorage.removeItem("feedbackOptOut");
	}else{
		localStorage.feedbackOptOut = "true";
	}
	
	defaultIcon(iconWasCustom);
}

function defaultIcon(force){
	if( iconIsBitmap || appleIcon || force ){
		var iconPath='img/';
		if(appleIcon)iconPath+='apple/';
		if(resetIcon)chrome.browserAction.setIcon({path:{19:chrome.extension.getURL(iconPath+'icon19.png'),38:chrome.extension.getURL(iconPath+'icon38.png')}});
		return true;
	}
	return false;
}


//on change visible tab, is cp active on this tab, if so, resnapshot..?
//888888888888888888888888888888888888888888888888888888888888888888888

//globals
var x,y,tabid=0,lsnaptabid=0,winid=0;
var curentHex=0,lastHex='FFF',lastLastHex='FFF';
var isCurrentEnableReady=false,isRunning=false,updateAvailable=false;



chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
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
			lsnaptabid=tabid;
//			wid=request._x;
//			hei=request._y;
//			dpr=request.dpr;
			var cbf=function(dataUrl){
				//if(showActualPickTarget){
				chrome.tabs.sendMessage(tabid, {setPickerImage:true,pickerImage:dataUrl}, function(response) {});
				//}
//				imageDataIsReady=false;
//				pim.src=dataUrl;
//				mcan.width = wid;
//				mcan.height = hei;
//				ctx = mcan.getContext("2d");
//				ctx.clearRect(0,0,wid,hei);
//				getNewColorData();
			}
			if(winid < 1)winid=null;
			if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
			else chrome.tabs.captureVisibleTab(winid, {format:'jpeg',quality:100}, cbf);
			sendResponse({});
		}else if (request.movePixel){
			chrome.tabs.sendMessage(tabid,request,function(r){});
//			x+=(request._x);//or otherwise use the current scale
//			y+=(request._y);
//			getNewColorData();
//			//handleRendering();
//			var dobj=getCurrentClrData();
//			dobj.movedPixel=true;
//			dobj.msg=chrome.i18n.getMessage('pressEnterToPick');
//			chrome.tabs.sendMessage(tabid,dobj,function(r){});
//			sendResponse({});
//		}else if (request.getPixel){
//			x=request._x;
//			y=request._y;
//			getNewColorData();
//			//setTimeout(handleRendering,10);
//			var dobj=getCurrentClrData();
//			dobj.movedPixel=true;
//			chrome.tabs.sendMessage(tabid,dobj,function(r){});
//			sendResponse({});
		}else if (request.setColor){
			if(request.hex) curentHex=request.hex;
			if(showPreviousClr){lastLastHex=lastHex;lastHex=curentHex;}
			else lastHex='none';
			//user clicked, optionally store color to database...
			if(shareClors){
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange=function(){if(xhr.readyState == 4){ }};
				xhr.open('GET', 'http://vidzbigger.com/vcolors.php?colorhex='+curentHex, true);
				xhr.send();
			}
			//store colors
			localStorage['colorPickHistory']+="#"+curentHex;
			//logs error when options is not showing... not sure of best way to prevent
			chrome.runtime.sendMessage({historypush: true}, function(response) {
					//console.log('disabled!');
			});
			if(autocopyhex){
				var n=document.createElement('input');document.body.appendChild(n);
				n.value=curentHex;n.select();document.execCommand('copy');n.parentNode.removeChild(n);
			}
			sendResponse({});
		}else if(request.reportingIn){
			isCurrentEnableReady=true;
			 
		}else if (request.enableColorPicker){
			//popupsShowing=true;
			//handleRendering();
			chrome.tabs.getSelected(null, function(tab) {
				tabId=tab.id;
				if(request.tabi>0 && request.tabi!=tabId){
					return false;//in the case of a popup, the currently selected "tab" is not the one we need to initialize
				}
				
				isCurrentEnableReady=false;
				var tabURL=tab.url;
				
				if(request.workerHasChanged) lsnaptabid=-1;

				chrome.tabs.sendMessage(tabId, {enableColorPicker:true}, function(r) {
					if(r){
						isRunning=true;
						if(r.wasAlreadyEnabled && lsnaptabid != tabId){
							//we were already running on this tab, yet our snapshot is of a different tab
							chrome.tabs.sendMessage(tabId, {newImage:true}, function(r) {});
						}
					}
				});

				if(tabURL.indexOf('https://chrome.google.com')==0 ||tabURL.indexOf('chrome')==0 ||tabURL.indexOf('about')==0 ){
						//console.log( 'Unsupported page type :/');
						chrome.runtime.sendMessage({greeting: "error_picker",errno:0}, function(response) {
								//console.log('disabled!');
						});
				}else if(tabURL.indexOf('http://vidzbigger.com/anypage.php')!=0){
  				window.setTimeout(function(){
  					if(!isCurrentEnableReady){
							if(tabURL.indexOf('file://')==0){
								chrome.runtime.sendMessage({greeting: "error_picker",errno:2}, function(response) {});
							}else{
								chrome.runtime.sendMessage({greeting: "error_picker",errno:1}, function(response) {});
							}
  					}
  				},560);//we expect to hear back from the content script by this time or something is wrong... and we need to use an iframe
			  }
			});
			//sendResponse({hex:curentHex,lhex:lastLastHex,previewURI:lastPreviewURI,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b});
			sendResponse({});
		}else if (request.browserIconMsg){
			chrome.browserAction.setIcon({path:(request.path)});
			sendResponse({});
		}else if (request.disableColorPicker){
			isRunning=false;
			defaultIcon();
			chrome.browserAction.setBadgeText({text:''});
			chrome.tabs.sendMessage(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
    }else if(request.reloadprefs){
			chrome.tabs.sendMessage(tabId, {reloadPrefs:true}, function(r) {});
			fromPrefs();
			sendResponse({});
    }else
    	sendResponse({});
  
});

chrome.runtime.onUpdateAvailable.addListener(function(details){
	updateAvailable=true;
});

//we need to save periodically in some way that won't over-use the sync api
chrome.alarms.create("sync colorpick", {delayInMinutes:40,periodInMinutes:80});
chrome.alarms.onAlarm.addListener(function(alarm){
	saveToChromeSyncStorage();//we should also find a way to save before the extension is being restarted
	if(!isRunning&&updateAvailable) chrome.runtime.reload();//applies a pending update
	//if(!isRunning)chrome.runtime.reload();//testing only, force update apply
});

function DOMloaded(){
	//difficult to say when best time to do this is.... chrome running at 2 locations with different settings may produce odd results!
	loadSettingsFromChromeSyncStorage(function(){
		fromPrefs();
	});
}

document.addEventListener('DOMContentLoaded', DOMloaded);

