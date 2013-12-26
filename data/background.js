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

function fromPrefs(){
	//remove defunct options
	//localStorage.removeItem("autoRedirectPickable");

	//future additions -
	//storage.remove(['','',''], function(){})

	var iconWasCustom = window.iconIsBitmap || window.appleIcon;

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
	
	defaultIcon(iconWasCustom);
	feedbackParticipationOversight();
}

function defaultIcon(force){
	if( iconIsBitmap || appleIcon || force ){
		var iconPath='img/';
		if(appleIcon)iconPath+='apple/';
		if(resetIcon)chrome.browserAction.setIcon({path:{19:chrome.extension.getURL(iconPath+'icon19.png'),38:chrome.extension.getURL(iconPath+'icon38.png')}});
		return true;
	}
	return false;
}

var dpr=1.0;//devicePixelRatio
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
var x,y,tabid=0,lsnaptabid=0,winid=0;
var curentHex=0,lastHex='FFF',lastLastHex='FFF';
var lastPreviewURI='';
var imageDataIsReady=false,popupsShowing=0;
var clrgb={r:0,g:0,b:0}
var clhsv={h:0,s:0,v:0}
var isCurrentEnableReady=false,isRunning=false,updateAvailable=false;
var wid, hei;

function getCurrentClrData(){
	var dobj={hex:curentHex}
	if(ShowRGBHSL){
		if(EnableRGB)dobj.rgb={r:clrgb.r,g:clrgb.g,b:clrgb.b}
		if(EnableHSL)dobj.hsv={h:clhsv.h,s:clhsv.s,v:clhsv.v}
	}
	return dobj;
}

chrome.runtime.onConnect.addListener(function(port){
	if(port.name == "popupshown"){
		popupsShowing++;
		port.onDisconnect.addListener(function(msg) {
			popupsShowing--;
			if(popupsShowing < 0)popupsShowing=0;
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
			lsnaptabid=tabid;
			wid=request._x;
			hei=request._y;
			dpr=request.dpr;
			var cbf=function(dataUrl){
				imageDataIsReady=false;
				pim.src=dataUrl;
				mcan.width = wid;
				mcan.height = hei;
				ctx = mcan.getContext("2d");
				ctx.clearRect(0,0,wid,hei);
			}
			if(winid < 1)winid=null;
			if(usePNG)chrome.tabs.captureVisibleTab(winid, {format:'png'}, cbf);
			else chrome.tabs.captureVisibleTab(winid, {format:'jpeg',quality:100}, cbf);
			sendResponse({});
		}else if (request.movePixel){
			x+=(request._x);//or otherwise use the current scale
			y+=(request._y);
			getNewColorData();
			handleRendering();
			var dobj=getCurrentClrData();
			dobj.movedPixel=true;
			dobj.msg=chrome.i18n.getMessage('pressEnterToPick');
			chrome.tabs.sendMessage(tabid,dobj,function(r){});
			sendResponse({});
		}else if (request.getPixel){
			x=request._x;
			y=request._y;
			getNewColorData();
			setTimeout(handleRendering,10);
			var dobj=getCurrentClrData();
			dobj.movedPixel=true;
			chrome.tabs.sendMessage(tabid,dobj,function(r){});
			sendResponse({});
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
			if(autocopyhex){
				var n=document.createElement('input');document.body.appendChild(n);
				n.value=curentHex;n.select();document.execCommand('copy');n.parentNode.removeChild(n);
			}
			sendResponse({});
		}else if(request.reportingIn){
			isCurrentEnableReady=true;
			 
		}else if (request.enableColorPicker){
			//popupsShowing=true;
			handleRendering();
			chrome.tabs.getSelected(null, function(tab) {
				tabId=tab.id;
				if(request.tabi>0 && request.tabi!=tabId){
					return false;//in the case of a popup, the currently selected "tab" is not the one we need to initialize
				}
				
				isCurrentEnableReady=false;
				var tabURL=tab.url;
				
				if(request.workerHasChanged) lsnaptabid=-1;

				chrome.tabs.sendMessage(tab.id, {enableColorPicker:true,borders:borderValue}, function(r) {
					if(r){
						isRunning=true;
						if(r.wasAlreadyEnabled && lsnaptabid != tab.id){
							//we were already running on this tab, yet our snapshot is of a different tab
							chrome.tabs.sendMessage(tab.id, {newImage:true}, function(r) {});
						}
					}
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
			isRunning=false;
			lastPreviewURI='';
			defaultIcon();
			chrome.browserAction.setBadgeText({text:''});
//	  			chrome.tabs.getSelected(null, function(tab) {
//					  chrome.tabs.sendMessage(tab.id, {disableColorPicker:true}, function(response) {});
//					});'
			if(!imageDataIsReady){//cleans up the image src
				if(pim.complete){
					ctx.drawImage(pim,0,0);
					pim.src='';
					imageDataIsReady=true;
				}else{
					pim.src='';
				}
			}
			chrome.tabs.sendMessage(tabid, {disableColorPicker:true}, function(response) {});
			sendResponse({});
    }else if(request.reloadprefs){
			fromPrefs();handleRendering();sendResponse({});
    }else
    	sendResponse({});
  
});
function getNewColorData(){
	ctx = mcan.getContext("2d");
	if(!imageDataIsReady){
		if(pim.complete){
			ctx.drawImage(pim,0,0);
			if(showActualPickTarget){
				chrome.tabs.sendMessage(tabid, {setPickerImage:true,pickerImage:pim.src}, function(response) {});
			}
			pim.src='';
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
var startSecond=0,frameCount=0;
function handleRendering(){
//	frameCount++;
//	curSecond = new Date().getSeconds();
//	if( curSecond > startSecond){
//		console.log('fps: '+frameCount);
//		startSecond = curSecond,frameCount=0;
//	}

// under some circumstances we do not need to render anything....
	if(!imageDataIsReady || (!iconIsBitmap && !showPreviewInContentS && popupsShowing < 1)){
		return;
	}

	var startPoint=Math.floor(totalWidth*0.5);
	var ox=Math.round(x),oy=Math.round(y);

	if(!pixelatedPreview){
		var ictx = getMain2dContext();
		ictx.scale(2,2);
		ictx.drawImage(mcan,-ox+(startPoint*0.5),-oy+(startPoint*0.5));
		ictx.scale(0.5,0.5);
		
		ictx.fillStyle = "rgba(0,0,0,0.3)";//croshair
		//ictx.globalAlpha = 1.0;
		
		ictx.fillRect(startPoint, 0, 1, totalWidth);
		ictx.fillRect(0,startPoint, totalWidth, 1);
		
	}else{
		if(allowWebGl && webGlAvail){
			getMain3dContext();
			texturectx.drawImage(mcan,-ox+(64),-oy+(64));
			//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0,0, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			gl.uniform1i(textureSampPosition, 0);
			gl.uniform1f(fishEyeScalePosition, fishEye)
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}else{
			var ictx = getMain2dContext();
			ictx.drawImage(mcan,-ox+(startPoint),-oy+(startPoint));
			var smi,spi,mp=fishEye-0;
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
	
	lastPreviewURI = icvs.toDataURL();//the last one, large size, is cached for revisiting the menu

	if(iconIsBitmap){
		var browseIconWidth=(dpr>1?38:19);
		var browseIconHalfWidth = Math.floor(browseIconWidth*0.5);
		//chrome.browserAction.setIcon({imageData:ictx.getImageData(startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth)});

		var tmpCvs=document.createElement('canvas');
		tmpCvs.width=browseIconWidth,tmpCvs.height=browseIconWidth;
		var tctx=tmpCvs.getContext("2d");
		tctx.drawImage(icvs,startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth,0,0,browseIconWidth,browseIconWidth);
		var pathData = {};
		pathData[browseIconWidth]=tmpCvs.toDataURL();
		chrome.browserAction.setIcon({path:pathData});//update icon (to be configurable)
	}

	if(showPreviewInContentS){
		chrome.tabs.sendMessage(tabid, {setPixelPreview:true,previewURI:lastPreviewURI,zoomed:contSprevZoomd,hex:curentHex,lhex:lastHex}, function(response) {});
	}

	if(popupsShowing > 0){
		chrome.runtime.sendMessage({setPreview:true,tabi:tabid,previewURI:lastPreviewURI,hex:curentHex,lhex:lastHex,cr:clrgb.r,cg:clrgb.g,cb:clrgb.b}, function(response) {});
	}
}

var pim = document.createElement('img');
var mcan = document.createElement('canvas');

chrome.runtime.onUpdateAvailable.addListener(function(details){
	updateAvailable=true;
});

//we need to save periodically in some way that won't over-use the sync api
chrome.alarms.create("sync colorpick", {delayInMinutes:40,periodInMinutes:80});
chrome.alarms.onAlarm.addListener(function(alarm){
	saveToChromeSyncStorage();//we should also find a way to save before the extension is being restarted
	if(!isRunning&&updateAvailable) chrome.runtime.reload();//applies a pending update
	//if(!isRunning)chrome.runtime.reload();//testing only, force update apply
});

function DOMloaded(){
	//difficult to say when best time to do this is.... chrome running at 2 locations with different settings may produce odd results!
	loadSettingsFromChromeSyncStorage(function(){
		fromPrefs();
		initializeCanvas();
	});
}

var webGlAvail=false,icvs=0,totalWidth=150;//750
function testWebGlAvail(){
	var testc=document.createElement("canvas");
	var testctx = testc.getContext('webgl');
	if (testctx && typeof(testctx.getParameter)== "function") webGlAvail=true;
	else webGlAvail=false;
}
testWebGlAvail();

document.addEventListener('DOMContentLoaded', DOMloaded);

var gl=0,texture=0,texturectx=0,snapTexture=0,shaderProgram=0,textureSampPosition=0,fishEyeScalePosition=0;

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
	icvs = document.createElement('canvas');//icon canvas
	icvs.width=totalWidth,
	icvs.height=totalWidth;
	if(webGlAvail && pixelatedPreview && allowWebGl){
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
