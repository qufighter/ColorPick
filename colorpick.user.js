var n=false,c=false,hex=0,rgb=null;hsv=null;scal=1,ex=0,ey=0,isEnabled=false,isLocked=false,scaleOffset=0,borders='1px solid black';
chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	if (request.setPixelPreview)
  	setPixelPreview(request.previewURI,request.zoomed,request.hex,request.lhex)
  else if (request.enableColorPicker){
  	borders=request.borders;
  	scaleOffset=request.scOffset;
  	enableColorPicker()
  }else if (request.setPickerImage){
  	c.src=request.pickerImage;
  	//c.style.backgroundImage=request.pickerImage;
  }else if (request.newImage){
  	ssf()
  }else if (request.doPick){
  	picked()
  }else if (request.movedPixel){
  	setColor(request);
  }else if (request.disableColorPicker)disableColorPicker()
  sendResponse({});
});
function setPixelPreview(pix,zoom,hex,lhex){
	if(n.innerHTML=='&nbsp;' || n.innerHTML.indexOf('<img')==0){
		var wid=75,padr=32;
		if(zoom)wid=150,padr=32;
		n.innerHTML='<img height="'+wid+'" width="'+wid+'" src="'+pix+'" style="margin-left:32px;padding-right:'+padr+'px;" /><br>#<input size="7" style="font-size:10pt;border:'+borders+';" id="cphexvl" type="text" value="'+hex+'" onmouseover="this.select()" />'+(lhex!='none'?'<input size="1" style="font-size:10pt;background-color:#'+lhex+';border:'+borders+';border-left:none;" type="text" value="" />':'')+(rgb?'<br><input onmouseover="this.select()" type="text" value="rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')"/>':'')+(hsv?'<br><input onmouseover="this.select()" type="text" value="hsl('+hsv.h+', '+hsv.s+', '+hsv.v+')"/>':'');
		keepOnScreen();
	}
}
function setColor(r){
	hex=r.hex,isUpdating=false,rgb=null,hsv=null;
	n.style.backgroundColor='#'+hex;
	if(r.rgb)rgb=r.rgb;
	if(r.hsv)hsv=r.hsv;
	if(!isLocked){if(r.msg)n.innerHTML=r.msg;}
	else setDisplay();
}
function setDisplay(){
	n.innerHTML='#<input size="7" style="font-size:10pt;border:'+borders+';" type="text" id="cphexvl" value="'+hex + '" onmouseover="this.select()" /> <input type="image" id="exitbtn" src="'+chrome.extension.getURL('close.png')+'" alt="Close" title="Close and Exit Color Pick Mode (esc)" />'+(rgb?'<br><input onmouseover="this.select()" type="text" value="rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')"/>':'')+(hsv?'<br><input onmouseover="this.select()" type="text" value="hsl('+hsv.h+', '+hsv.s+', '+hsv.v+')"/>':'');
	document.getElementById('exitbtn').addEventListener('click',dissableColorPickerFromHere,true);
	document.getElementById('cphexvl').select();
	keepOnScreen();
}
function picked(){
	if(isLocked){
		isLocked=false;
		n.innerHTML='&nbsp;';
	}else{
		chrome.extension.sendRequest({setColor:true}, function(response){if(response.docopy)document.execCommand('copy', false, null);});
		isLocked=true;
		setDisplay();
	}
}
function dissableColorPickerFromHere(){
	chrome.extension.sendRequest({disableColorPicker:true},function(r){});
}
function disableColorPicker(){
	isEnabled=false;
	document.removeEventListener('mousemove',mmf);
	window.removeEventListener('scroll',ssf);
	window.removeEventListener('resize',ssf);
	window.removeEventListener('keyup',wk);
	document.body.removeChild(c);
	document.body.removeChild(n);
	c=false,n=false;
	document.body.style.cursor='default';
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
function enableColorPicker(){
	chrome.extension.sendRequest({reportingIn:true}, function(response) {
		//allows us to detect if the script is running from the bg
	});
	if(!n){
		n=document.createElement('div');
		n.innerHTML='&nbsp;';
		n.style.position='fixed';//background-color: black; background-image: url();background-repeat: no-repeat no-repeat; 
		n.style.minWidth="30px";
		n.style.maxWidth="200px";
		n.style.minHeight="30px";
		n.style.borderRadius='8px';
		n.style.webkitBoxShadow='2px 2px 2px #666';
		n.style.border=borders;
		n.style.zIndex="2147483647";
		n.style.cursor="default";
		n.style.padding="4px";
		c=document.createElement('img');
		c.style.zIndex="2147483647";
		c.style.position='fixed';
		c.style.top='0px';
		c.style.left='0px';
		c.style.overflow='hidden';
		c.id='color_pick_click_box';
		c.addEventListener('click',picked,true);
		document.body.appendChild(c);
		document.body.appendChild(n);
		document.addEventListener('mousemove',mmf);
		window.addEventListener('scroll',ssf);
		window.addEventListener('resize',ssf);
		window.addEventListener('keyup',wk);//removed through here
	}
	if(!isEnabled){
		n.style.display="none";
		c.style.display="none";
		if(isLocked)picked();//unlocks for next pick
		document.body.style.cursor='url('+chrome.extension.getURL('crosshair.png')+') 16 16,crosshair';
		isEnabled=true;
		window.setTimeout(newImage,1);
	}
}
function keepOnScreen(){
	if( n.clientWidth + n.offsetLeft +24 > window.innerWidth ){
		n.style.left=(lx-8-n.clientWidth)+"px";
	}
	if( n.clientHeight + n.offsetTop +24 > window.innerHeight ){
		n.style.top=(ly-8-n.clientHeight)+"px";
	}
}
var isUpdating=false,lastTimeout=0,lx=0,ly=0;
function updateColorPreview(ev){
	if(!isEnabled||isLocked)return;
	var x,y,x1,y1;
	x=ex-window.pageXOffset,y=ey-window.pageYOffset;
	lx=x,ly=y;
	n.style.top=(y+8)+"px";
	n.style.left=(x+8)+"px";
	keepOnScreen();
	if(isUpdating){
		window.clearTimeout(lastTimeout);
		lastTimeout=window.setTimeout(function(){updateColorPreview()},250);
		return;
	}
	isUpdating=true;
	if(scal!=1){
		x*=scal;
		y*=scal;
	}
	chrome.extension.sendRequest({getPixel:true,_x:x,_y:y}, function(response){
		setColor(response);
	});
}
var isMakingNew=false,lastNewTimeout=0;
function newImage(){
	if(!isEnabled)return;
	if(isMakingNew){
		window.clearTimeout(lastNewTimeout);
		lastNewTimeout=window.setTimeout(function(){newImage()},500);
		return;
	}
	isMakingNew=true;
	n.style.display="none";
	c.style.display="none";
	var x,y;//wid hei
  x=window.innerWidth //NON inclusive of scroll bar (yet the image we get has one, and is innerWidth wide in the background page)
	y=window.innerHeight
	c.style.width=x+'px';
	c.style.height=y+'px';
	scal=(outerWidth-scaleOffset)/innerWidth;
	x*=scal;
	y*=scal;
	chrome.extension.sendRequest({newImage:true,_x:x,_y:y}, function(response){
		isMakingNew=false;//perhaps we wait unitl it's really 'new'
		window.setTimeout(function(){c.style.display="block";n.style.display="block";updateColorPreview();},500)
	});
}