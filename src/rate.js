var uc_staro='\u2606';
var uc_starf='\u2605';
var ln_sprt = 'https://chrome.google.com/webstore/detail/colorpick-eyedropper/ohcpnigalekghcmgcdcenkpelffpdolg/support';//?hl=en-US&gl=US'
var ln_rate = 'https://chrome.google.com/webstore/detail/colorpick-eyedropper/ohcpnigalekghcmgcdcenkpelffpdolg/reviews';//?hl=en-US&gl=US'
var interactiveMode = false;
if( isFirefox ){
	ln_sprt = 'https://addons.mozilla.org/en-US/firefox/addon/colorpick-eyedropper/';
	ln_rate = 'https://addons.mozilla.org/en-US/firefox/addon/colorpick-eyedropper/reviews/';
}else if( isEdge ){
	ln_sprt = 'https://microsoftedge.microsoft.com/addons/detail/colorpick-eyedropper/pieiiifgcmhldgbniafejdimnjnjcgfo';
	ln_rate = 'https://microsoftedge.microsoft.com/addons/detail/colorpick-eyedropper/pieiiifgcmhldgbniafejdimnjnjcgfo';
}

function createRatings(){
	setTimeout(function(){
		restorePreviousRating();
	},500);
	return Cr.elm('span',{id:'rate_container','style':'cursor:pointer;',events:[['mouseover',rateOver],['mouseout',rateOut]]},[
		Cr.elm('a',{'id':'star1',events:[['mousemove',moStar],['click',clickStar]],href:ln_sprt,target:"_blank"},[Cr.txt(uc_staro)]),
		Cr.elm('a',{'id':'star2',events:[['mousemove',moStar],['click',clickStar]],href:ln_sprt,target:"_blank"},[Cr.txt(uc_staro)]),
		Cr.elm('a',{'id':'star3',events:[['mousemove',moStar],['click',clickStar]],href:ln_sprt,target:"_blank"},[Cr.txt(uc_staro)]),
		Cr.elm('a',{'id':'star4',events:[['mousemove',moStar],['click',clickStar]],href:ln_sprt,target:"_blank"},[Cr.txt(uc_staro)]),
		Cr.elm('a',{'id':'star5',events:[['mousemove',moStar],['click',clickStar]],href:ln_rate,target:"_blank"},[Cr.txt(uc_staro)])
	]);
}

function createAndAttachRatings(container){
	var containingElm = container;
	chrome.i18n.getAcceptLanguages(function(lang){
		if(lang && lang[0]){
			ln_sprt += '?hl=' + lang[0];
			ln_rate += '?hl=' + lang[0];
		}
		containingElm.appendChild(createRatings());
	});
}
function rateOver(ev){
	if(ev.target.id == 'rate_container'){
		//console.log('inter');
		//interactiveMode = true;
	}
}
function rateOut(ev){
	if(ev.target.id == 'rate_container'){
		//console.log('non inter');
		//interactiveMode = false;
		restorePreviousRating();
	}
}
function restorePreviousRating(){
	if(typeof(localStorage['lastRating']) != 'undefined'){
		setRating(localStorage['lastRating'] - 0)
	}else{
		setRating(4);
	}
}
function setRating(starNo){
	for(var s=1;s<6;s++){
		if(s<=starNo){
			document.getElementById('star'+s).textContent=uc_starf;
		}else{
			document.getElementById('star'+s).textContent=uc_staro;
		}
	}
}
function moStar(ev){
	//console.log(interactiveMode)
	//if(!interactiveMode)return;
	var star=ev.target;
	var starNo = star.id.replace('star','') - 0;
	setRating(starNo)
}
function clickStar(ev){
	var star=ev.target;
	var starNo = star.id.replace('star','') - 0;
	setRating(starNo);
	interactiveMode = false;
	localStorage['lastRating']=starNo;
}
