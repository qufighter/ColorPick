var _ext_homepage="https://chrome.google.com/webstore/detail/color-picker/ohcpnigalekghcmgcdcenkpelffpdolg";
if( isFirefox ){
	_ext_homepage="https://addons.mozilla.org/en-US/firefox/addon/colorpick-eyedropper/";
}else if( isEdge ){
	_ext_homepage="https://microsoftedge.microsoft.com/addons/detail/colorpick-eyedropper/pieiiifgcmhldgbniafejdimnjnjcgfo";
}
var nbsp='\u00A0';
var infoicon='\u24D8';
var dirMap;

if( isWindows ){
	infoicon='\uD83D\uDEC8';
};

var instanceId = (new Date().getTime()) + '_' + Math.floor(Math.random() * 65535);

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
function show_next_sibling(n){
	if(n.nextSibling.style.display!='block') toggle_next_sibling_display({target:n});
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
	var oldHistoryOrder = localStorage['oldHistoryFirst'];

	var smb = document.getElementById('snapModeBlock');
	smb.value = smb.value.replace(/^\||\|$/g,''); // leading/trailing bars match everything and result in blocked everywhere...

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

  if( oldHistoryOrder != localStorage['oldHistoryFirst'] ){
	load_history();
  }
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
			document.getElementById(i).value = ((localStorage[i] || localStorage[i] === '')?localStorage[i]:pOptions[i].def);
	}
	
	for(i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pAdvOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i] || localStorage[i] === '')?localStorage[i]:pAdvOptions[i].def);
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
        h: Math.round(h * 360), // MAYBE 360 should become 0 ??
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

// found in 4096wheel.js, adapted for needs, fixed vars and structure somewhat, input 0-100???, fixed bug with 360
// HSV conversion algorithm adapted from easyrgb.com
function hsv2rgb(Hdeg,S,V) {
	var R,G,B,var_r,var_g,var_b;
	var H = Hdeg/360.0;		// convert from to 0 to 1
	S = S / 100.0;
	V = V / 100.0;
	if (S==0) {				// HSV values = From 0 to 1
		var_r = V;			// RGB results = From 0 to 255
		var_g = V;
		var_b = V;
	}else{
		var var_h = H*6;
		var var_i = Math.floor( var_h );
		var var_1 = V*(1-S);
		var var_2 = V*(1-S*(var_h-var_i));
		var var_3 = V*(1-S*(1-(var_h-var_i)));
		var_i = var_i % 6; //	360 == 0
		if (var_i==0)      {var_r=V ;    var_g=var_3; var_b=var_1}
		else if (var_i==1) {var_r=var_2; var_g=V;     var_b=var_1}
		else if (var_i==2) {var_r=var_1; var_g=V;     var_b=var_3}
		else if (var_i==3) {var_r=var_1; var_g=var_2; var_b=V    }
		else if (var_i==4) {var_r=var_3; var_g=var_1; var_b=V    }
		else               {var_r=V;     var_g=var_1; var_b=var_2}
	}
	R = Math.round(var_r*255);	//RGB results = From 0 to 255
	G = Math.round(var_g*255);
	B = Math.round(var_b*255);
	return {r: R, g: G, b: B};
}

function test_rgb2hsv_to_hsv2rgb(){ // 16777216 total possible rgb colors
	var matched=0;
	var mismatched = 0;
	var wayMismatched = 0;
	var errPct = 0;
	for( var r=0; r<256; r++ ){
		for( var g=0; g<256; g++ ){
			for( var b=0; b<256; b++ ){
				var hsv = rgb2hsv(r,g,b);
				var rgb = hsv2rgb(hsv.h, hsv.s, hsv.v);
				if( rgb.r == r && rgb.g == g && rgb.b == b ){
					matched++;
				}else{
					var thisErrPct = Math.abs(rgb.r - r) + Math.abs(rgb.g - g) + Math.abs(rgb.b - b);
					errPct += thisErrPct;
					if( thisErrPct > 5 ){
						wayMismatched++;
						// // most of the ones > 15 off are also > 128 off... we should look at some of the more extreme cases more closely ! (this issue was fixed, 360~==0)
						Cr.elm('div',{},[
							Cr.elm('div', {style:'display:inline-block;background-color:rgb('+r    +','+g    +','+b    +');width:150px;height:50px;'}),
							Cr.elm('div', {style:'display:inline-block;background-color:rgb('+rgb.r+','+rgb.g+','+rgb.b+');width:150px;height:50px;'}),
							Cr.txt(' R: '),
							Cr.txt((rgb.r - r)),
							Cr.txt(' G: '),
							Cr.txt((rgb.g - g)),
							Cr.txt(' B: '),
							Cr.txt((rgb.b - b)),
							Cr.txt(' H: '),
							Cr.txt(hsv.h),
						], document.body);
					}
					mismatched++;
				}
			}
		}
	}
	var total = matched + mismatched;
	// errPct = (errPct / (mismatched * 255 * 3) );
	console.log('ints offset', errPct);
	errPct = (errPct / (total * 255 * 3) );
	console.log(" tested ", total, " and found ", matched, "matched and", mismatched, " mismatched and ", wayMismatched, " wayMismatched with error percentage (0-1) computed as ", errPct, " or " , errPct * 100, '% innaccurate');
	// the result colors are off by 3/10 of one percent when they are off
	// the result colors are off by 2/10 of one percent overall
}

function rgbObjMismatch(a, b){
	return a.r != b.r || a.g != b.g || a.b != b.b;
}

function clear_history(ev){
	if(confirm( chrome.i18n.getMessage('clear') + ' ' + chrome.i18n.getMessage('history') + '\n' + chrome.i18n.getMessage('deleteConfirm'))){
		// first we will cache this history for "undo"
		var exiHisInner=document.getElementById('historyInner');
		if( exiHisInner ){
			addUndo({ // in the process of fragment creation, history is cleared
				removed: Cr.frag(Array.prototype.slice.call(exiHisInner.getElementsByClassName('clickSwatch'))),
				parent: exiHisInner,
				before: exiHisInner.firstChild, // the remaining node or null
				processUndo: persist_history_state
			});
		}
		localStorage['colorPickHistory']=''; // cheap persist_history_state
		inform_history_update();
		sendReloadPrefs();
	}
}

function inform_history_update(){
	chrome.runtime.sendMessage({historypush:true, fromoptions:instanceId}, function(response){});
}

function persist_history_state(){
	var exiHisInner=document.getElementById('historyInner');
	var histories = exiHisInner.getElementsByClassName('clickSwatch');
	var toSave = [];
	if( histories.length ){
		if( localStorage['oldHistoryFirst'] != 'true' ){
			for( var h=histories.length-1; h>-1; h-- ){
				toSave.push(histories[h].getAttribute('name'));
			}
		}else{
			for( var h=0,hl=histories.length;h<hl;h++ ){
				toSave.push(histories[h].getAttribute('name'));
			}
		}
	}
	localStorage['colorPickHistory']=toSave.join('#');//.split('##').join('#');
	inform_history_update();
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
	deleteHistoryElementWithUndo(e.target.closest('.swatch'));
}

function colorMetaForHex(hex, associatedNode){
	hex = cleanHex(hex);
	var rgb = fromHexClr(hex)
	return {
		node: associatedNode,
		hex: hex,
		rgb: rgb,
		hsl: rgb2hsl(rgb.r,rgb.g,rgb.b),
		hsv: rgb2hsv(rgb.r,rgb.g,rgb.b)
	};
}

function currentSwatches(){
	//read node state
	var colors=[];
	var swHld = document.getElementById('swatches');
	var hexInp = swHld.getElementsByClassName('hex');
	for( var s=0,l=hexInp.length; s<l; s++){
		colors.push(colorMetaForHex(hexInp[s].value, hexInp[s].parentNode));
	}
	var exi=document.getElementById('palette-help');
	if(colors.length<1 && !exi){
		swHld.appendChild(Cr.elm('div', {id: 'palette-help',childNodes:[
			Cr.txt(chrome.i18n.getMessage('noSwatches'))
		]}));
		show_next_sibling(document.getElementById('showhist'));
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

function clearSwatches(){
	var swHld = document.getElementById('swatches');
	var colorElms = swHld.getElementsByClassName('hex');
	if( colorElms.length > 0 && !confirm(chrome.i18n.getMessage('clear') + ' ' + chrome.i18n.getMessage('palette') + '\n' + chrome.i18n.getMessage('deleteConfirm')) ){
		return;
	}
	Cr.empty(swHld);
	document.getElementById('clear-palette').style.display='none';
}

function dedupeSwatches(){
	var swHld = document.getElementById('swatches');
	var colors = currentSwatches();
	var found={};
	for( var c=0,l=colors.length; c<l; c++ ){
		if( found[colors[c].hex] ){
			swHld.removeChild(colors[c].node);
		}
		found[colors[c].hex] = true;
	}
	addOrRemovePalleteGenerationFeatureIf();
}

function swatchChanged(ev){
	ev.target.parentNode.style.backgroundColor=ev.target.value;
}

var dragMeta = {
	active: false,
	sourceObj: null,
	lastDest: null,
	sourceResetFn: null,
	setSource: function(src, startCb, endCb){
		this.sourceObj = src;
		if( startCb ) startCb(this);
		this.sourceResetFn = endCb || null;
	},
	resetDest: function(destResetFn){
		if( this.lastDest ){
			if( destResetFn ){
				destResetFn(this, this.lastDest);
			}
			this.lastDest = null;
		}
	},
	setDest: function(destElm, destChangeFn){
		this.resetDest();
		this.lastDest = destElm;
		if( destChangeFn ){
			destChangeFn(this, destElm);
		}
	},
	resetActive: function(){
		if( this.sourceResetFn ){
			this.sourceResetFn(this);
			this.sourceResetFn = null;
		}
	},
	reset: function(destResetFn){
		this.resetDest(destResetFn);
		this.active = false;
	},
	insertAfter: function(element, afterElm){ // todo: this belongs somewhere else
		if( afterElm.nextSibling ){
			afterElm.parentNode.insertBefore(element, afterElm.nextSibling);
		}else{
			afterElm.parentNode.appendChild(element);
		}
	}
}

function draggedOverPalleteSwatch(dragMeta, dest){
	dest.style.marginBottom = dragMeta.sourceObj.clientHeight + 'px';
}

function draggedOutPalleteSwatch(dragMeta, dest){
	dest.style.marginBottom = 0;
}

function swatchDragStart(ev){
	dragMeta.active = true;
	dragMeta.setSource(ev.target.closest('.swatch'),
		function(dragMeta){ // begin
			dragMeta.sourceObj.style.marginLeft='-10px';
			dragMeta.sourceObj.style.marginRight='10px';
		},
		function(dragMeta){ // end
			dragMeta.sourceObj.style.marginLeft=0;
			dragMeta.sourceObj.style.marginRight=0;
		}
	);
}

function swatchDragOverEntry(ev){
	dragMeta.setDest(ev.target.closest('.swatch'), draggedOverPalleteSwatch);
	ev.preventDefault();
	if( dragMeta.sourceObj.closest('.clickSwatch') ){
		ev.dataTransfer.dropEffect = "copy"
	}else{
		ev.dataTransfer.dropEffect = "move"
	}
}

function swatchDragOutEntry(ev){
	dragMeta.resetDest(draggedOutPalleteSwatch);
}

function swatchDroppedEntry(ev){
	if( dragMeta.active ){
		dragMeta.resetActive();
		if( dragMeta.lastDest && ev.type == 'drop' ){
			if( dragMeta.sourceObj.closest('.clickSwatch') ){
				// dragging from history to palette :)
				updateHistorySelection(dragMeta.sourceObj);
				dragMeta.sourceObj = createPalleteSwatch(dragMeta.sourceObj.getAttribute('name'), true);
			}
			var spacer = Cr.elm('div',{class:"swatch-spacer", style:"margin-bottom:" + dragMeta.sourceObj.clientHeight + 'px;'});
			dragMeta.insertAfter(spacer, dragMeta.sourceObj);
			setTimeout(function(){
				spacer.style.marginBottom = 0;
				setTimeout(function(){ spacer.remove(); }, 250);
			}, 0);
			dragMeta.insertAfter(dragMeta.sourceObj, dragMeta.lastDest);
			ev.preventDefault();
		}
	}
	dragMeta.reset(draggedOutPalleteSwatch);
}

function createPalleteSwatch(hex, append){
	var swHld = document.getElementById('swatches');
	if( hex.length == 6 ){ hex = '#'+hex; }
	hex = hex.toUpperCase();
	return Cr.elm('div',{class:'swatch',draggable:true,style:'background-color:'+hex+';',events:[['dragover', swatchDragOverEntry],['dragleave', swatchDragOutEntry],['drop', swatchDroppedEntry],['dragend', swatchDroppedEntry],['dragstart', swatchDragStart]]},[
		//Cr.elm('span',{style:'position:absolute;left:-40px;'},[ // for some reason breaks the events
			Cr.elm("a",{class:'palette-nav', style:'cursor:ns-resize;', },[Cr.txt('\u25CF ')]),
			Cr.elm("a",{class:'palette-nav', events:['click',moveUp]},[Cr.txt('\u25B3')]),
			Cr.elm("a",{class:'palette-nav', events:['click',moveDn]},[Cr.txt('\u25BD')]),
		//]),
		Cr.elm('input',{type:'text',value:hex,class:'hex',event:['change', swatchChanged]}),
		Cr.elm("a",{class:'palette-nav', title: chrome.i18n.getMessage('generate_palette'), events:['click',paletteForColorHex]},[Cr.txt('\u25B7')]),
		Cr.elm("img",{class:'close',draggable:false,align:'top',src:chrome.extension.getURL('img/close.png'),events:['click',removeSwatch]})
	], append ? swHld : null);
}

function addPalleteSwatch(hex){
	var newSwatch = createPalleteSwatch(hex, true);
	document.getElementById('clear-palette').style.display='';
	var exi=document.getElementById('palette-help');
	if(exi)exi.remove();
	addOrRemovePalleteGenerationFeatureIf();
	show_next_sibling(document.getElementById('showpalette'));
	return newSwatch;
}

function paletteForColorHex(ev){
	var hex = ev.target.parentNode.getElementsByClassName('hex');
	addOrRemovePalleteGenerationFeatureIf(hex[0]);
}

//TODO move this out and into paletteGenData ?? paletteGenHelpers ??
function selectOptionsForObject(modesObj, selectedValue, filterFunction){
	var filterFunction = filterFunction || function(){return true;}
	var sortedKeys = Object.keys(modesObj), options = [];
	sortedKeys.sort(function(a,b){
		return modesObj[a].order - modesObj[b].order;
	});
	for( var ik=0,lk=sortedKeys.length; ik<lk; ik++){
		var paletteKey = sortedKeys[ik];
		var paletteMeta = modesObj[paletteKey];
		if( filterFunction(paletteMeta) ){
			options.push(Cr.elm('option', {
				title: paletteMeta.info,
				order: paletteMeta.order,
				value: paletteKey,
				childNodes:[Cr.txt(paletteMeta.name)]
			}));
			if( selectedValue == paletteKey ){
				options[options.length -1].setAttribute('selected', 'selected');

			}
		}
	}
	return options;
}

function addOrRemovePalleteGenerationFeatureIf(pColorInput){
	var pgHld = document.getElementById('generate-palette-area');
	if( pgHld ){
		Cr.empty(pgHld);
		var swHld = document.getElementById('swatches');
		var colorElms = swHld.getElementsByClassName('hex');
		var colorInput = null;
		if( colorElms.length == 1 ){
			colorInput = colorElms[0];
		}else{
			colorInput = pColorInput;
		}
		if( colorInput ){
			var c = colorMetaForHex(colorInput.value);
			var options = selectOptionsForObject(paletteGenData.Modes, localStorage['lastPalleteMode']);
			var eliminatedToneKeys={};
			var toneOptions = selectOptionsForObject(paletteGenData.Tones, localStorage['lastPalleteTone'], function(pMeta){
				// when 2 or more transform of this type yield the SAME result....
				// we return false thus omitting this ineffective choice (the choice would genrate repeats (for any resultant hue angle))
				// first though check if our key contains a portion of any eliminated key, meaning this category is redundant...
				for( var key in eliminatedToneKeys ){
					if( pMeta.key.indexOf(key) > -1 ){
						// console.log('key eliminating,', pMeta.key, key);
						return false;
					}
				}
				var lastResult = {r:-1, g:-1, b:-1};
				for( var r=0,rl=pMeta.results.length; r<rl; r++ ){
					var rgbResult = rgbForPalleteTransform(c, {}, pMeta.results[r]);
					if( !rgbObjMismatch(lastResult, rgbResult) ){
						// console.log('eliminating,', pMeta, eliminatedToneKeys);
						eliminatedToneKeys[pMeta.key] = true;
						return false;
					}
					lastResult = rgbResult;
				}
				return true;
			});

			var holder=Cr.elm('div', {
				class: 'transitions',
				style: 'background-color:#999',
				childNodes: [
					Cr.txt(chrome.i18n.getMessage('generate_palette') + ' '),
					Cr.elm('span', {id:'palette-gen-selection', style: 'border:1px solid black;display:inline-block;width:1em;background-color:' + colorInput.value, title: colorInput.value, childNodes:[Cr.txt(nbsp)]}),
					Cr.txt(' '),
					Cr.elm('select', {
						id: 'palette-gen-mode',
						style: 'width:100px;',
						childNodes: options
					}),
					Cr.elm('span', {
						style: 'cursor:pointer',
						events:[
							['mouseover', function(ev){
								var s=ev.target.previousSibling;
								var selOpt = s.querySelector("[value="+s.value+"]");
								ev.target.title = selOpt.title || 'no additional info';
							}],
							['click', function(ev){
								var s=ev.target.previousSibling;
								var selOpt = s.querySelector("[value="+s.value+"]");
								s.style.border="1px solid red";
								setTimeout(function(){
									alert(selOpt.title || 'no additional info');
									s.style.border="";
								}, 10)
							}]
						],
						childNodes:[Cr.txt(' '+infoicon+' ')]
					}),
					Cr.elm('select', {
						id: 'palette-gen-tone',
						style: 'width:70px;',
						childNodes: toneOptions
					}),
					Cr.elm('span', {
						style: 'cursor:pointer',
						title: chrome.i18n.getMessage('palette_tone_gen_info'),
						events:[
							['click', function(ev){
								var s=ev.target.previousSibling;
								s.style.border="1px solid red";
								setTimeout(function(){
									alert(ev.target.title);
									s.style.border="";	
								}, 10)
							}]
						],
						childNodes:[Cr.txt(' '+infoicon+' ')]
					}),
					Cr.elm('input', {type:'button', value: chrome.i18n.getMessage('generate'), event: ['click', generatePalleteFromSwatchES]})
				]
			}, pgHld);
			setTimeout(function(){ holder.style.backgroundColor=''; }, 10);
			scrollIntoView(pgHld);
		}
	}
}

function scrollIntoView(elm){
	if( elm.scrollIntoViewIfNeeded ) elm.scrollIntoViewIfNeeded();
	else if( elm.scrollIntoView ) elm.scrollIntoView();
}

function rgbForPalleteTransform(origColor, hueResult, toneResult){
	var h = origColor.hsv.h, s = origColor.hsv.s, v = origColor.hsv.v;
	if( hueResult.angle ){
		h = ((h + hueResult.angle) + 360) % 360
	}
	if( toneResult.sat ){
		s = s * toneResult.sat;
		if( s > 100 ) s = 100;
	}
	if( toneResult.val ){
		v = v * toneResult.val;
		if( v > 100 ) v = 100;
	}
	return hsv2rgb(h,s,v);
}

function addPalleteEntry(origColor, hueResult, toneResult){
	var rgbResult = rgbForPalleteTransform(origColor, hueResult, toneResult);
	addPalleteSwatch( RGBtoHex(rgbResult.r, rgbResult.g, rgbResult.b) );
}

function generatePalleteFromSwatchES(){
	var palette_selection = document.getElementById('palette-gen-selection');
	var c = colorMetaForHex(palette_selection.title);
	var palette_mode = document.getElementById('palette-gen-mode').value;
	var palette_tone = document.getElementById('palette-gen-tone').value;
	localStorage['lastPalleteMode'] = palette_mode;
	localStorage['lastPalleteTone'] = palette_tone;
	var swHld = document.getElementById('swatches');
	var colorElms = swHld.getElementsByClassName('hex');
	var lastColorElm = colorElms && colorElms.length ? colorElms[colorElms.length - 1] : null;
	// console.log('clicked generate palette!', palette_mode, palette_tone, c);

	if( lastColorElm && lastColorElm.value != '#'+c.hex){
		addPalleteSwatch( c.hex ); // if the final color is not our start color, just add it automagically
	}
	var toneList,t,tl,toneResult;

	if( paletteGenData.Tones[palette_tone] ){
		toneList = paletteGenData.Tones[palette_tone].results;
		for( t=0,tl=toneList.length; t<tl; t++){
			toneResult = toneList[t];
			if( (toneResult.sat && toneResult.sat != 1.0) || (toneResult.val && toneResult.val != 1.0)  ){ // We already guarantee we have swatch entry above, so we handle any tonal or brightness modulations to the origional here
				addPalleteEntry(c, {}, toneResult);
			}
		}
	}else{
		console.error("paletteGenData.Tones", palette_tone, "Was UNDEFINED!");
	}

	if( paletteGenData.Modes[palette_mode] ){
		var toneList = paletteGenData.Tones[palette_tone].results;
		if( !toneList || !toneList.length ){ toneList = [{sat: 1.0}]; }
		for( var r=0,rl=paletteGenData.Modes[palette_mode].results.length; r<rl; r++){
			var result = paletteGenData.Modes[palette_mode].results[r];
			for( t=0,tl=toneList.length; t<tl; t++){
				toneResult = toneList[t];
				addPalleteEntry(c, result, toneResult);
			}
		}
	}else{
		console.error("paletteGenData.Modes", palette_mode, "Was UNDEFINED!");
		// to hsv and back to rgb.... pointelss!
		var rgbResult = hsv2rgb( c.hsv.h, c.hsv.s, c.hsv.v);
		addPalleteSwatch( RGBtoHex(rgbResult.r, rgbResult.g, rgbResult.b) );
	}
}

function historySwatchDragStart(ev){
	dragMeta.active = true;
	dragMeta.setSource(ev.target.closest('.clickSwatch'), null, null);
}

function historySwatchDragOverEntry(ev){
	dragMeta.setDest(ev.target, /*dest modify fn*/);
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "copy"
}

function historySwatchDragOutEntry(ev){
	dragMeta.resetDest( /*dest reset fn*/);
}

function historySwatchDroppedEntry(ev){
	if( dragMeta.active ){
		dragMeta.resetActive();
		if( dragMeta.lastDest && ev.type == 'drop' ){
			if( dragMeta.lastDest.closest('.drop-target').getAttribute('name') == 'trash' ){
				deleteHistoryElementWithUndo(dragMeta.sourceObj);
			}
			ev.preventDefault();
		}
	}
	dragMeta.reset();
}

function deleteHistoryElementWithUndo(removeObj){
	// this is for any drop on history trash, or alt click of history items
	// so these are not ALL history swatches that may be dropped here
	var source = removeObj.className;
	var persistenceHandler = null;
	if( source.indexOf('clickSwatch') > -1 ){
		persistenceHandler = persist_history_state;
	}
	addUndo({
		removed: removeObj,
		parent: removeObj.parentNode,
		before: removeObj.nextSibling,
		processUndo: persistenceHandler
	});

	removeObj.remove();
	if( persistenceHandler ){
		persistenceHandler();
	}
}

function hasUndo(){
	return history_undo_stack.length;
}

function addUndo(meta){
	history_undo_stack.push(meta);
	document.getElementById('hist-del-undo-btn').style.display='';
	document.getElementById('hist-del-undo-btn2').style.display='';
}

function applyUndo(ev){
	ev.stopPropagation();ev.preventDefault();
	if( hasUndo() ){
		var history_undo_item = history_undo_stack.pop();
		history_undo_item.parent.insertBefore(history_undo_item.removed, history_undo_item.before);
		if( history_undo_item.processUndo ){
			history_undo_item.processUndo();
		}
	}
	if( !hasUndo() ){
		document.getElementById('hist-del-undo-btn').style.display='none';
		document.getElementById('hist-del-undo-btn2').style.display='none';
	}
}

function addHistorySwatch(hex, help, where){
		if(!hex)return;
		Cr.elm('div', {
			draggable:true,
			events:[
				['dragend', historySwatchDroppedEntry],
				['dragstart', historySwatchDragStart]
			],
			class: 'clickSwatch',
			style: 'background-color:#'+hex+';',
			name: '#'+hex,
			title: '#'+hex+' '+help
		}, [], where);
}

function add_all_history(){
	var exiHisInner=document.getElementById('historyInner');
	if( exiHisInner ){
		var histories = exiHisInner.getElementsByClassName('clickSwatch'), tc;
		var swHld = document.getElementById('swatches');
		var paletteElms = swHld.getElementsByClassName('hex');
		if( histories.length > 1 && (paletteElms.length < 2 || confirm(chrome.i18n.getMessage('addAllConfirm').replace('%history_count%', histories.length).replace('%palette_count%', paletteElms.length))) ){
			for( var h=0,hl=histories.length;h<hl;h++ ){
				tc = histories[h].getAttribute('name');
				if( tc ) addPalleteSwatch(tc);
			}
		}
	}
}

var history_undo_stack = []; // a dom node gc nightmare, but nice solution
var lastHistorySelection = null;
function updateHistorySelection(newSelection){
	if( lastHistorySelection ) lastHistorySelection.classList.remove('last-selection');
	lastHistorySelection = newSelection;
	lastHistorySelection.classList.add('last-selection');
}


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
	var swatchHelp = chrome.i18n.getMessage('addToPalette');
	if( localStorage['oldHistoryFirst'] != 'true' ){
		for( var i=hist.length-1; i>-1; i-- ){
			addHistorySwatch(hist[i], swatchHelp, historyInner);
		}
	}else{
		for( var i=0; i<hist.length; i++ ){
			addHistorySwatch(hist[i], swatchHelp, historyInner);
		}
	}
	history_undo_stack = []; // since the nodes we base undo restoration on are largely re-created, we should clear undo when this occurs....
	Cr.elm('div', {
		style: 'text-align:center;padding-top:15px;',
		childNodes:[
			hist.length > 1 ? Cr.elm("a",{href:"#",style:"font-size:10px;float:left;",event:['click', clear_history]},[
				Cr.txt(chrome.i18n.getMessage('clear'))
			]) : 0,
			hist.length > 1 ? Cr.elm("a",{
				href:"#",
				style:"font-size:10px;display:inline-block;position:relative;",
				class: 'drop-target',
				name: 'trash',
				events:[
					['click', function(){alert(chrome.i18n.getMessage('trash_can') + "\n\n" + chrome.i18n.getMessage('trash_alt_click'))}],
					['dragover', historySwatchDragOverEntry],
					['dragleave', historySwatchDragOutEntry],
					['drop', historySwatchDroppedEntry],
				]
			},[
				Cr.elm('img',{style:'height:1.5em;',src:chrome.extension.getURL('img/trash.svg')}),
				Cr.elm('a', {
					id:'hist-del-undo-btn',
					style:'position:absolute;left:100%;top:0px;padding-left:5px;display:none;', // undo won't work (always) if we re-create this history area!!!!! so no point in this: '+(hasUndo()?'':'none'
					events:[['click', applyUndo]],
					childNodes:[Cr.txt(chrome.i18n.getMessage('undo'))]
				})
			]) : 0,
			hist.length > 2 ? Cr.elm("a",{href:"#",style:"font-size:10px;float:right;",event:['click', add_all_history]},[
				Cr.txt(chrome.i18n.getMessage('add_all'))
			]) : 0
		]
	}, historyInner);


	div_history.appendChild(historyInner);
	historyInner.scrollTop = scrollToUse;
	historyInner.addEventListener('click',function(ev){
		var tc=ev.target.getAttribute('name');
		if(tc){
			if( ev.altKey ){
				deleteHistoryElementWithUndo(ev.target.closest('.clickSwatch'));
			}else{
				addPalleteSwatch(tc);
				updateHistorySelection(ev.target);
				doc_keyup(ev); // in case of stuck alt key (switch tabs while holding alt)... could handle this on mouseover??
			}
		}
	},false);
	historyInner.addEventListener('mouseover',doc_keyup);

	Cr.elm('div', {
		style: dirMap.end+':-11px;top:0px;cursor:ew-resize;width:7px;height:100%;',
		class: 'hist_drag_sizer',
		event: ['mousedown', dragHist]
	}, [], div_history);

	Cr.elm('div', {
		style: 'bottom:-11px;left:0px;cursor:ns-resize;width:100%;height:7px;',
		class: 'hist_drag_sizer',
		event: ['mousedown', dragHistVrt]
	}, [], div_history);

	Cr.elm('div', {
		style: 'bottom:-11px;'+dirMap.end+':-11px;cursor:'+dirMap.endResize+'-resize;width:7px;height:7px;',
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
		his.style.width = dirMap.eventPageX(ev.pageX) - 28;
	}
	if(histReSizeVrt){
		hisInner.style.height = ev.pageY - his.offsetTop - 7;
		hisInner.style.maxHeight = 'none';
	}
	if( histReSizeVrt || histReSize ){
		updateSwatchSelectionMargins(his);
	}
}

function updateSwatchSelectionMargins(his){
	his = his || document.getElementById('history');
	var swhld = document.getElementById('swatch-holder');
	var left_base = 480;
	if( his.clientWidth > 400 && his.style.display!='none' ){
		if( 400 + (left_base + (his.clientWidth - 399)) > window.innerWidth ){
			swhld.style.marginTop = his.clientHeight + 50;
			swhld.style[dirMap.start] = left_base + 'px';
			swhld.style.width = '48%';
		}else{
			swhld.style[dirMap.start] = (left_base + (his.clientWidth - 399)) + 'px';//his.clientHeight + 50;
			swhld.style.marginTop = 0;
			swhld.style.width = '';
		}
	}else{
		swhld.style.marginTop = 0;
	}
}


var fourSpaces='\u00a0\u00a0\u00a0\u00a0';
function createOptions(piOptions, elemAppend){
	//needs some compression 
	var i, im, z, l, cb;
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
				im=document.createElement('img');
				im.setAttribute('src',t);
				im.setAttribute('align','top');
				im.setAttribute('width',16);
				l.appendChild(document.createTextNode(' '));
				l.appendChild(im);
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
			cb.setAttribute('id',i);cb.setAttribute('size',(piOptions[i].size || (piOptions[i].def + '').length));
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode(fourSpaces));
			l.appendChild(cb);
			l.appendChild(document.createTextNode(' '+piOptions[i].name));
			
			elemAppend.appendChild(l);
			//document.getElementById('bsave').parentNode.insertBefore(l,document.getElementById('bsave'));
			//document.getElementById(i).value = ((localStorage[i])?localStorage[i]:piOptions[i].def);
		}
		l.id = "label_" + i;
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.historypush){
		if( request.fromoptions && request.fromoptions == instanceId ){
			return sendResponse({}); // we never reach here normally, since sendMessage skips our own listener very nicely, but just in case we do not want to blast away the undo history for the active tab... there is a "better" way but involves fetching our sender's tab ID
		}
		if(typeof(fetchMainPrefs)=='function')fetchMainPrefs();
		else load_history(); // while there is the idea we can just push it on the left or right edge... since history may be changed by any number of different options windows.... at some point this needs to be sync'd (the deletions of history items)
		sendResponse({});
	}else if(request.reloadprefs){
		restore_options();
		sendResponse({});
	}
});

function safeGetVersion(){
	if( chrome.runtime.getManifest ){
		return ((chrome.runtime.getManifest() || {}).version) || 'null-version';
	}
	return 'no-version';
}

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
		document.getElementById('ifcotd').src='https://vidsbee.com/ColorPick/Daily/vcolors_ofday.php?embed=extensionOptions&version='+safeGetVersion();
	}else{
		cotd.style.display="none";
	}
}

function createDailyColorViewer(container){
	if( container.childNodes.length ) return;
	Cr.elm('div',{},[
		Cr.txt(chrome.i18n.getMessage('colorOfDay')),
		Cr.elm("br",{}),
		Cr.elm("iframe",{id:"ifcotd",src:"",scrolling:"no"})
	], container);
}

function confirmBeforeLeaving(){
	if( localStorage['confirmEmptyPalleteWhenLeaving'] == 'true' ){
		if( currentSwatches().length ){
			return "Don't leave just yet if you haven't saved your palette!";
		}
	}
}

var hasKeyClass = false;
function doc_keydown(ev){
	if( ev.altKey ){
		document.body.classList.add('alt-key');
		hasKeyClass=true;
	}
	if( ev.ctrlKey || ev.metaKey ){
		// todo: non platform agnostic
		if( ev.keyCode == 83){ // s for save
			ev.preventDefault();
			ev.stopPropagation();
			var ps = document.getElementById('print-swatches');
			if( ps.offsetHeight && document.getElementById('clear-palette').style.display!='none' ){
				printSwatches(ev);
				ps.click()
			}else{
				save_options(ev);
			}
		}
	}
}

function doc_keyup(ev){
	if( !ev.altKey ){
		if( hasKeyClass ){
			document.body.classList.remove('alt-key');
		}
		hasKeyClass = false;
	}
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
		Cr.elm("a",{href:"#",id:"showpalette",class:"toggleOpts"},[
			Cr.elm("img",{src:"img/expand.png"}),
			Cr.txt(chrome.i18n.getMessage('palette'))
		]),
		Cr.elm("div",{id:"palette", class:'indented-when-narrow-area'},[

			Cr.elm('div',{
				id:'clear-palette',
				style:'text-align:center;position:absolute;display:block;width:20%;margin-'+dirMap.start+':40%;display:none;',
				childNodes:[
					Cr.elm("a",{class:"swatchCtrl",event:['click',clearSwatches]},[Cr.txt(chrome.i18n.getMessage('clear').toLowerCase())]),
			]}),
			Cr.elm("a",{class:"swatchCtrl",event:['click',sortSwatches],style:''},[Cr.txt(chrome.i18n.getMessage('sort'))]),
			Cr.elm("a",{class:"swatchCtrl",event:['click',dedupeSwatches]},[Cr.txt(chrome.i18n.getMessage('dedupe'))]),
			Cr.elm('a', {
					id:'hist-del-undo-btn2',
					class:"swatchCtrl",
					style:'display:none;',
					events:[['click', applyUndo]],
					childNodes:[Cr.txt(chrome.i18n.getMessage('undo').toLowerCase())]
				}),
			Cr.elm("a",{class:"swatchCtrl",event:['click',printSwatches],style:'float:'+dirMap.end+';',target:'_blank',id:'print-swatches'},[Cr.txt(chrome.i18n.getMessage('printSave'))]),
			Cr.elm("div",{id:"swatches", style:'display:block;position:relative;'}),
			Cr.elm("div",{id:"generate-palette-area"})
		])
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
	Cr.elm("br"),
	Cr.elm("a",{target:"_blank",href:"desktop_app.html",event:['click', navToDesktop]},[
		Cr.txt('\uD83D\uDDA5 '),
		Cr.txt(chrome.i18n.getMessage('desktopapp'))
	]),
	Cr.txt(" | "),
	Cr.elm("a",{target:"_blank",href:"mobile_app.html",event:['click', navToMobile]},[
		Cr.txt('\uD83D\uDCF1 '),
		Cr.txt(chrome.i18n.getMessage('mobileapp'))
	]),

	extensionsKnown.color_pick_tablet_url ? Cr.elm('span',{id:'tablet-edition-install-link',childNodes:[
		Cr.txt(" | "),
		Cr.elm("a",{target:"_blank",href:extensionsKnown.color_pick_tablet_url},[
			Cr.txt('\uD83D\uDD0D '),
			Cr.txt(chrome.i18n.getMessage('tabletModePitch'))
		])
	]}) : 0,
	extensionsKnown.color_pick_tablet ? Cr.elm('span',{
		id:'tablet-edition-installed',
		event:['click', function(ev){
			goToOrOpenTab("chrome-extension://"+extensionsKnown.color_pick_tablet+"/options.html")
			ev.preventDefault();
		}],
		style:'display:none;',
		childNodes:[
			Cr.txt(" | "),
			Cr.elm("a",{target:"_blank",href:'chrome-extension://'+extensionsKnown.color_pick_tablet+'/options.html'},[
				Cr.txt('\uD83D\uDD0D '),
				Cr.txt(chrome.i18n.getMessage('tabletModePrompt'))
			])
	]}) : 0,
	Cr.elm("br",{}),
	Cr.elm('span',{'id':'rate_position'}),
	Cr.txt(' '+chrome.i18n.getMessage('extName')+" "+String.fromCharCode(169)),
	Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
		Cr.txt("Vidsbee.com")
	])

],document.body);

	createAndAttachRatings(document.getElementById('rate_position'));

	init();
	document.getElementById('bsave').addEventListener('click', save_options);
	document.getElementById('defa').addEventListener('click', reset_options);

	document.getElementById('shoadvanc').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('showopt').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('showhist').addEventListener('click', toggle_next_sibling_display);
	document.getElementById('showpalette').addEventListener('click', toggle_next_sibling_display);

	toggle_next_sibling_display({target:document.getElementById('showopt')});
	toggle_next_sibling_display({target:document.getElementById('showpalette')});

	document.getElementById('bload').addEventListener('click', load_syncd_options);
	document.getElementById('cload').addEventListener('click', function(){
		storage.clear(function(){
			console.log('storage cleared... clear localStorage too for a full reset');
		});
	});

	window.addEventListener('resize', function(){updateSwatchSelectionMargins(null)});

	document.body.addEventListener('keydown', doc_keydown);
	document.body.addEventListener('keyup', doc_keyup);

	document.body.style.opacity="1";

	if( extensionsKnown.color_pick_tablet ){
		chrome.runtime.sendMessage(extensionsKnown.color_pick_tablet, {testAvailable:true}, function(r) {
			if( !chrome.runtime.lastError && r ){
				document.getElementById('tablet-edition-install-link').style.display="none";
				document.getElementById('tablet-edition-installed').style.display="inline";
			}
		});
	}

	if( window.location.search ){
		var navHexSelection = window.location.search.match(/\?(history|palette)[=]?([\dA-f]{0,6})/);
		// test single arg ?history and also arg+val ?history=######
		if( navHexSelection ){
			var hex = (navHexSelection[2] || '').toUpperCase();
			if( navHexSelection[1] == 'history' ){
				show_next_sibling(document.getElementById('showhist'));
				var exiHisInner=document.getElementById('historyInner');
				if( exiHisInner ){
					var cur=exiHisInner.querySelector('.clickSwatch[name="#'+hex+'"]');
					if( cur ){
						updateHistorySelection(cur);
						addPalleteSwatch(hex);
					}
				}
			}else if( navHexSelection[1] == 'palette' ){
				show_next_sibling(document.getElementById('showpalette'));
				if( hex && hex.length == 6 ) addPalleteSwatch(hex);
			}
		}

		var reveal = window.location.search.match(/\?reveal[=]?(\w+)/);
		if( reveal.length > 1 ){
			var found = document.getElementById('label_'+reveal[1]);
			if( found ){
				found.style.border = '1px solid blue';
				if( !found.offsetHeight){
					show_next_sibling(document.getElementById('shoadvanc'));
				}
				setTimeout(function(){
					scrollIntoView(found);
				},250)
			}
		}

	}

	window.onbeforeunload = confirmBeforeLeaving;

	if( window.navigator.maxTouchPoints > 0 ){
		document.body.classList.add('touchy');
	}
}

document.addEventListener('DOMContentLoaded', function () {
	dirMap=detectDirection();
	createDOM();
});
