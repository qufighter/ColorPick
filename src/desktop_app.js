document.addEventListener('DOMContentLoaded', function () {
	if(document.getElementById('plat_prev')){
		if(navigator.userAgent.indexOf('Windows') < 0){
			document.getElementById('plat_prev').src="img/osx.png";
			document.getElementById('req_mac').style.display="block";
		}else{
			document.getElementById('req_win').style.display="block";
		}
	}
});
