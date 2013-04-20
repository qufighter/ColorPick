DESC_INCL='options.js ';
firefoxChromeApi.setResponseIDbase(3000);

function sendReloadPrefs(){
	var m_prefs={};
	for(var i in localStorage){
		m_prefs[i]=localStorage[i];
	}
	chrome.extension.sendRequest({reloadprefs: true,prefs:m_prefs}, function(response) { });
}