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
}


function checkResourcesReady(){
	if(RSC_READY==0){
		ff_createDOM();
	}else{
		setTimeout(checkResourcesReady,33);
	}
}
checkResourcesReady();