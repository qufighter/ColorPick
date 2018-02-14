function recieveScaleFromFlash(sc){
	if(sc=='1'){
		document.getElementById('setcal').style.border='2px solid gray';
		document.getElementById('setcal').value='Looks Good - Set Calibration'
		getCurrentVals()
	}else{
		document.getElementById('setcal').style.border='3px solid red';
		document.getElementById('setcal').value='No Match - Please adjust page zoom first!'
	}
}
var scoffset=0;
function getCurrentVals(){
	scoffset=window.outerWidth-window.innerWidth;
	document.getElementById('creslt').value=scoffset;
	document.getElementById('allresult').style.display="block"
	document.getElementById('htmtes').innerText=((window.outerWidth-scoffset)/window.innerWidth);
	localStorage['cpScaleOffset']=scoffset;
	localStorage['flashScalePix']=false;
	
	document.getElementById('setcal').style.marginTop='-7px';
	setTimeout(function(){
		document.getElementById('setcal').style.marginTop='0px';
	},1000);
}
window.onresize=function(){
	document.getElementById('htmtes').innerText=((window.outerWidth-scoffset)/window.innerWidth);
}
function setpre(){
	document.getElementById('creslt').value=localStorage['cpScaleOffset'];
}

document.addEventListener('DOMContentLoaded', function () {
	setpre();
	
  document.getElementById('setcal').addEventListener('click', getCurrentVals);
});
