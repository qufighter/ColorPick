self.port.on('setIconURI', function(iuri){
	if(iuri)
		document.getElementById('widgeticon').src=iuri;
});
self.port.on('setBadgeBackground', function(clr){
	document.getElementById('widgetbadge').style.backgroundColor='rgb('+clr[0]+','+clr[1]+','+clr[2]+')';
});
self.port.on('setBadgeText', function(txt){
	document.getElementById('widgetbadge').innerHTML=txt;
	if(txt.length > 0){
		document.getElementById('widgetbadge').style.display='block';
	}else{
		document.getElementById('widgetbadge').style.display='none';
	}
});

function mdf(ev){
	if (ev.which === 2 || ev.which === 3){
	    self.port.emit('rightClicked');
	}
}
document.body.addEventListener('mousedown',mdf);