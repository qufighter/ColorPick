DESC_INCL='background.js';
firefoxChromeApi.setResponseIDbase(4000);

//DOMloaded();
fromPrefs();

document.execCommand = function(cmd){
	if(cmd=='copy'){
		self.port.emit('setClipboardText',curentHex);//could attempt to get current selection range...
	}
}