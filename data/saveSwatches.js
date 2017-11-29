/*
 * This file is a part of the Show Pixel Color project.
 *
 */

var imgSrc = 'data:image/png;base64,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';
var nl='\u000A', tab='\u0009', nbsp='\u00A0';

function createDOM(){
	var swatchElm = [];
	var st=window.location.href.indexOf('swatches=||');
	if( st > 0 ){
		var swatches = window.location.href.substr(st+11).split('||');
		for(var s=0,sl=swatches.length; s<sl; s++){
			swatches[s] = JSON.parse(unescape(swatches[s]));
			swatchElm.push(Cr.txt(nl));
			swatchElm.push(Cr.elm('div',{style:'background-color:#'+swatches[s].hex+';border:15px solid #'+swatches[s].hex+';padding:15px;', id:'color-'+(s+1)},[
				Cr.txt(nl+tab),Cr.elm('input',{value:'#'+swatches[s].hex, class:'hex'}),
				Cr.txt(nl+tab),swatches[s].rgb ? Cr.elm('input',{value:('rgb('+swatches[s].rgb.r+','+swatches[s].rgb.g+','+swatches[s].rgb.b+')'), class:'rgb'}) : Cr.txt(''),
				Cr.txt(nl+tab),swatches[s].hsl ? Cr.elm('input',{value:('hsl('+swatches[s].hsl.h+','+swatches[s].hsl.s+','+swatches[s].hsl.v+')'), class:'hsl'}) : Cr.txt(''),
				Cr.txt(nl+tab),swatches[s].hsv ? Cr.elm('input',{value:('hsv('+swatches[s].hsv.h+','+swatches[s].hsv.s+','+swatches[s].hsv.v+')'), class:'hsv'}) : Cr.txt(''),
				Cr.txt(nl)
			]));
		}
	}else{
		swatchElm.push(Cr.txt('No colors selected!'));
	}

	Cr.elm("div",{id:"mainbox"},[
		Cr.elm("h3",{class:'header'},[
			Cr.elm("img",{src:imgSrc,style:'width:1.6em;',align:'top',id:"logo"}),
			Cr.elm("font",{style:'font-size:1.5em;text-decoration:none;color:black;font-weight:100;'},[
				Cr.txt(nbsp+chrome.i18n.getMessage('extName'))
			]),
		]),
		Cr.txt(nl),
		Cr.elm("div",{style:'text-shadow:1px 1px 6px white;padding-top:10px;',id:'exported-colors'}, swatchElm),
		Cr.txt(nl)
	],document.body);

	var d=new Date();
	document.title+=' '+d.toString();

	head = document.getElementsByTagName('head')[0];
	head.removeChild(head.getElementsByTagName('script')[0]);
	head.removeChild(head.getElementsByTagName('script')[0]);
}

document.addEventListener('DOMContentLoaded', function () {
	createDOM();
});
