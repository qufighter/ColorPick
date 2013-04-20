var suppress_connection_errors=false;
function gel(n){
	return document.getElementById(n);
}
function preventEventDefault(ev){
	ev = ev || event;
	if(ev.preventDefault)ev.preventDefault();
	ev.returnValue=false;
	return false;
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
function set_registered(){
	gel('license_status').innerHTML='Registered';
	gel('license_status').className='registered';
	gel('license_name').disabled=true;
	gel('license_key').disabled=true;
	gel('license_name').value = localStorage['reg_name'];
	gel('license_key').value='************************';
	gel('license_go').value="Modify License";
	localStorage['reg_chk']=true;
	gel('examine').href='http://vidsbee.com/ColorPick/Upgrade?khash='+localStorage['reg_hash'];
}
function set_unregistered(){
	gel('license_status').innerHTML='Unegistered';
	gel('license_status').className='unregistered';
	gel('license_name').disabled=false;
	gel('license_key').disabled=false;
	gel('license_go').value="Register";
	localStorage['reg_chk']=false;
	gel('examine').href='http://vidsbee.com/ColorPick/Upgrade/';
}
function init(){
	if(localStorage['reg_chk']=='true'){
		set_registered()
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
	
	var kname=gel('license_name').value
	var khash = CryptoJS.SHA1(gel('license_key').value + "ColorPick" + kname).toString();

	VerifyHashToLicSrv(khash,kname)
}

function VerifyHashToLicSrv(p_khash,p_kname){
	var khash=p_khash;
	var kname=p_kname;
	
	var xhr = new XMLHttpRequest();
	//console.log(request.url +' '+ params);
	xhr.onreadystatechange=function(){if(xhr.readyState == 4){
		if(xhr.status==200){
			if(xhr.responseText == 'VERIFIED') keyResponse(true,khash,kname);
			else if(xhr.responseText == 'MAXIMUM_USE_EXCEEDED'){
				if(confirm('License may be in use on the maximum number of hosts.  Upgrading your license may resolve the issue... Launch upgrade webpage now?')){
					window.location = 'http://vidsbee.com/ColorPick/Upgrade?khash='+localStorage['reg_hash'];
				}
			}else if(!suppress_connection_errors) keyResponse(false);
		}else{
			if(!suppress_connection_errors)
				alert("Problem communicating with license server.  Make sure your firewall is open on port 80 or contact your system administrator.  Please try again soon!");
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
document.addEventListener('DOMContentLoaded', function () {
	init()
	gel('license_go').addEventListener('click', license_go);
	gel('unlocker').addEventListener('click', unlockInApp);
	if(window.location.href.indexOf('showoneclick')==-1){
		gel('unlockExtOnly').innerHTML="Comings Soon";
	}
});

function performPayment(token){
	google.payments.inapp.buy({
		'jwt'     : token,
		'success' : function(result) {
			localStorage['reg_chk']=true;
			localStorage['reg_inapp']=true;
			saveSyncItemsToChromeSyncStorage();
		},
		'failure' : function(result) {
			console.log("failure", result);
			if (result && result.response) {
				if (result.response.errorType == "PURCHASE_CANCELED") {
					//alert('Canceled!');
				} else {
					/*
						MERCHANT_ERROR - purchase request contains errors such as a badly formatted JWT
						PURCHASE_CANCELED - buyer canceled purchase or declined payment
						POSTBACK_ERROR - failure to acknowledge postback notification
						INTERNAL_SERVER_ERROR - internal Google error
					*/
					alert('Failed: '+result.response.errorType);
				}
			} else {
				alert("Unknown failure!  Internet connectivity?");
			}
		}
	});
}

function unlockInApp(ev){
	var attempt=0;
	var params=	'?name=Color+Picker+Chrome+Extension'+
							'&description=Color+Picker+for+Google+Chrome+Sign in/Sync+-+Single+User+License'+
							'&itemID=ColorPickChromeExt'+
							'&price=1.00';
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange=function(){if(xhr.readyState == 4){
		if(xhr.status==200){
			performPayment(xhr.responseText);
		}else if(xhr.status==403 && attempt < 1){
			attempt++;
			xhr.open('GET', "http://vidsbee.com/generateJWTJSON.php"+params, true);
			xhr.send();
		}else{
			alert("Temporary problem with this payment method (Check your Internet connectivity), please try again later, try the buy license key method, or contact the developer sam@vidsbee.com");
		}
	}};
	xhr.open('GET', "https://vidsbee.appspot.com/"+params, true);
	xhr.send();

	//app engine will return a 403 Forbidden when over quotta... 

	return preventEventDefault(ev);
}
