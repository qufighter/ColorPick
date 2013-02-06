function RGBtoHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(N) {//http://www.javascripter.net/faq/rgbtohex.htm
 if (N==null) return "00";
 N=parseInt(N); if (N==0 || isNaN(N)) return "00";
 N=Math.max(0,N); N=Math.min(N,255); N=Math.round(N);
 return "0123456789ABCDEF".charAt((N-N%16)/16)
      + "0123456789ABCDEF".charAt(N%16);
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
//reiterate defaults, eventually prefs will read config from here, no?
var iconIsBitmap=false,usePNG=true,resetIcon=false,appleIcon=false,iconIsPreview=false,autoRedirectPickable=false,redirectSameWindow=false,showPreviewInContentS=false,contSprevZoomd=false,borderValue='1px solid grey',showPreviousClr=true,flashScalePix=false,shareClors=false,autocopyhex=false,ShowRGBHSL=false,EnableRGB=true,EnableHSL=true,pixelatedPreview=true,fishEye=5,clrAccuracyOverPrecision=false,showActualPickTarget=false;
var cpScaleOffset=(navigator.platform=='win32'?16:0), customCalibration=false;
var iconPath = '';

function fromPrefs(){
	if(typeof(localStorage["clrAccuracyOverPrecision"])!='undefined')clrAccuracyOverPrecision = ((localStorage["clrAccuracyOverPrecision"]=='true')?true:false);
	if(typeof(localStorage["showActualPickTarget"])!='undefined')showActualPickTarget = ((localStorage["showActualPickTarget"]=='true')?true:false);
	if(typeof(localStorage["appleIcon"])!='undefined')appleIcon = ((localStorage["appleIcon"]=='true')?true:false);
	if(typeof(localStorage["iconIsBitmap"])!='undefined')iconIsBitmap = ((localStorage["iconIsBitmap"]=='true')?true:false);
	if(typeof(localStorage["resetIcon"])!='undefined')resetIcon = ((localStorage["resetIcon"]=='true')?true:false);
	if(typeof(localStorage["appleIcon"])!='undefined')appleIcon = ((localStorage["appleIcon"]=='true')?true:false);
	if(typeof(localStorage["usePNG"])!='undefined')usePNG = ((localStorage["usePNG"]=='true')?true:false);
	if(typeof(localStorage["iconIsPreview"])!='undefined')iconIsPreview = ((localStorage["iconIsPreview"]=='true')?true:false);
	if(typeof(localStorage["autoRedirectPickable"])!='undefined')autoRedirectPickable = ((localStorage["autoRedirectPickable"]=='true')?true:false);
	if(typeof(localStorage["redirectSameWindow"])!='undefined')redirectSameWindow = ((localStorage["redirectSameWindow"]=='true')?true:false);
	if(typeof(localStorage["showPreviewInContentS"])!='undefined')showPreviewInContentS = ((localStorage["showPreviewInContentS"]=='true')?true:false);
	if(typeof(localStorage["contSprevZoomd"])!='undefined')contSprevZoomd = ((localStorage["contSprevZoomd"]=='true')?true:false);
	if(typeof(localStorage["showPreviousClr"])!='undefined')showPreviousClr = ((localStorage["showPreviousClr"]=='true')?true:false);
	if(typeof(localStorage["borderValue"])!='undefined')borderValue = localStorage["borderValue"];
	if(typeof(localStorage["customCalibration"])!='undefined')customCalibration = ((localStorage["customCalibration"]=='true')?true:false);
	if(customCalibration)
		if(typeof(localStorage["cpScaleOffset"])!='undefined')cpScaleOffset = localStorage["cpScaleOffset"]-0;
	//if(typeof(localStorage["flashScalePix"])!='undefined')flashScalePix = ((localStorage["flashScalePix"]=='true')?true:false);
	if(typeof(localStorage["shareClors"])!='undefined')shareClors = ((localStorage["shareClors"]=='true')?true:false);
	if(typeof(localStorage["autocopyhex"])!='undefined')autocopyhex = ((localStorage["autocopyhex"]=='true')?true:false);
	if(typeof(localStorage["ShowRGBHSL"])!='undefined')ShowRGBHSL = ((localStorage["ShowRGBHSL"]=='true')?true:false);
	if(typeof(localStorage["EnableRGB"])!='undefined')EnableRGB = ((localStorage["EnableRGB"]=='true')?true:false);
	if(typeof(localStorage["EnableHSL"])!='undefined')EnableHSL = ((localStorage["EnableHSL"]=='true')?true:false);
	if(typeof(localStorage["pixelatedPreview"])!='undefined')pixelatedPreview = ((localStorage["pixelatedPreview"]=='true')?true:false);
	if(typeof(localStorage["fishEye"])!='undefined')fishEye=localStorage["fishEye"]-0;
	if(typeof(localStorage["colorPickHistory"])=='undefined')localStorage['colorPickHistory']="";
	
	if(typeof(localStorage["usageStatistics"])=='undefined')localStorage["usageStatistics"]=false;
	if(localStorage["usageStatistics"]=='true'){
		localStorage.removeItem("feedbackOptOut");
	}else{
		localStorage.feedbackOptOut = "true";
	}
	
	defaultIcon();
	feedbackParticipationOversight();
}

function defaultIcon(){
	var iconPath='';
	if(appleIcon)iconPath='apple/';
	if(resetIcon)chrome.browserAction.setIcon({path:chrome.extension.getURL(iconPath+'icon19.png')});//update icon (to be configurable)
}

function feedbackParticipationOversight(){
	if(localStorage.feedbackOptOut!='true' && localStorage["usageStatistics"]=='true'){
		var d=new Date();
		if( localStorage["participation_"+d.getMonth()+"_"+d.getFullYear()]!='true' ){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange=function(){if(xhr.readyState == 4){
				if(xhr.status==200){
					if(xhr.responseText == 'SOK'){
						var d=new Date();
						localStorage["participation_"+d.getMonth()+"_"+d.getFullYear()]=true;
						var lastMo=d.getMonth()-1;
						var lastMoYr=d.getFullYear();
						if(lastMo < 0){
							lastMo = 11;
							lastMoYr-=1;
						}
						localStorage.removeItem("participation_"+lastMo+"_"+lastMoYr);
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
var cvs,ctx;
var x,y,tabid=0,winid=0; //current pixel
var curentHex=0,lastHex='FFF';
var lastPreviewURI=''; //potentially needs to be cleaned up an not "jump" across sites, if exit triggered from content script the message does not reach us here... (they do now)
//var fullScreenImageData=[];//potentially huge array of raw image data
var imageDataIsRendered=false;
var clrgb={r:0,g:0,b:0}
var clhsv={h:0,s:0,v:0}
var isCurrentEnableReady=false;
var wid, hei;

function attemptReinitPicker(tabid){
	var tid=tabid;
	chrome.tabs.get(tabid, function(tab) {
		if(tab.status=='complete'){
			chrome.extension.sendRequest({greeting: "re_init_picker"}, function(response) {
				//console.log('enabled!');
			});
		}else{
			setTimeout(function(){attemptReinitPicker(tid)},200);
		}
	})
	
}

function getCurrentClrData(){
	var dobj={hex:curentHex}
	if(ShowRGBHSL){
		if(EnableRGB)dobj.rgb={r:clrgb.r,g:clrgb.g,b:clrgb.b}
		if(EnableHSL)dobj.hsv={h:clhsv.h,s:clhsv.s,v:clhsv.v}
	}
	return dobj;
}

chrome.extension.onRequest.addListener(
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
				pim.src=dataUrl;
				cvs = mcan;
				cvs.width = wid;
				cvs.height = hei;
				ctx = cvs.getContext("2d");
				ctx.clearRect(0,0,wid,hei);
				imageDataIsRendered=false;
				sendResponse({});
			}
			
			try{
				if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
				else chrome.tabs.captureVisibleTab(winid, {format:'jpg',quality:100}, cbf);
			}catch(ex){
				chrome.tabs.captureVisibleTab(winid, cbf);
			}
			
		}else if (request.movePixel){
			x+=(request._x);//or otherwise use the current scale
			y+=(request._y);
			handleRendering()
			dobj=getCurrentClrData();
			dobj.movedPixel=true;
			dobj.msg='Press Enter to Pick Color';
			chrome.tabs.sendRequest(tabid,dobj,function(r){});
			sendResponse({});
		}else if (request.getPixel){
			x=request._x;
			y=request._y;
			handleRendering()//if returns false we could send empty response since there is no hex update... or secret hourglass code as suggested
			sendResponse(getCurrentClrData());
		}else if (request.setColor){
			if(showPreviousClr)lastHex=curentHex;
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
			chrome.extension.sendRequest({historypush: true}, function(response) {
					//console.log('disabled!');
			});		
			sendResponse({docopy:autocopyhex});
		}else if(request.reportingIn){
			isCurrentEnableReady=true;
			 
		}else if (request.enableColorPicker){
			
			chrome.tabs.getSelected(null, function(tab) {
				var tabId=tab.id;
				if(request.tabi>0 && request.tabi!=tabId){
					sendResponse({});//in the case of a popup, the currently selected "tab" is not the one we need to initialize
					return;
				}
				
				isCurrentEnableReady=false;
				var tabURL=tab.url;
				
				
			  //var scaleurl='http://vidzbigger.com/downloads/tools/scalepixel.swf';
			  chrome.tabs.sendRequest(tab.id, {enableColorPicker:true,borders:borderValue,scOffset:cpScaleOffset}, function(response) {
			  });
			  
			  if(tabURL.indexOf('https://chrome.google.com/extensions/')==0 ||tabURL.indexOf('chrome')==0 ||tabURL.indexOf('about')==0 ){
						//console.log( 'Unsupported page type :/');
						chrome.extension.sendRequest({greeting: "error_picker",errno:0}, function(response) {
								//console.log('disabled!');
						});
				}else if(tabURL.indexOf('http://vidzbigger.com/anypage.php')!=0){
  				window.setTimeout(function(){
  					if(!isCurrentEnableReady){
  						//console.log('detecting image or non supported page '+tabURL)

							chrome.extension.sendRequest({greeting: "error_picker",errno:1}, function(response) {
  								//console.log('disabled!');
  						});
  						if(autoRedirectPickable){
  							
  							if( !redirectSameWindow ){
	  							chrome.tabs.getSelected(null,function(tab){
	  								console.log('UM');
	  								chrome.tabs.create({windowId:tab.windowId,index:tab.index+1,url:'http://vidzbigger.com/anypage.php?page='+escape(tabURL),selected:true}, function(newtab){ })
	  							})
	  						}else{
		  						chrome.tabs.update(tabId, {url:'http://vidzbigger.com/anypage.php?page='+escape(tabURL)}, function(t){
		  							x=75;
		  							y=187;
		  							window.setTimeout(function(){
		  								attemptReinitPicker(tabId);
		  							},500);
		  						});
		  					}
  						}
  					}
  				},560);//we expect to hear back from the content script by this time or something is wrong... and we need to use an iframe
			  }
			});
			sendResponse({hex:curentHex,lhex:lastHex,previewURI:lastPreviewURI,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b});
		}else if (request.disableColorPicker){
			lastPreviewURI='';
			defaultIcon();
			chrome.browserAction.setBadgeText({text:''});
//	  			chrome.tabs.getSelected(null, function(tab) {
//					  chrome.tabs.sendRequest(tab.id, {disableColorPicker:true}, function(response) {});
//					});'
			if(!imageDataIsRendered){//cleans up the image src
				if(pim.complete){
					//ctx.putImageData(getImageDataFromImage(pim).data, 0, 0);
					if(clrAccuracyOverPrecision)
						ctx.drawImage(pim,0,0);
					else
						ctx.drawImage(pim,0,0,wid,hei);
					pim.src='';
					imageDataIsRendered=true;
				}
			}
			chrome.tabs.sendRequest(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
    }else if(request.greeting == "reloadprefs"){
    	fromPrefs();sendResponse({});
    }else
    	sendResponse({});
  
});
function handleRendering(){
	cvs = mcan;
	ctx = cvs.getContext("2d");

	//repainting hte image should not be necessary... but wahtever
		if(!imageDataIsRendered){
			if(pim.complete){
				//ctx.putImageData(getImageDataFromImage(pim), 0, 0);
				if(clrAccuracyOverPrecision)
					ctx.drawImage(pim,0,0);
				else
					ctx.drawImage(pim,0,0,wid,hei);
				pim.src='';
				if(showActualPickTarget){
					setTimeout(function(){
						chrome.tabs.sendRequest(tabid, {setPickerImage:true,pickerImage:cvs.toDataURL()}, function(response) {});
						console.log('got there but...');
					},10);
				}
				imageDataIsRendered=true;
			}else{
				//image not ready to render...
				//sendResponse({}); //hourglass
				return false;
			}
		}else{
			//ctx.putImageData(fullScreenImageData, 0, 0);	
		}
	//page paint is either ready or finalized

	

	var icvs = document.createElement('canvas');//icon canvas
	var sx,sy;
	var totalWidth = 150;
	icvs.width=totalWidth
	icvs.height=totalWidth
	var ictx = icvs.getContext("2d");
	var startPoint=Math.floor(totalWidth/2);
	
	//strangest thing, the image clientWidth is different size on background page
	var ox=x;//(x/wid)*(wid-16);
	var oy=y;//(y/hei)*(hei-16);
	sx=ox-startPoint;
	sy=oy-startPoint;
	var data = ctx.getImageData(ox, oy, 1, 1).data;
	
	//var img=ctx.getImageData(sx, sy, totalWidth, totalWidth);
	if(!pixelatedPreview){
		ictx.scale(2,2);
		ictx.drawImage(cvs,-ox+(startPoint/2),-oy+(startPoint/2));//application of scale
		ictx.scale(0.5,0.5);
		
		ictx.fillStyle = "rgba(0,0,0,0.3)";//croshair
		//ictx.globalAlpha = 1.0;
		
		ictx.beginPath();
		ictx.moveTo(startPoint, 0);
		ictx.lineTo(startPoint, totalWidth);
		ictx.lineTo(startPoint+1, totalWidth);
		ictx.lineTo(startPoint+1, 0);
		ictx.closePath();
		ictx.fill();
		
		ictx.beginPath();
		ictx.moveTo(0,startPoint);
		ictx.lineTo(totalWidth, startPoint);
		ictx.lineTo(totalWidth, startPoint+1);
		ictx.lineTo(0, startPoint+1);
		ictx.closePath();
		ictx.fill();
		
	}else{
		ictx.drawImage(cvs,-ox+(startPoint),-oy+(startPoint));
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
				var data = ictx.getImageData(startPoint, startPoint, 1, 1).data;//notarget
				ictx.fillStyle = "rgba("+(255-data[0])+","+(255-data[1])+","+(255-data[2])+",0.9)";
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
			
			ictx.beginPath();
			ictx.moveTo(spi+1, 0);
			ictx.lineTo(spi+1, totalWidth);
			ictx.lineTo(spi+2, totalWidth);
			ictx.lineTo(spi+2, 0);
			ictx.closePath();
			ictx.fill();
			
			ictx.beginPath();
			ictx.moveTo(smi, 0);
			ictx.lineTo(smi, totalWidth);
			ictx.lineTo(smi-1, totalWidth);
			ictx.lineTo(smi-1, 0);
			ictx.closePath();
			ictx.fill();
			
			ictx.beginPath();
			ictx.moveTo(0,spi+1);
			ictx.lineTo(totalWidth, spi+1);
			ictx.lineTo(totalWidth, spi+2);
			ictx.lineTo(0, spi+2);
			ictx.closePath();
			ictx.fill();
			
			ictx.beginPath();
			ictx.moveTo(0,smi);
			ictx.lineTo(totalWidth, smi);
			ictx.lineTo(totalWidth, smi-1);
			ictx.lineTo(0, smi-1);
			ictx.closePath();
			ictx.fill();
		}
	}
	
	lastPreviewURI = icvs.toDataURL();//the last one, large size, is cached for revisiting the menu
	
		if(iconIsBitmap)
		chrome.browserAction.setIcon({imageData:ictx.getImageData(startPoint-9, startPoint-9, 19, 19)});//update icon (to be configurable)
		
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

		//couls also jsut send this back with the hex code later, not sure! (rather not slow that down but who gets there first?/)
		if(showPreviewInContentS){
//					chrome.tabs.getSelected(null, function(tab) {
//					  chrome.tabs.sendRequest(tab.id, {setPixelPreview:true,previewURI:lastPreviewURI,zoomed:contSprevZoomd,hex:curentHex,lhex:lastHex}, function(response) {
//				  		//preview has been sent to the contentscript in case its showing...
//						});
//					});
			
			chrome.tabs.sendRequest(tabid, {setPixelPreview:true,previewURI:lastPreviewURI,zoomed:contSprevZoomd,hex:curentHex,lhex:lastHex}, function(response) {});

		}

	ictx=null;icvs=null;

	//console.log('requesting:'+x+','+y + ' '+"#"+data[0]+" "+data[1]+" "+data[2]);
	curentHex=RGBtoHex(data[0],data[1],data[2]);
	clhsv=rgb2hsv(data[0],data[1],data[2]);
	clrgb.r=data[0],clrgb.g=data[1],clrgb.b=data[2];
	chrome.extension.sendRequest({setPreview:true,tabi:tabid,previewURI:lastPreviewURI,hex:curentHex,lhex:lastHex,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b}, function(response) {
		//preview has been sent to the popup in case its showing...
	});
}
function getImageDataFromImage(idOrElement){
	var theImg = (typeof(idOrElement)=='string')? document.getElementById(idOrElement):idOrElement;
	var tcvs = document.createElement('canvas');
	tcvs.width = theImg.width;
	tcvs.height = theImg.height;
	var tctx = tcvs.getContext("2d");
	tctx.drawImage(theImg,0,0);
	var theData = tctx.getImageData(0, 0, tcvs.width, tcvs.height);
	tctx=null;tcvs=null;
	return theData;
}

var pim = document.createElement('img');
var mcan = document.createElement('canvas');
fromPrefs();