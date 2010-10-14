var n=false,c=false,hex=0,rgb=null;hsv=null;scal=1,ex=0,ey=0;
var isEnabled=false,isLocked=false,scaleOffset=0;//isPicked
var borders='1px solid black',useflscale=false,scaleul='';
chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	if (request.setPixelPreview)
  	setPixelPreview(request.previewURI,request.zoomed,request.hex,request.lhex)
  else if (request.greeting == "enableColorPicker"){
  	borders=request.borders;
  	//useflscale=false;//request.usescale; //slow phaseout
  	//scaleul=request.scurl;
  	scaleOffset=request.scOffset;
  	enableColorPicker()
  }else if (request.greeting == "newImage"){
  	ssf()
  }else if (request.greeting == "disableColorPicker")
  	disableColorPicker()
  
  sendResponse({});
});
//function canpick(){
	//basically you can only unlock it if the mouse moves too
//	if(isLocked){
//		isLocked=false;
//		n.innerText=' ';
//	}
//}
function setPixelPreview(pix,zoom,hex,lhex){
	if(n.innerHTML=='&nbsp;' || n.innerHTML.indexOf('<img')==0){
		var wid=75,padr=32;
		if(zoom)wid=150,padr=32;
		n.innerHTML='<img height="'+wid+'" width="'+wid+'" src="'+pix+'" style="margin-left:32px;padding-right:'+padr+'px;" /><br>#<input size="7" style="font-size:10pt;border:'+borders+';" id="cphexvl" type="text" value="'+hex+'" />'+(lhex!='none'?'<input size="1" style="font-size:10pt;background-color:#'+lhex+';border:'+borders+';border-left:none;" type="text" value="" />':'')+(rgb?'<br><input type="text" value="rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')"/>':'')+(hsv?'<br><input type="text" value="hsl('+hsv.h+', '+hsv.s+', '+hsv.v+')"/>':'');
		keepOnScreen();
	}
}
function picked(){
	chrome.extension.sendRequest({greeting:'setColor'}, function(response){if(response.docopy)document.execCommand('copy', false, null);});
	if(isLocked){
		isLocked=false;
		n.innerHTML='&nbsp;';
	}else{
		isLocked=true;
		n.innerHTML='#<input size="7" style="font-size:10pt;border:'+borders+';" type="text" id="cphexvl" value="'+hex + '" /> <input type="image" id="exitbtn" src="'+chrome.extension.getURL('close.png')+'" alt="Close" title="Close and Exit Color Pick Mode (esc)" />'+(rgb?'<br><input type="text" value="rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')"/>':'')+(hsv?'<br><input type="text" value="hsl('+hsv.h+', '+hsv.s+', '+hsv.v+')"/>':'');
		document.getElementById('exitbtn').addEventListener('click',dissableColorPickerFromHere,true);
		document.getElementById('cphexvl').select();
		keepOnScreen();
	}
}
function dissableColorPickerFromHere(){//this one should be sufficient dissable
	chrome.extension.sendRequest({greeting: "disableColorPicker"}, function(response) {
		//hi, this should actually have called the below function as well due to message passing, although i would just call it manually.. it will look faster
	});
}

function disableColorPicker(){
	isEnabled=false;//cheap trick/// really we want to 
	//1)remove event listeners
	document.removeEventListener('mousemove',mmf);
	window.removeEventListener('scroll',ssf);
	window.removeEventListener('resize',ssf);
	window.removeEventListener('focus',ffs);
	window.removeEventListener('keyup',wk);
	//2)remove the elements we created and set them to false
	document.body.removeChild(c);
	document.body.removeChild(n);
	c=false,n=false;
	document.body.style.cursor='default';
	//	n.style.display="none";
	//	c.style.display="none";
}
function wk(ev){
	if(!isEnabled)return;
	if(ev.keyCode==27){
		dissableColorPickerFromHere();
	}else if(ev.keyCode==82||ev.keyCode==74){//r or j refresh
		ssf();
	}
}
function mmf(ev){
	if(!isEnabled)return;
	ex=ev.pageX;
	ey=ev.pageY;
	updateColorPreview()
}
var tgfdf=false;
function ffs(ev){
//	if(!isEnabled)return;//new ...?
//	if(tgfdf){tgfdf=false;return;}//double focus means skip it, else ssf
//	var e=ev;
//	tgfdf=true;
//	window.setTimeout(function(){if(tgfdf)ssf(e);tgfdf=false},250);
}
function ssf(ev){
	if(!isEnabled)return;
	n.style.display="none";c.style.display="none";//redundent?
	window.setTimeout(function(){
		newImage()//some delay required OR it won't update
	},10);
}
function enableColorPicker(){
	chrome.extension.sendRequest({greeting: "reportingIn"}, function(response) {
		//allows us to detect if the script is running from the bg
	});
	if(!n){
		n=document.createElement('div');
		n.innerHTML='&nbsp;';
		n.style.position='fixed';
		n.style.minWidth="30px";
		n.style.maxWidth="200px";
		n.style.minHeight="30px";
		n.style.borderRadius='8px';
		n.style.webkitBoxShadow='2px 2px 2px #666';
		n.style.border=borders;
		n.style.zIndex="2147483647";
		n.style.cursor="default";
		n.style.padding="4px";
		c=document.createElement('div');
		c.style.zIndex="2147483647";
		c.style.position='fixed';
		c.style.top='0px';
		c.style.left='0px';
		c.id='color_pick_click_box';
		c.addEventListener('click',picked,true);
		//c.addEventListener('mousedown',canpick,true);
		document.body.appendChild(c);
		document.body.appendChild(n);

		document.addEventListener('mousemove',mmf);
		window.addEventListener('scroll',ssf);
		window.addEventListener('resize',ssf);
		window.addEventListener('focus',ffs);
		window.addEventListener('keyup',wk);//removed through here
	}
	if(!isEnabled){
		n.style.display="none";
		c.style.display="none";
		if(isLocked)picked();
		document.body.style.cursor='crosshair';
		isEnabled=true;
		window.setTimeout(newImage,250);//yeah i know...c razy
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
	n.style.left=(x+8)+"px"; //still impossible to get accurate mouse positionin screen space relative to document space :/ although its possible to get it relative to top left corner of window, it becomes an approximation from there since zooming the page modifies the innerHeight rendering comparision with outerHeight moot
	
	keepOnScreen();

	//don't send two requests at once if the last one hasn't finished yet, but still send another request if it's busy
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
		hex=response.hex;n.style.backgroundColor='#'+hex;isUpdating=false;
		rgb=null;hsv=null
		if(response.rgb){
			rgb=response.rgb
		}
		if(response.hsv){
			hsv=response.hsv
		}
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
	n.style.display="none";//too late, it is still rendered... doing this earlier??? 
	c.style.display="none";
	isMakingNew=true;
	var x,y;//wid hei
  x=window.innerWidth
	y=window.innerHeight
	
	c.style.width=x+'px';
	c.style.height=y+'px';
	if(scal!=1){
		x*=scal;
		y*=scal;
	}
	chrome.extension.sendRequest({newImage:true,_x:x,_y:y}, function(response){
		isMakingNew=false;
		scal=(outerWidth-scaleOffset)/innerWidth
		//document.body.removeChild(f);chrome.extension.getURL
		window.setTimeout(function(){c.style.display="block";n.style.display="block";updateColorPreview();},500)
	});
}