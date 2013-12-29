var elmid1='color_pick_click_box',elmid2='ChromeExtension:Color-Pick.com';
if(typeof(exitAndDetach)=='function')exitAndDetach();
function _ge(n){return document.getElementById(n);}
var n=false,c=false,hex='F00BAF',lasthex='',rgb=null;hsv=null;scal=1,ex=0,ey=0,isEnabled=false,isLocked=false,borderValue='1px solid black',blankgif='',msg_bg_unavail=chrome.i18n.getMessage('bgPageUnavailable');
var cvs = document.createElement('canvas'),rwid=0,rhei=0;
var ctx = cvs.getContext('2d');
document.addEventListener('DOMContentLoaded',function(){
	//document.body.appendChild(cvs);
	//console.log('appended');
})
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
function emptyNode(node){
	while(node.lastChild)node.removeChild(node.lastChild);
}
function snapshotLoaded(){
		c.style.height='auto';
		if(c.naturalWidth/c.naturalHeight > window.innerWidth/window.innerHeight){
			c.style.width=(window.innerWidth+1)+'px';
		}
		//c.style.width='auto';g
		//console.log(c.naturalWidth, rwid, c.naturalHeight, rhei);
		cvs.width=rwid;
		cvs.height=rhei;
		ctx.drawImage(c,0,0,rwid,rhei);
		
		setTimeout(function(){
			isMakingNew=false;
			c.style.visibility="visible";n.style.visibility="visible";document.body.style.cursor='url('+chrome.extension.getURL('img/crosshair.png')+') 16 16,crosshair';updateColorPreview();
		},255);
}
function reqLis(request, sender, sendResponse) {
	var resp={result:true};
	if (request.testAlive){
		//disableColorPicker();
	}else	if (request.setPixelPreview){
  	setPixelPreview(request.previewURI,request.zoomed,request.hex,request.lhex)
  }else if (request.enableColorPicker){
		resp.wasAlreadyEnabled=enableColorPicker()
  }else if (request.setPickerImage){
		c.src=request.pickerImage;
  }else if (request.newImage){
  	ssf()
  }else if (request.doPick){
  	picked()
  }else if (request.movePixel){
  	ex+=(request._x);
		ey+=(request._y);
		updateColorPreview();
  }else if (request.movedPixel){
		setCurColor(request);
	}else if (request.reloadPrefs){
		loadPrefs();
		setCurColor(request);	
  }else if (request.disableColorPicker)disableColorPicker()
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

function setPixelPreview(pix,zoom,hxe,lhex){
	if(isLocked)return;
	var wid=75,padr=32;if(zoom)wid=150;
	hex=hxe?hxe:hex;
	if(!_ge('cpimprev') || (rgb && !_ge('cprgbvl'))){
		emptyNode(n);
		Cr.elm('div',{},[
			Cr.elm('img',{id:'cpimprev',height:wid,width:wid,src:pix,style:'margin:0px;padding:0px;margin:0px;'}),
			Cr.elm('br'),
			Cr.txt('#'),
			Cr.elm('input',{type:'text',size:7,style:'max-width:75px;font-size:10pt;border:'+borderValue,id:'cphexvl',value:hex,event:['mouseover',selectTargElm]}),
			//Cr.elm('input',{type:'image',src:chrome.extension.getURL('img/close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}),
			(lhex!='none'?Cr.elm('input',{type:'text',size:1,style:'max-width:50px;font-size:10pt;background-color:#'+lhex+';border:'+borderValue+';border-left:none;',value:''}):0),
			(ShowRGBHSL&&EnableRGB&&rgb?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'rgb('+rgb.r+','+rgb.g+','+rgb.b+')',id:'cprgbvl',event:['mouseover',selectTargElm]}):0),
			(ShowRGBHSL&&EnableHSL&&hsv?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)',id:'cphslvl',event:['mouseover',selectTargElm]}):0)
		],n)
		keepOnScreen();
	}else{
		_ge('cpimprev').src=pix,
		_ge('cpimprev').width=wid,
		_ge('cpimprev').height=wid;
		_ge('cphexvl').value=hex;
		n.style.backgroundColor='#'+hex;
		if(ShowRGBHSL&&EnableRGB&&rgb)_ge('cprgbvl').value='rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
		if(ShowRGBHSL&&EnableHSL&&hsv)_ge('cphslvl').value='hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)';
	}
}
function setCurColor(r){
	if(!n)return;
	hex=r.hex?r.hex:hex,isUpdating=false;
	if(!r.hex){
//		if(!_ge('bgPageUnavailMsg')){
//			Cr.elm('div',{'id':'bgPageUnavailMsg',style:"color:#FFF;background-color:#000;"},[Cr.txt(msg_bg_unavail)],n);
//		}else _ge('bgPageUnavailMsg').style.display='block';
	}else{
		n.style.backgroundColor='#'+hex;
		if(_ge('bgPageUnavailMsg'))_ge('bgPageUnavailMsg').style.display='none';
	}
	if(!isLocked){if(r.msg)n.innerText=r.msg;}
	else setDisplay();
}
function selectTargElm(ev){
	ev.target.select();
}
function setDisplay(){//Cr.elm
	emptyNode(n);
	Cr.elm('div',{},[
		Cr.txt('#'),
		Cr.elm('input',{type:'text',size:7,style:'max-width:75px;font-size:10pt;border:'+borderValue,id:'cphexvl',value:hex,event:['mouseover',selectTargElm]}),
		Cr.elm('input',{type:'image',style:'width:20px;height:20px;',src:chrome.extension.getURL('img/close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}),
		(ShowRGBHSL&&EnableRGB&&rgb?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'rgb('+rgb.r+','+rgb.g+','+rgb.b+')',id:'cprgbvl',event:['mouseover',selectTargElm]}):0),
		(ShowRGBHSL&&EnableHSL&&hsv?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)',id:'cphslvl',event:['mouseover',selectTargElm]}):0)
	],n)
	if(_ge('cphexvl'))_ge('cphexvl').select();
	keepOnScreen();
}
function picked(){
	if(isLocked){
		isLocked=false;
		emptyNode(n);
	}else{
		try{
			chrome.runtime.sendMessage({setColor:true,hex:hex}, function(response){});
			lasthex = hex;
		}catch(e){
			exitAndDetach();
		}
		isLocked=true;
		setDisplay();
	}
}
function exitAndDetach(){
	chrome.runtime.onMessage.removeListener(reqLis);
	disableColorPicker();
}
function dissableColorPickerFromHere(){
	var disableTimeout=setTimeout(disableColorPicker,500)
	chrome.runtime.sendMessage({disableColorPicker:true},function(r){
		clearTimeout(disableTimeout);
	});
}
function disableColorPicker(){
	isEnabled=false,isLocked=false;
	document.removeEventListener('mousemove',mmf);
	window.removeEventListener('scroll',ssf);
	window.removeEventListener('resize',ssf);
	window.removeEventListener('keyup',wk);
	c=_ge(elmid1),n=_ge(elmid2);
	if(document.body){
		if(c)document.body.removeChild(c);
		if(n)document.body.removeChild(n);
		c=false,n=false;
		document.body.style.cursor='default';
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
		ex=ev.pageX;
		ey=ev.pageY;
		updateColorPreview();
	}
}

function ssf(ev){
	if(!isEnabled)return;
	n.style.visibility="hidden";c.style.visibility="hidden";//redundent?
	window.clearTimeout(lastNewTimeout);
	lastNewTimeout=window.setTimeout(function(){
		newImage()//some delay required OR it won't update
	},250);
}
function loadPrefs(cbf){
	if(typeof(storage)=='undefined') alert('Sorry - you will have to refresh the page first.');
	storage.get(null, function(obj) {
		for(var i in pOptions){
			if(typeof(pOptions[i].def)=='boolean')
				window[i] = ((obj[i]=='true')?true:((obj[i]=='false')?false:pOptions[i].def));
			else
				window[i] = ((obj[i])?obj[i]:pOptions[i].def);
		}
		for(var i in pAdvOptions){
			if(typeof(pAdvOptions[i].def)=='boolean')
				window[i] = ((obj[i]=='true')?true:((obj[i]=='false')?false:pAdvOptions[i].def));
			else
				window[i] = ((obj[i])?obj[i]:pAdvOptions[i].def);
		}
		if(typeof(cbf)=='function')cbf();
	});
}
function initialInit(){
	loadPrefs(function(){
		c=Cr.elm('img',{id:elmid1,src:blankgif,style:'position:fixed;max-width:none!important;max-height:none!important;top:0px;left:0px;margin:0px;padding:0px;overflow:hidden;z-index:2147483646;',events:[['click',picked,true],['load',snapshotLoaded]]},[],document.body);
		n=Cr.elm('div',{id:elmid2,style:'position:fixed;min-width:30px;max-width:300px;min-height:30px;box-shadow:2px 2px 2px #666;border:'+borderValue+';z-index:2147483646;cursor:default;padding:4px;'},[Cr.txt(' ')],document.body);
		document.addEventListener('mousemove',mmf);
		window.addEventListener('keyup',wk);
		window.addEventListener('scroll',ssf);
		window.addEventListener('resize',ssf);
		testWebGlAvail();
		initializeCanvas();
		remainingInit();
	});
}
function enableColorPicker(){
	chrome.runtime.sendMessage({reportingIn:true}, function(response) {
		//allows us to detect if the script is running from the bg
	});
	if(!n){
		initialInit();
		return false;
	}
	return remainingInit();
}
function remainingInit(){
	if(!isEnabled){
		n.style.visibility="hidden";
		c.style.visibility="hidden";
		if(isLocked)picked();//unlocks for next pick
		document.body.style.cursor='url('+chrome.extension.getURL('img/crosshair.png')+') 16 16,crosshair';
		isEnabled=true;
		window.setTimeout(newImage,1);
		return false;
	}
	sendDataToPopup();
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
	if( n.clientWidth + n.offsetLeft +24 > window.innerWidth ){
		n.style.left=(lx-8-n.clientWidth)+"px";
	}
	if( n.clientHeight + n.offsetTop +24 > window.innerHeight ){
		n.style.top=(ly-8-n.clientHeight)+"px";
	}
}
var isUpdating=false,lastTimeout=0,timeoutCount=0,lx=0,ly=0;
function updateColorPreview(ev){
	if(!isEnabled)return;
	var x=ex-window.pageXOffset,y=ey-window.pageYOffset;
	lx=x,ly=y;
	keepOnScreen();
	if(isUpdating){
		window.clearTimeout(lastTimeout);
		lastTimeout=window.setTimeout(function(){updateColorPreview()},500),timeoutCount++;
		if(timeoutCount > 50){
			if(!_ge('bgPageUnavailMsg')){
				Cr.elm('div',{'id':'bgPageUnavailMsg',style:"color:#FFF;background-color:#000;"},[Cr.txt(msg_bg_unavail)],n);
			}else _ge('bgPageUnavailMsg').style.display='block';
		}
		return;
	}
	if(_ge('bgPageUnavailMsg'))_ge('bgPageUnavailMsg').style.display='none';
	timeoutCount=0,isUpdating=true;
	if(scal!=1){
		x*=scal,y*=scal;
	}

	x*=devicePixelRatio,y*=devicePixelRatio;
	var data = ctx.getImageData(x, y, 1, 1).data;
	hsv=rgb2hsl(data[0],data[1],data[2]);
	rgb={r:data[0],g:data[1],b:data[2]};

	setCurColor({hex:RGBtoHex(data[0],data[1],data[2])});
	handleRendering(x,y);
//	try{
//		chrome.runtime.sendMessage({getPixel:true,_x:x*devicePixelRatio,_y:y*devicePixelRatio}, function(response){
			//setCurColor(response);
//		});
//	}catch(e){
//		exitAndDetach();
//	}
}
var isMakingNew=false,lastNewTimeout=0;
function newImage(){
	if(!isEnabled)return;
	if(isMakingNew){
//		window.clearTimeout(lastNewTimeout);
//		lastNewTimeout=window.setTimeout(function(){newImage()},250);
		return;
	}
	document.body.style.cursor='wait';
	isMakingNew=true;
	n.style.visibility="hidden";
	c.style.visibility="hidden";
	//c.style.margin="0px";
	//c.style.padding="0px"
	c.src=blankgif;
	var x,y;//wid hei
	x=window.innerWidth;
	y=window.innerHeight;
	c.style.width=x+'px';
	c.style.height=y+'px';
	
	//scal=document.width / document.documentElement.clientWidth;
	var psc=[0.25,0.33,0.50,0.67,0.75,0.90,1.0,1.10,1.25,1.50,1.75,2.00,2.50,3.00,4.00,5.00];
	scal=outerWidth/innerWidth;
	if(scal < 0.25 || scal > 5.1 || (scal > 1.0 && scal < 1.02)) scal = 1.0;
	if(scal != 1.0){
		var newscal=0;
		for(var s=0,l=psc.length;s<l;s++){
			if( scal > psc[s] )newscal=psc[s];
			else break;
		}
		var errorMargin = scal - newscal;
		//console.log(errorMargin, newscal)
		if(errorMargin < 0.02 || (newscal > 1.0 && errorMargin < 0.06))
			scal = newscal;
	}
	//scal=document.width / document.body.clientWidth;
	x*=scal,y*=scal;
	x*=devicePixelRatio,y*=devicePixelRatio;
	rwid=x,rhei=y;

	setTimeout(function(){
		chrome.runtime.sendMessage({newImage:true,_x:x*devicePixelRatio,_y:y*devicePixelRatio,dpr:devicePixelRatio}, function(response){
			//WE WILL wait until we really get the image back....
			//isMakingNew=false;//perhaps we wait unitl it's really 'new'
			//window.setTimeout(function(){
			//	c.style.display="block";n.style.display="block";document.body.style.cursor='url('+chrome.extension.getURL('img/crosshair.png')+') 16 16,crosshair';updateColorPreview();
			//},500)
		});
	},255);
}

var lastPreviewURI;
var gl=0,texture=0,texturectx=0,snapTexture=0,shaderProgram=0,textureSampPosition=0,fishEyeScalePosition=0;

var webGlAvail=false,icvs=0,totalWidth=150;//750
function testWebGlAvail(){
	var testc=document.createElement("canvas");
	var testctx = testc.getContext('webgl');
	if (testctx && typeof(testctx.getParameter)== "function") webGlAvail=true;
	else webGlAvail=false;
}

function handleRendering(x,y){
//	frameCount++;
//	curSecond = new Date().getSeconds();
//	if( curSecond > startSecond){
//		console.log('fps: '+frameCount);
//		startSecond = curSecond,frameCount=0;
//	}

// under some circumstances we do not need to render anything....
//	if(!imageDataIsReady || (!iconIsBitmap && !showPreviewInContentS && popupsShowing < 1)){
//		return;
//	}

	var startPoint=Math.floor(totalWidth*0.5);
	var ox=Math.round(x),oy=Math.round(y);

	if(!pixelatedPreview){
		var ictx = getMain2dContext();
		ictx.scale(2,2);
		ictx.drawImage(cvs,-ox+(startPoint*0.5),-oy+(startPoint*0.5));
		ictx.scale(0.5,0.5);
		
		ictx.fillStyle = "rgba(0,0,0,0.3)";//croshair
		//ictx.globalAlpha = 1.0;
		
		ictx.fillRect(startPoint, 0, 1, totalWidth);
		ictx.fillRect(0,startPoint, totalWidth, 1);
		
	}else{
		if(allowWebGl && webGlAvail){
			getMain3dContext();
			texturectx.drawImage(cvs,-ox+(64),-oy+(64));
			//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			gl.texSubImage2D(gl.TEXTURE_2D, 0, 0,0, gl.RGBA, gl.UNSIGNED_BYTE, texture);
			gl.uniform1i(textureSampPosition, 0);
			gl.uniform1f(fishEyeScalePosition, fishEye)
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}else{
			var ictx = getMain2dContext();
			ictx.drawImage(cvs,-ox+(startPoint),-oy+(startPoint));
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
		var browseIconWidth=(devicePixelRatio>1?38:19);
		var browseIconHalfWidth = Math.floor(browseIconWidth*0.5);
		//chrome.browserAction.setIcon({imageData:ictx.getImageData(startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth)});

		var tmpCvs=document.createElement('canvas');
		tmpCvs.width=browseIconWidth,tmpCvs.height=browseIconWidth;
		var tctx=tmpCvs.getContext("2d");
		tctx.drawImage(icvs,startPoint-browseIconHalfWidth, startPoint-browseIconHalfWidth, browseIconWidth, browseIconWidth,0,0,browseIconWidth,browseIconWidth);
		var pathData = {};
		pathData[browseIconWidth]=tmpCvs.toDataURL();
		chrome.runtime.sendMessage({browserIconMsg:true,path:(pathData)},function(){});
		//chrome.browserAction.setIcon({path:pathData});//update icon (to be configurable)
	}

	if(showPreviewInContentS){
		setPixelPreview(lastPreviewURI,contSprevZoomd,hex,lasthex);
	}

	if(popupsShowing > 0){
		sendDataToPopup();
	}
}

function sendDataToPopup(){
	chrome.runtime.sendMessage({setPreview:true,previewURI:lastPreviewURI,hex:hex,lhex:lasthex,cr:rgb.r,cg:rgb.g,cb:rgb.b}, function(response) {});
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
	icvs = document.createElement('canvas');//icon canvas
	icvs.width=totalWidth,
	icvs.height=totalWidth;
	if( webGlAvail && pixelatedPreview && allowWebGl){
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
