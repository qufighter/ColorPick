var tabid=0;
var isScriptAlive=false,scriptAliveTimeout=0;
var cpw=165,cph=303;
var borderValue='1px solid grey',EnableRGB=true,EnableHSL=true,useCSSValues=true;
var cpScaleOffset=(navigator.platform=='win32'?16:0)
var pickEveryTime=true,isPicking=false,keyInputMode=false;
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

function setPreviewSRC(duri){
	var im=new Image();
	im.onload=function(){
		var pcvs=document.getElementById('pre').getContext('2d');
		pcvs.clearRect(0,0,150,150);
		pcvs.drawImage(im,0,0);
	}
	im.src=duri;
}
function fromHexClr(H){
	if(H.length == 6){
		return {r:fromHex(H.substr(0,2)),g:fromHex(H.substr(2,2)),b:fromHex(H.substr(4,2))}
	}
	return false;
}
function fromHex(h){return parseInt(h,16);}
function toHex(d){return ("00" + (d-0).toString(16).toUpperCase()).slice(-2);}
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

function updateCurrentColor(r,g,b,justFields,omitId){
	var hex=RGBtoHex(r,g,b);
	document.getElementById('hexpre').style.backgroundColor='#'+hex;
	if(omitId!='hex')document.getElementById('hex').value=hex;
	if(omitId!='cr')document.getElementById('cr').value=r;
	if(omitId!='cg')document.getElementById('cg').value=g;
	if(omitId!='cb')document.getElementById('cb').value=b;
	var hsl=rgb2hsl(r,g,b);
	document.getElementById('ch').value=hsl.h;
	document.getElementById('cs').value=hsl.s;
	document.getElementById('cv').value=hsl.v;
	if(omitId!='crgb')document.getElementById('crgb').value='rgb('+document.getElementById('cr').value+','+document.getElementById('cg').value+','+document.getElementById('cb').value+')';
	if(omitId!='chsl')document.getElementById('chsl').value='hsl('+document.getElementById('ch').value+','+document.getElementById('cs').value+'%,'+document.getElementById('cv').value+'%)';
	if(!justFields){var hsv=rgb2hsv(r,g,b);cp_set_from_hsv(hsv.h,hsv.s,hsv.v);}
}

function getPageZoomFactor(){
	var scal=document.width / document.documentElement.clientWidth;
	if(isNaN(scal)||!scal)scal=(outerWidth-cpScaleOffset)/innerWidth;
	if(scal < 0.25 || scal > 5.0 || (scal > 1.0 && scal < 1.02)) scal = 1.0;
	return scal;
}

//these should never be called, future use
function movePixel(){}
function movePixel(){}
function getPixel(){}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.setPreview && (request.tabi==tabid || tabid==0)){
      //var hex=request.hex;//RGBtoHex(request.c_r+0,request.c_g+0,request.c_b+0);
      keyInputMode=false;
      setPreviewSRC(request.previewURI);
      document.getElementById('ohexpre').style.backgroundColor='#'+request.lhex;
      updateCurrentColor(request.cr,request.cg,request.cb);
      sendResponse({});
    }else if(request.setFullsizeImage){
      setFullsizeImage(request);
    }else if (request.movePixel){
      movePixel(request);
    }else if (request.getPixel){
      movePixel(getPixel);
    }else if(request.greeting == "re_init_picker"){
      iin()
    }else if(request.greeting == "error_picker"){
     setPreviewSRC(chrome.extension.getURL('img/error'+request.errno+'.png'));
     if(request.errno==0)init_color_chooser();
    }else{
     sendResponse({});
    }
  });

function resnap(){
	chrome.tabs.sendMessage(tabid,{newImage:true},function(r){});
}
function setButtonState(picking){
	isPicking=picking;
	if(isPicking){
		document.getElementById('epick').className='btnActive'+(pickEveryTime?' autocast':'');
	}else{
		document.getElementById('epick').className='btnInactive'+(pickEveryTime?' autocast':'');
	}
}
function toglPick(ev){
	if (ev && (ev.which === 2 || ev.which === 3)){
	    return toglAutoPick(ev);
	}else{
		chrome.tabs.sendMessage(tabid,{doPick:true},function(r){
			setButtonState(r.isPicking);
		});//perform pick
	}
}
function stopPick(){
	if(isPicking)toglPick();
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
function popupClicked(ev){
	var t=getEventTarget(ev);
	if(t.nodeName=='INPUT')keyInputMode=true;
	else keyInputMode=false;
}
function wk(ev){
	var t=getEventTarget(ev);
	if(ev.keyCode==27){
		//dissableColorPickerFromHere();// :D
	}else if(ev.keyCode==82||ev.keyCode==74){//r or j refresh
		resnap();
	}else if(!keyInputMode && ev.keyCode==38){//u
		chrome.runtime.sendMessage({movePixel:true,_x:0,_y:-1,tabi:tabid},function(r){});
	}else if(!keyInputMode && ev.keyCode==40){//d
		chrome.runtime.sendMessage({movePixel:true,_x:0,_y:1,tabi:tabid},function(r){});
	}else if(!keyInputMode && ev.keyCode==37){//l
		chrome.runtime.sendMessage({movePixel:true,_x:-1,_y:0,tabi:tabid},function(r){});
	}else if(!keyInputMode && ev.keyCode==39){//r
		chrome.runtime.sendMessage({movePixel:true,_x:1,_y:0,tabi:tabid},function(r){});
	}else if(!keyInputMode && (ev.keyCode==13 || ev.keyCode==86)){//enter, v
		toglPick();
	}else if(t.id=='hex'){
		keyInputMode=true;stopPick();var rgb=fromHexClr(t.value);if(rgb)updateCurrentColor(rgb.r,rgb.g,rgb.b,false,t.id);
	}else if(t.id=='crgb'){
		keyInputMode=true;stopPick();var comp=t.value.match(/\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);if(comp)updateCurrentColor(comp[1]-0,comp[2]-0,comp[3]-0,false,t.id);
	}
}
function mwheel(ev){
	var oldFisheye=localStorage["fishEye"];
	if(ev.wheelDelta > 0){
		localStorage['fishEye']++;
	}else{
		localStorage['fishEye']--;
	}
	if(typeof(pOptions["fishEye"].select[localStorage['fishEye']])=='undefined')localStorage['fishEye']=oldFisheye;
	sendReloadPrefs();
	return preventEventDefault(ev);
}
function iin(){
	if(typeof(localStorage["borderValue"])!='undefined')borderValue = localStorage["borderValue"];
	if(typeof(localStorage["useCSSValues"])!='undefined')useCSSValues = ((localStorage["useCSSValues"]=='true')?true:false);
	if(typeof(localStorage["EnableRGB"])!='undefined')EnableRGB = ((localStorage["EnableRGB"]=='true')?true:false);
	if(typeof(localStorage["EnableHSL"])!='undefined')EnableHSL = ((localStorage["EnableHSL"]=='true')?true:false);
	if(typeof(localStorage["cpScaleOffset"])!='undefined')cpScaleOffset = localStorage["cpScaleOffset"]-0;

	setPreviewSRC(chrome.extension.getURL('img/default.png'));
	
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

	//if( !globalPopout ){
  	if( window.name.indexOf('colorPickPopup')>-1 ){
  		tabid=window.name.replace('colorPickPopup_','')-0;
  		//document.getElementById('popout').style.display='none';
			if(window.innerWidth > 200)init_color_chooser();
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
	
	
	
	
	if(document.getElementById('plat_prev')){
		if(navigator.userAgent.indexOf('Windows') < 0){
			document.getElementById('plat_prev').src="img/ico_mac.png";
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
	try{
		chrome.tabs.sendMessage(tabid, {testAlive:true}, function(response) {
			if(response&&response.result){
				isScriptAlive=true;
			}
			scriptsInjectedResult();
		});
		scriptAliveTimeout=setTimeout(scriptsInjectedResult,3000);
	}catch(e){
		scriptsInjectedResult();//I don't think we ever get here
	}
}
function scriptsInjectedResult(){
	clearTimeout(scriptAliveTimeout);
	if(!isScriptAlive){
		chrome.tabs.executeScript(tabid, {file: "Cr_min.js"});
		chrome.tabs.executeScript(tabid, {file: "colorpick.user.js"});
		isScriptAlive=true;
	}
	finishSetup();
}
function finishSetup(){
	chrome.runtime.sendMessage({enableColorPicker:true,tabi:tabid}, function(response) {
		
		//hex=response.hex;
		updateCurrentColor(response.cr,response.cg,response.cb);
		
		document.getElementById('ohexpre').style.backgroundColor='#'+response.lhex;
		if(response.previewURI.length > 0 )setPreviewSRC(response.previewURI);

		usePrevColorBG=false;
		if(typeof(localStorage["usePrevColorBG"])!='undefined')usePrevColorBG = ((localStorage["usePrevColorBG"]=='true')?true:false);
		if(usePrevColorBG){
			if(response.hex>0)document.body.style.backgroundColor='#'+response.hex;
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
		}
		
		var hasVScroll = document.body.scrollHeight > document.body.clientHeight;
		if(hasVScroll){
			document.body.style.width=(document.body.clientWidth+16)+'px';
		}
	});
	
	pickEveryTime=true;
	if(typeof(localStorage["pickEveryTime"])!='undefined')pickEveryTime = ((localStorage["pickEveryTime"]=='true')?true:false);

	//in future cases we will send a testAlive earlier... state will be set already...
	chrome.tabs.sendMessage(tabid,{testAlive:true},function(r){
		if(!r.isPicking && pickEveryTime)toglPick();
		else setButtonState(r.isPicking);
	});
	
	if(localStorage.feedbackOptOut=='true' && localStorage["reg_chk"]!='true'){
		setTimeout(checkForLicense,500);
	}
}
function oout(){
	chrome.runtime.sendMessage({disableColorPicker:true},function(r){});
}
var x,y,xm,ym;
function mmove(ev){
	if(isDrag){
		x=ev.pageX-window.pageXOffset,
		y=ev.pageY-window.pageYOffset;
		xm=Math.round((x1-x)/localStorage['fishEye']),
		ym=Math.round((y1-y)/localStorage['fishEye']);
		chrome.runtime.sendMessage({movePixel:true,_x:xm,_y:ym,tabi:tabid}, function(response) {});
		if(xm!=0)x1=x;
		if(ym!=0)y1=y;
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
	isDrag=false;
}

var win2 = 0;
function popupimage(mylink, windowname)
{
	if (! window.focus)return true;
	mylink = new String( mylink.href );
	if( win2 == 0 || typeof(win2) != 'object' || typeof(win2.location) != 'string'  ){
		//var scal=getPageZoomFactor();
		//var w=Math.ceil(window.innerWidth*scal)+1,h=Math.ceil(window.innerHeight*scal)+1;
		var w=Math.round(window.outerWidth*1.114),h=Math.round(window.outerHeight*1.15);
		win2 = window.open(mylink, windowname, 'fullscreen=no,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=yes,directories=no,location=no,width='+w+',height='+h);
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
	return;
	//if(document.getElementById('pre').src.indexOf('error') < 0)//< pre no longer exists
		document.getElementById('unreg_msg').style.display="block";
	
	if(localStorage["hasAgreedToLicense"]=='true')return;//they agreed then opted-out
	
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
function sizeWindow(x,y){
	window.resizeTo(x,y);
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
	if(!ev.offsetY)ev.offsetY=ev.layerY,ev.offsetX=ev.layerX;
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
	var scal=getPageZoomFactor();
	if(document.getElementById('chooser').style.display=='block'){
		document.getElementById('chooser').style.display='none';
		document.body.style.width='auto';
		sizeWindow(160*scal,window.outterHeight);
		return;
	}
	document.getElementById('chooser').style.display='block';
	document.body.style.width='470px';
	sizeWindow(470*scal,window.outterHeight);
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
	i1.src='img/cp_bg.png';
	i2.src='img/cp_rb.png';
	i3.src='img/cp_cr.gif';
}
//END COLOR CHOOSER FUNCTIONS ***************************
function createDOM() {
Cr.elm("div",{},[
	Cr.elm("div",{id:"chooser"},[
		Cr.elm("div",{id:"gradi_box"},[
			Cr.elm("canvas",{id:"gradi",width:"257",height:"256"})
		]),
		Cr.elm("div",{id:"slider_hue"},[
			Cr.elm("img",{id:"hue_pos",src:"img/cp_ar.gif",style:"top:-4px"}),
			Cr.elm("img",{id:"hue_grad",src:"img/cp_rb.png"})
		])
	]),
	Cr.elm("a",{href:"#",title:chrome.i18n.getMessage('closeAndExit'),id:"eclose"},[
		Cr.elm("img",{align:'top',src:chrome.extension.getURL('img/close.png')})
	]),
	Cr.txt("#"),Cr.elm("input",{type:"text",spellcheck:"false",id:"hex",size:"6"}),
	Cr.elm("a",{id:"hidemin",href:"#",title:chrome.i18n.getMessage('hideMinimize')},[Cr.txt("_-")]),
	Cr.elm("br",{}),
	Cr.elm("div",{id:"defaultmode"},[
		Cr.elm("div",{class:"lbrow",id:"defrgb"},[
			Cr.elm("div",{class:"lb"},[Cr.txt("rgb:")]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cr",style:"width:35px"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cg",style:"width:35px"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cb",style:"width:35px"}),
			Cr.elm("br",{})
		]),
		Cr.elm("div",{class:"lbrow",id:"defhsl"},[
			Cr.elm("div",{class:"lb"},[Cr.txt("hsl:")]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"ch",style:"width:35px"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cs",style:"width:35px"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cv",style:"width:35px"}),
			Cr.elm("br",{})
		])
	]),
	Cr.elm("div",{id:"cssmode"},[
		Cr.elm("div",{class:"lbrow",id:"cssrgb"},[
			Cr.elm("div",{class:"lb"},[Cr.txt("rgb:")]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"crgb",style:"width:105px"}),
			Cr.elm("br",{})
		]),
		Cr.elm("div",{class:"lbrow",id:"csshsl"},[
			Cr.elm("div",{class:"lb"},[Cr.txt("hsl:")]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"chsl",style:"width:105px"}),
			Cr.elm("br",{})
		])
	]),
	Cr.elm("div",{style:"position:relative;width:152px;height:152px;"},[
		Cr.elm("a",{id:"unreg_msg",target:"_blank",href:"register.html",title:chrome.i18n.getMessage('buyRegisterTip')},[Cr.txt(chrome.i18n.getMessage('registerBanner'))]),
		Cr.elm("canvas",{id:"pre",width:"150",height:"150",style:"margin-bottom:3px;"})
	]),
	Cr.elm("div",{id:"pres"},[
		Cr.elm("div",{id:"ohexpre"}),
		Cr.elm("div",{id:"hexpre",title:chrome.i18n.getMessage('showColorChooser')})
	]),
	Cr.elm("div",{id:"ctrls"},[
		Cr.elm("a",{href:"#",title:chrome.i18n.getMessage('pickAgain'),id:"epick"},[
			Cr.elm("img",{border:"0",align:"top",style:"position:relative;top:-1px;",src:"img/crosshair.png",width:"19"})
		]),
		Cr.elm("a",{href:"#",title:chrome.i18n.getMessage('reSnapPage'),id:"resnap"},[
			Cr.elm("img",{align:"top",src:"img/refresh.png"})
		]),
		Cr.elm("a",{target:"_blank",href:"options.html",title:chrome.i18n.getMessage('configurationHelp'),id:"optsb"},[
			Cr.elm("img",{align:"top",src:"img/settings.png"})
		]),
		Cr.elm("a",{target:"_blank",href:"desktop_app.html",title:chrome.i18n.getMessage('getStandaloneApp')},[
			Cr.elm("img",{align:"top",id:"plat_prev",src:"img/ico_win.png",style:"display:none;"})
		]),
		Cr.elm("a",{title:chrome.i18n.getMessage('popOutWindow'),href:"#",id:"popout"},[
			Cr.elm("img",{align:"top",src:"img/popout.gif"})
		])
	])
],document.body)

  document.getElementById('eclose').addEventListener('click', close_stop_picking);
  document.getElementById('hidemin').addEventListener('click', just_close_preview);
  document.getElementById('pre').addEventListener('mousedown', initdrag);
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
  
	document.getElementById('epick').addEventListener('mousedown', toglPick);
	document.getElementById('epick').addEventListener('contextmenu', preventEventDefault);
	document.getElementById('resnap').addEventListener('click', resnap);
	document.getElementById('popout').addEventListener('click', popOut);
	
	document.getElementById('hexpre').addEventListener('click', init_color_chooser);
	document.getElementById('ohexpre').addEventListener('click', init_color_chooser);

	window.addEventListener('mousewheel',mwheel);
	window.addEventListener('keyup',wk);
	document.addEventListener('mousemove',mmove);
	document.body.addEventListener('click', popupClicked,false);

	var port = chrome.runtime.connect({name:"popupshown"});

//log to bg page
//var background = chrome.extension.getBackgroundPage();
//background.console.log('hello bg');

	iin();
}

document.addEventListener('DOMContentLoaded', createDOM);
