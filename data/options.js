function getEventTargetA(ev){
	ev = ev || event;
	var targ=(typeof(ev.target)!='undefined') ? ev.target : ev.srcElement;
	if(targ !=null){
	    if(targ.nodeType==3)
	        targ=targ.parentNode;
	}
	if(targ.nodeName != 'A')return targ.parentNode;
	return targ;
}
function preventEventDefault(ev){
	ev = ev || event;
	if(ev.preventDefault)ev.preventDefault();
	ev.returnValue=false;
	return false;
}
function toggle_next_sibling_display(ev){
	who=getEventTargetA(ev);
	var nss=who.nextSibling.style;
	var arr=who.firstChild;
	if(!arr || arr.nodeName != 'IMG')arr=new Image();
	if(nss.display=='block'){
		nss.display='none';
		arr.src='img/expand.png';
	}else{
		nss.display='block';
		arr.src='img/expanded.png';
	}
	return preventEventDefault(ev);
}
function load_syncd_options() {
	loadSettingsFromChromeSyncStorage(function(){
		restore_options();
	});
	var status = document.getElementById("status");
  status.innerHTML = chrome.i18n.getMessage('loadsyncOptions');
  setTimeout(function() {
    status.innerHTML = "";
  }, 1750);
}

// Saves options to localStorage.
function save_options() {
//  var select = document.getElementById("color");
//  var color = select.children[select.selectedIndex].value;
//  localStorage["favorite_color"] = color;
  	
  	for(var i in pOptions){
  		if(typeof(pOptions[i].def)=='boolean')
  			localStorage[i] = document.getElementById(i).checked;
  		else
  			localStorage[i] = document.getElementById(i).value;
  	}
	
	
		for(var i in pAdvOptions){
  		if(typeof(pAdvOptions[i].def)=='boolean')
  			localStorage[i] = document.getElementById(i).checked;
  		else
  			localStorage[i] = document.getElementById(i).value;
  	}
	//localStorage["hqthumbs"] = document.getElementById("hqthumbs").checked;
	//localStorage["showCurrentTab"] = document.getElementById("showCurrentTab").checked;
	//localStorage["maxhistory"] = document.getElementById("maxhistory").value;
	
	var iconbitmap=false;
	var appleIcon=false;
	
	if(typeof(localStorage["iconIsBitmap"])!='undefined')iconbitmap = ((localStorage["iconIsBitmap"]=='true')?true:false);
	if(typeof(localStorage["appleIcon"])!='undefined')appleIcon = ((localStorage["appleIcon"]=='true')?true:false);
	if(!iconbitmap){
		var iconPath='img/';
		if(appleIcon)iconPath+='apple/';
		chrome.browserAction.setIcon({path:chrome.extension.getURL(iconPath+'icon19.png')});//update icon (to be configurable)
	}
	
	if(typeof(localStorage["usageStatistics"])=='undefined')localStorage["usageStatistics"]=false;
	if(localStorage["usageStatistics"]=='true' && !navigator.doNotTrack){
		if(localStorage.removeItem)localStorage.removeItem("feedbackOptOut");
		else delete localStorage["feedbackOptOut"];
	}else{
		localStorage.feedbackOptOut = "true";
	}

	showRegistrationStatus();
	
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = chrome.i18n.getMessage('savedoptions');
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
  
  sendReloadPrefs();
  saveToChromeSyncStorage();
}

function reset_options() {
	for(var i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = pOptions[i].def;
		else
			document.getElementById(i).value = pOptions[i].def;
	}
	
	for(var i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			document.getElementById(i).checked = pAdvOptions[i].def;
		else
			document.getElementById(i).value = pAdvOptions[i].def;
	}
	
	var status = document.getElementById("status");
  status.innerHTML = chrome.i18n.getMessage('showndefaults');
  setTimeout(function() {
    status.innerHTML = "";
  }, 3000);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	for(var i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i])?localStorage[i]:pOptions[i].def);
	}
	
	for(var i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pAdvOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i])?localStorage[i]:pAdvOptions[i].def);
	}

//  var favorite = localStorage["favorite_color"];
//  if (!favorite) {
//    return;
//  }
//  var select = document.getElementById("color");
//  for (var i = 0; i < select.children.length; i++) {
//    var child = select.children[i];
//    if (child.value == favorite) {
//      child.selected = "true";
//      break;
//    }
//  }
}

function clear_history(ev){
	if(confirm("are you sure?")){
		localStorage['colorPickHistory']='';
		load_history();
		sendReloadPrefs();
	}
}

function load_history(){
	if(!document.getElementById('history'))return;
	if(typeof(localStorage["colorPickHistory"])=='undefined')localStorage['colorPickHistory']="";
	var hist=localStorage['colorPickHistory'].split("#");
	var div_history=document.getElementById('history');
	div_history.innerHTML = '';
	for(i in hist){
		if(!hist[i])continue;
		var cb=document.createElement('div');
		cb.setAttribute('style','display:inline-block;background-color:#'+hist[i]+';width:22px;height:22px;');
		cb.setAttribute('title','#'+hist[i]);
		div_history.appendChild(cb);
		var tc=hist[i];
	}
	div_history.addEventListener('click',function(ev){
		var tc=ev.srcElement.title;
		if(tc)prompt(chrome.i18n.getMessage('copycolorval')+':',tc,tc);
	},false);
	
	var cb=document.createElement('div');
	cb.setAttribute('style','display:block;background-color:#CCC;opacity:0.5;width:7px;height:100%;position:absolute;right:-11px;top:0px;cursor:e-resize;');
	cb.setAttribute('id','hist_drag_sizer');
	div_history.appendChild(cb);
	cb.addEventListener('mousedown',dragHist);
	document.body.addEventListener('mouseup',stopdragHist);
	document.body.addEventListener('mousemove',mmv);
}

var histReSize=false;
var hist_sx=0,hist_sy=0;
function dragHist(ev){
	hist_sx=ev.pageX;
	hist_sy=ev.pageY;
	histReSize=true;
}
function stopdragHist(){
	histReSize=false;
}
function mmv(ev){
	if(histReSize){
		var ch=ev.pageX-hist_sx;
		
		var his=document.getElementById('history');
		var hds=document.getElementById('hist_drag_sizer');
		
		//hds.style.right = hds.style.right.replace('px','')-0 - ch;
		his.style.width = his.style.width.replace('px','')-0 + ch;

		hist_sx=ev.pageX;
		hist_sy=ev.pageY;
	}
}

function createOptions(piOptions, elemAppend){
	//needs some compression 
	for( i in piOptions){
		if(!piOptions[i].name)piOptions[i].name=chrome.i18n.getMessage(i);
		if(piOptions[i].select){
			var l=document.createElement('label');
			var cb=document.createElement('select');
			cb.setAttribute('type','select');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(document.createTextNode(" "+piOptions[i].name+" "));
			l.appendChild(cb);
			
			
			for(z in piOptions[i].select){
				var opt=document.createElement('option');
				opt.setAttribute('value',z);
				opt.appendChild(document.createTextNode(piOptions[i].select[z]));
				cb.appendChild(opt);
			}
			
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
		}else if(typeof(piOptions[i].def)=='boolean'){
			var l=document.createElement('label');
			var cb=document.createElement('input');
			cb.setAttribute('type','checkbox');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(cb);
			l.appendChild(document.createTextNode(piOptions[i].name));
			if(piOptions[i].img){
				var t=piOptions[i].img;
				i=document.createElement('img');
				i.setAttribute('src',t);
				i.setAttribute('align','top');
				i.setAttribute('width',16);
				l.appendChild(document.createTextNode(' '));
				l.appendChild(i);
			}
			if(piOptions[i] && piOptions[i].css){
				l.setAttribute('style',piOptions[i].css);
			}
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
			//.getElementById(i).checked = ((localStorage[i]=='true')?true:piOptions[i].def);
		}else{
			var l=document.createElement('label');
			var cb=document.createElement('input');
			cb.setAttribute('type','text');
			cb.setAttribute('id',i);cb.setAttribute('size',(piOptions[i].def + '').length);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(cb);
			l.appendChild(document.createTextNode(piOptions[i].name));
			
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
			//document.getElementById(i).value = ((localStorage[i])?localStorage[i]:piOptions[i].def);
		}
	}
}

function init(){

//	var a=document.getElementById('dupli');
//	var b=a.cloneNode(true);
//	b.id='nota';
//	b.style.color='black';
//	b.style.position='absolute';
//	b.style.top='1px';b.style.left='1px';
//	a.appendChild(b);
	
	createOptions(pOptions, document.getElementById('options'));
	createOptions(pAdvOptions, document.getElementById('adv_options'))
	restore_options();
	
	load_history();
	
	

	
	showRegistrationStatus();
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.historypush){
    	if(typeof(fetchMainPrefs)=='function')fetchMainPrefs();
    	else load_history();
    	sendResponse({});
    }else if(request.reloadprefs){
    	restore_options();
    	sendResponse({});
    }
  });
  
function showRegistrationStatus(){
	if(localStorage['reg_chk']=='true' || localStorage['usageStatistics']=='true'){
		document.getElementById('reg_status').innerHTML=chrome.i18n.getMessage('registered');
		document.getElementById('reg_status').className='registered';
		if(localStorage['reg_chk']!='true') document.getElementById('reg_status').innerHTML=chrome.i18n.getMessage('approved');
	}else{
		document.getElementById('reg_status').innerHTML=chrome.i18n.getMessage('unregistered');
		document.getElementById('reg_status').className='unregistered';
	}

	if(localStorage['shareClors']=='true'){
		document.getElementById('cotd').style.display="block";
		document.getElementById('ifcotd').src='http://vidzbigger.com/vcolors_ofday.php';
	}else{
		document.getElementById('cotd').style.display="none";
	}
}

function createDOM(){
Cr.elm("div",{id:"mainbox"},[
	Cr.elm("h3",{},[
		Cr.elm("img",{src:"img/icon48.png",id:"logo"}),
		Cr.elm("a",{href:"https://chrome.google.com/webstore/detail/color-picker/ohcpnigalekghcmgcdcenkpelffpdolg",target:"_blank"},[
			Cr.txt(chrome.i18n.getMessage('extName'))
		]),
		Cr.elm("br",{}),
		Cr.elm("a",{id:'register_link',href:"register.html"},[
			Cr.elm("span",{id:"reg_status"})
		]),
		Cr.elm("br",{}),
		Cr.elm("br",{})
	]),
	Cr.elm("br",{}),
	Cr.elm("div",{id:"options"},[

	]),
	Cr.elm("a",{href:"#",id:"shoadvanc"},[
		Cr.elm("img",{src:"img/expand.png"}),
		Cr.txt(chrome.i18n.getMessage('advancedOptions'))
	]),
	Cr.elm("div",{id:"adv_options"},[
		Cr.elm("button",{id:"bload"},[
			Cr.txt(chrome.i18n.getMessage('fetchSync'))
		]),
		Cr.elm("button",{id:"cload"},[
			Cr.txt(chrome.i18n.getMessage('clearSync'))
		])
	]),
	Cr.elm("button",{id:"bsave"},[
		Cr.txt(chrome.i18n.getMessage('saveOptions'))
	]),
	Cr.txt(" "),
	Cr.elm("button",{id:"defa"},[
		Cr.txt(chrome.i18n.getMessage('showDefaults'))
	]),
	Cr.elm("span",{id:"status"}),
	Cr.elm("div",{id:"cotd"},[
		Cr.txt(chrome.i18n.getMessage('colorOfDay')),
		Cr.elm("br",{}),
		Cr.elm("iframe",{id:"ifcotd",src:"about:blank",scrolling:"no"})
	]),
	Cr.elm("a",{id:"license_link",href:"license.html?wide=1"},[
		Cr.txt(chrome.i18n.getMessage('terms'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{target:"_blank",href:"desktop_app.html"},[
		Cr.txt(chrome.i18n.getMessage('desktopapp'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{target:"_blank",href:"help.html"},[
		Cr.txt(chrome.i18n.getMessage('help'))
	]),
	Cr.elm("h4",{},[
		Cr.txt(chrome.i18n.getMessage('history')),
		Cr.elm("a",{href:"#",id:"clhist",style:"font-size:10px;"},[
			Cr.txt(chrome.i18n.getMessage('clear'))
		])
	]),
	Cr.elm("div",{id:"history"}),
	Cr.elm("br",{}),
	Cr.ent(chrome.i18n.getMessage('extName')+" &copy;"),
	Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
		Cr.txt("Vidsbee.com")
	])
],document.body)

	init()
	document.getElementById('bsave').addEventListener('click', save_options);
	document.getElementById('defa').addEventListener('click', reset_options);
	document.getElementById('clhist').addEventListener('click', clear_history);
	
	document.getElementById('shoadvanc').addEventListener('click', toggle_next_sibling_display);

	document.getElementById('bload').addEventListener('click', load_syncd_options);
	document.getElementById('cload').addEventListener('click', function(){
		storage.clear(function(){});
	});
}

document.addEventListener('DOMContentLoaded', function () {
	createDOM();
});
