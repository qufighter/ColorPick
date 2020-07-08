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
function init(){
	if(window.location.href.indexOf('wide=1') > 0){
		document.body.className="wide";
		if(document.getElementById('termspop')){
			tp=document.getElementById('termspop');
			tp.parentNode.removeAttribute('href');
			tp.parentNode.style.fontSize="11pt";
			tp.parentNode.removeChild(tp);
		}
	}
}
function closeLicensePopup(closewin){
	sendReloadPrefs(function(){
		if(window.parent){
			var doc=window.parent.document;
			var dby=doc.body;
			if(doc.getElementById('license_frame')){
				dby.removeChild(doc.getElementById('license_frame'));
			}else{
				if(closewin)
					window.close();
			}
		}
	});
}
function resetAllButtonStyles(){
	gel('btn_agree').style.border="";
	gel('btn_register').style.border="";
	//gel('btn_try').style.border="";
}
function license_agree(){
	localStorage["hasAgreedToLicense"]=true;
	localStorage["usageStatistics"]=true;
	localStorage["shareClors"]=true;
	
	if(typeof(localStorage["usageStatistics"])=='undefined')localStorage["usageStatistics"]=false;
	if(localStorage["usageStatistics"]=='true' && !navigator.doNotTrack){
		if(localStorage.removeItem)localStorage.removeItem("feedbackOptOut");
		else delete localStorage["feedbackOptOut"];
	}else{
		localStorage.feedbackOptOut = "true";
	}
	resetAllButtonStyles()
	gel('btn_agree').style.border="2px outset green";
	closeLicensePopup(true)
}
function license_try(){
	localStorage["hasAgreedToLicense"]=false;
	localStorage["usageStatistics"]=false;
	localStorage["shareClors"]=false;
	localStorage.feedbackOptOut = "true";

	if(typeof(localStorage["trialPeriodResets"])=='undefined')localStorage["trialPeriodResets"]=0;
	localStorage["trialPeriodResets"]=localStorage["trialPeriodResets"]-0+1;

	if(typeof(localStorage["trialPeriod"])=='undefined')localStorage["trialPeriod"]=0;
	localStorage["trialPeriod"]=localStorage["trialPeriod"]-(5*(localStorage["trialPeriodResets"]-0));

	resetAllButtonStyles()
	//gel('btn_try').style.border="2px outset green";
	
	closeLicensePopup(true);
}
function license_register(){
	
	if(document.body.className=='wide'){
		window.location='register.html';
	}else{
		//window.open("http://color-pick.com/",'buy-colorpick');
		window.open("register.html",'buy-colorpick');
	}
	
	resetAllButtonStyles()
	gel('btn_register').style.border="2px outset green";
	closeLicensePopup(false)
}

function createDOM(){
Cr.elm("div",{id:"container"},[
	Cr.elm("div",{id:"license"},[
		Cr.elm("b",{},[
			Cr.elm("a",{target:"_blank",href:"license.html?wide=1"},[
				Cr.txt("Terms of Use"),
				Cr.elm("img",{id:"termspop",title:"Read in a New Tab",src:"img/popout.gif",width:"12"})
			])
		]),
		Cr.elm("br"),
		Cr.txt("By pressing 'Agree' you agree to the terms herein and will not have to review this version of the agreement again."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("This agreement may be reviewed at any time from the options screen."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("Registration includes a valid license for ColorPick Extension & desktop App on Windows & OSX."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("Color Picker costs 99"+String.fromCharCode(162)+" to register one authorized host address to use any version (sans mobile versions, licensed separately) of the program without any limitations."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("Discounts are available when purchasing a license for more than one host.  For example; 8 hosts may cost $3.99."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("An interface to manage which hosts are "),
		Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/Upgrade/"},[
			Cr.txt("authorized")
		]),
		Cr.txt(" to use your license is provided.  A host is defined by unique IP address.  Highly mobile users may purchase additional hosts."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("Failure to register will display a message that says unregistered.  Click this link to "),
		Cr.elm("a",{target:"_blank",href:"http://vidsbee.com/ColorPick/"},[
			Cr.txt("buy a license")
		]),
		Cr.txt(".  If you have already registered enter your registration name and key on the options screen."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("By clicking agree you will automatically opt-into sharing each color that you pick for color of the day statistics.  You  may opt-out from the preferences screen."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("By clicking agree you will automatically opt-into collecting usage statistics which the following pertains to.  You may subsequently opt-out."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("You acknowledge and agree that we may use data capture, syndication analysis and other similar tools to track, extract, compile, aggregate and analyze any data or information resulting from your use of the Plug-in, and that we may share or make available this information with our business partners. If you object to any of these uses, you may opt-out of certain aspects of such data tracking in accordance with the instructions herein."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("To opt-out: first agree to this agreement; then open options and un-check the box that says \"Gather Statistics\" and press Save.  If you opt out you will end up with unregistered status."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("If the gather statistics box is not present then statistics are not being collected, as this feature may be removed at a later date."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("By clicking agree you will automatically opt-into collecting usage statistics and receive registered status within this extension."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("You may agree with this agreement and opt-into gathering of usage statistics.  You may provide a valid license key which can be purchased by clicking on the Register button or from the options screen."),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.txt("By agreeing with this license you confirm that you are over the age of 18 or have parental consent to agree to this license.")
	]),
	Cr.elm("div",{id:"controls"},[
		Cr.elm("input",{type:"button",id:"btn_agree",value:"Opt-in"}),
		// Cr.elm("input",{type:"button",id:"btn_try",value:"Try"}),
		Cr.elm("input",{type:"button",id:"btn_register",value:"Register"})
	])
],document.body)
	init()
	gel('btn_agree').addEventListener('click', license_agree);
	// gel('btn_try').addEventListener('click', license_try);
	gel('btn_register').addEventListener('click', license_register);
}

document.addEventListener('DOMContentLoaded', function () {
	createDOM();
});