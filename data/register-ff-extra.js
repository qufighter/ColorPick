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
	if(document.getElementById('register_link')){
		document.getElementById('register_link').addEventListener('click',function(ev){
			self.port.emit('show_popup','REGISTER_SCREEN');
			preventEventDefault(ev);
		});
	}
	
	if(document.getElementById('inapp-unlock')){
		document.getElementById('inapp-unlock').style.display='none';
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

var ffxmlhttpobject={
	url : '',
	readyState : 4,
	status : 0,
	responseText : '',
	open : function(method,url){
		this.url=url;
	},
	onreadystatechange : function(){
		
	},
	send : function(){
		self.port.emit('XMLHttpRequest',this.url);
	}
};
self.port.on('XMLHttpResponse', function(status,responseText){
	ffxmlhttpobject.readyState=4;
	ffxmlhttpobject.status=status;
	ffxmlhttpobject.responseText=responseText;
	ffxmlhttpobject.onreadystatechange();
});
function getXMLhttpObject(){
	ffxmlhttpobject.readyState=0;
	ffxmlhttpobject.status=0;
	ffxmlhttpobject.responseText='';
	return ffxmlhttpobject;
}
