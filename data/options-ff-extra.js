DESC_INCL='options.js ';
firefoxChromeApi.setResponseIDbase(3000);

function ff_createDOM(){
	createDOM();
	
	ln=document.getElementsByTagName('a');
	for(var i=0,l=ln.length;i<l;i++){
		if(ln[i].target=="_blank"){
			ln[i].addEventListener('click',function(){
				self.port.emit('destroyPopupSoon');
			});
		}
	}
	
	if(document.getElementById('license_link')){
		document.getElementById('license_link').addEventListener('click',function(ev){
			self.port.emit('show_popup','LICENSE_SCREEN');
			preventEventDefault(ev);
		});
	}
	if(document.getElementById('register_link')){
		document.getElementById('register_link').addEventListener('click',function(ev){
			self.port.emit('show_popup','REGISTER_SCREEN');
			preventEventDefault(ev);
		});
	}
}



function checkResourcesReady(){
	if(RSC_READY==0 && gotMainPrefs){
		ff_createDOM();
	}else{
		setTimeout(checkResourcesReady,33);
	}
}


function sendReloadPrefs(){
	var m_prefs={};
	for(var i in localStorage){
		m_prefs[i]=localStorage[i];
	}
	chrome.extension.sendRequest({reloadprefs: true,prefs:m_prefs}, function(response) { });
}

var gotMainPrefs=false;
function fetchMainPrefs(){
	chrome.extension.sendRequest({getprefs: true}, function(response) {
		gotMainPrefs=true;
		for(i in response.prefs){
			localStorage[i]=response.prefs[i];
		}
		load_history();
		//console.log('got resp'+response.prefs.colorPickHistory)
	});
}

fetchMainPrefs();
checkResourcesReady();