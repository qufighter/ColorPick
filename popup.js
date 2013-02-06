var tabid=0;
var isScriptAlive=false,scriptAliveTimeout=0;
var cpw=165,cph=303;
var cpScaleOffset=(navigator.platform=='win32'?16:0)
if(typeof(localStorage["cpScaleOffset"])!='undefined')cpScaleOffset = localStorage["cpScaleOffset"]-0;
function getEventTargetA(ev){
	var targ=getEventTarget(ev)
	if(targ.nodeName != 'A')return targ.parentNode;
	return targ;
}
function getEventTarget(ev){
	ev = ev || event;
	var targ=(typeof(ev.target)!='undefined') ? ev.target : ev.srcElement;
	if(targ !=null){
	    if(targ.nodeType==3)
	        targ=targ.parentNode;
	}
	return targ;
}
function rgb2hsv(red, grn, blu) {
	var x, val, f, i, hue, sat, val;
	red/=255;//http://www.actionscript.org/forums/showthread.php3?t=15155
	grn/=255;
	blu/=255;
	x = Math.min(Math.min(red, grn), blu);
	val = Math.max(Math.max(red, grn), blu);
	if (x==val){
	    return({h:0, s:0, v:Math.floor(val*100)});
	}
	f = (red == x) ? grn-blu : ((grn == x) ? blu-red : red-grn);
	i = (red == x) ? 3 : ((grn == x) ? 5 : 1);
	hue = Math.floor((i-f/(val-x))*60)%360;
	sat = Math.floor(((val-x)/val)*100);
	val = Math.floor(val*100);
	return({h:hue, s:sat, v:val});
}
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request.setPreview && (request.tabi==tabid || tabid==0)){
    	var hex=request.hex;//RGBtoHex(request.c_r+0,request.c_g+0,request.c_b+0);
    	
    	document.getElementById('pre').src=request.previewURI;
    	document.getElementById('hexpre').style.backgroundColor='#'+hex;
    	document.getElementById('ohexpre').style.backgroundColor='#'+request.lhex;
    	document.getElementById('hex').value=hex;
    	document.getElementById('cr').value=request.cr;
    	document.getElementById('cg').value=request.cg;
    	document.getElementById('cb').value=request.cb;
    	var hsv=rgb2hsv(request.cr,request.cg,request.cb);
    	document.getElementById('ch').value=hsv.h;
    	document.getElementById('cs').value=hsv.s;
    	document.getElementById('cv').value=hsv.v;
    	document.getElementById('crgb').value='rgb('+document.getElementById('cr').value+','+document.getElementById('cg').value+','+document.getElementById('cb').value+')';
    	document.getElementById('chsl').value='hsl('+document.getElementById('ch').value+','+document.getElementById('cs').value+','+document.getElementById('cv').value+')';

    	//document.body.innerHTML='<img src="'+request.previewURI+'" /> '+hex;
    	
    	sendResponse({});
    }else if(request.greeting == "re_init_picker"){
    	document.getElementById('pre').src=chrome.extension.getURL('default.png');
    	iin()
    }else if(request.greeting == "error_picker"){
    	document.getElementById('pre').src=chrome.extension.getURL('error'+request.errno+'.png')
    }else{
    	sendResponse({});
    }
  });

var borderValue='1px solid grey';
if(typeof(localStorage["borderValue"])!='undefined')borderValue = localStorage["borderValue"];

var useCSSValues=false;
if(typeof(localStorage["useCSSValues"])!='undefined')useCSSValues = ((localStorage["useCSSValues"]=='true')?true:false);
EnableRGB=true;
EnableHSL=true;
if(typeof(localStorage["EnableRGB"])!='undefined')EnableRGB = ((localStorage["EnableRGB"]=='true')?true:false);
if(typeof(localStorage["EnableHSL"])!='undefined')EnableHSL = ((localStorage["EnableHSL"]=='true')?true:false);


function resnap(){
	chrome.tabs.sendRequest(tabid,{newImage:true},function(r){});
}
function setButtonState(isPicking){
	if(isPicking){
		document.getElementById('epick').className='btnActive'+(pickEveryTime?' autocast':'');
	}else{
		document.getElementById('epick').className='btnInactive'+(pickEveryTime?' autocast':'');
	}
}
function toglPick(){
	chrome.tabs.sendRequest(tabid,{doPick:true},function(r){
		setButtonState(r.isPicking);
	});//perform pick
}
function preventEventDefault(ev){
	ev = ev || event;
	if(ev.preventDefault)ev.preventDefault();
	ev.returnValue=false;
	return false;
}
function toglAutoPick(ev){
	pickEveryTime = !pickEveryTime;
	localStorage["pickEveryTime"]=pickEveryTime;
	document.getElementById('epick').className=document.getElementById('epick').className.replace('autocast','').replace(' ','');
	if(pickEveryTime){
		document.getElementById('epick').className+=' autocast';
	}
	return preventEventDefault(ev)
}

function wk(ev){
	if(ev.keyCode==27){
		//dissableColorPickerFromHere();// :D
	}else if(ev.keyCode==82||ev.keyCode==74){//r or j refresh
		resnap();
	}else if(ev.keyCode==38){//u
		chrome.extension.sendRequest({movePixel:true,_x:0,_y:-1,tabi:tabid},function(r){});
	}else if(ev.keyCode==40){//d
		chrome.extension.sendRequest({movePixel:true,_x:0,_y:1,tabi:tabid},function(r){});
	}else if(ev.keyCode==37){//l
		chrome.extension.sendRequest({movePixel:true,_x:-1,_y:0,tabi:tabid},function(r){});
	}else if(ev.keyCode==39){//r
		chrome.extension.sendRequest({movePixel:true,_x:1,_y:0,tabi:tabid},function(r){});
	}else if(ev.keyCode==13){//enter
		toglPick();
	}
}

function iin(){
	
	if(useCSSValues){
		document.getElementById('cssmode').style.display="block";
		document.getElementById('defaultmode').style.display="none";
	}
	if(!EnableRGB){
		document.getElementById('defrgb').style.display="none";
		document.getElementById('cssrgb').style.display="none";
	}
	if(!EnableHSL){
		document.getElementById('defhsl').style.display="none";
		document.getElementById('csshsl').style.display="none";
	}
	document.getElementById('eclose').innerHTML='<img border="0" align="top" style="position:relative;top:3px;" src="'+chrome.extension.getURL('close.png')+'" />';

	//if( !globalPopout ){
  	if( window.name.indexOf('colorPickPopup')>-1 ){
  		tabid=window.name.replace('colorPickPopup_','')-0;
  		window.setTimeout(function(){
	  		if(innerWidth){
	  			scal=(outerWidth-cpScaleOffset)/innerWidth;
	  			cpw=document.body.clientWidth + 50;
	  			cph=document.body.clientHeight + 75;
	  			window.resizeTo(cpw*scal,cph*scal);
	  		}
	  	},50);
  		setupInjectScripts()
  	}else{
	  	chrome.windows.getCurrent(function(window){
	  		chrome.tabs.getSelected(window.id, function(tab){
	  			tabid=tab.id;
	  			setupInjectScripts()
	  		})
	  	})
	  }
	//}
	
	window.addEventListener('keydown',wk);//window does not work unless inspect mode
	
	
	if(document.getElementById('plat_prev')){
		if(navigator.userAgent.indexOf('Windows') < 0){
			document.getElementById('plat_prev').src="ico_mac.png";
		}
		document.getElementById('plat_prev').style.display="inline";
	}
}

function setupInjectScripts(){
	finishSetup();return;

//	   "content_scripts": [ {
//      "js": [ "colorpick.user.js" ],
//      "run_at": "document_start",
//      "matches": [ "*://*/*" ]
//   } ],
//eventually re-enable this block (removing above) - since after first install it gets us running - however
//gotta make sure that any pre-installed version responds to testAlive first!
//	isScriptAlive=false;
//	chrome.tabs.sendRequest(tabid, {testAlive:true}, function(response) {
//		if(response&&response.result){
//			isScriptAlive=true;
//			scriptsInjectedResult();
//		}
//	});
//	scriptAliveTimeout=setTimeout(scriptsInjectedResult,100);
}
//function scriptsInjectedResult(){
//	clearTimeout(scriptAliveTimeout);
//	if(!isScriptAlive){
//		chrome.tabs.executeScript(tabid, {file: "colorpick.user.js"});
//		isScriptAlive=true;
//	}
//	finishSetup();
//}
function finishSetup(){
	chrome.extension.sendRequest({enableColorPicker:true,tabi:tabid}, function(response) {
		
		
		hex=response.hex;
		document.getElementById('hexpre').style.backgroundColor='#'+hex;
		document.getElementById('ohexpre').style.backgroundColor='#'+hex;
		document.getElementById('hex').value=hex;
		document.getElementById('cr').value=response.cr;
  	document.getElementById('cg').value=response.cg;
  	document.getElementById('cb').value=response.cb;
  	var hsv=rgb2hsv(response.cr,response.cg,response.cb);
  	document.getElementById('ch').value=hsv.h;
  	document.getElementById('cs').value=hsv.s;
  	document.getElementById('cv').value=hsv.v;
		if(response.previewURI.length > 0 )document.getElementById('pre').src=response.previewURI;
		document.getElementById('hex').select();
  	document.getElementById('crgb').value='rgb('+document.getElementById('cr').value+','+document.getElementById('cg').value+','+document.getElementById('cb').value+')';
  	document.getElementById('chsl').value='hsl('+document.getElementById('ch').value+','+document.getElementById('cs').value+','+document.getElementById('cv').value+')';

		
		usePrevColorBG=true;
		if(typeof(localStorage["usePrevColorBG"])!='undefined')usePrevColorBG = ((localStorage["usePrevColorBG"]=='true')?true:false);
		if(usePrevColorBG){
			if(hex>0)document.body.style.backgroundColor='#'+hex;
		}else{
			bbackgroundColor='white';
			if(typeof(localStorage["bbackgroundColor"])!='undefined')bbackgroundColor = (localStorage["bbackgroundColor"]);
			document.body.style.backgroundColor=bbackgroundColor;
		}
		
		
		
		showPreviousClr=true;
		if(typeof(localStorage["showPreviousClr"])!='undefined')showPreviousClr = ((localStorage["showPreviousClr"]=='true')?true:false);
		if(!showPreviousClr){
			document.getElementById('ohexpre').style.display='none';
			document.getElementById('hexpre').style.width='150px';
			document.getElementById('hexpre').style.borderRight=borderValue;
		}
		
		if(borderValue!='1px solid grey'){
			document.getElementById('pres').style.border=borderValue;
			
//					document.getElementById('hexpre').style.border=borderValue;
//	  			document.getElementById('ohexpre').style.border=borderValue;
//	  			if(showPreviousClr){
//		  			document.getElementById('hexpre').style.borderRight='none';
//		  			document.getElementById('ohexpre').style.borderLeft='none';
//		  		}
//	  			document.getElementById('pre').style.border=borderValue;
		}
		
		var hasVScroll = document.body.scrollHeight > document.body.clientHeight;
		if(hasVScroll){
			document.body.style.width='166px';
		}
	});
	
	pickEveryTime=true;
	if(typeof(localStorage["pickEveryTime"])!='undefined')pickEveryTime = ((localStorage["pickEveryTime"]=='true')?true:false);

	//in future cases we will send a testAlive earlier... state will be set already...
	chrome.tabs.sendRequest(tabid,{testAlive:true},function(r){
		if(!r.isPicking && pickEveryTime)toglPick();
		else setButtonState(r.isPicking);
	});
	
	if(localStorage.feedbackOptOut=='true' && localStorage["reg_chk"]!='true'){
		setTimeout(checkForLicense,500);
	}
}
function oout(){
	chrome.extension.sendRequest({disableColorPicker:true},function(r){});
}
var x,y;
document.onmousemove=function(ev){
	x=ev.pageX-window.pageXOffset
	y=ev.pageY-window.pageYOffset
	if(isDrag){
		chrome.extension.sendRequest({movePixel:true,_x:((x1-x)/2),_y:((y1-y)/2),tabi:tabid}, function(response) {});
		x1=x,y1=y;//accoutn for that we moved it already
	}
}
var x1=0,y1=0,isDrag=false;;
function initdrag(ev){
	x1=x,y1=y;
	isDrag=true;
	
	ev.preventDefault();
	return false;
	//document.getElementById('dbg').innerHTML=(x1)+' ' +(y1);
}
function finalizedrag(){
	if(isDrag){
  	//document.getElementById('dbg').innerHTML=(x-x1)+' ' +(y-y1);
  	chrome.extension.sendRequest({movePixel:true,_x:(x1-x),_y:(y1-y),tabi:tabid}, function(response) {});
  	isDrag=false;
  }
}

var win2 = 0;
function popupimage(mylink, windowname)
{
	if (! window.focus)return true;
	mylink = new String( mylink.href );
	if( win2 == 0 || typeof(win2) != 'object' || typeof(win2.location) != 'string'  ){
		win2 = window.open(mylink, windowname, 'fullscreen=no,toolbar=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,directories=no,location=yes,width=160,height=294');
	}else{
		win2.location = mylink;
	}
	win2.blur();
	win2.focus();
	return false;
}
function popOut(){
 popupimage({href:chrome.extension.getURL('popup.html?isPopup')},'colorPickPopup_'+tabid);
}

function close_stop_picking(){
 oout();window.close()
}

function just_close_preview(){
 window.close()
}

function selectSelfText(ev){
 getEventTarget(ev).select();
}

var licf=false,lhei=10;
function checkForLicense(){
	
	document.getElementById('unreg_msg').style.display="block";
	
	if(localStorage["hasAgreedToLicense"]=='true')return;
	
	if(typeof(localStorage["trialPeriod"])=='undefined')localStorage["trialPeriod"]=0;
	if(localStorage["trialPeriod"]-0 < 5 ){
		localStorage["trialPeriod"] = localStorage["trialPeriod"]-0+1;
		return;
	}
	
	return;//do not be super annoying...
	
	lhei=10;
	var f=document.createElement('iframe');
	f.setAttribute('id','license_frame');
	f.setAttribute('src','license.html');
	f.setAttribute('width','146');
	f.setAttribute('height',lhei);
	f.setAttribute('frameborder','yes');
	f.setAttribute('scrolling','no');
	f.setAttribute('style','position:absolute;top:40px;left:3px;z-index:999;box-shadow: 0px 0px 6px #000;opacity:0.9;');
	
	if(document.body.firstChild.id=='license_frame')document.body.removeChild(document.body.firstChild);
	document.body.insertBefore(f,document.body.firstChild);
	licf=f;
	animIn();
}
function animIn(){
	lhei+=5;
	licf.style.height=lhei+'px';
	if(lhei < 150)setTimeout(animIn,33)
}

document.addEventListener('DOMContentLoaded', function () {
	iin();
  document.getElementById('eclose').addEventListener('click', close_stop_picking);
  document.getElementById('hidemin').addEventListener('click', just_close_preview);
  document.getElementById('pre').addEventListener('dragstart', initdrag);
  document.getElementById('pre').addEventListener('mouseout', finalizedrag);
  document.getElementById('pre').addEventListener('mouseup', finalizedrag);
  
  document.getElementById('hex').addEventListener('mouseover', selectSelfText);
  document.getElementById('cr').addEventListener('mouseover', selectSelfText);
  document.getElementById('cg').addEventListener('mouseover', selectSelfText);
  document.getElementById('cb').addEventListener('mouseover', selectSelfText);
  document.getElementById('ch').addEventListener('mouseover', selectSelfText);
  document.getElementById('cs').addEventListener('mouseover', selectSelfText);
  document.getElementById('cv').addEventListener('mouseover', selectSelfText);
  document.getElementById('crgb').addEventListener('mouseover', selectSelfText);
  document.getElementById('chsl').addEventListener('mouseover', selectSelfText);
  
	document.getElementById('epick').addEventListener('click', toglPick);
	document.getElementById('epick').addEventListener('contextmenu', toglAutoPick);
	document.getElementById('resnap').addEventListener('click', resnap);
	document.getElementById('popout').addEventListener('click', popOut);

});
