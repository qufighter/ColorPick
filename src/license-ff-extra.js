DESC_INCL='license.js ';
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
	if(document.getElementById('btn_register')){
		document.getElementById('btn_register').addEventListener('click',function(ev){
			self.port.emit('show_popup','REGISTER_SCREEN');
			preventEventDefault(ev);
		});
	}
	if(document.getElementById('btn_agree')){
		document.getElementById('btn_agree').addEventListener('click',function(ev){
			self.port.emit('destroyPopupSoon');
		});
	}
	if(document.getElementById('btn_try')){
		document.getElementById('btn_try').addEventListener('click',function(ev){
			self.port.emit('destroyPopupSoon');
		});
	}
}


function checkResourcesReady(){
	if(RSC_READY==0){
		ff_createDOM();
	}else{
		setTimeout(checkResourcesReady,33);
	}
}
checkResourcesReady();

function sendReloadPrefs(cb){
	var cbf=cb;
	if(typeof(cbf)!='function')cbf=function(){};
	var m_prefs={};
	for(var i in localStorage){
		m_prefs[i]=localStorage[i];
	}
	chrome.extension.sendRequest({reloadprefs: true,prefs:m_prefs}, function(response) {cbf()});
}