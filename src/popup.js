/*jshint sub:true*/
var tabid=0,winid=0,popupWinId=0,dirMap;
var snapModeDelay = 3, errorScreenshotAttempts=0, snapModeBlockedHere=false, snapModeTimeout = 0, snapExtPage = false;
var screenshotAlternativeRecieved = 0, realSrcRecieved = false;
var isScriptAlive=false,scriptAliveTimeout=1,reExecutedNeedlessly=false;
var cpw=165,cph=303;
var nbsp='\u00A0';
var lastHex='FFF';
var isPopout=false;
//pref variables should be created dynamicaly
var borderValue='1px solid grey',EnableRGB=true,EnableHSL=true,useCSSValues=true,usePrevColorBG=false,showPreviousClr=true,pickEveryTime=(isWindows?true:false),bbackgroundColor='white',hexHasHash=false,hexIsLowerCase=false;
var cpScaleOffset=(isWindows?16:0);
var isPicking=false,keyInputMode=false;
var CSS3ColorFormat=loadedOptions.CSS3ColorFormat;
var snapModeBlock=loadedOptions.snapModeBlock;
var popupWaitTimeout=4000;

var gotAnUpdate = false;EnableHex=true;otherError=false;
var fishEye = (localStorage['fishEye']||pOptions["fishEye"].def)-0;
var startTime = (new Date()).getTime();
function getEventTargetA(ev){
	var targ=getEventTarget(ev);
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
var im=new Image();
function setPreviewSRC(duri, hidearrows){
	if( realSrcRecieved && hidearrows ){
		return;
	}
	if( screenshotAlternativeRecieved && duri.indexOf('img/error') > 0 ){
		return;
	}
	if( !hidearrows && !realSrcRecieved ){
		var timer = document.getElementById('timer_msg');
		if( timer ) timer.remove();
		if( screenshotAlternativeRecieved ){
			document.getElementById('alt-snap-mode-link').remove();
			screenshotAlternativeRecieved = 0;
		}
	}
	realSrcRecieved = realSrcRecieved || !hidearrows;
	im.onload=function(){
		//console.log("img loaded....", duri,  (new Date()).getTime())
		var pcvs=document.getElementById('pre').getContext('2d');
		pcvs.clearRect(0,0,150,150);

		var iw=im.naturalWidth;
		var ih=im.naturalHeight;
		var ratio = iw / ih;
		if( iw > ih ){
			var dh = 150 / ratio;
			pcvs.drawImage(im,0,(150-dh)*0.5,150,dh);
		}else{
			var dw = 150 * ratio;
			pcvs.drawImage(im,(150-dw)*0.5,0,dw,150);
		}
		possiblyShowLinkToTabletEdition();
	};
	//console.log('loading... ' , duri, (new Date()).getTime());
	im.src=duri;
	if(hidearrows){
		document.getElementById('arr_u').style.display='none',
		document.getElementById('arr_d').style.display='none',
		document.getElementById('arr_l').style.display='none',
		document.getElementById('arr_r').style.display='none';
	}else{
		document.getElementById('arr_u').style.display='inline',
		document.getElementById('arr_d').style.display='inline',
		document.getElementById('arr_l').style.display='inline',
		document.getElementById('arr_r').style.display='inline';
	}
}
function fromHexClr(H){
	if(H.length == 6){
		return {r:fromHex(H.substr(0,2)),g:fromHex(H.substr(2,2)),b:fromHex(H.substr(4,2))};
	}
	return false;
}
function fromHex(h){return parseInt(h,16);}
function toHex(d){return ("00" + (d-0).toString(16).toUpperCase()).slice(-2);}
function RGBtoHex(R,G,B) {return applyHexCase(toHex(R)+toHex(G)+toHex(B));}
function applyHexCase(hex){return hexIsLowerCase ? hex.toLowerCase() : hex;}
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
	document.getElementById('hex-prefix').style.visibility=(hexHasHash?'hidden':'normal');
	document.getElementById('hexpre').style.backgroundColor='#'+hex;
	if(omitId!='hex')document.getElementById('hex').value=(hexHasHash?'#':'')+hex;
	if(omitId!='cr')document.getElementById('cr').value=r;
	if(omitId!='cg')document.getElementById('cg').value=g;
	if(omitId!='cb')document.getElementById('cb').value=b;
	var hsl=rgb2hsl(r,g,b);
	document.getElementById('ch').value=hsl.h;
	document.getElementById('cs').value=hsl.s;
	document.getElementById('cv').value=hsl.v;
	cc_lastRGB.r=r,cc_lastRGB.g=g,cc_lastRGB.b=b;
	document.getElementById('cc_current_preview').style.backgroundColor='#'+hex;
	if(omitId!='crgb'){
		document.getElementById('crgb').value='rgb'+formatColorValues(r,g,b);
	}
	if(omitId!='chsl'){
		document.getElementById('chsl').value='hsl'+formatColorValues(hsl.h,hsl.s,hsl.v,0,1,1);
	}
	if(!justFields){var hsv=rgb2hsv(r,g,b);cp_set_from_hsv(hsv.h,hsv.s,hsv.v);}
}

function getPageZoomFactor(){
	var scal=document.width / document.documentElement.clientWidth;
	if(isNaN(scal)||!scal)scal=(outerWidth-cpScaleOffset)/innerWidth;
	if(scal < 0.25 || scal > 5.0 || (scal > 1.0 && scal < 1.02)) scal = 1.0;
	return scal;
}

function showLastPickingHex(){
	document.getElementById('ohexpre').style.backgroundColor='#'+lastHex;
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var validTab = ((sender.tab && sender.tab.id == tabid) || request.tabi==tabid || tabid==0);
		if(request.setPreview && validTab){
      //var hex=request.hex;//RGBtoHex(request.c_r+0,request.c_g+0,request.c_b+0);
      keyInputMode=false;
      gotAnUpdate=true;
      setPreviewSRC(request.previewURI,false);
      lastHex = request.lhex; // under some conditions, we may not update this here...
      if( isPicking ) showLastPickingHex();
      updateCurrentColor(request.cr,request.cg,request.cb);
      sendResponse({});
		}else if(request.setPickState && validTab){
			setButtonState(request && request.isPicking);
		}else if(request.disableColorPicker && validTab){
			close_stop_picking();
		}else if(request.reportingIn){
			isCurrentEnableReady=true;
	}else if(request.setTabImage){
		sendResponse({});
		tabScreenshotRecieved(request.pickerImage, request);
	}else if(request.didReqTabImage && request.tooFast){
		sendResponse({});
		errorShowScreenshotInstead();
	}else{
		sendResponse({});
	}
  });

function resnap(){
	chrome.tabs.sendMessage(tabid,{tabRefreshSnap:true,newImage:true},function(r){});
}
function setButtonState(picking){
	if( !picking && picking != isPicking ) showLastPickingHex();
	isPicking=picking;
	if(isPicking){
		document.getElementById('epick').className='btnActive'+(pickEveryTime?' autocast':'');
	}else{
		document.getElementById('epick').className='btnInactive'+(pickEveryTime?' autocast':'');
	}
	document.getElementById('epick').title = (isPicking?chrome.i18n.getMessage('pickAgainUnlocked'):chrome.i18n.getMessage('pickAgainLocked')) + "\n( [" + chrome.i18n.getMessage('rightClick') + "] "+ (pickEveryTime?chrome.i18n.getMessage('disablePickEveryTime'):chrome.i18n.getMessage('pickEveryTime')) + " )";
	document.getElementById('pre').title = (isPicking?chrome.i18n.getMessage('pickAgainUnlocked'):chrome.i18n.getMessage('pickAgainLocked')) + " [" + chrome.i18n.getMessage('dblClick') + "]";
}
function toglPick(ev){
	if (ev && (ev.which === 2 || ev.which === 3)){
		toglAutoPick(ev);
	}else{
		chrome.tabs.sendMessage(tabid,{doPick:true},function(r){});
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
	saveToChromeSyncStorage();
	sendReloadPrefs();
	setButtonState(isPicking);
	return preventEventDefault(ev);
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
		movePixel(0,-1);
	}else if(!keyInputMode && ev.keyCode==40){//d
		movePixel(0,1);
	}else if(!keyInputMode && ev.keyCode==37){//l
		movePixel(-1,0);
	}else if(!keyInputMode && ev.keyCode==39){//r
		movePixel(1,0);
	}else if(!keyInputMode && (ev.keyCode==13 || ev.keyCode==86)){//enter, v
		toglPick();
	}else if(!keyInputMode && (ev.keyCode==192)){//~
		resnap(); // selected text back!
		just_close_preview();
	}else if(t.id=='hex'){
		keyInputMode=true;stopPick();var rgb=fromHexClr(t.value);if(rgb)updateCurrentColor(rgb.r,rgb.g,rgb.b,false,t.id);
	}else if(t.id=='crgb'){
		keyInputMode=true;stopPick();var comp=t.value.match(/\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);if(comp)updateCurrentColor(comp[1]-0,comp[2]-0,comp[3]-0,false,t.id);
	}
}
function movePixel(mx,my){
	chrome.runtime.sendMessage({movePixel:true,_x:mx,_y:my,tabi:tabid},function(r){});
}
function moveArrowBtn(ev){
	var t=getEventTarget(ev);
	wk({keyCode:t.name });
}
function mwheel(ev){
	//console.log(ev);
	var newFishEye=(typeof(localStorage["fishEye"])!='undefined'?(localStorage["fishEye"]-0):pOptions["fishEye"].def);
	if(ev.wheelDelta > 0){
		newFishEye++;
	}else{
		newFishEye--;
	}
	if(typeof(pOptions["fishEye"].select[newFishEye])!='undefined')localStorage['fishEye']=newFishEye;
	saveToChromeSyncStorage();
	sendReloadPrefs();
	return preventEventDefault(ev);
}
function configureSnapModeBlocked(tabURL){
	snapModeBlockedHere = snapModeBlock && (tabURL || '').match(new RegExp(snapModeBlock, 'i'));
	snapExtPage = (tabURL || '').match(chrome.runtime.id);
}
function iin(){
	if(typeof(localStorage["borderValue"])!='undefined')borderValue = localStorage["borderValue"];
	if(typeof(localStorage["useCSSValues"])!='undefined')useCSSValues = ((localStorage["useCSSValues"]=='true')?true:false);
	if(typeof(localStorage["EnableHex"])!='undefined')EnableHex = ((localStorage["EnableHex"]=='true')?true:false);
	if(typeof(localStorage["EnableRGB"])!='undefined')EnableRGB = ((localStorage["EnableRGB"]=='true')?true:false);
	if(typeof(localStorage["EnableHSL"])!='undefined')EnableHSL = ((localStorage["EnableHSL"]=='true')?true:false);
	if(typeof(localStorage["cpScaleOffset"])!='undefined')cpScaleOffset = localStorage["cpScaleOffset"]-0;
	if(typeof(localStorage["pickEveryTime"])!='undefined')pickEveryTime = ((localStorage["pickEveryTime"]=='true')?true:false);
	if(typeof(localStorage["usePrevColorBG"])!='undefined')usePrevColorBG = ((localStorage["usePrevColorBG"]=='true')?true:false);
	if(typeof(localStorage["bbackgroundColor"])!='undefined')bbackgroundColor = (localStorage["bbackgroundColor"]);
	if(typeof(localStorage["showPreviousClr"])!='undefined')showPreviousClr = ((localStorage["showPreviousClr"]=='true')?true:false);
	if(typeof(localStorage["hexIsLowerCase"])!='undefined')hexIsLowerCase = ((localStorage["hexIsLowerCase"]=='true')?true:false);
	if(typeof(localStorage["hexHasHash"])!='undefined')hexHasHash = ((localStorage["hexHasHash"]=='true')?true:false);
	if(typeof(localStorage["popupWaitTimeout"])!='undefined')popupWaitTimeout = localStorage["popupWaitTimeout"]-0;

	if( !(popupWaitTimeout > 10) ) popupWaitTimeout = 4000;

	setPreviewSRC(chrome.extension.getURL('img/default.png'),true);

	if(useCSSValues){
		document.getElementById('cssmode').style.display="block";
		document.getElementById('defaultmode').style.display="none";
	}
	if(!EnableHex&&(EnableRGB || EnableHSL)) document.getElementById('hexrow').style.display="none";

	if(!EnableRGB){
		document.getElementById('defrgb').style.display="none";
		document.getElementById('cssrgb').style.display="none";
	}
	if(!EnableHSL){
		document.getElementById('defhsl').style.display="none";
		document.getElementById('csshsl').style.display="none";
	}
	if(document.getElementById('plat_prev')){
		var dow=new Date().getDay();
		if(navigator.userAgent.indexOf('Windows') < 0){
			if(dow==4){
				document.getElementById('plat_prev').src="img/ico_maca.png";
			}else
				document.getElementById('plat_prev').src="img/ico_mac.png";
		}else if(dow==4){
			document.getElementById('plat_prev').src="img/ico_wina.png";
		}
		document.getElementById('plat_prev').style.display="inline";
	}

	//if( !globalPopout ){
		if( window.location.href.indexOf('isPopup=')>-1 ){
			isPopout=true;
			var wlh=window.location.href;
			var st = wlh.indexOf('isPopup=') + 8;
			var en = wlh.indexOf('&',st);
			if( en < 0 ) en = wlh.length;
			var values = wlh.substr(st,en-st).split(',');
			tabid=values[0]-0;
			winid=values[1]-0;
			document.getElementById('popout').style.display='none';
			if(window.innerWidth > 200)init_color_chooser();
			setupInjectScripts();
			chrome.tabs.get(tabid, function(tab){
				configureSnapModeBlocked(tab.url);
			});
			chrome.windows.getCurrent({windowTypes:['popup']},function(win){
				if( win.type=='popup' ){ // shouldn't this check be redundant? is not
					popupWinId=win.id
				}
			});
		}else{
			chrome.windows.getCurrent(function(win){
				chrome.tabs.query({windowId: win.id, active: true}, function(tabs){
					var tab = tabs[0];
					tabid=tab.id;
					winid=win.id-0;
					var tabURL=tab.url;
					configureSnapModeBlocked(tabURL);
					if(tabURL.indexOf('https://chrome.google.com')==0 ||tabURL.indexOf('chrome')==0 ||tabURL.indexOf('about')==0 ){
						showErrorScreen('page_url');
					}else if(tabURL.indexOf('file://')==0){
						showErrorScreen('page_is_file');
					}else{
						setTimeout(function(){
							if(!gotAnUpdate && !otherError){
								showErrorScreen('page_slow');
							}
						},2000);
					}
					setupInjectScripts();
			});
		});
	}
	//}
}

var errorTypes={
	current: null,
	conent_port:{
		image: '0.1',
		chooser: true
	},
	snap_mode_block:{
		image: '0.2',
		chooser: false, // really true; page_url error already enabled the chooser, enabling it again toggles it off!
		no_snap: true,
		ignore: {'conent_port': 1, 'page_slow': 1}
	},
	page_url:{
		image: '0',
		chooser: true,
		ignore: {'conent_port': 1, 'page_slow': 1}
	},
	page_slow:{
		image: '1',
		timer: true,
	},
	page_is_file:{
		image: '2',
		timer: true,
		no_snap: true,
		ignore: {'conent_port': 1, 'page_slow': 1}
	}
}
function showErrorScreen(errorType){
	var err = errorTypes[errorType];
	if( !err ) err = errorTypes.page_slow;
	var lastErr = errorTypes[errorTypes.current];
	// console.log('showing error', errorType, err, 'last error', errorTypes.current, lastErr);
	if( lastErr && lastErr.ignore && lastErr.ignore[errorType] ){ // to ignore subsequent errors of specified types
		console.log('error of type '+errorType+' ignored after occurance of error type ' +errorTypes.current );
		return;
	}
	errorTypes.current = errorType;
	// todo: delay/fade this error in??  maybe some types ???
	setPreviewSRC(chrome.extension.getURL('img/error'+err.image+'.png'), true);
	if( err.chooser && !cp_chooser_booted ){ init_color_chooser(); }
	if( err.timer ){ showLoadingTimer(); }
	if( !err.no_snap )errorShowScreenshotInstead();
}

function errorShowScreenshotInstead(){
	if( localStorage['snapMode'] === 'false' ){
		console.warn(chrome.i18n.getMessage('snapMode') + ' - snap mode disabled');
		document.getElementById('optsb').href='options.html?reveal=snapMode'
		return;
	}
	if( snapModeBlockedHere ){
		console.warn(chrome.i18n.getMessage('snapMode') + ' - snap mode blocked....');
		showErrorScreen('snap_mode_block');
		document.getElementById('optsb').href='options.html?reveal=snapModeBlock'
		document.getElementById('pre').addEventListener('click', beginSnapModeOnce);
		document.getElementById('pre').style.cursor="pointer";
		return;
	}
	clearTimeout(snapModeTimeout);
	snapModeTimeout = setTimeout(beginSnapMode, snapModeDelay);
}
function beginSnapModeOnce(){
	document.getElementById('pre').removeEventListener('click', beginSnapModeOnce);
	beginSnapMode();
}

function beginSnapMode(){
	errorScreenshotAttempts++;
	if( gotAnUpdate || realSrcRecieved || localStorage['snapMode'] === 'false' ){
		return;
	}
	if( errorScreenshotAttempts > 5 ){console.log("max err alternative screeshot attempts reached;"); return;}
	chrome.tabs.captureVisibleTab( isPopout ? winid : null, {format:'png'}, function(dataUrl){
		tabScreenshotRecieved(dataUrl, {setTabImage:tabid})
	});
}
function tabScreenshotRecieved(dataUri, request){
	if( realSrcRecieved ) return;
	if( screenshotAlternativeRecieved ) return;
	setPreviewSRC(dataUri,true);
	Cr.elm("a",{
		id:'alt-snap-mode-link',
		target:'_blank',
		href:chrome.extension.getURL('pick.html#tab='+request.setTabImage)+(snapExtPage?'#extSelf':''),
		event:['click', function(){
			console.log('passing data to snap mode via localStorage...') // todo fix this
			localStorage.lastImageSnap=dataUri; // our new tab will delete this entry
		}],
		childNodes:[
			Cr.txt(chrome.i18n.getMessage('snapMode_prompt'))
		]
	},document.getElementById('preview'));
	screenshotAlternativeRecieved = 1;
}


function showLoadingTimer(){
	var timer = document.getElementById('timer_msg');
	if( timer ){
		Cr.empty(timer);
		var curTime = (new Date()).getTime();
		var elapsedS = Math.floor((curTime - startTime) / 1000);
		if( elapsedS <= 8 && !screenshotAlternativeRecieved ){
			timer.appendChild(Cr.txt(':'+elapsedS));
			setTimeout(showLoadingTimer, 250);
		}else{
			timer.appendChild(screenshotAlternativeRecieved?Cr.txt(''):Cr.txt('sorry, reload'));
		}
	}
}

function setupInjectScripts(){
	if( snapModeBlockedHere ){
		showErrorScreen('page_url');
		return;
	}
	isScriptAlive=false;
	scriptAliveTimeout=1;
	reExecutedNeedlessly=false;
	try{
		chrome.tabs.sendMessage(tabid, {testAlive:true}, function(response) {
			if(chrome.runtime.lastError)console.log('Content scripts inactive, was the extension reloaded?: '+chrome.runtime.lastError.message);
			if(response&&response.result){
				if(scriptAliveTimeout==0){
					showErrorScreen('page_slow');
					reExecutedNeedlessly=true;
				}else{
					isScriptAlive=true;
					scriptsInjectedResult();
				}
			}
		});
		scriptAliveTimeout=setTimeout(scriptsInjectedResult,popupWaitTimeout||4000);
	}catch(e){
		scriptsInjectedResult();//I don't think we ever get here
	}
}
function scriptsInjectedResult(){
	clearTimeout(scriptAliveTimeout);
	scriptAliveTimeout = 0;
	if(!isScriptAlive){
		//chrome.extension.getURL('img/error'+1+'.png'); // showErrorScreen('page_slow');
		// if they wait anyway, it could work....
		chrome.tabs.executeScript(tabid, {file: "Cr.js"}, function(){
			if(chrome.runtime.lastError){
				console.log(chrome.runtime.lastError.message);
				showErrorScreen('conent_port');
				return;
			}
			chrome.tabs.executeScript(tabid, {file: "options_prefs.js"}, function(){
				chrome.tabs.executeScript(tabid, {file: "colorpick.user.js"}, function(){
					isScriptAlive=true;
					setTimeout(finishSetup, 250);
				});
			});
		});
	}else
		finishSetup();
}

function bgPageOrPortError(){
	otherError=true;
	showErrorScreen('conent_port');
}

function finishSetup(){
	var port = null;
	try{
		port = chrome.tabs.connect(tabid, {name:"popupshown",frameId:0});
	}catch(e){
		console.log("Port connection error", port, e);
	}
	if(!port){
		console.log('Failed to chrome.tabs.connect name:"popupshown" - this may mean our background page or content script went away');
		bgPageOrPortError();
		return;
	}
	var colorHistory = localStorage['colorPickHistory'] || '';
	chrome.tabs.sendMessage(tabid,{enableColorPicker:true, historyLen:colorHistory.length},function(response){

		if(response.hex)
			updateCurrentColor(response.cr,response.cg,response.cb);
		
		document.getElementById('ohexpre').style.backgroundColor='#'+response.lhex;
		if(response.previewURI && response.previewURI.length > 0 ){
			gotAnUpdate=true;
			setPreviewSRC(response.previewURI,false);
		}else if( response.wasAlreadyEnabled ){
			movePixel(0,0); // should help update the preview...
		}

		if(usePrevColorBG){
			if(response.hex && response.hex.length == 6)document.body.style.backgroundColor='#'+response.hex;
		}else{
			document.body.style.backgroundColor=bbackgroundColor;
		}

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

		if(!response.isPicking && pickEveryTime)toglPick();
		setButtonState(response && response.isPicking);

		if(!response.wasAlreadyEnabled && !isWindows && isChrome){
			setTimeout(function(){
				just_close_preview();
			},1000);
		}
	});

	if(localStorage.feedbackOptOut=='true' && localStorage["reg_chk"]!='true'){
		setTimeout(checkForLicense,500);
	}
}
function oout(){
	chrome.runtime.sendMessage({disableColorPicker:true,tabi:tabid},function(r){});
}
var x=0,y=0,x1=0,y1=0,isDrag=false,xm,ym;
function mmove(ev){
	if(isDrag){
		fishEye = (localStorage['fishEye']||pOptions["fishEye"].def);
		x=ev.pageX-window.pageXOffset,
		y=ev.pageY-window.pageYOffset;
		xm=Math.round((x1-x)/fishEye),
		ym=Math.round((y1-y)/fishEye);
		if(xm!=0||ym!=0){
			chrome.runtime.sendMessage({movePixel:true,_x:xm,_y:ym,tabi:tabid}, function(response) {});
			if(xm!=0)x1=x;
			if(ym!=0)y1=y;
		}
	}
}
function initdrag(ev){
	x=ev.pageX-window.pageXOffset,
	y=ev.pageY-window.pageYOffset;
	x1=x,y1=y;
	isDrag=true;
	
	ev.preventDefault();
	return false;
}
function finalizedrag(){
	isDrag=false;
}

var win2 = 0;
function popupimage(mylink, windowname)
{
	var w=Math.round(window.outerWidth*1.114),h=Math.round(window.outerHeight*1.15);

	//console.log(w,h);
	chrome.windows.create({url:mylink.href,width:w,height:h,type:"popup",focused:true},function(win){
		// offset the new window so it is tougher to loose it
		var newx=0, newy=0;
		if( win.left && win.top ){
			newx = win.left - 170;
			newy = win.top - 30;
			if( newx < 0 ) newx=0;
			if( newy < 0 ) newy=0;
			chrome.windows.update(win.id,{left:newx,top:newy},function(wi2){});
		}
	});
	return false;
	
//	if (! window.focus)return true;
//	mylink = new String( mylink.href );
//	if( win2 == 0 || typeof(win2) != 'object' || typeof(win2.location) != 'string'  ){
//		//var scal=getPageZoomFactor();
//		//var w=Math.ceil(window.innerWidth*scal)+1,h=Math.ceil(window.innerHeight*scal)+1;
//		
//		win2 = window.open(mylink, windowname, 'fullscreen=no,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=yes,directories=no,location=no,width='+w+',height='+h);
//	}else{
//		win2.location = mylink;
//	}
//	win2.blur();
//	win2.focus();
//	win2.blur();
//	return false;
}

function popOutMouseDown(ev){
 getEventTargetA(ev).href=popOutUrl()+'#';
}
function popOut(ev){
 popupimage({href:popOutUrl()}, chrome.i18n.getMessage('extName') + " : Extension");
 ev.preventDefault();
}

function popOutUrl(){
	return chrome.extension.getURL('popup.html')+'?isPopup='+tabid+','+winid
}

function close_stop_picking(ev){
	if(  !ev || ev.type ){
		if( ev && ev.which && (ev.which === 2 || ev.which === 3) ){
			ev.preventDefault();
			ev.stopPropagation();
			resnap(); // selected text back!
			just_close_preview();
		}else{
			if( !ev || ev.type == 'click' ){
				oout();
				window.close();
			}
		}

	}
}

function just_close_preview(){
 window.close();
}

function selectSelfText(ev){
 getEventTarget(ev).select();
}

var licf=false,lhei=10;
function checkForLicense(){
	//return;
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
	f.setAttribute('style','position:absolute;top:40px;'+dirMap.start+':3px;z-index:999;box-shadow: 0px 0px 6px #000;opacity:0.9;');
	
	if(document.body.firstChild.id=='license_frame')document.body.removeChild(document.body.firstChild);
	document.body.insertBefore(f,document.body.firstChild);
	licf=f;
	animIn();
}
function animIn(){
	lhei+=5;
	licf.style.height=lhei+'px';
	if(lhei < 150)setTimeout(animIn,33);
}
function sizeWindow(x,y){
	//window.resizeTo(x,y); // broken! works from console
}
//COLOR CHOOSER FUNCTIONS *******************************
var cc_lastRGB={r:0,g:0,b:0};
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
	if(!ev.offsetY){ev.offsetY=ev.layerY;ev.offsetX=ev.layerX;}
	if(ev.which==0){huedrag=false,clrdrag=false;}
	if(huedrag){
		var newPos=ev.offsetY;
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
	cp_x=Math.round(((s)/100)*255);
	cp_y=Math.round(((100-v)/100)*255);
	if(cp_chooser_booted)cp_grad_render(true);
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
	++cp_loads;if(cp_loads>=cp_totalLoads){cp_chooser_booted=true;cp_grad_render((cp_x!=0 || cp_y != 0));}
	return cp_chooser_booted;
}
function init_color_chooser(){
	var scal=getPageZoomFactor();
	if(document.getElementById('chooser').style.display=='block'){
		document.getElementById('chooser').style.display='none';
		document.body.style.width='auto';
		// if(isPopout) sizeWindow(160*scal,window.outterHeight);
		if( popupWinId ){
			chrome.windows.update(popupWinId,{width:Math.round(180*scal)},function(win){});
		}
		return;
	}
	document.getElementById('chooser').style.display='block';
	document.body.style.width='470px';
	if( popupWinId ){
		chrome.windows.update(popupWinId,{width:Math.round(490*scal)},function(win){});
	}
	if(cp_chooser_booted)return;
	//if(isPopout) sizeWindow(470*scal,window.outterHeight);
	//One Time Init...
	document.getElementById('ch_ctrl_add').addEventListener('click', colorChooserAdd);
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
function colorChooserAdd(){
	var hex=RGBtoHex(cc_lastRGB.r,cc_lastRGB.g,cc_lastRGB.b);
	var hsl=rgb2hsl(cc_lastRGB.r,cc_lastRGB.g,cc_lastRGB.b);
	chrome.runtime.sendMessage({setColor:true,hex:hex,rgb:cc_lastRGB,hsv:hsl}, function(response){});
	document.getElementById('ohexpre').style.backgroundColor='#'+hex;
	lastHex = hex;
}
//END COLOR CHOOSER FUNCTIONS ***************************
function possiblyShowLinkToTabletEdition(){
	if( realSrcRecieved ){ // also ? (window.navigator.maxTouchPoints || 0) > 0 ?
		var teBtn = document.getElementById('launch-tablet-edition-btn');
		var gteBtn = document.getElementById('get-tablet-edition-btn');
		if( teBtn && teBtn.style.display != 'block' && extensionsKnown.color_pick_tablet){
			chrome.runtime.sendMessage(extensionsKnown.color_pick_tablet, {testAvailable:true}, function(r) {
				if( !chrome.runtime.lastError && r ){
					teBtn.style.display="block";
				}else{
					if( gteBtn && window.navigator.maxTouchPoints > 0 ){ // prompt: go install tablet edition already!
						gteBtn.style.display="block";
					}
				}
			});
		}
	}
}
function createDOM() {
dirMap=detectDirection();
Cr.elm("div",{},[
	Cr.elm("div",{id:"chooser"},[
		Cr.elm("div",{id:"gradi_box"},[
			Cr.elm("canvas",{id:"gradi",width:"257",height:"256"})
		]),
		Cr.elm("div",{id:"slider_hue"},[
			Cr.elm("img",{id:"hue_pos",src:"img/cp_ar.gif",style:"top:-4px"}),
			Cr.elm("img",{id:"hue_grad",src:"img/cp_rb.png"})
		]),
		Cr.elm("div",{id:"ch_ctrls_box"},[
			Cr.elm("a",{href:"#",id:"ch_ctrl_add"},[
				Cr.elm('span',{style:'width:16px;display:inline-block;', id:'cc_current_preview'},[Cr.txt(nbsp)]),
				Cr.txt(' '+chrome.i18n.getMessage('addToHistory'))
			])
		]),
	]),


	Cr.elm("div",{class:"lbrow",id:"hex-and-close"},[
		Cr.elm("div",{class:"lb"},[
			Cr.elm("span",{title:chrome.i18n.getMessage('closeAndExit')+' [esc]',id:"eclose"},[
				Cr.elm("img",{align:'top',src:chrome.extension.getURL('img/close.png')})
			]),
			Cr.elm('span',{id:'hex-prefix'},[Cr.txt("#")])
		]),
		Cr.elm("span",{id:'hexrow'},[
			Cr.elm("input",{type:"text",spellcheck:"false",id:"hex",class:'fullwidth'+(hexHasHash?' hex-hashed':'') })
		]),
	]),
	//Cr.elm("a",{id:"hidemin",href:"#",class:'hilight',event:['click',just_close_preview],title:chrome.i18n.getMessage('hideMinimize')},[Cr.txt("_-")]),
	Cr.elm("div",{id:"defaultmode"},[
		Cr.elm("div",{class:"lbrow",id:"defrgb"},[
			Cr.elm("div",{class:"lb"},[Cr.txt("rgb:")]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cr",class:"thirdw"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cg",class:"thirdw"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cb",class:"thirdw"}),
			Cr.elm("br",{})
		]),
		Cr.elm("div",{class:"lbrow",id:"defhsl"},[
			Cr.elm("div",{class:"lb"},[Cr.txt("hsl:")]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"ch",class:"thirdw"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cs",class:"thirdw"}),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"cv",class:"thirdw"}),
			Cr.elm("br",{})
		])
	]),
	Cr.elm("div",{id:"cssmode"},[
		Cr.elm("div",{class:"lbrow",id:"cssrgb"},[
			Cr.elm("div",{class:"lb"},[]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"crgb",class:"fullwidth"}),
			Cr.elm("br",{})
		]),
		Cr.elm("div",{class:"lbrow",id:"csshsl"},[
			Cr.elm("div",{class:"lb"},[]),
			Cr.elm("input",{type:"text",spellcheck:"false",id:"chsl",class:"fullwidth"}),
			Cr.elm("br",{})
		])
	]),
	Cr.elm("div",{id:"preview",title:chrome.i18n.getMessage('zoomPreviewDefaultTip')},[
		Cr.elm("a",{id:"unreg_msg",target:"_blank",href:"register.html",event:['click',navToReg],title:chrome.i18n.getMessage('buyRegisterTip')},[/*Cr.txt(chrome.i18n.getMessage('registerBanner'))*/]),
		Cr.elm("span",{id:"timer_msg"},[]),
		Cr.elm("a",{href:'#',id:'arr_u',class:'hilight mvarrow',name:38,event:['click',moveArrowBtn]},[Cr.txt(String.fromCharCode(9650))]),
		Cr.elm("a",{href:'#',id:'arr_d',class:'hilight mvarrow',name:40,event:['click',moveArrowBtn]},[Cr.txt(String.fromCharCode(9660))]),
		Cr.elm("a",{href:'#',id:'arr_l',class:'hilight mvarrow',name:37,event:['click',moveArrowBtn]},[Cr.txt(String.fromCharCode(9664))]),
		Cr.elm("a",{href:'#',id:'arr_r',class:'hilight mvarrow',name:39,event:['click',moveArrowBtn]},[Cr.txt(String.fromCharCode(9654))]),
		Cr.elm("canvas",{id:"pre",width:"150",height:"150",style:"margin-bottom:3px;"})
	]),
	Cr.elm('a',{id:'launch-tablet-edition-btn',class:'promt-row',style:'display:none;',event:['click', function(){

		chrome.tabs.sendMessage(tabid,{getActivatedStatus:true, tab:tabid, win:winid},function(tab_response){
			// TODO: show loading ?? (response is pretty quick!)
			var fw_tab_resp = Object.assign({alsoLaunch: true}, tab_response);
			//console.log('got respone from tab...', fw_tab_resp);
			chrome.runtime.sendMessage(extensionsKnown.color_pick_tablet, fw_tab_resp, function(r) {
				//console.log('good to launch?', r);
			});
		});
	}],childNodes:[Cr.txt('\uD83D\uDD0D '),Cr.txt(chrome.i18n.getMessage('tabletModePrompt')),Cr.txt(' \uD83D\uDD0E')]}),
	Cr.elm('a',{
		id:'get-tablet-edition-btn',
		class:'promt-row',
		style:'display:none;',
		href: extensionsKnown.color_pick_tablet_url + '?from_popup=true',
		target: '_blank',
		childNodes:[
			Cr.txt('\uD83D\uDD0D '),Cr.txt(chrome.i18n.getMessage('tabletModePitch')),Cr.txt(' \uD83D\uDD0E')
		]
	}),
	Cr.elm("div",{id:"pres"},[
		Cr.elm("div",{id:"ohexpre"}),
		Cr.elm("div",{id:"hexpre",title:chrome.i18n.getMessage('showColorChooser')})
	]),
	Cr.elm("div",{id:"ctrls"},[
		Cr.elm("a",{href:"#",title:chrome.i18n.getMessage('pickAgainLocked'),id:"epick"},[
			Cr.elm("img",{border:"0",align:"top",style:"position:relative;top:-1px;",src:"img/crosshair.png",width:"19"})
		]),
		Cr.elm("a",{href:"#",class:'hilight',title:chrome.i18n.getMessage('reSnapPage'),id:"resnap"},[
			Cr.elm("img",{align:"top",src:"img/refresh.png"})
		]),
		Cr.elm("a",{target:"_blank",class:'hilight',href:"options.html",event:['click',navToOptions],title:chrome.i18n.getMessage('configurationHelp'),id:"optsb"},[
			Cr.elm("img",{align:"top",style:'position:relative;top:0.5px;',src:"img/settings.png"})
		]),

		(!localStorage["hideMobilePromo"]?(Cr.elm("a",{target:"_blank",class:'hilight',href:"mobile_app.html",event:['click',navToMobile],title:chrome.i18n.getMessage('getStandaloneApp'),id:"mobileapp"},[
			Cr.txt('\uD83D\uDCF1')
		])):0),

		// Cr.elm("a",{target:"_blank",class:'hilight',href:"desktop_app.html",title:chrome.i18n.getMessage('getStandaloneApp')},[
		// 	Cr.elm("img",{align:"top",id:"plat_prev",src:"img/ico_win.png",style:"display:none;"})
		// ]),
		Cr.elm("a",{title:chrome.i18n.getMessage('popOutWindow'),href:"#",class:'hilight',id:"popout"},[
			Cr.elm("img",{align:"top",src:"img/popout.gif"})
		])
	])
],document.body);

  document.getElementById('eclose').addEventListener('click', close_stop_picking);
  document.getElementById('eclose').addEventListener('mousedown', close_stop_picking);
  document.getElementById('pre').addEventListener('dblclick', toglPick);
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
	document.getElementById('popout').addEventListener('mousedown', popOutMouseDown);
	
	document.getElementById('hexpre').addEventListener('click', init_color_chooser);
	document.getElementById('ohexpre').addEventListener('click', navToHistory);

	window.addEventListener('mousewheel',mwheel);
	window.addEventListener('keyup',wk);
	document.addEventListener('mousemove',mmove);
	document.body.addEventListener('click', popupClicked,false);

	var bgWaitTimeout = setTimeout(function(){
		console.warn("background alive wait timeout!")
		bgPageOrPortError();
	}, 4500);

	//console.log('pending: option for automatically entering wasm "touch" mode? or seperate extension?', window.navigator.maxTouchPoints);

	chrome.runtime.sendMessage({isBgAlive:true},function(r){
		if(chrome.runtime.lastError){
			console.warn('Error during check of isBgAlive: '+chrome.runtime.lastError.message);
			bgPageOrPortError();
		}else{
			iin();
		}
		clearTimeout(bgWaitTimeout);
	});

}

document.addEventListener('DOMContentLoaded', createDOM);
