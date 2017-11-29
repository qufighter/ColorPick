/*
 * This file is a part of the Show Pixel Color project.
 *
 */

function fromPrefs(){
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

//version
var manifestData = chrome.runtime.getManifest();
if(localStorage["version"]!=manifestData.version){
	localStorage["version"]=manifestData.version;
};

//fix fishEye
if(!localStorage["fishEye"]){
	localStorage["fishEye"]="5";
};

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
		if (request.newImage){
			lsnaptabid=tabid;
			var cbf=function(dataUrl){
				chrome.tabs.sendMessage(lsnaptabid, {setPickerImage:true,pickerImage:dataUrl}, function(response) {});
			}
			if(winid < 1)winid=null;
			if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
			else chrome.tabs.captureVisibleTab(winid, {format:'jpeg',quality:100}, cbf);
			sendResponse({});
		}else if (request.movePixel){
			chrome.tabs.sendMessage(tabid,request,function(r){});
		}else if (request.setColor){
			if(request.hex) curentHex=request.hex;
			if(showPreviousClr){lastLastHex=lastHex;lastHex=curentHex;}
			else lastHex='none';
			//store colors
			localStorage['colorPickHistory']+="#"+curentHex;
			chrome.runtime.sendMessage({historypush: true}, function(response) {
			});
			if(autocopyhex){
				var n=document.createElement('input');document.body.appendChild(n);
				n.value=curentHex;n.select();document.execCommand('copy');n.parentNode.removeChild(n);
			}
			sendResponse({});
		}else if (request.browserIconMsg){
			chrome.browserAction.setIcon({path:(request.path)});
			sendResponse({});
		}else if (request.disableColorPicker){
			isRunning=false;
			defaultIcon();
			chrome.tabs.sendMessage(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
		}else if(request.reloadprefs){
			setTimeout(function(){
				chrome.tabs.sendMessage(lsnaptabid, {reloadPrefs:true}, function(r) {});
			},255);
			fromPrefs();
			sendResponse({});
    }else
    	sendResponse({});
  
});

chrome.runtime.onUpdateAvailable.addListener(function(details){
	updateAvailable=true;
});

//need to save periodically in some way that won't over-use the sync api
chrome.alarms.create("sync colorpick", {delayInMinutes:40,periodInMinutes:80});
chrome.alarms.onAlarm.addListener(function(alarm){
	saveToChromeSyncStorage();//should also find a way to save before the extension is being restarted
	if(!isRunning&&updateAvailable) chrome.runtime.reload();//applies a pending update
});

function DOMloaded(){
	//chrome running at 2 locations with different settings may produce odd results!
	loadSettingsFromChromeSyncStorage(function(){
		fromPrefs();
	});
}

document.addEventListener('DOMContentLoaded', DOMloaded);
