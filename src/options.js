var _ext_homepage="https://chrome.google.com/webstore/detail/color-picker/ohcpnigalekghcmgcdcenkpelffpdolg";
if( isFirefox ){
	_ext_homepage="https://addons.mozilla.org/en-US/firefox/addon/colorpick-eyedropper/";
}
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
	updateSwatchSelectionMargins(null);
	return preventEventDefault(ev);
}
function load_syncd_options() {
	loadSettingsFromChromeSyncStorage(function(){
		restore_options();
	});
	var status = document.getElementById("status");
	Cr.empty(status).appendChild(Cr.txt(chrome.i18n.getMessage('loadsyncOptions')));

	setTimeout(function() {
		Cr.empty(status);
	}, 1750);
}

// Saves options to localStorage.
function save_options() {
//  var select = document.getElementById("color");
//  var color = select.children[select.selectedIndex].value;
//  localStorage["favorite_color"] = color;
  	var i;

  	for(i in pOptions){
  		document.getElementById(i).closest('label').style.border='';
  		if(typeof(pOptions[i].def)=='boolean')
  			localStorage[i] = document.getElementById(i).checked;
  		else
  			localStorage[i] = document.getElementById(i).value;
  	}
	
	
	for(i in pAdvOptions){
  		document.getElementById(i).closest('label').style.border='';
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
  Cr.empty(status).appendChild(Cr.txt(chrome.i18n.getMessage('savedoptions')));

  setTimeout(function() {
    Cr.empty(status);
  }, 750);
  
  saveToChromeSyncStorage();
  sendReloadPrefs();
}

var textForWas = chrome.i18n.getMessage('was');

function borderStyle(was, boolz, element){
	var label = element.closest('label');
	if(boolz){
		label.classList.add('changed');
		label.style.border='1px solid blue';
		label.title=textForWas+': '+was;
		var area = label.closest('.indented-area');
		if( area.style.display!='block' ){
			toggle_next_sibling_display({target:area.previousElementSibling});
		}
	}else{
		label.classList.remove('changed');
		label.style.border='';
	}
	return boolz;
}

function show_default_option(element, defaultValue){
	if(typeof(defaultValue)=='boolean'){
		borderStyle(element.checked, element.checked != defaultValue, element);
		element.checked = defaultValue;
	}else{
		borderStyle(element.value, element.value != defaultValue, element);
		element.value = defaultValue;
	}
}

function reset_options() {
	var i;
	for(i in pOptions){
		show_default_option(document.getElementById(i), pOptions[i].def)
	}
	
	for(i in pAdvOptions){
		show_default_option(document.getElementById(i), pAdvOptions[i].def);
	}
	
	var status = document.getElementById("status");
	Cr.empty(status).appendChild(Cr.txt(chrome.i18n.getMessage('showndefaults')));
	setTimeout(function() {
		Cr.empty(status);
	}, 3000);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	var i;
	for(i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i])?localStorage[i]:pOptions[i].def);
	}
	
	for(i in pAdvOptions){
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


//color functions used for history sorting
function cleanHex(H){
	if( H.length > 6 && H.substr(0,1) == '#' ) return H.substr(1);
	return H;
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


function clear_history(ev){
	if(confirm("are you sure?")){
		localStorage['colorPickHistory']='';
		load_history();
		sendReloadPrefs();
	}
}

function printSwatches(e){
	var colors = currentSwatches();
	var params = '';
	for( var c=0,l=colors.length; c<l; c++ ){
		params+='||'+JSON.stringify({hex: colors[c].hex,rgb: colors[c].rgb, hsl: colors[c].hsl, hsv: colors[c].hsv});
	}
	e.target.href='saveSwatches.html?fmt='+escape(localStorage['CSS3ColorFormat'])+'&swatches='+params;
	if(colors.length < 1){
		e.preventDefault();
	}
}

function moveUp(e){
	e.target.parentNode.parentNode.insertBefore(e.target.parentNode, e.target.parentNode.previousSibling);
}

function moveDn(e){
	var b4 = e.target.parentNode.parentNode.firstChild;
	if( e.target.parentNode.nextSibling )b4 = e.target.parentNode.nextSibling.nextSibling;
	e.target.parentNode.parentNode.insertBefore(e.target.parentNode, b4);
}

function removeSwatch(e){
	e.target.parentNode.parentNode.removeChild(e.target.parentNode);
}

function currentSwatches(){
	//read node state
	var colors=[];
	var swHld = document.getElementById('swatches');
	var hexInp = swHld.getElementsByClassName('hex');
	var hex,rgb;
	for( var s=0,l=hexInp.length; s<l; s++){
		hex = cleanHex(hexInp[s].value);
		rgb = fromHexClr(hex);
		colors.push({
			node: hexInp[s].parentNode,
			hex: hex,
			rgb: rgb,
			hsl: rgb2hsl(rgb.r,rgb.g,rgb.b),
			hsv: rgb2hsv(rgb.r,rgb.g,rgb.b)
		});
	}
	var exi=document.getElementById('pallete-help');
	if(colors.length<1 && !exi){
		swHld.appendChild(Cr.elm('div', {id: 'pallete-help',childNodes:[
			Cr.txt(chrome.i18n.getMessage('noSwatches'))
		]}));
		var n=document.getElementById('showhist');
		if(n.nextSibling.style.display!='block') toggle_next_sibling_display({target:n});
	}else{
		if(exi)exi.remove();
	}
	return colors;
}

function sortSwatches(){
	var swHld = document.getElementById('swatches');
	var colors = currentSwatches();
	//sort
	colors.sort(function(a,b){
		return a.hsl.h - b.hsl.h || a.hsl.s - b.hsl.s  || a.hsv.v - b.hsv.v;
	});
	//append new order
	for( var c=0,cl=colors.length; c<cl; c++){
		swHld.appendChild(colors[c].node);
	}
}

function dedupeSwatches(){
	var swHld = document.getElementById('swatches');
	var colors = currentSwatches();
	var found={};
	for( var c=0,l=colors.length; c<l; c++ ){
		//params+='||'+JSON.stringify({hex: colors[c].hex,rgb: colors[c].rgb, hsl: colors[c].hsl, hsv: colors[c].hsv})
		if( found[colors[c].hex] ){
			swHld.removeChild(colors[c].node);
			//e.target.parentNode.parentNode.removeChild(e.target.parentNode);
		}
		found[colors[c].hex] = true;
	}
}

function swatchChanged(ev){
	ev.target.parentNode.style.backgroundColor=ev.target.value;
}

function addSwatchEntry(hex){
	var swHld = document.getElementById('swatches');
	Cr.elm('div',{class:'swatch',style:'background-color:'+hex+';'},[
		//Cr.elm('span',{style:'position:absolute;left:-40px;'},[ // for some reason breaks the events
			Cr.elm("a",{events:['click',moveUp]},[Cr.txt('\u25B3')]),
			Cr.elm("a",{events:['click',moveDn]},[Cr.txt('\u25BD')]),
		//]),
		Cr.elm('input',{type:'text',value:hex,class:'hex',event:['change', swatchChanged]}),
		Cr.elm("img",{class:'close',align:'top',src:chrome.extension.getURL('img/close.png'),events:['click',removeSwatch]})
	],swHld);
}

var lastHistorySelection = null;
function load_history(){
	if(!document.getElementById('history'))return;
	if(typeof(localStorage["colorPickHistory"])=='undefined')localStorage['colorPickHistory']="";
	var hist=localStorage['colorPickHistory'].replace(/^undefined/,'').split("#");
	var div_history=document.getElementById('history');
	var exiHisInner=document.getElementById('historyInner');
	var heightToUse = exiHisInner ? exiHisInner.style.height : 'auto';
	var scrollToUse = exiHisInner ? exiHisInner.scrollTop : 0;
	var widthToUse = div_history.style.width || '399px';
	Cr.empty(div_history);

	div_history.style.width = widthToUse;
	var historyInner = Cr.elm('div',{id:'historyInner',style:'height:'+heightToUse});
	var i;
	for(i in hist){
		if(!hist[i])continue;
		Cr.elm('div', {
			class: 'clickSwatch',
			style: 'background-color:#'+hist[i]+';',
			name: '#'+hist[i],
			title: '#'+hist[i]+' '+chrome.i18n.getMessage('addToPalette')
		}, [], historyInner);
		var tc=hist[i];
	}
	Cr.elm("a",{href:"#",style:"display:block;font-size:10px;text-align:right;",event:['click', clear_history]},[
		Cr.txt(chrome.i18n.getMessage('clear'))
	], historyInner);
	div_history.appendChild(historyInner);
	historyInner.scrollTop = scrollToUse;
	historyInner.addEventListener('click',function(ev){
		var tc=ev.target.getAttribute('name');
		if(tc){
			addSwatchEntry(tc);
			if( lastHistorySelection ) lastHistorySelection.classList.remove('last-selection');
			lastHistorySelection = ev.target;
			lastHistorySelection.classList.add('last-selection');
			//prompt(chrome.i18n.getMessage('copycolorval')+':',tc,tc);
		}
	},false);
	
	Cr.elm('div', {
		style: 'right:-11px;top:0px;cursor:ew-resize;width:7px;height:100%;',
		class: 'hist_drag_sizer',
		event: ['mousedown', dragHist]
	}, [], div_history);

	Cr.elm('div', {
		style: 'bottom:-11px;left:0px;cursor:ns-resize;width:100%;height:7px;',
		class: 'hist_drag_sizer',
		event: ['mousedown', dragHistVrt]
	}, [], div_history);

	Cr.elm('div', {
		style: 'bottom:-11px;right:-11px;cursor:nwse-resize;width:7px;height:7px;',
		class: 'hist_drag_sizer',
		event: ['mousedown', dragHistBth]
	}, [], div_history);
}
function disableSelection(){document.body.style.userSelect='none';}
function enableSelection(){document.body.style.userSelect='';}
var histReSize=false;histReSizeVrt=false;
function dragHist(ev){ histReSize=true;disableSelection(); }
function dragHistVrt(ev){ histReSizeVrt=true;disableSelection(); }
function dragHistBth(ev){ histReSize=histReSizeVrt=true;disableSelection(); }
function stopdragHist(){ histReSize=histReSizeVrt=false;enableSelection(); }
function mmv(ev){
	var his=document.getElementById('history');
	var hisInner=document.getElementById('historyInner');
	if(histReSize){
		his.style.width = ev.pageX - 28;
	}
	if(histReSizeVrt){
		hisInner.style.height = ev.pageY - his.offsetTop - 7;
	}
	if( histReSizeVrt || histReSize ){
		updateSwatchSelectionMargins(his);
	}
}

function updateSwatchSelectionMargins(his){
	his = his || document.getElementById('history');
	if( his.clientWidth > 400 && his.style.display!='none' ){
		document.getElementById('swatch-holder').style.marginTop = his.clientHeight + 50;
	}else{
		document.getElementById('swatch-holder').style.marginTop = 0;
	}
}


var fourSpaces='\u00a0\u00a0\u00a0\u00a0';
function createOptions(piOptions, elemAppend){
	//needs some compression 
	var i, z, l, cb;
	for( i in piOptions){
		if(!piOptions[i].name)piOptions[i].name=chrome.i18n.getMessage(i);
		if(piOptions[i].select){
			l=document.createElement('label');
			cb=document.createElement('select');
			cb.setAttribute('type','select');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode(fourSpaces));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode(fourSpaces));
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
			l=document.createElement('label');
			cb=document.createElement('input');
			cb.setAttribute('type','checkbox');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode(fourSpaces));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode(fourSpaces));
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
			l=document.createElement('label');
			cb=document.createElement('input');
			cb.setAttribute('type','text');
			cb.setAttribute('id',i);cb.setAttribute('size',(piOptions[i].def + '').length);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode(fourSpaces));
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
	createOptions(pAdvOptions, document.getElementById('adv_options'));
	restore_options();
	
	load_history();
	document.body.addEventListener('mouseup',stopdragHist); //one time history related events
	document.body.addEventListener('mousemove',mmv);
	

	
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
		Cr.empty(document.getElementById('reg_status')).appendChild(Cr.txt(chrome.i18n.getMessage('registered')));
		document.getElementById('reg_status').className='registered';
		if(localStorage['reg_chk']!='true'){
			Cr.empty(document.getElementById('reg_status')).appendChild(Cr.txt(chrome.i18n.getMessage('approved')));
		}
	}else{
		Cr.empty(document.getElementById('reg_status')).appendChild(Cr.txt(chrome.i18n.getMessage('unregistered')));
		document.getElementById('reg_status').className='unregistered';
	}

	var cotd = document.getElementById('cotd');
	if(localStorage['shareClors']=='true'){
		cotd.style.display="block";
		createDailyColorViewer(cotd);
		document.getElementById('ifcotd').src='sorry.html';//http://vidzbigger.com/vcolors_ofday.php';
	}else{
		cotd.style.display="none";
	}
}

function createDailyColorViewer(container){
	if( container.childNodes.length ) return;
	Cr.elm('div',{},[
		Cr.txt(chrome.i18n.getMessage('colorOfDay')),
		Cr.elm("br",{}),
		Cr.elm("iframe",{id:"ifcotd",src:"about:blank",scrolling:"no"})
	], container);
}

function createDOM(){
Cr.elm("div",{id:"mainbox"},[
	Cr.elm("h3",{},[
		Cr.elm("img",{src:"img/icon48.png",id:"logo"}),
		Cr.elm("a",{id:"exthometxt",href:_ext_homepage,target:"_blank"},[
			Cr.txt(chrome.i18n.getMessage('extName'))
		]),
		Cr.elm("br",{}),
		Cr.elm("a",{id:'register_link',event:['click',navToReg],href:"register.html"},[
			Cr.elm("span",{id:"reg_status"})
		]),
		Cr.elm("br",{}),
		Cr.elm("br",{})
	]),
	Cr.elm("br",{}),
	Cr.elm("div",{id:"swatch-holder"},[
		Cr.elm("a",{class:"swatchCtrl",event:['click',dedupeSwatches],style:'text-align:center;position:absolute;display:block;width:50%;margin-left:25%;'},[Cr.txt(chrome.i18n.getMessage('dedupe'))]),
		Cr.elm("a",{class:"swatchCtrl",event:['click',sortSwatches],style:''},[Cr.txt(chrome.i18n.getMessage('sort'))]),
		Cr.elm("a",{class:"swatchCtrl",event:['click',printSwatches],style:'float:right;',target:'_blank'},[Cr.txt(chrome.i18n.getMessage('printSave'))]),
		Cr.elm("div",{id:"swatches"})
	]),
	Cr.elm("a",{href:"#",id:"showhist",class:"toggleOpts"},[
		Cr.elm("img",{src:"img/expand.png"}),
		Cr.txt(chrome.i18n.getMessage('history'))
	]),
	Cr.elm("div",{id:"history", class:'indented-area'},[]),
	Cr.elm("a",{href:"#",id:"showopt",class:"toggleOpts"},[
		Cr.elm("img",{src:"img/expand.png"}),
		Cr.txt(chrome.i18n.getMessage('options'))
	]),
	Cr.elm("div",{id:"options", class:'indented-area'},[]),
	Cr.elm("a",{href:"#",id:"shoadvanc",class:"toggleOpts"},[
		Cr.elm("img",{src:"img/expand.png"}),
		Cr.txt(chrome.i18n.getMessage('advancedOptions'))
	]),
	Cr.elm("div",{id:"adv_options", class:'indented-area'},[
		Cr.elm("button",{id:"bload"},[
			Cr.txt(chrome.i18n.getMessage('fetchSync'))
		]),
		Cr.elm("button",{id:"cload"},[
			Cr.txt(chrome.i18n.getMessage('clearSync'))
		])
	]),
	Cr.elm('br'),
	Cr.elm("button",{id:"bsave", class:"options-btn"},[
		Cr.txt(chrome.i18n.getMessage('saveOptions'))
	]),
	Cr.txt(" "),
	Cr.elm("button",{id:"defa", class:"options-btn"},[
		Cr.txt(chrome.i18n.getMessage('showDefaults'))
	]),
	Cr.elm("span",{id:"status"}),
	Cr.elm("div",{id:"cotd"},[]),
	Cr.elm("a",{id:"license_link",href:"license.html?wide=1"},[
		Cr.txt(chrome.i18n.getMessage('terms'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{target:"_blank",href:"desktop_app.html",event:['click', navToDesktop]},[
		Cr.txt('\uD83D\uDDA5 '),
		Cr.txt(chrome.i18n.getMessage('desktopapp'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{target:"_blank",href:"mobile_app.html",event:['click', navToMobile]},[
		Cr.txt('\uD83D\uDCF1 '),
		Cr.txt(chrome.i18n.getMessage('mobileapp'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{target:"_blank",href:"help.html",event:['click', navToHelp]},[
		Cr.elm('span',{style:'color:#444;'},[Cr.txt('\uFFFD ')]),
		Cr.txt(chrome.i18n.getMessage('help'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{href:"credits.html"},[
		Cr.txt(chrome.i18n.getMessage('credits'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{href:"sponsors.html"},[
		Cr.txt(chrome.i18n.getMessage('sponsors'))
	]),
	Cr.elm("br",{}),
	Cr.ent(chrome.i18n.getMessage('extName')+" &copy;"),
	Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
		Cr.txt("Vidsbee.com")
	]),
	Cr.elm('div',{'id':'rate_position'})
],document.body);

	createAndAttachRatings(document.getElementById('rate_position'));

	init();
	document.getElementById('bsave').addEventListener('click', save_options);
	document.getElementById('defa').addEventListener('click', reset_options);

	document.getElementById('shoadvanc').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('showopt').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('showhist').addEventListener('click', toggle_next_sibling_display);

	toggle_next_sibling_display({target:document.getElementById('showopt')});

	document.getElementById('bload').addEventListener('click', load_syncd_options);
	document.getElementById('cload').addEventListener('click', function(){
		storage.clear(function(){
			console.log('storage cleared... clear localStorage too for a full reset');
		});
	});

	document.body.style.opacity="1";
}

document.addEventListener('DOMContentLoaded', function () {
	createDOM();
});
