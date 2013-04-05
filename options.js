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
var pOptions=[];
var pAdvOptions=[];
//pOptions["maxhistory"]={def:15,ind:0,name:'Max History per Window '};
//pOptions["dothumbs"]={def:false,ind:0,name:'Collect Thumbnails'};
//pOptions["hqthumbs"]={def:false,ind:1,name:'HQ Thumbnails (more ram) '};

//WARNIGN you have to set defaults two places for now...
pOptions["pickEveryTime"]={def:true,ind:0,name:'Start picking each time colorpick button is clicked'}; //default false in popup.html
pOptions["pixelatedPreview"]={def:true,ind:0,name:'Zoomed preview is Pixelated Fish Eye'};
pOptions["fishEye"]={def:5,ind:1,name:'Fish Eye Amount ',select:{1:'1 Off',2:2,3:3,4:4,5:'5 default',6:6,7:7,8:8,9:'9 Full',10:10,11:11,12:12,13:13,14:14,15:'15 Max Zoomed'}};
pOptions["EnableRGB"]={def:true,ind:0,name:'Show RGB',css:'display:inline;'};
pOptions["EnableHSL"]={def:true,ind:0,name:'Show HSL',css:'display:inline;margin-left:35px;'};
pOptions["showPreviewInContentS"]={def:false,ind:0,name:'Show image preview near cursor while picking'};
pOptions["ShowRGBHSL"]={def:false,ind:1,name:'Show RGB and HSL on page too'};
pOptions["contSprevZoomd"]={def:true,ind:1,name:'Large size on page preview'};
pAdvOptions["customCalibration"]={def:false,ind:0,name:'Enable the defunct calibration link above.'};
pAdvOptions["usePNG"]={def:true,ind:0,name:'Use PNG quality when available'};
pAdvOptions["useCSSValues"]={def:true,ind:0,name:'Use CSS values for RGB/HSL'};
pAdvOptions["iconIsPreview"]={def:false,ind:0,name:'Use icon badge square color preview: ',img:'img/opt_badge.png'};
pAdvOptions["appleIcon"]={def:false,ind:0,name:'Use Apple Digital Color Meter logo: ',img:'img/apple/icon16.png'};
pAdvOptions["iconIsBitmap"]={def:false,ind:0,name:'Icon is zoomed colorpick pixel preview ',img:'img/icon_pixel.png'};
pAdvOptions["resetIcon"]={def:true,ind:1,name:'Back to normal icon when done'};
pAdvOptions["autocopyhex"]={def:false,ind:0,name:'Attempt auto-copy the hex to the clipboard'};
pAdvOptions["bbackgroundColor"]={def:'#FFF',ind:0,name:'Popup Background Color ("#FFFFFF" or "blue")'};
pAdvOptions["usePrevColorBG"]={def:false,ind:1,name:'Use Previous Color for Background Instead'};
pAdvOptions["showPreviousClr"]={def:true,ind:0,name:'Show Split color Preview with Previous Color'};
pAdvOptions["borderValue"]={def:'1px solid grey',ind:0,name:'Borders to use ("1px solid #000" or "none")'};
//pOptions["flashScalePix"]={def:false,ind:0,name:'Flash approximate Precision during Page Zoom (NOT recommended - use calibrate below instead)'};
//pOptions["localflScalePix"]={def:false,ind:1,name:'Local Flash Scale Pixel? (read help)'};
pAdvOptions["clrAccuracyOverPrecision"]={def:false,ind:0,name:'ColorAccuracyOverPrecision - Improves color accuracy but decreases location accuracy.  Negative: possibly inaccessible page locations.'};
pAdvOptions["showActualPickTarget"]={def:false,ind:0,name:'ShowActualPickTarget - Helps a great deal when the above is checked, you see the image you\'re picking from instead of the webpage.'};
//pAdvOptions["autoRedirectPickable"]={def:false,ind:0,name:'Automatically redirect to a pickable version when unavailable (no longer useful!)'};
//pAdvOptions["redirectSameWindow"]={def:false,ind:1,name:'Use the same window (warning: you may lose form data)'};
pOptions["hasAgreedToLicense"]={def:false,ind:0,name:'Has agreed to license Terms of Use',css:'display:none;'};
pOptions["usageStatistics"]={def:false,ind:0,name:'Gather Usage Statistics (See Terms of Use)'};
pOptions["shareClors"]={def:false,ind:0,name:'Color of the Day Statistics (See Terms of Use)'};

//pOptions["previewOnPage"]={def:false,ind:0,name:'On page zoomed preview'};

// Saves options to localStorage.
function save_options() {
//  var select = document.getElementById("color");
//  var color = select.children[select.selectedIndex].value;
//  localStorage["favorite_color"] = color;
  	
  	for( i in pOptions){
  		if(typeof(pOptions[i].def)=='boolean')
  			localStorage[i] = document.getElementById(i).checked;
  		else
  			localStorage[i] = document.getElementById(i).value;
  	}
	
	
		for( i in pAdvOptions){
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
		localStorage.removeItem("feedbackOptOut");
	}else{
		localStorage.feedbackOptOut = "true";
	}
	
	showRegistrationStatus();
	
  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
  
  sendReloadPrefs();
}

function sendReloadPrefs(){
	chrome.runtime.sendMessage({greeting: "reloadprefs"}, function(response) { });
}

function reset_options() {
	for( i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = pOptions[i].def;
		else
			document.getElementById(i).value = pOptions[i].def;
	}
	
	for( i in pAdvOptions){
		if(typeof(pAdvOptions[i].def)=='boolean')
			document.getElementById(i).checked = pAdvOptions[i].def;
		else
			document.getElementById(i).value = pAdvOptions[i].def;
	}
	
	var status = document.getElementById("status");
  status.innerHTML = "You still need to press save, defaults are showing now.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 3000);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
	for( i in pOptions){
		if(typeof(pOptions[i].def)=='boolean')
			document.getElementById(i).checked = ((localStorage[i]=='true')?true:((localStorage[i]=='false')?false:pOptions[i].def));
		else
			document.getElementById(i).value = ((localStorage[i])?localStorage[i]:pOptions[i].def);
	}
	
	for( i in pAdvOptions){
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
	localStorage['colorPickHistory']='';
	load_history();
}

function load_history(){
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
		if(tc)prompt('Copy the color value:',tc,tc);
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
		if(piOptions[i].select){
			var l=document.createElement('label');
			var cb=document.createElement('select');
			cb.setAttribute('type','select');
			cb.setAttribute('id',i);
			if(piOptions[i].ind>0)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			if(piOptions[i].ind>1)l.appendChild(document.createTextNode('\u00a0\u00a0\u00a0\u00a0'));
			l.appendChild(document.createTextNode(piOptions[i].name));
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
				i=document.createElement('image');
				i.setAttribute('src',t);
				i.setAttribute('align','top');
				i.setAttribute('width',16);
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
    	load_history();
    	sendResponse({});
    }
  });
  
function showRegistrationStatus(){
	if(localStorage['reg_chk']=='true' || localStorage['usageStatistics']=='true'){
		document.getElementById('reg_status').innerHTML="Registered";
		document.getElementById('reg_status').className='registered';
		if(localStorage['reg_chk']!='true') document.getElementById('reg_status').innerHTML="Approved";
	}else{
		document.getElementById('reg_status').innerHTML="Unregistered";
		document.getElementById('reg_status').className='unregistered';
	}

	if(localStorage['shareClors']=='true'){
		document.getElementById('cotd').style.display="block";
		document.getElementById('ifcotd').src='http://vidzbigger.com/vcolors_ofday.php';
	}else{
		document.getElementById('cotd').style.display="none";
	}
}
function toggle_next_sibling_display(ev){
	who=getEventTargetA(ev);
	var nss=who.nextSibling.style;
	var arr=who.firstChild;
	if(nss.display=='block'){
		nss.display='none';
		arr.src='img/expand.png';
	}else{
		nss.display='block';
		arr.src='img/expanded.png';
	}
	return preventEventDefault(ev);
}

document.addEventListener('DOMContentLoaded', function () {
	init()
	document.getElementById('bsave').addEventListener('click', save_options);
	document.getElementById('defa').addEventListener('click', reset_options);
	document.getElementById('clhist').addEventListener('click', clear_history);
	
	document.getElementById('shoadvanc').addEventListener('click', toggle_next_sibling_display);

});
