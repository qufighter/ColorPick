var elmid1='color_pick_click_box',elmid2='ChromeExtension:Color-Pick.com';
if(typeof(exitAndDetach)=='function')exitAndDetach();
function _ge(n){return document.getElementById(n);}
var n=false,c=false,hex=0,rgb=null;hsv=null;scal=1,ex=0,ey=0,isEnabled=false,isLocked=false,scaleOffset=0,borders='1px solid black',blankgif='',msg_bg_unavail=chrome.i18n.getMessage('bgPageUnavailable');
function reqLis(request, sender, sendResponse) {
	if (request.testAlive){
		//disableColorPicker();
	}else	if (request.setPixelPreview){
  	setPixelPreview(request.previewURI,request.zoomed,request.hex,request.lhex)
  }else if (request.enableColorPicker){
  	borders=request.borders;
  	enableColorPicker()
  }else if (request.setPickerImage){
  	c.src=request.pickerImage;
  }else if (request.newImage){
  	ssf()
  }else if (request.doPick){
  	picked()
  }else if (request.movedPixel){
  	setColor(request);
  }else if (request.disableColorPicker)disableColorPicker()
  sendResponse({result:true,isPicking:!isLocked});
}
chrome.runtime.onMessage.addListener(reqLis);
function setPixelPreview(pix,zoom,hex,lhex){
	var wid=75,padr=32;if(zoom)wid=150;
	if(!_ge('cpimprev') || (rgb && !_ge('cprgbvl'))){
		n.innerHTML='';
		Cr.elm('div',{},[
			Cr.elm('img',{id:'cpimprev',height:wid,width:wid,src:pix,style:'margin-left:32px;padding-right:'+padr+'px;'}),
			Cr.elm('br'),
			Cr.txt('#'),
			Cr.elm('input',{type:'text',size:7,style:'max-width:75px;font-size:10pt;border:'+borders,id:'cphexvl',value:hex,event:['mouseover',selectTargElm]}),
			//Cr.elm('input',{type:'image',src:chrome.extension.getURL('img/close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}),
			(lhex!='none'?Cr.elm('input',{type:'text',size:1,style:'max-width:50px;font-size:10pt;background-color:#'+lhex+';border:'+borders+';border-left:none;',value:''}):0),
			(rgb?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'rgb('+rgb.r+','+rgb.g+','+rgb.b+')',id:'cprgbvl',event:['mouseover',selectTargElm]}):0),
			(hsv?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)',id:'cphslvl',event:['mouseover',selectTargElm]}):0)
		],n)
		keepOnScreen();
	}else{
		_ge('cpimprev').src=pix,
		_ge('cpimprev').width=wid,
		_ge('cpimprev').height=wid;
		_ge('cphexvl').value=hex;
		if(rgb)_ge('cprgbvl').value='rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
		if(hsv)_ge('cphslvl').value='hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)';
	}
}
function setColor(r){
	if(!n)return;
	hex=r.hex,isUpdating=false,rgb=null,hsv=null;
	n.style.backgroundColor='#'+hex;
	if(!hex){
		if(!_ge('bgPageUnavailMsg')){
			n.appendChild(Cr.elm('div',{'id':'bgPageUnavailMsg'},[Cr.elm(msg_bg_unavail)]));
			n.style.backgroundColor='#000',n.style.color='#FFF';
		}else _ge('bgPageUnavailMsg').style.display='block';
	}else{
		if(_ge('bgPageUnavailMsg'))_ge('bgPageUnavailMsg').style.display='none';
	}
	if(r.rgb)rgb=r.rgb;
	if(r.hsv)hsv=r.hsv;
	if(!isLocked){if(r.msg)n.innerHTML=r.msg;}
	else setDisplay();
}
function selectTargElm(ev){
	ev.target.select();
}
function setDisplay(){//Cr.elm
	n.innerHTML='';
	Cr.elm('div',{},[
		Cr.txt('#'),
		Cr.elm('input',{type:'text',size:7,style:'max-width:75px;font-size:10pt;border:'+borders,id:'cphexvl',value:hex,event:['mouseover',selectTargElm]}),
		Cr.elm('input',{type:'image',style:'width:20px;height:20px;',src:chrome.extension.getURL('img/close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}),
		(rgb?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'rgb('+rgb.r+','+rgb.g+','+rgb.b+')',id:'cprgbvl',event:['mouseover',selectTargElm]}):0),
		(hsv?Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)',id:'cphslvl',event:['mouseover',selectTargElm]}):0)
	],n)
	if(_ge('cphexvl'))_ge('cphexvl').select();
	keepOnScreen();
}
function picked(){
	if(isLocked){
		isLocked=false;
		n.innerHTML=' ';
	}else{
		try{
			chrome.runtime.sendMessage({setColor:true}, function(response){});
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
	ex=ev.pageX;
	ey=ev.pageY;
	updateColorPreview()
}
function ssf(ev){
	if(!isEnabled)return;
	n.style.display="none";c.style.display="none";//redundent?
	window.setTimeout(function(){
		newImage()//some delay required OR it won't update
	},10);
}
function getBase64Image(im) {
  var canvas = Cr.elm("canvas",{width:im.width,height:im.height});
  var ctx = canvas.getContext("2d");
  ctx.drawImage(im, 0, 0);
  return canvas.toDataURL("image/png");
}
function enableColorPicker(){
	chrome.runtime.sendMessage({reportingIn:true}, function(response) {
		//allows us to detect if the script is running from the bg
	});
	if(!n){
		c=Cr.elm('img',{id:elmid1,src:blankgif,style:'position:fixed;top:0px;left:0px;overflow:hidden;z-index:2147483647;',event:['click',picked,true]},[],document.body);
		n=Cr.elm('div',{id:elmid2,style:'position:fixed;min-width:30px;max-width:300px;min-height:30px;border-radius:4px;box-shadow:2px 2px 2px #666;border:'+borders+';z-index:2147483647;cursor:default;padding:4px;'},[Cr.txt(' ')],document.body);
		document.addEventListener('mousemove',mmf);
		window.addEventListener('scroll',ssf);
		window.addEventListener('resize',ssf);
		window.addEventListener('keyup',wk);//removed through here
	}
	if(!isEnabled){
		n.style.display="none";
		c.style.display="none";
		if(isLocked)picked();//unlocks for next pick
		document.body.style.cursor='url('+chrome.extension.getURL('img/crosshair.png')+') 16 16,crosshair';
		isEnabled=true;
		window.setTimeout(newImage,1);
	}
}
function keepOnScreen(){
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
	if(!isEnabled||isLocked)return;
	var x=ex-window.pageXOffset,y=ey-window.pageYOffset;
	lx=x,ly=y;
	keepOnScreen();
	if(isUpdating){
		window.clearTimeout(lastTimeout);
		lastTimeout=window.setTimeout(function(){updateColorPreview()},500),timeoutCount++;
		if(timeoutCount > 50){
			if(!_ge('bgPageUnavailMsg')){
				n.appendChild(Cr.elm('div',{'id':'bgPageUnavailMsg'},[Cr.elm(msg_bg_unavail)]));
				n.style.backgroundColor='#000',n.style.color='#FFF';
			}else _ge('bgPageUnavailMsg').style.display='block';
		}
		return;
	}
	timeoutCount=0,isUpdating=true;
	if(scal!=1){
		x*=scal;
		y*=scal;
	}
//	try{
		chrome.runtime.sendMessage({getPixel:true,_x:x,_y:y}, function(response){
			setColor(response);
		});
//	}catch(e){
//		exitAndDetach();
//	}
}
var isMakingNew=false,lastNewTimeout=0;
function newImage(){
	if(!isEnabled)return;
	if(isMakingNew){
		window.clearTimeout(lastNewTimeout);
		lastNewTimeout=window.setTimeout(function(){newImage()},500);
		return;
	}
	document.body.style.cursor='wait';
	isMakingNew=true;
	n.style.display="none";
	c.style.display="none";
	c.style.margin="0px";
	c.style.padding="0px"
	c.src=blankgif;
	var x,y;//wid hei
	x=window.innerWidth;
	y=window.innerHeight;
	c.style.width=x+'px';
	c.style.height=y+'px';
	scal=document.width / document.documentElement.clientWidth;
	if(isNaN(scal)||!scal)scal=(outerWidth-scaleOffset)/innerWidth;
	//scal=document.width / document.body.clientWidth;
	x*=scal,y*=scal;
	setTimeout(function(){
		chrome.runtime.sendMessage({newImage:true,_x:x,_y:y}, function(response){
			isMakingNew=false;//perhaps we wait unitl it's really 'new'
			//window.setTimeout(function(){
				c.style.display="block";n.style.display="block";document.body.style.cursor='url('+chrome.extension.getURL('img/crosshair.png')+') 16 16,crosshair';updateColorPreview();
			//},500)
		});
	},500);
}
