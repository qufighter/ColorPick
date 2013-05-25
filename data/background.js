function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
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

var iconPath = '';

function fromPrefs(){

	//remove defunct options
	localStorage.removeItem("autoRedirectPickable");
	localStorage.removeItem("redirectSameWindow");
	localStorage.removeItem("customCalibration");
	localStorage.removeItem("cpScaleOffset");
	localStorage.removeItem("flashScalePix");
	localStorage.removeItem("postAutoOptin");

	//future additions -
	//storage.remove(['','',''], function(){})

	for(var i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			window[i] = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
		else
			window[i] = ((localStorage[i])?localStorage[i]:pOptions[i].def);
	}

	for(var i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			window[i] = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pAdvOptions[i].def));
		else
			window[i] = ((localStorage[i])?localStorage[i]:pAdvOptions[i].def);
	}

	if(typeof(localStorage["usageStatistics"])=='undefined'){
		//if(!navigator.doNotTrack) localStorage["usageStatistics"]=true;
		//else
		localStorage["usageStatistics"]=false;
	}

	if(localStorage["usageStatistics"]=='true' && !navigator.doNotTrack){
		localStorage.removeItem("feedbackOptOut");
	}else{
		localStorage.feedbackOptOut = "true";
	}
	
	defaultIcon();
	feedbackParticipationOversight();
}

function defaultIcon(){
	var iconPath='img/';
	if(appleIcon)iconPath+='apple/';
	if(resetIcon)chrome.browserAction.setIcon({path:chrome.extension.getURL(iconPath+(window.devicePixelRatio>1?'icon38.png':'icon19.png'))});//update icon (to be configurable)
}

var d=new Date();

function getWeek(d){
	var onejan = new Date(d.getFullYear(),0,1);
	return Math.ceil((((d - onejan) / 86400000) + onejan.getDay()+1)/7);
}

function feedbackParticipationOversight(){
	if(localStorage["hasAgreedToLicense"]=='true' && localStorage.feedbackOptOut!='true' && localStorage["usageStatistics"]=='true'){
		var d=new Date();
		if( localStorage["participation"]!=d.getFullYear()+'_'+getWeek(d) ){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange=function(){if(xhr.readyState == 4){
				if(xhr.status==200){
					if(xhr.responseText == 'SOK'){
						var d=new Date();
						localStorage["participation"]=d.getFullYear()+'_'+getWeek(d)
					}
				}
			}};
			xhr.open('GET', "http://vidzbigger.com/feedback.php?app=1", true);
			xhr.send();
		}
	}
}

//on change visible tab, is cp active on this tab, if so, resnapshot..?
//888888888888888888888888888888888888888888888888888888888888888888888

//globals
var ctx;
var x,y,tabid=0,winid=0; //current pixel
var curentHex=0,lastHex='FFF',lastLastHex='FFF';
var lastPreviewURI=''; //potentially needs to be cleaned up an not "jump" across sites, if exit triggered from content script the message does not reach us here... (they do now)
//var fullScreenImageData=[];//potentially huge array of raw image data
var imageDataIsReady=false,popupIsShowing=false;
var clrgb={r:0,g:0,b:0}
var clhsv={h:0,s:0,v:0}
var isCurrentEnableReady=false;
var wid, hei;

function getCurrentClrData(){
	var dobj={hex:curentHex}
	if(ShowRGBHSL){
		if(EnableRGB)dobj.rgb={r:clrgb.r,g:clrgb.g,b:clrgb.b}
		if(EnableHSL)dobj.hsv={h:clhsv.h,s:clhsv.s,v:clhsv.v}
	}
	return dobj;
}

chrome.runtime.onConnect.addListener(function(port) {
	if(port.name == "popupshown"){
		popupIsShowing=true;
		port.onDisconnect.addListener(function(msg) {
			popupIsShowing=false;
		});
	}
});

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
		if(sender.tab && sender.tab.id >= 0){
			tabid=sender.tab.id;
			winid=sender.tab.windowId;
		}
		if(request.tabi){
			tabid=request.tabi;
		}
		if(request.setPreview){
			 sendResponse({});//not handled by this listener
		}else if (request.newImage){
			wid=request._x;
			hei=request._y;
			var cbf=function(dataUrl){
				imageDataIsReady=false;
				pim.src=dataUrl;
				mcan.width = wid;
				mcan.height = hei;
				ctx = mcan.getContext("2d");
				ctx.clearRect(0,0,wid,hei);
			}
			
			if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
			else chrome.tabs.captureVisibleTab(winid, {format:'jpeg',quality:100}, cbf);
			sendResponse({});
		}else if (request.movePixel){
			x+=(request._x);//or otherwise use the current scale
			y+=(request._y);
			getNewColorData();
			handleRendering();
			dobj=getCurrentClrData();
			dobj.movedPixel=true;
			dobj.msg=chrome.i18n.getMessage('pressEnterToPick');
			chrome.tabs.sendMessage(tabid,dobj,function(r){});
			sendResponse({});
		}else if (request.getPixel){
			x=request._x;
			y=request._y;
			getNewColorData();
			sendResponse(getCurrentClrData());
			setTimeout(handleRendering,10);
		}else if (request.setColor){
			if(showPreviousClr){lastLastHex=lastHex;lastHex=curentHex;}
			else lastHex='none';
			//user clicked, optionally store color to database...
			if(shareClors){
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange=function(){if(xhr.readyState == 4){ }};
				xhr.open('GET', 'http://vidzbigger.com/vcolors.php?colorhex='+curentHex, true);
				xhr.send();
			}
			//store colors
			localStorage['colorPickHistory']+="#"+curentHex;
//logs error when options is not showing... not sure of best way to prevent
			chrome.runtime.sendMessage({historypush: true}, function(response) {
					//console.log('disabled!');
			});
			sendResponse();
			if(autocopyhex){
				var n=document.createElement('input');document.body.appendChild(n);
				n.value=curentHex;n.select();document.execCommand('copy');n.parentNode.removeChild(n);
			}
		}else if(request.reportingIn){
			isCurrentEnableReady=true;
			 
		}else if (request.enableColorPicker){
			popupIsShowing=true;
			handleRendering();
			chrome.tabs.getSelected(null, function(tab) {
				var tabId=tab.id;
				if(request.tabi>0 && request.tabi!=tabId){
					sendResponse({});//in the case of a popup, the currently selected "tab" is not the one we need to initialize
					return;
				}
				
				isCurrentEnableReady=false;
				var tabURL=tab.url;
				
				
			  chrome.tabs.sendMessage(tab.id, {enableColorPicker:true,borders:borderValue}, function(response) {
			  });
			  
			  if(tabURL.indexOf('https://chrome.google.com')==0 ||tabURL.indexOf('chrome')==0 ||tabURL.indexOf('about')==0 ){
						//console.log( 'Unsupported page type :/');
						chrome.runtime.sendMessage({greeting: "error_picker",errno:0}, function(response) {
								//console.log('disabled!');
						});
				}else if(tabURL.indexOf('http://vidzbigger.com/anypage.php')!=0){
  				window.setTimeout(function(){
  					if(!isCurrentEnableReady){
							if(tabURL.indexOf('file://')==0){
								chrome.runtime.sendMessage({greeting: "error_picker",errno:2}, function(response) {});
							}else{
								chrome.runtime.sendMessage({greeting: "error_picker",errno:1}, function(response) {});
							}
  					}
  				},560);//we expect to hear back from the content script by this time or something is wrong... and we need to use an iframe
			  }
			});
			sendResponse({hex:curentHex,lhex:lastLastHex,previewURI:lastPreviewURI,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b});
		}else if (request.disableColorPicker){
			lastPreviewURI='';
			defaultIcon();
			chrome.browserAction.setBadgeText({text:''});
//	  			chrome.tabs.getSelected(null, function(tab) {
//					  chrome.tabs.sendMessage(tab.id, {disableColorPicker:true}, function(response) {});
//					});'
			if(!imageDataIsReady){//cleans up the image src
				if(pim.complete){
					//ctx.putImageData(getImageDataFromImage(pim).data, 0, 0);
					if(clrAccuracyOverPrecision)
						ctx.drawImage(pim,0,0);
					else
						ctx.drawImage(pim,0,0,wid,hei);
					pim.src='';
					imageDataIsReady=true;
				}else{
					pim.src='';
				}
			}
			chrome.tabs.sendMessage(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
    }else if(request.reloadprefs){
    	fromPrefs();sendResponse({});
    }else
    	sendResponse({});
  
});
function getNewColorData(){
	ctx = mcan.getContext("2d");
	if(!imageDataIsReady){
		if(pim.complete){
			if(clrAccuracyOverPrecision)
				ctx.drawImage(pim,0,0);
			else
				ctx.drawImage(pim,0,0,wid,hei);
			pim.src='';
			if(showActualPickTarget){
				setTimeout(function(){
					chrome.tabs.sendMessage(tabid, {setPickerImage:true,pickerImage:mcan.toDataURL()}, function(response) {});
				},10);
			}
			imageDataIsReady=true;
		}else{
			return false;//image not ready to render...
		}
	}
	var ox=Math.round(x),oy=Math.round(y);
	var data = ctx.getImageData(ox, oy, 1, 1).data;

	if(iconIsPreview){
		if(data[0]||data[1]||data[2]){
			chrome.browserAction.setBadgeBackgroundColor({color:[data[0],data[1],data[2],255]})
			chrome.browserAction.setBadgeText({text:'  '});
		}else{
			chrome.browserAction.setBadgeText({text:''});
		}
	}else{
		chrome.browserAction.setBadgeText({text:''});
	}

	curentHex=RGBtoHex(data[0],data[1],data[2]);
	clhsv=rgb2hsl(data[0],data[1],data[2]);
	clrgb.r=data[0],clrgb.g=data[1],clrgb.b=data[2];
}
function handleRendering(){
	ctx = mcan.getContext("2d");
	if(!imageDataIsReady) return false;

// under some circumstances we do not need to render anything....
	if(!iconIsBitmap && !showPreviewInContentS && !popupIsShowing){
		return;
	}

	var icvs = document.createElement('canvas');//icon canvas
	var totalWidth = 150;//750
	icvs.width=totalWidth
	icvs.height=totalWidth
	var ictx = icvs.getContext("2d");
	var startPoint=Math.floor(totalWidth/2);
	var ox=Math.round(x),oy=Math.round(y);

	if(!pixelatedPreview){
		ictx.scale(2,2);
		ictx.drawImage(mcan,-ox+(startPoint/2),-oy+(startPoint/2));//application of scale
		ictx.scale(0.5,0.5);
		
		ictx.fillStyle = "rgba(0,0,0,0.3)";//croshair
		//ictx.globalAlpha = 1.0;
		
		ictx.fillRect(startPoint, 0, 1, totalWidth);
		ictx.fillRect(0,startPoint, totalWidth, 1);
		
	}else{
		ictx.drawImage(mcan,-ox+(startPoint),-oy+(startPoint));
		var smi,spi,mp=fishEye;
		//xx,yy
		for(var i=0;i<startPoint;i+=2){
			smi=startPoint-i;
			spi=startPoint+i;
			////drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) //CANVAS
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
//				ictx.fillStyle = "rgba("+(255-data[0])+","+(255-data[1])+","+(255-data[2])+",0.9)";
				var d=dat[0]+dat[1]+dat[2];
				if(d > 192) ictx.fillStyle = "rgba(30,30,30,0.8)";
				else ictx.fillStyle = "rgba(225,225,225,0.8)";
			}else ictx.fillStyle = "rgba(255,255,255,0.4)";
				
			for(var c=0;c<mp;c++){
				++i;
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
	
	lastPreviewURI = icvs.toDataURL();//the last one, large size, is cached for revisiting the menu

	if(iconIsBitmap){
		var browseIconWidth=(window.devicePixelRatio>1?38:19);
		var browseIconHalfWidth = Math.floor(browseIconWidth*0.5);
		chrome.browserAction.setIcon({imageData:ictx.getImageData(startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth)});
	}

	if(showPreviewInContentS){
		chrome.tabs.sendMessage(tabid, {setPixelPreview:true,previewURI:lastPreviewURI,zoomed:contSprevZoomd,hex:curentHex,lhex:lastHex}, function(response) {});
	}

	if(popupIsShowing){
		chrome.runtime.sendMessage({setPreview:true,tabi:tabid,previewURI:lastPreviewURI,hex:curentHex,lhex:lastHex,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b}, function(response) {});
	}
	ictx=null,icvs=null;
}

var pim = document.createElement('img');
var mcan = document.createElement('canvas');

document.addEventListener('DOMContentLoaded', function () {
	//difficult to say when best time to do this is.... chrome running at 2 locations with different settings may produce odd results!
	loadSettingsFromChromeSyncStorage(function(){
		fromPrefs();
	});

	saveToChromeSyncStorage(); //temporary... but may help cover some users who haven't pressed the save button in preferences but use sync
});
