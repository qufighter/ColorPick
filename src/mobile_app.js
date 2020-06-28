var nbsp='\u00A0';
function gel(n){
	return document.getElementById(n);
}

function getPromoStateChanger(){
	if( !localStorage['hideMobilePromo'] ){
		return Cr.elm('a',{
			style:'cursor:pointer;color:blue;',
			event:['click', function(ev){
				localStorage['hideMobilePromo'] = 'true';
				ev.target.remove();
			}],
			childNodes:[Cr.txt("Hide promo in popup")]
		});
	}else{
		return Cr.elm('a',{
			style:'cursor:pointer;color:blue;',
			event:['click', function(ev){
				localStorage['hideMobilePromo'] = '';
				ev.target.remove();
			}],
			childNodes:[Cr.txt("Show promo in popup")]
		});
	}
}

function createDOM(){
	Cr.elm("div",{id:"mainbox"},[
		Cr.elm("h2",{},[
			Cr.elm("img",{src:"img/icon32.png",style:'width:32px;height:32px;vertical-align:text-bottom;'}),
			Cr.txt(" ColorPick for Native Mobile"),
			Cr.elm("br"),
			Cr.txt(" "),
			Cr.elm("span",{class:"subh",style:"left:42px;"},[
				Cr.txt(String.fromCharCode(169)+" Vidsbee.com by Sam Larison")
			])
		]),
		Cr.txt("ColorPick is an Amazing Eyedropper tool that allows precise selection of color values through it's one-of-a-kind zoomed preview!"),
		Cr.elm("br"),
		Cr.elm("br"),
		Cr.elm("small",{style:"",class:""},[
			createPhoneDiv()
		]),
		Cr.elm("br"),
		Cr.elm("br"),
		getPromoStateChanger()
	],document.body);

	document.body.style.opacity="1";
}

window.addEventListener('load', createDOM);
