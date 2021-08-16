gameScr = true;

var closeX=null;

var icons = [
 "img/game/bunny.webp",
 "img/game/rabbit.webp",
 "img/icon64.png",
]

function nextIconImage(g_moveCtr){
	// when this is called we already tested if(!waterm) return;

	waterml.src = chrome.extension.getURL(icons[g_moveCtr%icons.length]);

	//console.log('next from index', g_moveCtr, g_moveCtr % 6, watermct)

	return;

	if( g_moveCtr % 6 == 1){

		waterml.src = chrome.extension.getURL('img/icon64.png');
		Cr.empty(watermct);
		Cr.elm('div',{id:'tip_'+((g_moveCtr + 4)%6),childNodes:[
			Cr.txt('TEST!'),
		]}, watermct);

		closeX=Cr.elm('a',{style:'top:0;right:0;position:absolute;',events:['click', function(ev){waterm.name='';moveWm(ev);closeX.remove();}],childNodes:[Cr.txt('X')]}, waterm)

		waterm.name='data-stay-put';
	}
}
	
function initGame(){

}
initGame();
