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
function toHex(N) {//http://www.javascripter.net/faq/rgbtohex.htm
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
}
function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function rgb2hsl(r, g, b){//http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(l * 100)
    };
}

function rgb2hsv () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);
        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function updateCurrentColor(r,g,b,justFields){
	var hex=RGBtoHex(r,g,b);
	document.getElementById('hexpre').style.backgroundColor='#'+hex;
	document.getElementById('hex').value=hex;
	document.getElementById('cr').value=r;
	document.getElementById('cg').value=g;
	document.getElementById('cb').value=b;
	var hsl=rgb2hsl(r,g,b);
	var hsv=rgb2hsv(r,g,b);
	document.getElementById('ch').value=hsl.h;
	document.getElementById('cs').value=hsl.s;
	document.getElementById('cv').value=hsl.v;
	document.getElementById('crgb').value='rgb('+document.getElementById('cr').value+','+document.getElementById('cg').value+','+document.getElementById('cb').value+')';
	document.getElementById('chsl').value='hsl('+document.getElementById('ch').value+','+document.getElementById('cs').value+'%,'+document.getElementById('cv').value+'%)';
	var hsv=rgb2hsv(r,g,b);
	if(!justFields)cp_set_from_hsv(hsv.h,hsv.s,hsv.v);
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if(request.setPreview && (request.tabi==tabid || tabid==0)){
      var hex=request.hex;//RGBtoHex(request.c_r+0,request.c_g+0,request.c_b+0);
      document.getElementById('pre').src=request.previewURI;
      document.getElementById('ohexpre').style.backgroundColor='#'+request.lhex;
      updateCurrentColor(request.cr,request.cg,request.cb);
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

var useCSSValues=true;
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
//	finishSetup();return;

//	   "content_scripts": [ {
//      "js": [ "colorpick.user.js" ],
//      "run_at": "document_start",
//      "matches": [ "*://*/*" ]
//   } ],
//eventually re-enable this block (removing above) - since after first install it gets us running - however
//gotta make sure that any pre-installed version responds to testAlive first!
	isScriptAlive=false;
	chrome.tabs.sendRequest(tabid, {testAlive:true}, function(response) {
		if(response&&response.result){
			isScriptAlive=true;
			scriptsInjectedResult();
		}
	});
	scriptAliveTimeout=setTimeout(scriptsInjectedResult,1000);
}
function scriptsInjectedResult(){
	clearTimeout(scriptAliveTimeout);
	if(!isScriptAlive){
		chrome.tabs.executeScript(tabid, {file: "colorpick.user.js"});
		isScriptAlive=true;
	}
	finishSetup();
}
function finishSetup(){
	chrome.extension.sendRequest({enableColorPicker:true,tabi:tabid}, function(response) {
		
		//hex=response.hex;
		updateCurrentColor(response.cr,response.cg,response.cb);
		
		document.getElementById('ohexpre').style.backgroundColor='#'+response.lhex;
		if(response.previewURI.length > 0 )document.getElementById('pre').src=response.previewURI;

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
			document.body.style.width=(document.body.clientWidth+16)+'px';
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
		win2 = window.open(mylink, windowname, 'fullscreen=no,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=yes,directories=no,location=no,width=160,height=294');
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
	
	//if(document.getElementById('pre').src.indexOf('error') < 0)
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

//COLOR CHOOSER FUNCTIONS *******************************
var i1,i2,i3,ctx,cp_x=0,cp_y=0;
var cp_loads=0,cp_totalLoads=3,cp_chooser_booted=false;
var huedrag=false,clrdrag=false;
function dragHue(ev){
	huedrag=true;
	dragingClr(ev);
	preventEventDefault(ev);
}
function dragClr(ev){
	clrdrag=true;
	dragingClr(ev);
	preventEventDefault(ev);
}
function dragingClr(ev){
	if(ev.which==0){huedrag=false,clrdrag=false;};
	if(huedrag){
		var newPos=ev.offsetY
		if(ev.target.id!='hue_grad'){
			newPos=ev.pageY - document.getElementById('chooser').offsetTop;
			if(newPos < 0)newPos=0;
		}
		document.getElementById('hue_pos').style.top=(Math.min(newPos,255)-4)+'px';
		cp_grad_render();
		preventEventDefault(ev);
	}else if(clrdrag){
		var newPosY=ev.offsetY,newPosX=ev.offsetX;
		if(ev.target.id!='gradi'){
			newPosY=ev.pageY - document.getElementById('chooser').offsetTop;
			newPosX=ev.pageX - document.getElementById('chooser').offsetLeft;
			if(newPosY < 0)newPosY=0;
			if(newPosX < 0)newPosX=0;
		}
		cp_y=Math.min(newPosY,255);
		cp_x=Math.min(newPosX,255);
		cp_grad_render();
		preventEventDefault(ev);
	}
}
function cancelDrag(){
	huedrag=false,clrdrag=false;
}
function cp_set_from_hsv(h,s,v){
	document.getElementById('hue_pos').style.top=(255-Math.round((h/360)*255)-4)+'px';
	cp_x=Math.round((v/100)*255);
	cp_y=Math.round(((100-s)/100)*255);
	if(cp_chooser_booted)cp_grad_render(true)
}
function cp_grad_render(from_current){
	ctx.drawImage(i2,256,0);
	var hue=document.getElementById('hue_pos').style.top.replace('px','')-0+4;
	var dat = ctx.getImageData(256, hue, 1, 1).data;
	ctx.fillStyle = "rgba("+(dat[0])+","+(dat[1])+","+(dat[2])+",1.0)";
	ctx.fillRect(0,0,256,256);
	ctx.drawImage(i1,0,0);
	dat = ctx.getImageData(cp_x, cp_y, 1, 1).data;
	if(!from_current)updateCurrentColor(dat[0],dat[1],dat[2],true);
	ctx.drawImage(i3,cp_x-5,cp_y-5);
}
function cp_chooser_test_ready(){
	++cp_loads;if(cp_loads>=cp_totalLoads){cp_chooser_booted=true;cp_grad_render()};
	return cp_chooser_booted;
}
function init_color_chooser(){
	if(document.getElementById('chooser').style.display=='block'){
		document.getElementById('chooser').style.display='none';
		document.body.style.width='auto';
		return;
	}
	document.getElementById('chooser').style.display='block';
	document.body.style.width='470px';
	if(cp_chooser_booted)return;
	document.getElementById('gradi_box').addEventListener('mousedown', dragClr);
	document.getElementById('slider_hue').addEventListener('mousedown', dragHue);
	document.body.addEventListener('mousemove', dragingClr);
	document.body.addEventListener('mouseup', cancelDrag);
	ctx=document.getElementById('gradi').getContext('2d');
	i1=new Image();
	i2=new Image();
	i3=new Image();
	i1.onload=cp_chooser_test_ready;
	i2.onload=cp_chooser_test_ready;
	i3.onload=cp_chooser_test_ready;
	i1.src='cp_bg.png';
	i2.src='cp_rb.png';
	i3.src='cp_cr.gif';
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
	
	document.getElementById('hexpre').addEventListener('click', init_color_chooser);
	document.getElementById('ohexpre').addEventListener('click', init_color_chooser);
});
