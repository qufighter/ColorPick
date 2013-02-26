if(!document.getElementById('ChromeExtension:Color-Pick.com')){
var n=false,c=false,hex=0,rgb=null;hsv=null;scal=1,ex=0,ey=0,isEnabled=false,isLocked=false,scaleOffset=0,borders='1px solid black',blankgif='';
if(!document.getElementById('ChromeExtension:Color-Pick.com'))chrome.extension.onRequest.addListener(
function(request, sender, sendResponse) {
	if (request.testAlive){
		//disableColorPicker();
	}else	if (request.setPixelPreview){
  	setPixelPreview(request.previewURI,request.zoomed,request.hex,request.lhex)
  }else if (request.enableColorPicker){
  	borders=request.borders;
  	scaleOffset=request.scOffset;
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
});
function setPixelPreview(pix,zoom,hex,lhex){
	var wid=75,padr=32;if(zoom)wid=150;
	if(true || !document.getElementById('cpimprev')){
		n.innerHTML='';
		var nodes=[];
		nodes.push(Cr.elm('img',{id:'cpimprev',height:wid,width:wid,src:pix,style:'margin-left:32px;padding-right:'+padr+'px;'}));
		nodes.push(Cr.elm('br'));
		nodes.push(Cr.txt('#'));
		nodes.push(Cr.elm('input',{type:'text',size:7,style:'max-width:75px;font-size:10pt;border:'+borders,id:'cphexvl',value:hex,event:['mouseover',selectTargElm]}));
		//nodes.push(Cr.elm('input',{type:'image',src:chrome.extension.getURL('close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}));
		if(lhex!='none')nodes.push(Cr.elm('input',{type:'text',size:1,style:'max-width:50px;font-size:10pt;background-color:#'+lhex+';border:'+borders+';border-left:none;',value:''}));
		if(rgb)nodes.push(Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'rgb('+rgb.r+','+rgb.g+','+rgb.b+')',id:'cprgbvl',event:['mouseover',selectTargElm]}));
		if(hsv)nodes.push(Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)',id:'cphslvl',event:['mouseover',selectTargElm]}));
		Cr.elm('div',{},nodes,n)
		keepOnScreen();
	}else{
		document.getElementById('cpimprev').src=pix;
		document.getElementById('cphexvl').value=hex;
		document.getElementById('cprgbvl').value='rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
		document.getElementById('cphslvl').value='hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)';
	}
}
function setColor(r){
	if(!n)return;
	hex=r.hex,isUpdating=false,rgb=null,hsv=null;
	n.style.backgroundColor='#'+hex;
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
	var nodes=[];
	nodes.push(Cr.txt('#'));
	nodes.push(Cr.elm('input',{type:'text',size:7,style:'max-width:75px;font-size:10pt;border:'+borders,id:'cphexvl',value:hex,event:['mouseover',selectTargElm]}));
	nodes.push(Cr.elm('input',{type:'image',style:'width:16px;height:16px;',src:chrome.extension.getURL('close.png'),alt:'Close',title:chrome.i18n.getMessage('closeAndExit'),id:'exitbtn',event:['click',dissableColorPickerFromHere,true]}));
	if(rgb)nodes.push(Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'rgb('+rgb.r+','+rgb.g+','+rgb.b+')',id:'cprgbvl',event:['mouseover',selectTargElm]}));
	if(hsv)nodes.push(Cr.elm('input',{type:'text',style:'max-width:150px;display:block;',value:'hsl('+hsv.h+','+hsv.s+'%,'+hsv.v+'%)',id:'cphslvl',event:['mouseover',selectTargElm]}));
	Cr.elm('div',{},nodes,n)
	if(document.getElementById('cphexvl'))document.getElementById('cphexvl').select();
	keepOnScreen();
}
function picked(){
	if(isLocked){
		isLocked=false;
		n.innerHTML=' ';
	}else{
		chrome.extension.sendRequest({setColor:true}, function(response){if(response.docopy)document.execCommand('copy', false, null);});
		isLocked=true;
		setDisplay();
	}
}
function dissableColorPickerFromHere(){
	var disableTimeout=setTimeout(disableColorPicker,500)
	chrome.extension.sendRequest({disableColorPicker:true},function(r){
		clearTimeout(disableTimeout);
	});
}
function disableColorPicker(){
	isEnabled=false,isLocked=false;
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
		n.innerHTML=' ';
		n.id='ChromeExtension:Color-Pick.com';
		n.style.position='fixed';//background-color: black; background-image: url();background-repeat: no-repeat no-repeat; 
		n.style.minWidth="30px";
		n.style.maxWidth="200px";
		n.style.minHeight="30px";
		n.style.borderRadius='4px';
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
		c.src=blankgif;
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
	n.style.top=(ly+8)+"px";
	n.style.left=(lx+8)+"px";
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
	//scal=(outerWidth-scaleOffset)/innerWidth;
	scal=document.width / document.documentElement.clientWidth;
	//scal=document.width / document.body.clientWidth;
	x*=scal;
	y*=scal;
	setTimeout(function(){
		chrome.extension.sendRequest({newImage:true,_x:x,_y:y}, function(response){
			isMakingNew=false;//perhaps we wait unitl it's really 'new'
			window.setTimeout(function(){c.style.display="block";n.style.display="block";document.body.style.cursor='url('+chrome.extension.getURL('crosshair.png')+') 16 16,crosshair';updateColorPreview();},500)
		});
	},500);
}
}//enclosing block
