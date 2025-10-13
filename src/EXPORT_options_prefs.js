var storage = chrome.storage.sync || chrome.storage.local;
var plat3 = navigator.platform.substr(0,3).toLowerCase();
var isWindows=plat3=='win';
var isMac=plat3=='mac';
var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
var isChrome = navigator.userAgent.indexOf('Chrome/') > -1;
var isEdge = navigator.userAgent.indexOf('Edge') > -1;
if( isEdge ){
	isChrome = false;
}
var pOptions={};
var pAdvOptions={};
var pSyncItems={};

// some fallback code, tbd
if(typeof(localStorage)!='object'){
	var localStorage = {};
}

var extensionsKnown = {
	color_pick_tablet: (isChrome ? 'hobaclohjecibademehpakdcphmbodmb' : (isFirefox ? null : (isEdge ? null : null))),
	color_pick_tablet_url: (isChrome ? 'https://chrome.google.com/webstore/detail/color-pick-tablet-edition/hobaclohjecibademehpakdcphmbodmb' : (isFirefox ? null : (isEdge ? null : null)))
};

if( chrome.runtime.id != 'ohcpnigalekghcmgcdcenkpelffpdolg' ){ // development / test settings:
	if( chrome.runtime.id == 'cjfjdjekdbgjbapfnemckbacdmhaocgg'){
		extensionsKnown.color_pick_tablet = 'amlacjdajlinpfncappopgkheaooknbe';
	}else if( chrome.runtime.id == 'ljgenjiadmepdpgnhlpcmmebkiogngli' ){
		extensionsKnown.color_pick_tablet = 'kjgakcoopjnkaobapohfkipbkpnajocc';
	}
}


//WARNIGN you have to set defaults two places for now...
pOptions["pickEveryTime"]={def:false,ind:0,img:'img/icons/no-shadow/icon16.png'}; //default also set in popup.html
pOptions["closePopupOnTrigger"]={def:true,ind:0}; //default also set in popup.html
pOptions["pixelatedPreview"]={def:true,ind:0};
pOptions["allowWebGl"]={def:false,ind:1,img:'img/warning.png'};
pOptions["fishEye"]={def:5,ind:1,select:{1:'1 '+chrome.i18n.getMessage('minimum')+'/'+chrome.i18n.getMessage('off'),2:2,3:3,4:4,5:'5 '+chrome.i18n.getMessage('default'),6:6,7:7,8:8,9:'9 '+chrome.i18n.getMessage('full'),10:10,11:11,12:12,13:13,14:14,15:'15 '+chrome.i18n.getMessage('maxZoom')}};
pOptions["lessFishEye"]={def:false,ind:2};
pOptions["EnableHex"]={def:true,ind:0,css:'display:inline-block;'};
pOptions["EnableRGB"]={def:true,ind:0,css:'display:inline-block;margin-left:8px;'};
pOptions["EnableHSL"]={def:false,ind:0,css:'display:inline-block;margin-left:8px;'};
pOptions["showPreviewInContent"]={def:true,ind:0};
// pOptions["contSprevZoomd"]={def:true,ind:1};
pOptions["ShowRGBHSL"]={def:true,ind:1};
pOptions["autocopyhex"]={def:'false',ind:0,select:{'false':chrome.i18n.getMessage('off'),'true':'hexadecimal','rgb':'rgb','hsl':'hsl'}};

pOptions["guessColorName"]={def:true,ind:0};
pOptions["guessColorNameInPage"]={def:false,ind:1};

//pAdvOptions["customCalibration"]={def:false,ind:0,name:'Enable the defunct calibration link above.'};
pAdvOptions["usePNG"]={def:true,ind:0};
pAdvOptions["useCSSValues"]={def:true,ind:0};
pAdvOptions["CSS3ColorFormat"]={def:'(#1,#2,#3)',ind:1,ifEmptyReset:true};
pAdvOptions["supportColorInputs"]={def:isMac?false:true,ind:0,img:'img/icon16.png'};

pAdvOptions["snapMode"]={def:true,ind:0};
pAdvOptions["snapModeBlock"]={def:'chrome://(newtab|extensions|settings|downloads|bookmarks)|chrome://about',ind:1,size:15};
pAdvOptions["snapModeCloseTab"]={def:true,ind:1};
pAdvOptions["cacheSnapshots"]={def:false,ind:1};

pAdvOptions["hexIsLowerCase"]={def:false,ind:0};
pAdvOptions["hexHasHash"]={def:false,ind:0};
pAdvOptions["oldHistoryFirst"]={def:false,ind:0};
//pAdvOptions["iconIsPreview"]={def:false,ind:0,img:'img/opt_badge.png'};
pAdvOptions["appleIcon"]={def:false,ind:0,img:'img/apple/icon16.png'};
pAdvOptions["iconIsBitmap"]={def:false,ind:0,img:'img/icon_pixel.png'};
pAdvOptions["resetIcon"]={def:true,ind:1};
pAdvOptions["bbackgroundColor"]={def:'#FFF',ind:0};
pAdvOptions["usePrevColorBG"]={def:false,ind:1};
pAdvOptions["showPreviousClr"]={def:true,ind:0};
pAdvOptions["borderValue"]={def:'1px solid grey',ind:0};

pAdvOptions["popupWaitTimeout"]={def:2000,ind:0};
pAdvOptions["snapWaitTimeout"]={def:6000,ind:0};
pAdvOptions["controlsHiddenDelay"]={def:10,ind:1,select:{1:'1',10:'10 '+chrome.i18n.getMessage('default'),20:20,35:35,50:50,100:100,255:255}};

pAdvOptions["confirmEmptyPalleteWhenLeaving"]={def:false,ind:0};
pAdvOptions["hideWatermark"]={def:false,ind:0};

//pOptions["localflScalePix"]={def:false,ind:1,name:'Local Flash Scale Pixel? (read help)'};
//pAdvOptions["showActualPickTarget"]={def:true,ind:0,name:'ShowActualPickTarget - Freeze Screen when Picking.  Also useful when ColorAccuracyOverPrecision checked, you see the image you\'re picking from instead of the webpage.'};
//pAdvOptions["clrAccuracyOverPrecision"]={def:false,ind:0,name:'ColorAccuracyOverPrecision - Never scale screenshot.  Improves color accuracy sometimes (rarely) but decreases location accuracy.  Negative: possibly inaccessible page locations.'};
//pAdvOptions["autoRedirectPickable"]={def:false,ind:0,name:'Automatically redirect to a pickable version when unavailable (no longer useful!)'};
//pAdvOptions["redirectSameWindow"]={def:false,ind:1,name:'Use the same window (warning: you may lose form data)'};
pOptions["hasAgreedToLicense"]={def:false,ind:0,css:'display:none;'};
pOptions["usageStatistics"]={def:false,ind:0};
pOptions["shareClors"]={def:false,ind:0};
pOptions["disableUninstallSurvey"]={def:false,ind:0};
pSyncItems["syncColorHistory"]={def:''};
pSyncItems["reg_chk"]={def:false};
pSyncItems["reg_hash"]={def:""};
pSyncItems["reg_name"]={def:""};
pSyncItems["reg_inapp"]={def:false};

function formatColorValues(a,b,c,pcta,pctb,pctc){
	return formatColorValuesWith(CSS3ColorFormat,a,b,c,pcta,pctb,pctc);
}

function formatColorValuesWith(fmt,a,b,c,pcta,pctb,pctc){
	return fmt.replace('#1',a/*+(pcta?'%':'')*/).replace('#2',b+(pctb?'%':'')).replace('#3',c+(pctc?'%':''));
}

var colorNamesSrc = [{"r":25,"g":25,"b":112,"n":"midnightblue","h":"191970"},{"r":102,"g":51,"b":153,"n":"rebeccapurple","h":"663399"},{"r":105,"g":105,"b":105,"n":"dimgray dimgrey","h":"696969"},{"r":112,"g":128,"b":144,"n":"slategray slategrey","h":"708090"},{"r":119,"g":136,"b":153,"n":"lightslategray lightslategrey","h":"778899"},{"r":128,"g":0,"b":0,"n":"maroon","h":"800000"},{"r":128,"g":0,"b":128,"n":"purple","h":"800080"},{"r":128,"g":128,"b":0,"n":"olive","h":"808000"},{"r":128,"g":128,"b":128,"n":"grey gray","h":"808080"},{"r":0,"g":0,"b":0,"n":"black","h":"000000"},{"r":192,"g":192,"b":192,"n":"silver","h":"c0c0c0"},{"r":255,"g":255,"b":255,"n":"white","h":"ffffff"},{"r":255,"g":0,"b":0,"n":"red","h":"ff0000"},{"r":255,"g":0,"b":255,"n":"magenta fuchsia","h":"ff00ff"},{"r":0,"g":128,"b":0,"n":"green","h":"008000"},{"r":0,"g":255,"b":0,"n":"lime","h":"00ff00"},{"r":255,"g":255,"b":0,"n":"yellow","h":"ffff00"},{"r":0,"g":0,"b":128,"n":"navy","h":"000080"},{"r":0,"g":0,"b":255,"n":"blue","h":"0000ff"},{"r":0,"g":128,"b":128,"n":"teal","h":"008080"},{"r":0,"g":255,"b":255,"n":"cyan aqua","h":"00ffff"},{"r":240,"g":248,"b":255,"n":"aliceblue","h":"f0f8ff"},{"r":250,"g":235,"b":215,"n":"antiquewhite","h":"faebd7"},{"r":127,"g":255,"b":212,"n":"aquamarine","h":"7fffd4"},{"r":240,"g":255,"b":255,"n":"azure","h":"f0ffff"},{"r":245,"g":245,"b":220,"n":"beige","h":"f5f5dc"},{"r":255,"g":228,"b":196,"n":"bisque","h":"ffe4c4"},{"r":255,"g":235,"b":205,"n":"blanchedalmond","h":"ffebcd"},{"r":138,"g":43,"b":226,"n":"blueviolet","h":"8a2be2"},{"r":165,"g":42,"b":42,"n":"brown","h":"a52a2a"},{"r":222,"g":184,"b":135,"n":"burlywood","h":"deb887"},{"r":95,"g":158,"b":160,"n":"cadetblue","h":"5f9ea0"},{"r":127,"g":255,"b":0,"n":"chartreuse","h":"7fff00"},{"r":210,"g":105,"b":30,"n":"chocolate","h":"d2691e"},{"r":255,"g":127,"b":80,"n":"coral","h":"ff7f50"},{"r":100,"g":149,"b":237,"n":"cornflowerblue","h":"6495ed"},{"r":255,"g":248,"b":220,"n":"cornsilk","h":"fff8dc"},{"r":220,"g":20,"b":60,"n":"crimson","h":"dc143c"},{"r":0,"g":0,"b":139,"n":"darkblue","h":"00008b"},{"r":0,"g":139,"b":139,"n":"darkcyan","h":"008b8b"},{"r":184,"g":134,"b":11,"n":"darkgoldenrod","h":"b8860b"},{"r":169,"g":169,"b":169,"n":"darkgrey","h":"a9a9a9"},{"r":0,"g":100,"b":0,"n":"darkgreen","h":"006400"},{"r":189,"g":183,"b":107,"n":"darkkhaki","h":"bdb76b"},{"r":139,"g":0,"b":139,"n":"darkmagenta","h":"8b008b"},{"r":85,"g":107,"b":47,"n":"darkolivegreen","h":"556b2f"},{"r":255,"g":140,"b":0,"n":"darkorange","h":"ff8c00"},{"r":153,"g":50,"b":204,"n":"darkorchid","h":"9932cc"},{"r":139,"g":0,"b":0,"n":"darkred","h":"8b0000"},{"r":233,"g":150,"b":122,"n":"darksalmon","h":"e9967a"},{"r":143,"g":188,"b":143,"n":"darkseagreen","h":"8fbc8f"},{"r":72,"g":61,"b":139,"n":"darkslateblue","h":"483d8b"},{"r":47,"g":79,"b":79,"n":"darkslategray darkslategrey","h":"2f4f4f"},{"r":0,"g":206,"b":209,"n":"darkturquoise","h":"00ced1"},{"r":148,"g":0,"b":211,"n":"darkviolet","h":"9400d3"},{"r":255,"g":20,"b":147,"n":"deeppink","h":"ff1493"},{"r":0,"g":191,"b":255,"n":"deepskyblue","h":"00bfff"},{"r":30,"g":144,"b":255,"n":"dodgerblue","h":"1e90ff"},{"r":178,"g":34,"b":34,"n":"firebrick","h":"b22222"},{"r":255,"g":250,"b":240,"n":"floralwhite","h":"fffaf0"},{"r":34,"g":139,"b":34,"n":"forestgreen","h":"228b22"},{"r":220,"g":220,"b":220,"n":"gainsboro","h":"dcdcdc"},{"r":248,"g":248,"b":255,"n":"ghostwhite","h":"f8f8ff"},{"r":255,"g":215,"b":0,"n":"gold","h":"ffd700"},{"r":218,"g":165,"b":32,"n":"goldenrod","h":"daa520"},{"r":173,"g":255,"b":47,"n":"greenyellow","h":"adff2f"},{"r":240,"g":255,"b":240,"n":"honeydew","h":"f0fff0"},{"r":255,"g":105,"b":180,"n":"hotpink","h":"ff69b4"},{"r":205,"g":92,"b":92,"n":"indianred","h":"cd5c5c"},{"r":75,"g":0,"b":130,"n":"indigo","h":"4b0082"},{"r":255,"g":255,"b":240,"n":"ivory","h":"fffff0"},{"r":240,"g":230,"b":140,"n":"khaki","h":"f0e68c"},{"r":230,"g":230,"b":250,"n":"lavender","h":"e6e6fa"},{"r":255,"g":240,"b":245,"n":"lavenderblush","h":"fff0f5"},{"r":124,"g":252,"b":0,"n":"lawngreen","h":"7cfc00"},{"r":255,"g":250,"b":205,"n":"lemonchiffon","h":"fffacd"},{"r":173,"g":216,"b":230,"n":"lightblue","h":"add8e6"},{"r":240,"g":128,"b":128,"n":"lightcoral","h":"f08080"},{"r":224,"g":255,"b":255,"n":"lightcyan","h":"e0ffff"},{"r":250,"g":250,"b":210,"n":"lightgoldenrodyellow","h":"fafad2"},{"r":211,"g":211,"b":211,"n":"lightgray lightgrey","h":"d3d3d3"},{"r":144,"g":238,"b":144,"n":"lightgreen","h":"90ee90"},{"r":255,"g":182,"b":193,"n":"lightpink","h":"ffb6c1"},{"r":255,"g":160,"b":122,"n":"lightsalmon","h":"ffa07a"},{"r":32,"g":178,"b":170,"n":"lightseagreen","h":"20b2aa"},{"r":135,"g":206,"b":250,"n":"lightskyblue","h":"87cefa"},{"r":176,"g":196,"b":222,"n":"lightsteelblue","h":"b0c4de"},{"r":255,"g":255,"b":224,"n":"lightyellow","h":"ffffe0"},{"r":50,"g":205,"b":50,"n":"limegreen","h":"32cd32"},{"r":250,"g":240,"b":230,"n":"linen","h":"faf0e6"},{"r":102,"g":205,"b":170,"n":"mediumaquamarine","h":"66cdaa"},{"r":0,"g":0,"b":205,"n":"mediumblue","h":"0000cd"},{"r":186,"g":85,"b":211,"n":"mediumorchid","h":"ba55d3"},{"r":147,"g":112,"b":219,"n":"mediumpurple","h":"9370db"},{"r":60,"g":179,"b":113,"n":"mediumseagreen","h":"3cb371"},{"r":123,"g":104,"b":238,"n":"mediumslateblue","h":"7b68ee"},{"r":0,"g":250,"b":154,"n":"mediumspringgreen","h":"00fa9a"},{"r":72,"g":209,"b":204,"n":"mediumturquoise","h":"48d1cc"},{"r":199,"g":21,"b":133,"n":"mediumvioletred","h":"c71585"},{"r":245,"g":255,"b":250,"n":"mintcream","h":"f5fffa"},{"r":255,"g":228,"b":225,"n":"mistyrose","h":"ffe4e1"},{"r":255,"g":228,"b":181,"n":"moccasin","h":"ffe4b5"},{"r":255,"g":222,"b":173,"n":"navajowhite","h":"ffdead"},{"r":253,"g":245,"b":230,"n":"oldlace","h":"fdf5e6"},{"r":107,"g":142,"b":35,"n":"olivedrab","h":"6b8e23"},{"r":255,"g":165,"b":0,"n":"orange","h":"ffa500"},{"r":255,"g":69,"b":0,"n":"orangered","h":"ff4500"},{"r":218,"g":112,"b":214,"n":"orchid","h":"da70d6"},{"r":238,"g":232,"b":170,"n":"palegoldenrod","h":"eee8aa"},{"r":152,"g":251,"b":152,"n":"palegreen","h":"98fb98"},{"r":175,"g":238,"b":238,"n":"paleturquoise","h":"afeeee"},{"r":219,"g":112,"b":147,"n":"palevioletred","h":"db7093"},{"r":255,"g":239,"b":213,"n":"papayawhip","h":"ffefd5"},{"r":255,"g":218,"b":185,"n":"peachpuff","h":"ffdab9"},{"r":205,"g":133,"b":63,"n":"peru","h":"cd853f"},{"r":255,"g":192,"b":203,"n":"pink","h":"ffc0cb"},{"r":221,"g":160,"b":221,"n":"plum","h":"dda0dd"},{"r":176,"g":224,"b":230,"n":"powderblue","h":"b0e0e6"},{"r":188,"g":143,"b":143,"n":"rosybrown","h":"bc8f8f"},{"r":65,"g":105,"b":225,"n":"royalblue","h":"4169e1"},{"r":139,"g":69,"b":19,"n":"saddlebrown","h":"8b4513"},{"r":250,"g":128,"b":114,"n":"salmon","h":"fa8072"},{"r":244,"g":164,"b":96,"n":"sandybrown","h":"f4a460"},{"r":46,"g":139,"b":87,"n":"seagreen","h":"2e8b57"},{"r":255,"g":245,"b":238,"n":"seashell","h":"fff5ee"},{"r":160,"g":82,"b":45,"n":"sienna","h":"a0522d"},{"r":135,"g":206,"b":235,"n":"skyblue","h":"87ceeb"},{"r":106,"g":90,"b":205,"n":"slateblue","h":"6a5acd"},{"r":255,"g":250,"b":250,"n":"snow","h":"fffafa"},{"r":0,"g":255,"b":127,"n":"springgreen","h":"00ff7f"},{"r":70,"g":130,"b":180,"n":"steelblue","h":"4682b4"},{"r":210,"g":180,"b":140,"n":"tan","h":"d2b48c"},{"r":216,"g":191,"b":216,"n":"thistle","h":"d8bfd8"},{"r":255,"g":99,"b":71,"n":"tomato","h":"ff6347"},{"r":64,"g":224,"b":208,"n":"turquoise","h":"40e0d0"},{"r":238,"g":130,"b":238,"n":"violet","h":"ee82ee"},{"r":245,"g":222,"b":179,"n":"wheat","h":"f5deb3"},{"r":245,"g":245,"b":245,"n":"whitesmoke","h":"f5f5f5"},{"r":154,"g":205,"b":50,"n":"yellowgreen","h":"9acd32"}];

function namesForColor(search_rgb, max){
	// perf test this
	var cns=null, sr,sg,sb, d = 0;
	sr=search_rgb.r;
	sg=search_rgb.g;
	sb=search_rgb.b;
	var rsl=[];
	for(var cx=0,cl=colorNamesSrc.length; cx<cl; cx++){
		cns = colorNamesSrc[cx];
		d = Math.sqrt(Math.pow(cns.r - sr, 2) + Math.pow(cns.g - sg, 2) + Math.pow(cns.b - sb, 2));
		rsl.push({d:d, r: cns});
	}
	rsl = rsl.sort(function(a, b){return a.d-b.d});
	return rsl.slice(0,max||5);
}

// this helper avoids new tabs when they already exist...
function navTo(ev, html){
	chrome.runtime.sendMessage({goToOrVisitTab:html}, function(r){});
	ev.preventDefault();
}

function navToHelp(ev){
	navTo(ev, 'help.html');
}

function navToDesktop(ev){
	navTo(ev, 'desktop_app.html');
}

function navToMobile(ev){
	navTo(ev, 'mobile_app.html');
}

function navToReg(ev){
	navTo(ev, 'register.html');
}

function navToAmz(ev){
	navTo(ev, 'https://www.amazon.com?tag=colorpick01-20');
}

function navToOptions(ev){
	if( ev.target && ev.target.closest('a') && ev.target.closest('a').href.match(/options.html\?/) ){
		navTo(ev, ev.target.closest('a').href.match(/options.html\?([\w=&]+)/)[0]); // send query params if present on link
	}else{
		navTo(ev, 'options.html');
	}
}

function navToHistory(ev){
	navTo(ev, 'options.html?history');
}

function navToPallete(ev, addColor){ // probably unused
	navTo(ev, 'options.html?palette' + (addColor ? '='+addColor : ''));
}

function iloadPref(results, i, obj, pOptions){
	if(typeof(pOptions[i].def)=='boolean'){
		results[i] = ((obj[i]=='true')?true:((obj[i]=='false')?false:pOptions[i].def));
	}else if(typeof(pOptions[i].def)=='number'){
		results[i] = (!obj[i] || isNaN(obj[i] - 0)) ? pOptions[i].def : obj[i] - 0;
	}else{
		results[i] = ((obj[i])?obj[i]:((obj[i]==='' && !pOptions[i].ifEmptyReset)?obj[i]:pOptions[i].def));
	}
}

function loadPrefsFromStorage(results, cbf){
	storage.get(null, function(obj) {
		if(chrome.runtime.lastError)console.log(chrome.runtime.lastError.message);
		loadPrefsFromLocalStorage(results, cbf, obj || {})
	});
}

function loadPrefsFromLocalStorage(results, cbf, override){
	var i;
	for(i in pOptions){iloadPref(results, i, override || localStorage, pOptions);}
	for(i in pAdvOptions){iloadPref(results, i, override || localStorage, pAdvOptions);}
	for(i in pSyncItems){iloadPref(results, i, override || localStorage, pSyncItems);}
	if(typeof(cbf)=='function')cbf();
}

//run build_exports.sh to create EXPORT_<file>.js
export { storage, plat3, isWindows, isMac, isFirefox, isChrome, isEdge, pOptions, pAdvOptions, pSyncItems, extensionsKnown, formatColorValues, formatColorValuesWith, navTo, navToHelp, navToDesktop, navToMobile, navToReg, navToAmz, navToOptions, navToHistory, navToPallete, loadPrefsFromStorage, loadPrefsFromLocalStorage }
