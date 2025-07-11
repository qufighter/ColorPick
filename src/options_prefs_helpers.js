// these functions are NOT included in user.js (content scripts)

//run build_exports.sh to create EXPORT_<file>.js
//import {storage, plat3, isWindows, isMac, isFirefox, isChrome, isEdge, pOptions, pAdvOptions, pSyncItems, extensionsKnown, formatColorValues, formatColorValuesWith, navTo, navToHelp, navToDesktop, navToMobile, navToReg, navToAmz, navToOptions, navToHistory, navToPallete, loadPrefsFromStorage, loadPrefsFromLocalStorage} from "./EXPORT_options_prefs.js";

var loadedOptions = {}

if(typeof(localStorage)!='object'){
	var localStorage = {};
}


function sendReloadPrefs(cb){
	var cbf=cb;
	if(typeof(cbf)!='function')cbf=function(){};
	chrome.runtime.sendMessage({reloadprefs: true}, function(response) {
		if(chrome.runtime.lastError)console.log('sendReloadPrefs error (if there are active views we tell them to reload the preferences which may have changed): '+chrome.runtime.lastError.message);
		cbf()
	});
}

// note, this is probably inadequately named, as it will be local only if sync is not available...
// and yes sadly clicking fast may yield errors syncing the color history now :/
// mv3 note need to handle errors with save now... localStorage backup won't necessarily be reliably available
function chromeStorageSaveALocalStor(tosave, cbf){
	cbf =  cbf || function(){};
	storage.set(tosave, function() {
		if(chrome.runtime.lastError ){
			console.log(chrome.runtime.lastError);
			if(chrome.runtime.lastError.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') > 0){
				// ???
			}
		}
		cbf();
	});
}

function saveSyncItemsToChromeSyncStorage(cbf){
	var tosave={};
	for(var i in pSyncItems){
		tosave[i]=localStorage[i];
	}
	chromeStorageSaveALocalStor(tosave, cbf);
	sendReloadPrefs();
}
function saveToChromeSyncStorage(cbf){
	var tosave={};
	for(var i in pOptions){
		tosave[i]=localStorage[i];
	}
	for(var i in pAdvOptions){
		tosave[i]=localStorage[i];
	}
	chromeStorageSaveALocalStor(tosave, cbf);
}

function goToOrOpenTab(tabUrl, completedCallback){
  if( tabUrl.match(/^http/) ) tabUr = tabUrl
  else if( !tabUrl.match(/^chrome/) ) tabUrl = chrome.runtime.getURL(tabUrl); // typically "options.html"
  completedCallback = completedCallback || function(){};
  chrome.tabs.query({
    url: tabUrl,
    currentWindow: true
  }, function(tabs){
    if( tabs.length > 0 ){
      chrome.tabs.update(tabs[0].id,{active:true}, completedCallback)
      //chrome.tabs.highlight({tabs:[tabs[0].index], windowId:tabs[0].windowId}, completedCallback);
    }else{
      chrome.tabs.create({
        url: tabUrl,
        active: true
      }, function(t){
        chrome.tabs.update(t.id,{active:true}, completedCallback)
        // chrome.tabs.highlight({tabs:[t.index]}, completedCallback)
      });
    }
  });
}

// https://stackoverflow.com/a/15726116
function getDirection(el) {
    var dir;
    if (el.currentStyle)
        dir = el.currentStyle['direction'];
    else if (window.getComputedStyle)
        dir = getComputedStyle(el, null).getPropertyValue('direction');
    return dir;
}

function detectDirection(){
	var dir = getDirection(document.body);
	document.body.setAttribute('detected-dir', dir);
	document.body.classList.add(dir);
	return getDirMap(dir);
}

function getDirMap(dir){
	var ltrtl={
		ltr:{start:'left',end:'right',endResize:'nwse',eventPageX:function(x){return x;}},
		rtl:{start:'right',end:'left',endResize:'nesw',eventPageX:function(x){return window.innerWidth-x;}}
	};
	var dirMap = ltrtl[dir || document.body.getAttribute('detected-dir')] || ltrtl.ltr;
	return dirMap;
}

function loadSettingsFromChromeSyncStorage(cbf, optionalIntoObj){
	
	var srcLocation = localStorage;
	
	
	storage.get(null, function(obj) {
		for(var i in obj){
			if(pOptions[i] || pAdvOptions[i] || pSyncItems[i]){
				srcLocation[i] = obj[i];
			}
		}
		loadPrefsFromLocalStorage(optionalIntoObj || loadedOptions, function(){}, srcLocation);
		sendReloadPrefs(); // can maybe remove the call to sendReload here and call when needed instead?
		if(typeof(cbf)=='function')cbf();
	});
}

loadPrefsFromLocalStorage(loadedOptions, function(){});


//run build_exports.sh to create EXPORT_<file>.js
//export { storage, plat3, isWindows, isMac, isFirefox, isChrome, isEdge, pOptions, pAdvOptions, pSyncItems, extensionsKnown, formatColorValues, formatColorValuesWith, navTo, navToHelp, navToDesktop, navToMobile, navToReg, navToAmz, navToOptions, navToHistory, navToPallete, loadPrefsFromStorage, loadPrefsFromLocalStorage, loadedOptions, loadSettingsFromChromeSyncStorage, getDirMap, detectDirection, getDirection, goToOrOpenTab, saveToChromeSyncStorage, saveSyncItemsToChromeSyncStorage, chromeStorageSaveALocalStor, sendReloadPrefs }
