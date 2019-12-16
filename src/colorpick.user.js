var elmid1='color_pick_click_box',elmid2='ChromeExtension:Color-Pick.com';
if(typeof(exitAndDetach)=='function')exitAndDetach();
function _ge(n){return document.getElementById(n);}
var n=null,c=null,waterm=null,watermlo=null,watermct=null,wmMoveCtr=0,lastMoveInc=0,gameScr=false,hex='F00BAF',lasthex='',rgb=null;hsv=null;scal=1,ex=0,ey=0,isEnabled=false,isLocked=false,msg_bg_unavail=chrome.i18n.getMessage('bgPageUnavailable');
var isUpdating=false,lastTimeout=0,lx=0,ly=0,histories=0,nbsp='\u00A0';
var opts={};
var cvs = document.createElement('canvas');
var ctx = cvs.getContext('2d'),x_cvs_scale=1,y_cvs_scale=1;
function RGBtoHex(R,G,B) {return applyHexCase(toHex(R)+toHex(G)+toHex(B));}
function applyHexCase(hex){return opts.hexIsLowerCase ? hex.toLowerCase() : hex;}
function toHex(N) {//http://www.javascripter.net/faq/rgbtohex.htm
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
}
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
function emptyNode(node){
	Cr.empty(node);
}
var snapLoader=Cr.elm('img',{events:[['load',snapshotLoaded]]});
var dirtyImage=Cr.elm('img');
var imagesRcvdCounter=0;
var imagesLoadedCounter=0;
function snapshotLoaded(){
		clearTimeout(snapshotLoadedTimeout);
		imagesLoadedCounter++;
		c.height=innerHeight;
		c.width=innerWidth;
		var cctx=c.getContext("2d");
		cctx.drawImage(dirtyImage,0,0,1,1,0,0,1,1); // taint the canvas to prevent malicious website (or framework) from stealing screenshots while color pick runs. To verify, select the canvas element and $0.toDataURL() to see an exception
		cctx.drawImage(snapLoader,0,0,innerWidth,innerHeight);

		x_cvs_scale=snapLoader.naturalWidth / innerWidth;
		y_cvs_scale=snapLoader.naturalHeight / innerHeight;
		cvs.width=snapLoader.naturalWidth;
		cvs.height=snapLoader.naturalHeight;
		ctx.drawImage(snapLoader,0,0);
		
		setTimeout(function(){
			isMakingNew=false;
			showCtrls();document.body.style.cursor=crosshairCss();updateColorPreview();
		},10);
}
function reqLis(request, sender, sendResponse) {
  var resp={result:true};
  if (request.testAlive){
		//disableColorPicker();
  }else if (request.enableColorPicker){
		histories = request.historyLen || 0;
		resp.wasAlreadyEnabled=enableColorPicker();
		if(request.workerHasChanged) lsnaptabid=-1;
		if(resp.wasAlreadyEnabled){
				resp.hex=hex;
				resp.lhex=lasthex;
				resp.previewURI = lastPreviewURI;
				resp.cr=rgb.r;
				resp.cg=rgb.g;
				resp.cb=rgb.b;
		}
  }else if (request.setPickerImage){
		imagesRcvdCounter++;
		snapLoader.src=request.pickerImage;
		if( request.isErrorTryAgain ){
			/// do we let them have time to read it?? or not???
			// if we are "locked" or not.... ?
		}
  }else if (request.newImage){
  	ssf();
  }else if (request.doPick){
  	picked();
  }else if (request.movePixel){
		ex+=(request._x),ey+=(request._y);
		lx=Math.round(ex / x_cvs_scale),ly=Math.round(ey / y_cvs_scale);
		updateColorPreview();
	}else if (request.reloadPrefs){
		loadPrefs(function(){updateColorPreview();});
  }else if (request.disableColorPicker)disableColorPicker();
  resp.isPicking=!isLocked;
  sendResponse(resp);
}
chrome.runtime.onMessage.addListener(reqLis);

var popupsShowing=0;
chrome.runtime.onConnect.addListener(function(port){
	if(port.name == "popupshown"){
		popupsShowing++;
		port.onDisconnect.addListener(function(msg) {
			popupsShowing--;
			if(popupsShowing < 0)popupsShowing=0;
		});
	}
});

var connectListener=false;

function setPixelPreview(hxe,lhex){
	if(isLocked)return;
	hex=hxe?hxe:hex;
	if(!_ge('previewArea') || (rgb && !_ge('cprgbvl'))){
		emptyNode(n);
		Cr.elm('div',{id:'previewArea'},[
			ticvs,
			Cr.elm('br'),
			(opts.EnableHex && !opts.hexHasHash)?Cr.txt('#'):0,
			Cr.elm('input',{type:'text',readonly:true,size:8,style:'max-width:75px;font-size:10pt;border:'+opts.borderValue,id:'cphexvl',value:(opts.hexHasHash?'#':'')+hex,event:['mouseover',selectTargElm]}),
			//Cr.elm('input',{type:'image',src:chrome.extension.getURL('img/close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}),
			(opts.showPreviousClr&&lhex!='none'?Cr.elm('input',{type:'text',size:1,style:'max-width:50px;font-size:10pt;background-color:#'+lhex+';border:'+opts.borderValue+';border-left:none;',value:''}):0),
			(opts.ShowRGBHSL&&opts.EnableRGB&&rgb?Cr.elm('input',{type:'text',readonly:true,style:'max-width:150px;display:block;',value:'rgb'+formatColorValuesWith(opts.CSS3ColorFormat,rgb.r,rgb.g,rgb.b),id:'cprgbvl',event:['mouseover',selectTargElm]}):0),
			(opts.ShowRGBHSL&&opts.EnableHSL&&hsv?Cr.elm('input',{type:'text',readonly:true,style:'max-width:150px;display:block;',value:'hsl'+formatColorValuesWith(opts.CSS3ColorFormat,hsv.h,hsv.s,hsv.v,0,1,1),id:'cphslvl',event:['mouseover',selectTargElm]}):0)
		],n);
		if(!opts.EnableHex) _ge('cphexvl').style.display="none";
		keepOnScreen();
	}else{
		_ge('cphexvl').value=hex;
		n.style.backgroundColor='#'+hex;
		if(opts.ShowRGBHSL&&opts.EnableRGB&&rgb)_ge('cprgbvl').value='rgb'+formatColorValuesWith(opts.CSS3ColorFormat,rgb.r,rgb.g,rgb.b);
		if(opts.ShowRGBHSL&&opts.EnableHSL&&hsv)_ge('cphslvl').value='hsl'+formatColorValuesWith(opts.CSS3ColorFormat,hsv.h,hsv.s,hsv.v,0,1,1);
	}
}
function setCurColor(r){
	if(!n)return;
	hex=r.hex?r.hex:hex;
	n.style.backgroundColor='#'+hex;
	if(isLocked)setDisplay();
}
function selectTargElm(ev){
	ev.target.select();
}
var lastHex='';
var goodHexCounter=0;
function setDisplay(){//Cr.elm
	if( !n ) return;
	emptyNode(n);
	Cr.elm('div',{},[
		(opts.EnableHex && !opts.hexHasHash)?Cr.txt('#'):0,
		Cr.elm('input',{type:'text',readonly:true,size:8,style:'max-width:75px;font-size:10pt;border:'+opts.borderValue,id:'cphexvl',value:(opts.hexHasHash?'#':'')+hex,event:['mouseover',selectTargElm]}),
		Cr.elm('input',{type:'image',style:'width:20px;height:20px;min-width:20px;min-height:20px;box-sizing:unset;box-shadow:none;background:unset;padding:8px;',src:chrome.extension.getURL('img/close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit')+' [esc]',id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}),
		(opts.ShowRGBHSL&&opts.EnableRGB&&rgb?Cr.elm('input',{type:'text',readonly:true,style:'max-width:150px;display:block;',value:'rgb'+formatColorValuesWith(opts.CSS3ColorFormat,rgb.r,rgb.g,rgb.b),id:'cprgbvl',event:['mouseover',selectTargElm]}):0),
		(opts.ShowRGBHSL&&opts.EnableHSL&&hsv?Cr.elm('input',{type:'text',readonly:true,style:'max-width:150px;display:block;',value:'hsl'+formatColorValuesWith(opts.CSS3ColorFormat,hsv.h,hsv.s,hsv.v,0,1,1),id:'cphslvl',event:['mouseover',selectTargElm]}):0)
	],n);
	if(!opts.EnableHex) _ge('cphexvl').style.display="none";
	if(_ge('cphexvl'))_ge('cphexvl').select();
	if( opts.reg_chk!=true && hex && hex != lastHex && (!rgb || (rgb.r != rgb.g || rgb.r != rgb.b || rgb.g != rgb.b)) ){
		goodHexCounter++;
		if( goodHexCounter > 1 && histories > 25 ){
			Cr.elm('div', {style:'text-shadow:white 1px 1px 2px;font-weight:bold;'}, [
				Cr.elm('a', {
					style: 'cursor:pointer;',
					events:['click', navToReg],
					childNodes:[Cr.txt(chrome.i18n.getMessage('registerBannerLong'))]
				})
			], n);
		}
		lastHex=hex;
	}
	keepOnScreen();
}
function picked(){
	if(isLocked){
		lasthex = hex;
		isLocked=false;
		emptyNode(n);
	}else{
		try{
			chrome.runtime.sendMessage({setColor:true,hex:hex,rgb:rgb,hsv:hsv}, function(response){});
		}catch(e){
			console.log("Sorry - ColorPick experienced a problem during setColor and has been disabled - Reload the page in order to pick colors here.", e);
			exitAndDetach();
		}
		isLocked=true;
		setDisplay();
	}
	updateTip();
	chrome.runtime.sendMessage({setPickState:true,isPicking:!isLocked}, function(r){});
}
function exitAndDetach(){
	disableColorPicker();
	chrome.runtime.onMessage.removeListener(reqLis);
}
function dissableColorPickerFromHere(){
	var disableTimeout=setTimeout(disableColorPicker,500);
	chrome.runtime.sendMessage({disableColorPicker:true},function(r){
		clearTimeout(disableTimeout);
	});
}
function disableColorPicker(){
	isEnabled=false,isLocked=false;
	document.removeEventListener('mousemove',mmf);
	removeEventListener('scroll',ssf);
	removeEventListener('resize',ssf);
	removeEventListener('keyup',wk);
	removeExistingNodes();
	clearTimeout(lastNewTimeout);
}
function removeExistingNodes(){
	if(document.body){
		c=_ge(elmid1),n=_ge(elmid2);
		if(c)document.body.removeChild(c);
		if(n)document.body.removeChild(n);
		if(waterm)document.body.removeChild(waterm);
		c=null,n=null,waterm=null,watermlo=null,watermct=null;
		if( document.body.style ) document.body.style.cursor='default';
	}
}
function wk(ev){
	if(!isEnabled)return;
	if(ev.keyCode==27){
		dissableColorPickerFromHere();
	}else if(ev.keyCode==82||ev.keyCode==74){//r or j refresh
		ssf();
	}else if(ev.keyCode==13){
		picked();
	}
}
function mmf(ev){
	if(!isEnabled)return;
	if(!isLocked){
		lx=(ev.pageX-pageXOffset),ly=(ev.pageY-pageYOffset);
		ex = Math.round(lx * x_cvs_scale),
		ey = Math.round(ly * y_cvs_scale);
		updateColorPreview();
	}
}

function ssf(ev){
	if(!isEnabled)return;
	hideCtrls();//redundent?
	if( !c.parentNode ){
		// this indicates our context has been invalidated by another instance of the script, possibly ext has been reloaded
		console.log("Sorry - ColorPick experienced a problem in scrollFunction and has been disabled - Reload the page in order to pick colors here.");
		exitAndDetach();
		return;
	}
	clearTimeout(lastNewTimeout);
	lastNewTimeout=setTimeout(function(){
		newImage();//some delay required OR it won't update
	},10);
}

function loadPref(i, obj, pOptions){
	if(typeof(pOptions[i].def)=='boolean')
		opts[i] = ((obj[i]=='true')?true:((obj[i]=='false')?false:pOptions[i].def));
	else
		opts[i] = ((obj[i])?obj[i]:pOptions[i].def);
}

function loadPrefs(cbf){
	storage.get(null, function(obj) {
		if(chrome.runtime.lastError)console.log(chrome.runtime.lastError.message);
		obj = obj || {};
		var i;
		for(i in pOptions){loadPref(i, obj, pOptions);}
		for(i in pAdvOptions){loadPref(i, obj, pAdvOptions);}
		for(i in pSyncItems){loadPref(i, obj, pSyncItems);}
		if(typeof(cbf)=='function')cbf();
	});
}
function initialInit(){
	loadPrefs(function(){
		prefsLoadedCompleteInit()
	});
	if( !connectListener ){
		chrome.runtime.connect().onDisconnect.addListener(function() {
			console.log("Sorry - ColorPick detected the extension has been reloaded.  This instance of the content script is now defunct. You may have to refresh the page to use ColorPick here!")
			exitAndDetach();
		})
		connectListener=true;
	}
}
function crosshairCss(){
	return 'url('+chrome.extension.getURL('img/crosshair.png')+') 16 16,crosshair';
}

function prefsLoadedCompleteInit(){
	removeExistingNodes();
	c=Cr.elm('canvas',{id:elmid1,style:'position:fixed;max-width:none!important;max-height:none!important;top:0px!important;left:0px!important;margin:0px!important;padding:0px!important;overflow:hidden;z-index:2147483646;cursor:'+crosshairCss(),events:[['click',picked,true],['mousedown',function(ev){ev.preventDefault();}]]},[],document.body);
	n=Cr.elm('div',{id:elmid2,style:'position:fixed;min-width:30px;max-width:300px;min-height:30px;box-shadow:2px 2px 2px #666;border:'+opts.borderValue+';z-index:2147483646;cursor:default;padding:4px;'},[Cr.txt(' ')],document.body);
	if( opts.reg_chk!=true || !opts.hideWatermark ){
		waterml=Cr.elm('img',{src:chrome.extension.getURL('img/icon64.png'), width:64, align:"top", style:'vertical-align:top;display:inline-block;'});
		watermct=Cr.elm('div',{id:'wm-content',style:'margin:7px'});
		waterm=Cr.elm('div',{
			id:'colorpick-watermark',
			title: chrome.i18n.getMessage('watermark_help'),
			style:"position:fixed;bottom:0;right:0;cursor:default;z-index:2147483646;transition:0.5s ease-out;user-select:none;background:white;box-shadow:#000 0px 0px 10px 1px;font-family:sans-serif;color:#494949;font-size:14px;max-width:225px;text-align:left;",
			events:[['mouseover', moveWm],['click', moveWm]],
			childNodes:[
				Cr.elm('div',{
					style:"font-family:'Helvetica Neue','Lucida Grande';font-size:16px;color:black;font-weight:300;text-shadow:white 1px 1px 2px;line-height:24px;padding:5px;text-align:left;opacity:0.9;",
					childNodes:[
						waterml,
						Cr.elm('div',{
							style:"display:inline-block;width:85px;margin:8px 0 0 5px;",
							childNodes:[
								Cr.txt(chrome.i18n.getMessage('extName'))
							]
						})
					]
				}),
				watermct
			]
		},document.body);
	}
	wmMoveCtr=0;
	dirtyImage.src=chrome.extension.getURL('img/close.png');
	document.addEventListener('mousemove',mmf);
	addEventListener('keyup',wk);
	addEventListener('scroll',ssf);
	addEventListener('resize',ssf);
	testWebGlAvail();
	initializeCanvas();
	remainingInit();
}

function showCtrls(){ // todo: single container
	n.style.display="";
	c.style.display="";
	if(waterm)waterm.style.display="";
}

function hideCtrls(){
	n.style.display="none";
	c.style.display="none";
	if(waterm)waterm.style.display="none";
}

function swapSides(elm, olds, news, length, swappedCb){
	elm.style[olds] ='-'+length+'px';
	setTimeout(function(){
		elm.style[news] = elm.style[olds];
		elm.style[olds] = '';
		swappedCb();
		setTimeout(function(){
			elm.style[news] = '0px';
		}, 10);
	}, 500);
}
function moveWm(ev){
	if(!waterm) return;
	var t=waterm.style.top.match(/^0/), r=waterm.style.right.match(/^0/), b=waterm.style.bottom.match(/^0/), l=waterm.style.left.match(/^0/);
	var cliw = waterm.clientWidth;
	var le = ev.offsetX < 10, re = ev.offsetX > cliw - 10;
	if( (le || re) && window.innerWidth > (cliw * 2 ) ){
		if( r ){
			swapSides(waterm, 'right', 'left', cliw, wmSwapped);
		}else if( l ){
			swapSides(waterm, 'left', 'right', cliw, wmSwapped);
		}
	}else{
		if( b ){
			swapSides(waterm, 'bottom', 'top', waterm.clientHeight, wmSwapped);
		}else if( t ){
			swapSides(waterm, 'top', 'bottom', waterm.clientHeight, wmSwapped);
		}
	}
}
function wmSwapped(){
	var t = (new Date()).getTime();
	if( t - lastMoveInc > (wmMoveCtr == 1 ? 1000 : 500) ){
		wMoveInc();
	}
	lastMoveInc = t;
}
function wMoveInc(){
	wmMoveCtr++;
	if( wmMoveCtr == 3 ){
		if(!gameScr){
			chrome.runtime.sendMessage({beginGame:true}, function(response){});
		}else{
			initGame();
		}
	}
	if( wmMoveCtr > 3 ){
		nextWm();
	}else{
		currentTip();
	}
}
function updateTip(){
	// we can possibly more simply test wmMoveCtr is sufficient range for tips... rather than querySelector....
	if(!waterm) return;
	var tip1 = waterm.querySelector('#tip_1');
	if( tip1 ){
		currentTip();
	}
}
function currentTip(){
	if(!waterm) return;
	Cr.empty(watermct);
	var tipIndex = wmMoveCtr%6;
	var extra = '';
	if( tipIndex == 1 && isLocked ){ extra = '_locked' }
	Cr.elm('div',{id:'tip_'+tipIndex,childNodes:[Cr.txt(chrome.i18n.getMessage('tips_'+tipIndex+extra))]}, watermct);
}
function nextWm(){
	if(!waterm) return;

	if( gameScr ){
		nextIconImage(wmMoveCtr-4);
	}

	currentTip();
}

function enableColorPicker(){
	if(!n){
		initialInit();
		return false;
	}
	return remainingInit();
}

function remainingInit(){
	if( !document.body.style ){ // page isn't loaded enough yet... try again soon...
		setTimeout(remainingInit, 250);
		return false;
	}
	if(!isEnabled){
		hideCtrls();
		if(isLocked)picked();//unlocks for next pick
		document.body.style.cursor=crosshairCss();
		isEnabled=true;
		setTimeout(newImage,1);
		return false;
	}
	return true;
}
function keepOnScreen(){
//	if(true && n.firstChild && n.firstChild.firstChild){
//		var img=n.firstChild.firstChild;
//		var amt=Math.floor(img.offsetLeft + (img.clientWidth*0.5));
//		n.style.top=(ly-amt)+"px";
//		n.style.left=(lx-amt)+"px";
//		return;
//	}
  if(!n)return;
	n.style.top=(ly+8)+"px";
	n.style.left=(lx+8)+"px";
	if( n.clientWidth + n.offsetLeft +24 > innerWidth ){
		n.style.left=(lx-8-n.clientWidth)+"px";
	}
	if( n.clientHeight + n.offsetTop +24 > innerHeight ){
		n.style.top=(ly-8-n.clientHeight)+"px";
	}
}
function updateColorPreview(ev){
	if(!isEnabled)return;
	keepOnScreen();
	var data = ctx.getImageData(ex, ey, 1, 1).data;
	hsv=rgb2hsl(data[0],data[1],data[2]);
	rgb={r:data[0],g:data[1],b:data[2]};
	setCurColor({hex:RGBtoHex(data[0],data[1],data[2])});
	handleRenderingThrottle();
	//handleRendering();
}

var isMakingNew=false,lastNewTimeout=0,snapshotLoadedTimeout;
var imageRequestReachedBg=0;
function newImage(){
	if(!isEnabled)return;
	if(isMakingNew || !document.body.style){
		clearTimeout(lastNewTimeout);
		lastNewTimeout=setTimeout(function(){newImage();},500);
		return;
	}
	document.body.style.cursor='wait';
	isMakingNew=true;
	hideCtrls();
	var x=innerWidth,y=innerHeight;
	c.width=x;
	c.height=y;

	clearTimeout(snapshotLoadedTimeout);
	snapshotLoadedTimeout = setTimeout(function(){
		disableColorPicker();
		console.warn("Sorry - ColorPick experienced issues while waiting for the snapshot - Reload the page in order to pick colors here.  Here is how many newImage requests reached bg page:", imageRequestReachedBg, 'imagesRcvdCounter', imagesRcvdCounter, 'imagesLoadedCounter', imagesLoadedCounter, snapLoader);
	}, 6000); // max 3 second wait for image, attempt to prevent endless spin

	setTimeout(function(){
		try{
			chrome.runtime.sendMessage({newImage:true,w:x,h:y}, function(response){
				imageRequestReachedBg++;
			});
		}catch(e){
			console.log("Sorry - ColorPick experienced a problem in newImage and has been disabled - Reload the page in order to pick colors here.", e);
			exitAndDetach();
		}
	},10); // todo: this delay may be redundant, consider removing delay in ssf
}

var lastPreviewURI;
var gl=0,texture=0,texturectx=0,snapTexture=0,shaderProgram=0,textureSampPosition=0,fishEyeScalePosition=0;

var webGlAvail=false,icvs=0,ticvs=0,totalWidth=150;//750
function testWebGlAvail(){
	var testc=document.createElement("canvas");
	var testctx = testc.getContext('webgl');
	if (testctx && typeof(testctx.getParameter)== "function") webGlAvail=true;
}

function handleRenderingThrottle(){
	var msDelay=0;
	if( isUpdating ) msDelay=8;
	clearTimeout(lastTimeout);
	isUpdating = true;
	lastTimeout = setTimeout(handleRendering,msDelay);
}

function handleRendering(quick){
	var x=ex,y=ey;
//	frameCount++;
//	curSecond = new Date().getSeconds();
//	if( curSecond > startSecond){
//		console.log('fps: '+frameCount);
//		startSecond = curSecond,frameCount=0;
//	}

// under some circumstances we do not need to render anything....
	if(isMakingNew || (!opts.iconIsBitmap && !opts.showPreviewInContent && popupsShowing < 1)){
		isUpdating = false;
		return;
	}

	var startPoint=Math.floor(totalWidth*0.5);
	var ox=Math.round(x),oy=Math.round(y);
	var ictx;

	if(!opts.pixelatedPreview || quick){
		ictx = getMain2dContext();
		ictx.scale(2,2);
		ictx.drawImage(cvs,-ox+(startPoint*0.5),-oy+(startPoint*0.5));
		ictx.scale(0.5,0.5);
		
		ictx.fillStyle = "rgba(0,0,0,0.3)";//croshair
		//ictx.globalAlpha = 1.0;
		
		ictx.fillRect(startPoint, 0, 1, totalWidth);
		ictx.fillRect(0,startPoint, totalWidth, 1);
		
	}else{
		if(opts.allowWebGl && webGlAvail){
			getMain3dContext();
			texturectx.drawImage(cvs,-ox+(64),-oy+(64));
			//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0,0, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			gl.uniform1i(textureSampPosition, 0);
			gl.uniform1f(fishEyeScalePosition, opts.fishEye);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}else{
			ictx = getMain2dContext();
			ictx.drawImage(cvs,-ox+(startPoint),-oy+(startPoint));
			var smi,spi,mp=opts.fishEye-0;
			//xx,yy
			for(var i=0;i<startPoint;i+=2){
				smi=startPoint-i;
				spi=startPoint+i;
				//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) //CANVAS
				ictx.drawImage(icvs,spi,0,smi,totalWidth,//total width really??
														spi+1,0,smi,totalWidth);

				ictx.drawImage(icvs,0,0,smi+1,totalWidth,
														-1,0,smi+1,totalWidth);

				ictx.drawImage(icvs,0,spi,totalWidth,smi,
														0,spi+1,totalWidth,smi);

				ictx.drawImage(icvs,0,0,totalWidth,smi+1,
														0,-1,totalWidth,smi+1);

				if(i==0){
					var dat = ictx.getImageData(startPoint, startPoint, 1, 1).data;//notarget
//					ictx.fillStyle = "rgba("+(255-data[0])+","+(255-data[1])+","+(255-data[2])+",0.9)";
					var d=dat[0]+dat[1]+dat[2];
					if(d > 192) ictx.fillStyle = "rgba(30,30,30,0.8)";
					else ictx.fillStyle = "rgba(225,225,225,0.8)";
				}else ictx.fillStyle = "rgba(255,255,255,0.4)";

				for(var c=0;c<mp;c++){
					if(++i>=startPoint)break;
					smi=startPoint-i;
					spi=startPoint+i;
					ictx.drawImage(icvs,spi,0,smi,totalWidth,
															spi+1,0,smi,totalWidth);

					ictx.drawImage(icvs,0,0,smi+1,totalWidth,
															-1,0,smi+1,totalWidth);

					ictx.drawImage(icvs,0,spi,totalWidth,smi,
															0,spi+1,totalWidth,smi);

					ictx.drawImage(icvs,0,0,totalWidth,smi+1,
															0,-1,totalWidth,smi+1);
				}
				mp--;
				if(mp<1)mp=1;
				ictx.fillRect(spi+1, 0, 1, totalWidth);
				ictx.fillRect(smi-1, 0, 1, totalWidth);
				ictx.fillRect(0, spi+1, totalWidth, 1);
				ictx.fillRect(0,smi-1,totalWidth,1);
			}
		}
	}

	if(opts.iconIsBitmap){
		var browseIconWidth=(devicePixelRatio>1?38:19);
		var srcBrowseIconWidth=browseIconWidth;
		if( webGlAvail && opts.pixelatedPreview && opts.allowWebGl ){
			srcBrowseIconWidth*=2;
		}
		var browseIconHalfWidth = Math.floor(srcBrowseIconWidth*0.5);
		var tmpCvs=document.createElement('canvas');
		tmpCvs.width=browseIconWidth,tmpCvs.height=browseIconWidth;
		var tctx=tmpCvs.getContext("2d");
		
		tctx.drawImage(icvs,startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, srcBrowseIconWidth, srcBrowseIconWidth,0,0,browseIconWidth,browseIconWidth);
		var pathData = {};
		pathData[browseIconWidth]=tmpCvs.toDataURL();
		chrome.runtime.sendMessage({browserIconMsg:true,path:(pathData)},function(){});
	}

	var tictx = ticvs.getContext('2d');
	tictx.drawImage(dirtyImage,0,0,1,1,0,0,1,1); // taint the canvas to prevent malicious website (or framework) from stealing zoomed view while color pick runs. To verify, select the canvas element and $0.toDataURL() to see an exception
	tictx.drawImage(icvs,0,0);

	if(opts.showPreviewInContent && popupsShowing < 1){
		setPixelPreview(hex,lasthex);
	}

	if(popupsShowing > 0){
		sendDataToPopup();
	}
	isUpdating = false;
}

function sendDataToPopup(){
	chrome.runtime.sendMessage({setPreview:true,previewURI:icvs.toDataURL(),hex:hex,lhex:lasthex,cr:rgb.r,cg:rgb.g,cb:rgb.b}, function(response) {});
}

function getMain2dContext(){
	var context=icvs.getContext("2d");
	if(context) return context;
	else{
		initializeCanvas();
		return icvs.getContext("2d");
	}
}

function getMain3dContext(){
	if(gl) return gl;
	else{
		initializeCanvas();
		return gl;
	}
}

function initializeCanvas(){
	gl=0;
	icvs = Cr.elm('canvas',{width:totalWidth,height:totalWidth});//icon canvas
	ticvs = Cr.elm('canvas',{width:totalWidth,height:totalWidth});//tainted icon canvas
	if( webGlAvail && opts.pixelatedPreview && opts.allowWebGl){
		gl = icvs.getContext("webgl");

		var squareVerticesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
		var vertices = [
			 1.0,  1.0,  0.0,//top right
			-1.0,  1.0,  0.0,
			 1.0, -1.0,  0.0,
			-1.0, -1.0,  0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		var textureCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
		var textureCoordinates = [
			// Front
			1.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,
			0.0, 0.0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),gl.STATIC_DRAW);

		var fragShader = ""+
		"precision mediump float;"+"\n"+
		"varying highp vec2 vTextureCoord;"+"\n"+
		"uniform float fishEyeScale;"+"\n"+
		"uniform sampler2D uSampler;"+"\n"+
		"void main(void) {"+"\n"+
		" float texSizeFracOnePix=1.0 / 128.0;"+"\n"+
		" float halfTexSizeFracOnePix=texSizeFracOnePix * 0.5;"+"\n"+
		" vec2 ctr=vec2(0.5,0.5) + vec2(halfTexSizeFracOnePix,-halfTexSizeFracOnePix);"+"\n"+
		" vec2 agl=(vTextureCoord.xy - ctr.xy);"+"\n"+
		" float dis=distance(ctr,vTextureCoord) / fishEyeScale;"+"\n"+
		" vec2 get=ctr + (agl * dis);"+"\n"+
		" vec4 bcolor=texture2D(uSampler, get);"+"\n"+
		" vec2 res=get * 128.0;"+"\n"+
		" ivec2 geb=ivec2(res);"+"\n"+
		" vec4 pcolor = texture2D(uSampler, ctr);//picked color"+"\n"+
		" vec4 ccolor = vec4(0.0,0.0,0.0,1.0);//crosshair color"+"\n"+
		" if(pcolor.r + pcolor.g + pcolor.b < 1.5){"+"\n"+
		"  ccolor = vec4(1.0,1.0,1.0,1.0);"+"\n"+
		" }"+"\n"+
		" if( geb.x == 64 && geb.y == 63 ){"+"\n"+
		"  if( res.x < 64.1 || res.x > 64.9  || res.y > 63.9 || res.y < 63.1 	){"+"\n"+
		"   bcolor = mix(bcolor,ccolor,0.8);"+"\n"+
		"  }"+"\n"+
		" }"+"\n"+
//		" if( vTextureCoord.x < 0.3 && vTextureCoord.y < 0.3 	){"+"\n"+
//		"  bcolor = pcolor;"+"\n"+
//		" }"+"\n"+
		" gl_FragColor = bcolor;"+"\n"+
		"}";

		var vertShader = ""+
		"attribute vec3 aVertexPosition;"+"\n"+
		"attribute vec2 aTextureCoord;"+"\n"+
		"varying highp vec2 vTextureCoord;"+"\n"+
		"void main(void) {"+"\n"+
		" gl_Position = vec4(aVertexPosition, 1.0);"+"\n"+
		" vTextureCoord = aTextureCoord;"+"\n"+
		"}";

		var fshader = gl.createShader(gl.FRAGMENT_SHADER);
		var vshader = gl.createShader(gl.VERTEX_SHADER);

		gl.shaderSource(fshader, fragShader);
		gl.shaderSource(vshader, vertShader);

		gl.compileShader(fshader);
		if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
			webGlAvail=false;
			console.log("An error occurred compiling the frag shaders: " + gl.getShaderInfoLog(fshader));
		}

		gl.compileShader(vshader);
		if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
			webGlAvail=false;
			console.log("An error occurred compiling the vertex shaders: " + gl.getShaderInfoLog(vshader));
		}

		shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vshader);
		gl.attachShader(shaderProgram, fshader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			webGlAvail=false;
			console.log("Unable to initialize the shader program.");
			console.log(gl.getProgramInfoLog(shaderProgram));
		}

		gl.useProgram(shaderProgram);

		var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);

		var textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
		gl.enableVertexAttribArray(textureCoordAttribute);

		textureSampPosition = gl.getUniformLocation(shaderProgram, "uSampler");
		fishEyeScalePosition = gl.getUniformLocation(shaderProgram, "fishEyeScale");

		texture = document.createElement('canvas');//icon canvas
		texture.width=128,
		texture.height=128;
		texturectx = texture.getContext("2d");

		gl.activeTexture(gl.TEXTURE0);
		snapTexture = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, snapTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.uniform1i(textureSampPosition, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
		gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	}
}
