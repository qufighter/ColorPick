function gel(n){
	return document.getElementById(n);
}
function init(){
	//gel('license').innerHTML = document.body.clientHeight;
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
}
function resetAllButtonStyles(){
	gel('btn_agree').style.border="";
	gel('btn_try').style.border="";
	gel('btn_register').style.border="";
}
function license_agree(){
	localStorage["hasAgreedToLicense"]=true;
	localStorage["usageStatistics"]=true;
	localStorage["shareClors"]=true;
	
	if(typeof(localStorage["usageStatistics"])=='undefined')localStorage["usageStatistics"]=false;
	if(localStorage["usageStatistics"]=='true'){
		localStorage.removeItem("feedbackOptOut");
	}else{
		localStorage.feedbackOptOut = "true";
	}
	resetAllButtonStyles()
	gel('btn_agree').style.border="2px outset green";
	closeLicensePopup(true)
}
function license_try(){
	if(typeof(localStorage["trialPeriod"])=='undefined')localStorage["trialPeriod"]=0;
	localStorage["trialPeriod"]=localStorage["trialPeriod"]-5;
	if(document.body.className=='wide'){
		localStorage["trialPeriod"]=localStorage["trialPeriod"]-10;
	}
	
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

document.addEventListener('DOMContentLoaded', function () {
	init()
	gel('btn_agree').addEventListener('click', license_agree);
	gel('btn_try').addEventListener('click', license_try);
	gel('btn_register').addEventListener('click', license_register);
});