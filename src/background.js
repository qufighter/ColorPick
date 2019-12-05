
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

function goToOrOpenTab(tab, completedCallback){
  var optionsUrl = chrome.extension.getURL(tab); // typically "options.html"
  completedCallback = completedCallback || function(){};
  chrome.tabs.query({
    url: optionsUrl,
    currentWindow: true
  }, function(tabs){
    if( tabs.length > 0 ){
      chrome.tabs.update(tabs[0].id,{active:true}, completedCallback)
      //chrome.tabs.highlight({tabs:[tabs[0].index], windowId:tabs[0].windowId}, completedCallback);
    }else{
      chrome.tabs.create({
        url: optionsUrl,
        active: true
      }, function(t){
        chrome.tabs.update(t.id,{active:true}, completedCallback)
        // chrome.tabs.highlight({tabs:[t.index]}, completedCallback)
      });
    }
  });
}

//on change visible tab, is cp active on this tab, if so, resnapshot..?
//888888888888888888888888888888888888888888888888888888888888888888888

//globals
var x,y,tabid=0,lsnaptabid=0,winid=0;
var curentHex=0,lastHex='FFF',lastLastHex='FFF';
var isCurrentEnableReady=false,isRunning=false,updateAvailable=false;



// during snapshot, we care to verify the tab didn't change.
var lastActiveTabTime=0;
chrome.tabs.onActivated.addListener(function(activeInfo){
	lastActiveTabTime=(new Date()).getTime();
});

function getFauxSnap(dataUrl,w,h){
	var props = {width:600,height:400};
	w=w||props.width;
	h=h||props.height;
	var ratio = w/h;
	props.height = props.width / ratio;
	if( props.height < 400 ) props.height = 400;
	var cvs = document.createElement('canvas');
	cvs.setAttribute('width', props.width)
	cvs.setAttribute('height', props.height)
	var ctx = cvs.getContext('2d');
	ctx.fillStyle = "rgb(77,77,77)";
	ctx.fillRect(0, 0, props.width, props.height);
	ctx.fillStyle = "rgb(255,255,255)";
	ctx.textAlign = "center";
	ctx.font = "12px sans-serif";
	ctx.fillText("Press R, scroll or resize the window for a new snapshot", 300, 50);
	ctx.font = "24px sans-serif";
	ctx.fillText("ColorPick - Snapshot Error", 300, 100);
	ctx.font = "12px sans-serif";
	if( dataUrl ){
		ctx.fillText("The screenshot was discarded", 300, 200);
	}
	ctx.fillText("Press R, scroll or resize the window for a new snapshot", 300, 250);
	return cvs.toDataURL();
}

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
			//todo need desired size for getFauxSnap... we can match aspect ratio vertically
			lsnaptabid=tabid;
			var cbf=function(dataUrl){

				var currentTime = (new Date()).getTime();
				var snapDuration = currentTime - lastActiveTabTime; // measure duration since last tab activation....

				if( snapDuration > 1000 && dataUrl ){ // tab has to have been active for at least this long.... (keep in mind we wait 255ms before calling this)
					chrome.tabs.sendMessage(lsnaptabid, {setPickerImage:true,pickerImage:dataUrl}, function(response) {});
				}else{
					// tab must have changed too recently - too risky to send this snapshot back... (might be wrong tab)
					chrome.tabs.sendMessage(lsnaptabid, {setPickerImage:true,pickerImage:getFauxSnap(dataUrl,request.w,request.h),isErrorTryAgain:true}, function(response) {});
				}
			}
			if(winid < 1)winid=null;
			if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
			else chrome.tabs.captureVisibleTab(winid, {format:'jpeg',quality:100}, cbf);
			sendResponse({});
		}else if (request.isBgAlive){
			sendResponse({});
		}else if (request.movePixel){
			chrome.tabs.sendMessage(tabid,request,function(r){});
		}else if (request.setColor){
			if(request.hex) curentHex=request.hex;
			if(showPreviousClr){lastLastHex=lastHex;lastHex=curentHex;}
			else lastHex='none';
			//user clicked, optionally store color to database... (db full... does not work)
			// if(shareClors){
			// 	var xhr = new XMLHttpRequest();
			// 	xhr.onreadystatechange=function(){if(xhr.readyState == 4){ }};
			// 	xhr.open('GET', 'http://vidzbigger.com/vcolors.php?colorhex='+curentHex, true);
			// 	xhr.send();
			// }
			//store colors
			localStorage['colorPickHistory']=(localStorage['colorPickHistory']||'')+"#"+curentHex;
			//logs error when options is not showing... not sure of best way to prevent
			chrome.runtime.sendMessage({historypush: true}, function(response) {
				if(chrome.runtime.lastError)console.log('historypush error: '+chrome.runtime.lastError.message);
			});
			if(autocopyhex&&autocopyhex!='false'){
				var n=document.createElement('input');document.body.appendChild(n);
				var fmt = curentHex;
				if( request.rgb && autocopyhex=='rgb' ) fmt='rgb'+formatColorValues(request.rgb.r,request.rgb.g,request.rgb.b);
				if( request.hsv && autocopyhex=='hsl' ) fmt='hsl'+formatColorValues(request.hsv.h,request.hsv.s,request.hsv.v,0,1,1);
				n.value=fmt;n.select();document.execCommand('copy');n.parentNode.removeChild(n);
			}
			if( curentHex ){
				chrome.tabs.sendMessage(tabid,{hexValueWasSelected:curentHex.toLowerCase()},function(response){});
			}
			sendResponse({});
		}else if (request.browserIconMsg){
			chrome.browserAction.setIcon({path:(request.path)});
			sendResponse({});
		}else if (request.beginGame){
			chrome.tabs.executeScript(tabid, {file: "colorgame.user.js"}, function(){});
			sendResponse({});
		}else if (request.disableColorPicker){
			isRunning=false;
			defaultIcon();
			//chrome.browserAction.setBadgeText({text:''});
			chrome.tabs.sendMessage(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
		}else if (request.activateForInput){
			chrome.tabs.sendMessage(tabid,{enableColorPicker:true},function(response){});
			sendResponse({});
		}else if(request.goToOrVisitTab){
			goToOrOpenTab(request.goToOrVisitTab);
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

chrome.runtime.onConnect.addListener(function(port){});

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

function safeGetVersion(){
	if( chrome.runtime.getManifest ){
		return ((chrome.runtime.getManifest() || {}).version) || 'null-version';
	}
	return 'no-version';
}

if( chrome.runtime.setUninstallURL ){
	chrome.runtime.setUninstallURL("https://www.vidsbee.com/Contact/?browserinfo=Please take a moment to briefly describe why you uninstalled Color Pick.%0A%0AThank you for your support!%0A%0AAppVersion:ExtenstionRegPage-"+safeGetVersion());
}