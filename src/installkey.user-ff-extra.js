DESC_INCL='installkey.usr.js ';
firefoxChromeApi.setResponseIDbase(1000);

function installKey(){
	self.port.emit('show_popup','REGISTER_SCREEN','?k='+rkey+'&n='+rname);
}