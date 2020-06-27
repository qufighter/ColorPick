// these functions are NOT included in user.js (content scripts)
var loadedOptions = {}

function sendReloadPrefs(cb){
	var cbf=cb;
	if(typeof(cbf)!='function')cbf=function(){};
	chrome.runtime.sendMessage({reloadprefs: true}, function(response) {
		if(chrome.runtime.lastError)console.log('sendReloadPrefs error (if there are active views we tell them to reload the preferences which may have changed): '+chrome.runtime.lastError.message);
		cbf()
	});
}

function chromeStorageSaveALocalStor(tosave){
	storage.set(tosave, function() {
		if(chrome.runtime.lastError && chrome.runtime.lastError.message.indexOf('MAX_WRITE_OPERATIONS_PER_HOUR') > 0){
			//console.log(chrome.runtime.lastError);
		}
	});
}

function saveSyncItemsToChromeSyncStorage(){
	var tosave={};
	for(var i in pSyncItems){
		tosave[i]=localStorage[i];
	}
	chromeStorageSaveALocalStor(tosave);
	sendReloadPrefs();
}
function saveToChromeSyncStorage(){
	var tosave={};
	for(var i in pOptions){
		tosave[i]=localStorage[i];
	}
	for(var i in pAdvOptions){
		tosave[i]=localStorage[i];
	}
	chromeStorageSaveALocalStor(tosave);
}

function goToOrOpenTab(tabUrl, completedCallback){
  if( !tabUrl.match(/^chrome/) ) tabUrl = chrome.extension.getURL(tabUrl); // typically "options.html"
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

function loadSettingsFromChromeSyncStorage(cbf){
	
	storage.get(null, function(obj) {
		for(i in obj){
			if(pOptions[i] || pAdvOptions[i] || pSyncItems[i]){
				localStorage[i] = obj[i];
			}
		}
		loadPrefsFromLocalStorage(loadedOptions, function(){});
		sendReloadPrefs(); // can maybe remove the call to sendReload here and call when needed instead?
		if(typeof(cbf)=='function')cbf();
	});
}

loadPrefsFromLocalStorage(loadedOptions, function(){});
