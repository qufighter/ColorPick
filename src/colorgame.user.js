gameScr = true;

var icons = [
 "img/game/bunny.webp",
 "img/game/rabbit.webp",
 "img/icon64.png",
]

function nextIconImage(g_moveCtr){
	// when this is called we already tested if(!waterm) return;

	waterml.src = chrome.extension.getURL(icons[g_moveCtr%icons.length]);


}
	
function initGame(){

}
initGame();