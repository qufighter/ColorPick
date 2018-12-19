var suppress_connection_errors=false;
var registerdModeSku = 'colorpick_eyedropper_registered_mode';
var searchQuery = window.location.search;
var nbsp='\u00A0';
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
	gel('examine').href='http://vidsbee.com/ColorPick/Upgrade?khash='+(localStorage['reg_hash']||'');
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
	if(gel('license_key').value.length < 1 || gel('license_key').value=='undefined')return keyResponse(false);
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

function resetPurchases(){
	localStorage['reg_chk']='false';
	localStorage['reg_inapp']='false';
	localStorage.removeItem('reg_name');
	saveSyncItemsToChromeSyncStorage();
	set_unregistered();
}

function chromeInapPurchaseSuccess(){
	var inAppBtnArea = gel('chrome-inapp');
	Cr.empty(inAppBtnArea);
	inAppBtnArea.appendChild(Cr.elm('div', {
		class: 'note-bubble',
		childNodes: [
			Cr.txt('You have completed the in-app purchase to enable registered mode - thank you!  If the extension was not already in registered mode it will be placed into registered mode now.  Please refresh any other views to see the latest registration status.')
		]
	}));
	localStorage['reg_chk']='true';
	localStorage['reg_inapp']='true';
	localStorage['reg_name']='Chrome Exclusive';
	set_registered();
	saveSyncItemsToChromeSyncStorage();
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
					    'font-size': '16px',
						'background-color': '#6799CC',
						'box-shadow': 'black 1px 1px 1px',
						'border-radius': '4px',
						border: '1px solid #1c6bbb',
						padding: '8px',
						cursor: 'pointer'
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
			inAppBtnArea.appendChild(Cr.elm('div', {
					childNodes: [
						Cr.txt('Purchase check failed.  You must sign into chrome to enable this feature.'),
						Cr.elm('br'),
						Cr.elm("a",{class:"pointer",events:Cr.evt('click', toggle_next_sibling_display)},[
							Cr.elm("img",{src:"img/expand.png",class:'expand-triangle'}),
							Cr.txt(' More Info'+nbsp)
						]),
						Cr.elm("ul",{style:"display:none;"},[
							Cr.elm('li',{},[Cr.txt('Chrome does not support in-app purchases in all regions.')]),
							Cr.elm('li',{},[
								Cr.txt('Your firewall must allow Chrome to connect to Google Wallet.'),
								Cr.elm("ul",{style:""},[
									Cr.elm('li',{},[Cr.txt('This includes any firewalls present between your device and the Internet.')]),
									Cr.elm('li',{},[Cr.txt('Allow all Google owned domains on port 80 and 443 (not all of them are obvious).')])
									//Cr.elm('li',{},[Cr.txt('As of 2018 this includes port 80 of gvt1.com')])
								])
							]),
							Cr.elm('li',{},[Cr.txt('This license is tied to a single user signed into chrome - for a more portable license that can be used for different users and platforms consider the full license below.')]),
							Cr.elm('li',{},[Cr.txt('If you sign into chrome on a new computer you may have to re-visit this screen to activate your license there.')]),
						]),
					]
			}));
		}
	});
}

function createDOM(){
Cr.elm("div",{id:"mainbox"},[
	Cr.elm("h2",{},[
		Cr.elm("img",{src:"img/icon32.png",style:'width:32px;height:32px;',align:"bottom"}),
		Cr.txt("ColorPick for Google Chrome"),
		Cr.elm("br"),
		Cr.txt(" "),
		Cr.elm("span",{class:"subh",style:"left:42px;"},[
			Cr.ent("&copy; Vidsbee.com by Sam Larison")
		])
	]),
	Cr.txt("ColorPick is an Amazing Eye Dropper that allows precise selection of color values through it's one-of-a-kind zoomed preview!"),
	Cr.elm('div',{id:'chrome-inapp-reg', childNodes:[
		Cr.elm("h3",{},[
			Cr.txt("Register Chrome Extension only")
		]),
		Cr.elm('div',{id:'chrome-inapp', childNodes:[
			Cr.elm("img",{src:"img/loading.gif",id:"indicator"}),
		]})
	]}),
	Cr.elm("h3",{},[
		Cr.txt("Enter your ColorPick License")
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
	Cr.elm("a",{href:"javascript:;",id:"expandReginfo",events:Cr.evt('click', toggle_next_sibling_display)},[
		Cr.elm("img",{src:"img/expand.png",class:'expand-triangle'})
	]),
	Cr.elm("small",{style:"display:none;"},[
		Cr.txt("License applies wherever else you sign into chrome or enter the same license."),
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
		Cr.elm("img",{style:'width:130px;height:41px;padding-top:8px;',src:"img/paypal.png"})
	]),


	Cr.elm("span",{style:"float:left;margin-right:12px;margin-bottom:24px;"},[
		Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
			Cr.elm("img",{height:"50",align:"middle",src:"img/chrome.png",style:"padding-right:10px;"}),
			Cr.elm("img",{height:"50",align:"middle",src:"img/win32.png",style:"padding-right:10px;"}),
			Cr.elm("img",{height:"57",align:"middle",src:"img/osx.png"})
		])
	]),
	Cr.elm("a",{href:"javascript:;",id:"expandBuyinfo",events:Cr.evt('click', toggle_next_sibling_display)},[
		Cr.elm("img",{src:"img/expand.png",class:'expand-triangle'})
	]),
	Cr.elm("small",{style:"display:none;",class:"toInline"},[
		Cr.txt("Your color-pick license not only works here;"),
		Cr.elm("br"),
		Cr.txt("The same license also registers the color-pick desktop applications"),
		Cr.elm("br"),
		Cr.txt("for both Windows and OSX. "),
		Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
			Cr.txt("color-pick.com")
		]),
		Cr.txt(" or "),
		Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
			Cr.txt("vidsbee.com/ColorPick")
		]),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("A button to automatically install the license into this extension"),
		Cr.elm("br"),
		Cr.txt("will appear at the bottom of the page after purchase.")
	]),


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

	if( isChrome && searchQuery.indexOf('enableChromePurchase') > -1 ){
		getChromeInAppStatus();
	}else{
		gel('chrome-inapp-reg').style.display='none';
	}

	//setTimeout(function(){
		document.body.style.opacity="1";
	//},250);
}

window.addEventListener('load', createDOM);
