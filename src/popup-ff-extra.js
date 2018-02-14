DESC_INCL='popup.js ';
firefoxChromeApi.setResponseIDbase(2000);

function setupInjectScripts(){
	//override as empty function, since this will lead to auto-enabling the extension when the popup is created.
}
//self.port.on('hide',function(){
//	self.port.emit('disconnect');
//});
self.port.on('shown',function(){
	//we culd just as well create the dom here if we have not already....
	//else
	
	//these are defaults since on chrome we re-create the whole dom each time this is shown
	document.getElementById('cssmode').style.display="none";
	document.getElementById('defaultmode').style.display="block";
	document.getElementById('defrgb').style.display="block";
	document.getElementById('cssrgb').style.display="block";
	document.getElementById('defhsl').style.display="block";
	document.getElementById('csshsl').style.display="block";
	document.getElementById('chooser').style.display='none';
	document.body.style.width='auto';
	sizeWindow(160,window.outterHeight);
	
	iin();
	finishSetup();//since this actually enablesColorPicker do not call until shown!
});
//on mac, when "on hidden" need to potentially pick from screen, lock picker
//self.port.on('shown',function(){
//	finishSetup();
//});

//helps to keep responses listening seperate between each file that uses the chromeAPI


function ff_createDOM(){
	createDOM();
	if(document.getElementById('optsb')){
		document.getElementById('optsb').addEventListener('click',function(ev){
			self.port.emit('show_popup','OPTIONS_SCREEN');
			preventEventDefault(ev);
		});
	}
}

function checkResourcesReady(){
	if(RSC_READY==0){
		ff_createDOM();
	}else{
		setTimeout(checkResourcesReady,1000);//no rush
	}
}
checkResourcesReady();

//overrides
function popOut(ev){
	self.port.emit('show_popup','POPUP_PREVIEW');
	preventEventDefault(ev);
}
function sizeWindow(x,y){
	self.port.emit('resize_popup',x,y);
}
function getPageZoomFactor(){
	return 1;
}
function just_close_preview(){
 self.port.emit('hide_popup');
}
function close_stop_picking(){
 oout();just_close_preview()
}

//function movePixel(request){
//	
//}
//
//function movePixel(request){
//  x+=(request._x);//or otherwise use the current scale
//  y+=(request._y);
//  handleRendering()
//  dobj=getCurrentClrData();
//  dobj.movedPixel=true;
//  dobj.msg='Press Enter to Pick Color';
//  chrome.tabs.sendRequest(tabid,dobj,function(r){});
//}
//
//function getPixel(request){
//  x=request._x;
//  y=request._y;
//  handleRendering();
//  sendResponse(getCurrentClrData());
//}
