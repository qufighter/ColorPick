var suppress_connection_errors=false;
var registerdModeSku = 'colorpick_eyedropper_registered_mode';
var isChrome = window.navigator.userAgent.indexOf('Chrome/') > -1;
var searchQuery = window.location.search;
function gel(n){
	return document.getElementById(n);
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
	ev.returnValue=false;
	return false;
}
function toggle_next_sibling_display(ev){
	var who=getEventTargetA(ev);
	var nss=who.nextSibling.style;
	var arr=who.firstChild;
	var tes='block';
	if(who.nextSibling.className=='toInline')tes='inline';
	if(!arr || arr.nodeName != 'IMG')arr=new Image();
	if(nss.display==tes){
		nss.display='none';
		arr.src='img/expand.png';
	}else{
		nss.display=tes;
		arr.src='img/expanded.png';
	}
	return preventEventDefault(ev);
}
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return false;
}
function getXMLhttpObject(){
	return new XMLHttpRequest();
}
function set_registered(){
	Cr.empty(gel('license_status')).appendChild(Cr.txt(chrome.i18n.getMessage('registered')));
	gel('license_status').className='registered';
	gel('license_name').disabled=true;
	gel('license_key').disabled=true;
	gel('license_name').value = localStorage['reg_name'];
	gel('license_key').value='************************';
	gel('license_go').value=chrome.i18n.getMessage('modifyLicense');
	localStorage['reg_chk']=true;
	gel('examine').href='http://vidsbee.com/ColorPick/Upgrade?khash='+localStorage['reg_hash'];
}
function set_unregistered(){
	Cr.empty(gel('license_status')).appendChild(Cr.txt(chrome.i18n.getMessage('unregistered')));
	gel('license_status').className='unregistered';
	gel('license_name').disabled=false;
	gel('license_key').disabled=false;
	gel('license_go').value=chrome.i18n.getMessage('registerButton');
	localStorage['reg_chk']=false;
	gel('examine').href='http://vidsbee.com/ColorPick/Upgrade/';
}
function init(){
	if(localStorage['reg_chk']=='true'){
		set_registered();
		if(localStorage['reg_inapp']!='true'){
			suppress_connection_errors=true;
			VerifyHashToLicSrv(localStorage['reg_hash'],localStorage['reg_name']);
		}
	}else{
		if(localStorage['reg_hash'] && localStorage['reg_hash'].length == 40){
			VerifyHashToLicSrv(localStorage['reg_hash'],localStorage['reg_name']);
		}
	}
	suppress_connection_errors=false;
	if(getQueryVariable('k') && getQueryVariable('n')){
		gel('license_name').value=getQueryVariable('n');
		gel('license_key').value=getQueryVariable('k');
		license_go();
	}
}
function checkKey(){
	if(gel('license_key').value.length < 1)return keyResponse(false);
	gel('loading').style.display="inline";
	
	var kname=gel('license_name').value;
	var khash = CryptoJS.SHA1(gel('license_key').value + "ColorPick" + kname).toString();

	VerifyHashToLicSrv(khash,kname);
}

function VerifyHashToLicSrv(p_khash,p_kname){
	var khash=p_khash;
	var kname=p_kname;
	
	var xhr = getXMLhttpObject();
	//console.log(request.url +' '+ params);
	xhr.onreadystatechange=function(){if(xhr.readyState == 4){
		if(xhr.status==200){
			if(xhr.responseText == 'VERIFIED') keyResponse(true,khash,kname);
			else if(xhr.responseText == 'MAXIMUM_USE_EXCEEDED'){
				if(confirm(chrome.i18n.getMessage('licenseExceeded'))){
					window.location = 'http://vidsbee.com/ColorPick/Upgrade?khash='+localStorage['reg_hash'];
				}
				gel('loading').style.display='none';
			}else if(!suppress_connection_errors) keyResponse(false);
		}else{
			if(!suppress_connection_errors)
				alert(chrome.i18n.getMessage('licenseComError'));
			gel('loading').style.display='none';
		}
	}};
	xhr.open('GET', "http://vidsbee.com/key_chk.php?khash=" + khash, true);
	xhr.send();
}

function keyResponse(isValid,validHash,validName){
	setTimeout(function(){
		gel('loading').style.display='none';
	},250);
	if(isValid){
		localStorage['reg_hash']=validHash;
		localStorage['reg_name']=validName;
		set_registered();
		sendReloadPrefs();
	}else{
		set_unregistered();
	}
	saveSyncItemsToChromeSyncStorage();
}

function license_go(){
	
	
	if(localStorage['reg_chk']=='true' && localStorage['reg_inapp']!='true'){
		set_unregistered();
		gel('license_key').value='';
	}
	
	checkKey();
	
}

function chromeInapPurchaseSuccess(){
	var inAppBtnArea = gel('chrome-inapp');
	Cr.empty(inAppBtnArea);
	inAppBtnArea.appendChild(Cr.elm('span', {
		style: Cr.css({
			color: "black",
			'background-color': '#F7FFBF',
			'border-radius': '10px',
			border: '2px solid #FFE9B9',
			padding: '8px'
		}),
		childNodes: [
			Cr.txt('You have completed the in-app purchase to enable registered mode - thank you!  If the extension was not already in registered mode it will be placed into registered mode now.  Please refresh any other views to see the latest registration status.')
		]
	}));
	localStorage['reg_chk']='true';
	localStorage['reg_inapp']='true';
}

function chromeInappBuyBegin(){
	google.payments.inapp.buy({
		parameters: {env: (searchQuery.indexOf('useSandbox') > -1 ? 'TEST' : 'prod')},
		sku: registerdModeSku,
		success: chromeInapPurchaseSuccess,
		failure: getChromeInAppStatus
	});

}

function getChromeInAppStatus(){
	//var inAppArea = gel('chrome-inapp-reg');
	var inAppBtnArea = gel('chrome-inapp');

	google.payments.inapp.getSkuDetails({
		'parameters': {env: (searchQuery.indexOf('useSandbox') > -1 ? 'TEST' : 'prod')},
		success: function(resp){
			console.log('getSkuDetails - resp', resp);
		},
		failure: function(resp){
			console.log('getSkuDetails - failed', resp);
		}
	});

	google.payments.inapp.getPurchases({
		parameters: {env: (searchQuery.indexOf('useSandbox') > -1 ? 'TEST' : 'prod')},
		success: function(resp){
			console.log('inapp - check - resp', resp);
			var found = false;
			resp.response.details.forEach(function(purchase){
				if( purchase.sku == registerdModeSku){
					found = true;
				}
			});

			if( found ){
				chromeInapPurchaseSuccess();
			}else{
				Cr.empty(inAppBtnArea);
				inAppBtnArea.appendChild(Cr.elm('span', {
					style: Cr.css({
						color: "white",
						'font-weight': "bold",
						'background-color': '#6799CC',
						'border-radius': '10px',
						padding: '8px'
					}),
					events: Cr.evt('click', chromeInappBuyBegin),
					childNodes: [
						Cr.txt('Buy License')
					]
				}));
			}
		},
		failure: function(resp){
			console.log('inapp - check - failed', resp);
			Cr.empty(inAppBtnArea);
			inAppBtnArea.appendChild(Cr.elm('span', {
					childNodes: [
						Cr.txt('Purchases check failed.  You must sign into chrome to enable this feature.  Sorry some regions are not supported.')
					]
			}));
		}
	});
}

function createDOM(){
Cr.elm("div",{id:"mainbox"},[
	Cr.elm("h2",{},[
		Cr.elm("img",{src:"img/icon32.png",align:"bottom"}),
		Cr.txt("Color Picker for Google Chrome"),
		Cr.elm("br"),
		Cr.txt(" "),
		Cr.elm("span",{class:"subh",style:"left:42px;"},[
			Cr.ent("&copy; Vidsbee.com by Sam Larison")
		])
	]),
	Cr.txt("Color Pick is an Amazing Eye Dropper that allows precise selection of color values through it's one-of-a-kind zoomed preview!"),
	Cr.elm('div',{id:'chrome-inapp-reg', childNodes:[
		Cr.elm("h3",{},[
			Cr.txt("Register via In-App Purchase (Google Chrome only)")
		]),
		Cr.elm('div',{id:'chrome-inapp', childNodes:[
			Cr.elm("img",{src:"img/loading.gif",id:"indicator"}),
		]})
	]}),
	Cr.elm("h3",{},[
		Cr.txt("Register Color Picker")
	]),
	Cr.elm("div",{id:"license_status"},[
		Cr.txt("Enter License")
	]),
	Cr.elm("div",{id:"regDiv"},[
		Cr.txt("Name: "),
		Cr.elm("input",{type:"text",id:"license_name"}),
		Cr.elm("br"),
		Cr.txt("License Key: "),
		Cr.elm("input",{type:"text",id:"license_key"})
	]),
	Cr.elm("input",{type:"button",id:"license_go",value:"Register"}),
	Cr.txt(" "),
	Cr.elm("img",{src:"img/loading.gif",id:"loading"}),
	Cr.elm("a",{href:"javascript:;",id:"expandReginfo"},[
		Cr.elm("img",{src:"img/expand.png"})
	]),
	Cr.elm("small",{style:"display:none;"},[
		Cr.txt("License applies wherever else you sign into chrome."),
		Cr.elm("br"),
		Cr.txt("Upgrade your license; add & manage authorized hosts from the "),
		Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/Upgrade/",id:"examine"},[
			Cr.txt("License Manager")
		])
	]),
	Cr.elm("h3",{style:"margin-bottom:7px;"},[
		Cr.txt("Buy ColorPick License")
	]),
	Cr.elm("br"),
	Cr.elm("a",{style:"float:left;margin-right:20px;top:-10px;",class:"rounded",target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
		Cr.txt("Purchase License Key"),
		Cr.elm("br"),
		Cr.elm("img",{width:"130",height:"41",src:"img/paypal.png"})
	]),
	// Cr.elm("span",{style:"float:left;margin-right:12px;"},[
	// 	Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
	// 		Cr.elm("img",{height:"50",align:"middle",src:"img/chrome.png",style:"padding-right:10px;"}),
	// 		Cr.elm("img",{height:"50",align:"middle",src:"img/win32.png",style:"padding-right:10px;"}),
	// 		Cr.elm("img",{height:"57",align:"middle",src:"img/osx.png"})
	// 	])
	// ]),
	// Cr.elm("a",{href:"javascript:;",id:"expandBuyinfo"},[
	// 	Cr.elm("img",{src:"img/expand.png"})
	// ]),
	// Cr.elm("small",{style:"display:none;",class:"toInline"},[
	// 	Cr.txt("Your color-pick license not only works here;"),
	// 	Cr.elm("br"),
	// 	Cr.txt("The same license also registers the color-pick desktop applications"),
	// 	Cr.elm("br"),
	// 	Cr.txt("for both Windows and OSX. "),
	// 	Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
	// 		Cr.txt("color-pick.com")
	// 	]),
	// 	Cr.txt(" or "),
	// 	Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
	// 		Cr.txt("vidsbee.com/ColorPick")
	// 	]),
	// 	Cr.elm("br"),
	// 	Cr.elm("br"),
	// 	Cr.txt("A button to automatically install the license will appear after purchase.")
	// ]),
	Cr.elm("h3",{style:"margin-bottom:7px;clear:both;"},[
		Cr.txt("Alternative")
	]),
	Cr.txt("If you do not wish to purchase a license at this time,"),
	Cr.elm("br"),
	Cr.txt("you may still place ColorPick in registered mode by following the "),
	Cr.elm("a",{id:"license_link",href:"license.html?wide=1"},[
		Cr.txt("license agreement")
	]),
	Cr.txt(".")
],document.body);
	init();
	gel('license_go').addEventListener('click', license_go);
	
	gel('expandReginfo').addEventListener('click', toggle_next_sibling_display);
	//gel('expandBuyinfo').addEventListener('click', toggle_next_sibling_display);

	if( isChrome && searchQuery.indexOf('enableChromePurchase') > -1 ){
		getChromeInAppStatus();
	}else{
		gel('chrome-inapp-reg').style.display='none';
	}
}

document.addEventListener('DOMContentLoaded', function () {
	createDOM();
	
	
});
