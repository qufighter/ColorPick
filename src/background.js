import {goToOrOpenTab, chromeStorageSaveALocalStor, loadSettingsFromChromeSyncStorage, pOptions, pAdvOptions, loadedOptions, extensionsKnown} from "./EXPORT_options_prefs_helpers.js";

//var private_window={};
//var options={};
var tabs_ports={};
//var localStorage = {}; // TBD< this is no longer hte real localStorage :/ so this does NOT sync anything wiht options.html etc

// arguably this is totally defunct... yes we can get options from private_window,
// but they are also already read into EXPORT_options_prefs_helpers.loadedOptions
//function fromPrefs(){
//	//remove defunct options
//	//localStorage.removeItem("autoRedirectPickable");
//
//	//future additions -
//	//storage.remove(['','',''], function(){})
//
//	var iconWasCustom = private_window.iconIsBitmap || private_window.appleIcon;
//
//	for(var i in pOptions){
//		if(typeof(pOptions[i].def)=='boolean')
//			options[i] = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
//		else
//			options[i] = ((localStorage[i])?localStorage[i]:pOptions[i].def);
//		private_window[i] = options[i] // todo refactor out
//	}
//
//	for(var i in pAdvOptions){
//		if(typeof(pAdvOptions[i].def)=='boolean')
//			options[i] = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pAdvOptions[i].def));
//		else
//			options[i] = ((localStorage[i])?localStorage[i]:pAdvOptions[i].def);
//		private_window[i] = options[i] // todo refactor out
//	}
//
//	if(typeof(localStorage["usageStatistics"])=='undefined'){
//		//if(!navigator.doNotTrack) localStorage["usageStatistics"]=true;
//		//else
//		localStorage["usageStatistics"]=false;
//	}
//
//	if(localStorage["usageStatistics"]=='true' && !navigator.doNotTrack){
//		localStorage.removeItem("feedbackOptOut");
//	}else{
//		localStorage.feedbackOptOut = "true";
//	}
//
//	defaultIcon(iconWasCustom);
//
//	if( chrome.runtime.setUninstallURL && !options.disableUninstallSurvey ){
//		chrome.runtime.setUninstallURL("https://www.vidsbee.com/ColorPick/Thanks/?uninstall=1&browserinfo=To help improve this tool, please take a //moment to describe why you uninstalled ColorPick.%0A%0AColorPick has an option to disable this //survey.%0A%0AExtUninstall-"+safeGetVersion());
//        //"https://www.vidsbee.com/Contact/?uninstallSurvey=ColorPick&browserinfo=To help improve this tool, please take a moment to describe why //you uninstalled ColorPick.%0A%0AColorPick has an option to disable this survey.%0A%0AExtUninstall-"+safeGetVersion());
//	}else{
//		chrome.runtime.setUninstallURL('');
//	}
//}

function defaultIcon(force){
	if( loadedOptions.iconIsBitmap || loadedOptions.appleIcon || force ){
		var iconPath='img/icons/no-shadow/';
		if(loadedOptions.appleIcon)iconPath+='apple/';
		if(loadedOptions.resetIcon)chrome.action.setIcon({path:{19:chrome.runtime.getURL(iconPath+'icon19.png'),38:chrome.runtime.getURL(iconPath+'icon38.png')}});
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



// during snapshot, we care to verify the tab didn't change.
var lastActiveTabTime=0;
var timeRequiredToBeOnTabSinceChange=500;
chrome.tabs.onActivated.addListener(function(activeInfo){
	lastActiveTabTime=(new Date()).getTime();
});

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
	
	//console.log('external message onMessageExternal', request, sender);
	var extTabId = request.active_tab;
	var extWinId = request.active_window;
	if (sender.id === extensionsKnown.color_pick_tablet){

		if(request.movePixel){
			chrome.tabs.sendMessage(extTabId, {movePixel:true,_x:request.x,_y:request.y,tabi:extTabId}, function(r) {});
			sendResponse({});
		}else if(request.getActivatedStatusFromBg){
			//console.log('chrome.tabs.sendMessage(',extTabId, {getActivatedStatus:true, tab:extTabId, win:extWinId});
			chrome.tabs.sendMessage(extTabId, {getActivatedStatus:true, tab:extTabId, win:extWinId}, function(tab_response) {
				if( chrome.runtime.lastError || !tab_response ){
					chrome.runtime.sendMessage(extensionsKnown.color_pick_tablet, {extInactive:true, tab:extTabId, win:extWinId}, function(r) {});
				}else{
					chrome.runtime.sendMessage(extensionsKnown.color_pick_tablet, tab_response, function(r) {});
				}
				//console.log('recieved a response from the tab....', tab_response);
			});
			sendResponse({askedTheTab:true});
		}else if(request.bulkAppendHistories){
			loadedOptions.syncColorHistory=(loadedOptions.syncColorHistory||'')+bulkAppendHistories;
			saveColorHistories();
			sendResponse({});
		}else if(request.getAllHistories){
			sendResponse({allExtHistories: loadedOptions.syncColorHistory || ''});
		}else if(request.historyPush && request.hex && request.rgb && request.hsv ){
			processSetColor({setColor:true,hex:request.hex,rgb:request.rgb,hsv:request.hsv});
			sendResponse({});
		}else if(request.goToOrVisitTab){
			goToOrOpenTab(request.goToOrVisitTab);
			sendResponse({});
		}
	}else{
		sendResponse({});
	}
});

function doCaptueForTab(request,tabId,winId){
	var cbf=function(dataUrl){
		var error_capturing = false;
		if(chrome.runtime.lastError){
			console.error('capture err ', chrome.runtime.lastError);
			error_capturing = true; // tbd assign sring for what error?
		}
		var currentTime = (new Date()).getTime();
		var snapDuration = currentTime - lastActiveTabTime; // measure duration since last tab activation....

		if( snapDuration > timeRequiredToBeOnTabSinceChange && dataUrl ){ // tab has to have been active for at least this long.... (keep in mind we wait 255ms before calling this)
			//setTimeout(function(){
				chrome.tabs.sendMessage(tabId, {setPickerImage:true,pickerImage:dataUrl,to:request.to}, function(response) {});
			//}, 5000); // for testing only, to simulate slow PC...
		}else{
			// tab must have changed too recently - too risky to send this snapshot back... (might be wrong tab)
			// note: error capturing will preempt getFaux mode...
			chrome.tabs.sendMessage(tabId, {setPickerImage:true,pickerImage:"",getFaux:true,to:request.to,isErrorTryAgain:error_capturing}, function(response) {});
		}
	}
	// if( request.newImage == 'for-popup' ){
	// 	cbf=function(dataUrl){
	// 		var currentTime = (new Date()).getTime();
	// 		var snapDuration = currentTime - lastActiveTabTime; // measure duration since last tab activation....
	// 		if( snapDuration > timeRequiredToBeOnTabSinceChange && dataUrl ){ // tab has to have been active for at least this long.... (keep in mind we wait 255ms before calling this)
	// 			chrome.runtime.sendMessage({setTabImage:tabId,pickerImage:dataUrl}, function(response) {});
	// 		}else{
	// 			chrome.runtime.sendMessage({didReqTabImage:tabId,tooFast:true}, function(response) {});
	// 		}
	// 	}// define handler instead?
	// }
	if(winId < 1)winId=null;
	if(loadedOptions.usePNG)chrome.tabs.captureVisibleTab(winId, {format:'png'}, cbf);
	else chrome.tabs.captureVisibleTab(winId, {format:'jpeg',quality:100}, cbf);
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
		if(request.tabw){
			winid=request.tabw - 0;
		}
		if (request.newImage){
			//todo need desired size for getFauxSnap... we can match aspect ratio vertically
			lsnaptabid=tabid;
			doCaptueForTab(request,lsnaptabid,winid);
			sendResponse({});
		}else if (request.activateOnTab){
			lastActiveTabTime=(new Date()).getTime() - timeRequiredToBeOnTabSinceChange;
			chrome.tabs.sendMessage(tabid, {enableColorPicker:true, forSnapMode: request.forSnapMode, historyLen:25},function(r){});
			sendResponse({});
		}else if (request.isBgAlive){
			sendResponse({});
		}else if (request.movePixel){
			chrome.tabs.sendMessage(tabid,Object.assign({from_bg: true}, request),function(r){});
			sendResponse({});
		}else if (request.setColor){ //hsv values here are really hsl in all cases (popup or user js)
			processSetColor(request);
			sendResponse({});
		}else if (request.browserIconMsg){
			chrome.action.setIcon({path:(request.path)});
			sendResponse({});
		}else if (request.beginGame){
			chrome.scripting.executeScript({target: {tabId: tabid}, files: ["colorgame.user.js"]});
			sendResponse({});
        }else if (request.requestSponsorsList){
            fetchSponsorsListTo(tabid, request.devicePixelRatio || 1, request.timestamp);
            sendResponse({});
		}else if (request.disableColorPicker){
			isRunning=false;
			defaultIcon();
			//chrome.action.setBadgeText({text:''});
			chrome.tabs.sendMessage(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
		}else if (request.activateForInput){
			chrome.tabs.sendMessage(tabid,{enableColorPicker:true, historyLen:25},function(response){});
			sendResponse({});
		}else if(request.goToOrVisitTab){
			goToOrOpenTab(request.goToOrVisitTab);
			sendResponse({});
		}else if(request.assignsavedhistory){
			// we saved a new history from options, avoid a round trip to storage
			console.log('assigning new history as: '+request.assignsavedhistory);
			loadedOptions.syncColorHistory = request.assignsavedhistory
			sendResponse({});
		}else if(request.reloadprefs){
			// tbd...
			loadSettingsFromChromeSyncStorage(function load_prefs_cb(){
				// logging: the joy of needing to debug possible circulars
				console.log('reaload prefs processed in bg page...');
				chrome.tabs.sendMessage(lsnaptabid, {reloadPrefs:true}, function(r) {});
			}, loadedOptions);
			sendResponse({});
    }else
    	sendResponse({});
});

function finallyProcessSafeSponsorsListFor(sponsors, safeBrowsingResponse, tabid){
    var sponsorsValid = [];
    console.log('safeBrowsingResponse', safeBrowsingResponse);
    safeBrowsingResponse = safeBrowsingResponse || {};
    // safeBrowsingResponse = { "matches": [{"threat":{"url": "http://www.urltocheck1.org/"}}] }; console.error('dummy response override!!  this code should be uncommented for TESTING ONLY!!!! oops!!!!');
    var badUrls = {};
    if( safeBrowsingResponse.matches && safeBrowsingResponse.matches.length ){
        for( var m=0, th=null; m<safeBrowsingResponse.matches.length; m++){
            th = safeBrowsingResponse.matches[m];
            if( th.threat && th.threat.url ){
                badUrls[th.threat.url] = th;
            }
        }
    }

    for( var s=0, sp=null; s<sponsors.length; s++){
        sp = sponsors[s];
        if( badUrls[sp.href] ){
            console.log('sponsor was omitted due to failed safe browisng api check', badUrls[sp.href]);
        }else{
            sponsorsValid.push(sp);
        }
    }

    if( sponsorsValid.length ){
        var sponsorsJson = JSON.stringify(sponsors);
        chrome.tabs.sendMessage(tabid, {validSponsors:sponsorsJson}, function(response) {});
    }
}

function safeBrowsingCheckSponsorsList(sponsors, tabid){
    //  https://developers.google.com/safe-browsing/v4/lookup-api (docs)
    // my argument for this not being revenue generating is that this is
    // a request made on behalf of the client to validate safety
    // in reality they would use their own api key for this task if it is important to them
    // plus as time is money, I'm not making any money...
    // I'll probably still be billed for this for more than anyone will ever pay for a link
    // I'd rather just send the link to a google redirect and let them pick if it is currently safe TBH....
    // this is just to account for the fact sites will randomly be hacked, and safety may constantly change
    // while extension deploys have become a slow process and unlikely to be as responsive to a live issue as this api
    // here is hoping no sponsor will ever be negatively impacted by this check
    // and no user will ever be negatively impacted by a sponsor link...
    var coolorpeckkey = 'AIzaSyAIWf-Mc8OvaBJYY6pBZOcBoiWZOkQjf0g';
    var threatsUrl = 'https://safebrowsing.googleapis.com/v4/threatLists?key='+coolorpeckkey;
    // you need to visit threatsUrl and load this list, or otherwise.... maintain appropriate logic here... yay!
    var baseUrl = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key='+coolorpeckkey;
    // good thing we love complexity here.... in no-mans infinite time land... lols :)
    var request = {
      "client": {
        "clientId":      "com.vidsbee.colorpick",
        "clientVersion": safeGetVersion()
      },
      "threatInfo": {
        "threatTypes":      ["MALWARE"],
        "platformTypes":    ["ANY_PLATFORM"],
        "threatEntryTypes": ["URL"],
        "threatEntries": []
      }
    };

    for( var s=0, sp=null; s<sponsors.length; s++){
        sp = sponsors[s];
        request.threatInfo.threatEntries.push(sp.href);
    }

	// mv3 fixme too use fetch/etc if possible, as needed (zero sponser presently so not needed)
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange=function(){if(xhr.readyState == 4){
        if(xhr.status == 200){
            var safeBrowsingResponse = null;
            try{
                safeBrowsingResponse = JSON.parse(xhr.responseText);
            }catch(e){
                console.warn("The Safe Browsing API did not return json.  If your internet was connected, please report this issue to http://www.vidsbee.com/Contact", xhr.responseText, xhr);
            }
            finallyProcessSafeSponsorsListFor(sponsors, safeBrowsingResponse, tabid);
        }else{
            // google is down? api key expires? well we can't just assume this means the URL is malware...
            console.warn("The Safe Browsing API check failed.  If your internet was connected, please report this issue to http://www.vidsbee.com/Contact", xhr.responseText, xhr);
            finallyProcessSafeSponsorsListFor(sponsors, null, tabid);
        }
    }};
    xhr.open('POST', baseUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function processSponsorsListFor(sponsors, tabid, timestamp){
     //timestamp = (new Date('2022-08-31 12:00:00')).getTime(); console.error('timestamp override!!  this code should be uncommented for TESTING ONLY!!!! oops!!!!');

    // if someone can hack the file system, they could probably change this check too
    // anyway we'll double check what we got from the coresponding lo/hi dpi JSON file(s) to see if it's in the approved list...
    // and check against google safe-browsing api too... see safeBrowsingCheckSponsorsList()
    var knownSponsorUrls={};
    var sponsorsValid = [];
    for( var s=0, sp=null; s<sponsors.length; s++){
        sp = sponsors[s];
        if( timestamp > sp.begin && timestamp < sp.end && knownSponsorUrls[sp.href] ){
            sponsorsValid.push(sp);
        }
    }
    //console.log('bg: sponsors', sponsors, 'validated', sponsorsValid);
    if( sponsorsValid.length ){
        safeBrowsingCheckSponsorsList(sponsors, tabid);
    }
}

function fetchSponsorsListTo(tabid, devicePixelRatio, timestamp){
    var sponsors_dpi = 'colorgame_sponsors_lodpi.json';
    if( devicePixelRatio > 1 ){
        sponsors_dpi = 'colorgame_sponsors_hidpi.json';
    }
	fetch(chrome.runtime.getURL(sponsors_dpi))
	.then(function(response){return response.text()})
	.then(function(responseText){
		var sponsors =  JSON.parse(responseText);
		processSponsorsListFor(sponsors, tabid, timestamp);
	});
}

function saveColorHistories(){
	chromeStorageSaveALocalStor({syncColorHistory: loadedOptions.syncColorHistory}, function saved_prefs_hista(){
		//console.log('save occured of the option syncColorHistory');
		//logs error when options is not showing... not sure of best way to prevent
		chrome.runtime.sendMessage({historypush: loadedOptions.syncColorHistory}, function(response) {
			if(chrome.runtime.lastError)console.log('historypush error (options screen not open?): '+chrome.runtime.lastError.message);
		});
	})
}

function processSetColor(request){
	if(request.hex) curentHex=request.hex;
	if( lastHex != curentHex ){
		//optionally store color to database...
		if(loadedOptions.shareClors){
			fetch('https://vidsbee.com/ColorPick/Daily/vcolors.php?colorhex='+curentHex)
			.then(function(response){
				// huh?  it works?  I don't have any host permisison claimed
				// to me this is an indciation of how easy it is to do nefarious things with manifest version 3
				// nuff said... (unlesssomeone made a special exception for me, aww how sweet)
				// I'm going to guess service_worker: it's not restricted.  yikes.
				// mv2 basiaclly forced you to use permissions.<all_urls> instead of a restricted set so that ohter features would work ( for example, content_scripts that needed <all_urls>)
				// now mv3 you don't have to claim anything and you can fetch (and presumably execute) anything
				// and that thing could fetch more stuff....
				// so this just breeds culplable deniablitiy, etc
				// the spyware for profit ethos of our times demands it?
				// not a fan...
			});
		}
		//store colors
		// tbd, it may already have a hex prefix...
		loadedOptions.syncColorHistory=(loadedOptions.syncColorHistory||'')+"#"+curentHex;
		saveColorHistories();
		
		
		//console.log(request, loadedOptions.syncColorHistory)
	}
	if( curentHex ){
		chrome.tabs.sendMessage(tabid,{hexValueWasSelected:curentHex.toLowerCase()},function(response){});
	}
	lastLastHex=lastHex;lastHex=curentHex;
}


chrome.runtime.onUpdateAvailable.addListener(function(details){
	updateAvailable=true;
});

chrome.runtime.onConnect.addListener(function(port){
	tabs_ports[port.name] = port;
});

function safeGetVersion(){
	if( chrome.runtime.getManifest ){
		return ((chrome.runtime.getManifest() || {}).version) || 'null-version';
	}
	return 'no-version';
}

// loadedOptions is already laoded from an empty data source, this is problematic potentially...
loadSettingsFromChromeSyncStorage(function(){
	// mv3 note until this loads, we're actually not ready to process runtime.onMessage! fun fact...
	console.log('loadedOptions', loadedOptions);
});
