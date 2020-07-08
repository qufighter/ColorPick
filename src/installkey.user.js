var rkey='000-000-000-000-000';
var rname='default_reg_name';
if(document.getElementById('n.colorpick.com')){
	rname=document.getElementById('n.colorpick.com').innerText;
}
if(document.getElementById('k.colorpick.com')){
	rkey=document.getElementById('k.colorpick.com').innerText;
}
function clickedInstallKey(){
	installKey();
}
function installKey(){
	window.location=chrome.extension.getURL('register.html')+'?k='+rkey+'&n='+rname;
}
destNode=document.body;
if(document.getElementById('autoinstall.colorpick.com') && rname != 'default_reg_name'){
	destNode=document.getElementById('autoinstall.colorpick.com');
	var b=document.createElement('input');
	b.setAttribute('type','button');
	b.setAttribute('style','margin:20px 0px 20px 0px;');
	b.setAttribute('value',chrome.i18n.getMessage('auto_install_key'));
	destNode.appendChild(b);
	b.addEventListener('click',clickedInstallKey);
}