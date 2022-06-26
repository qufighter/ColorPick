gameScr = true;

var closeX=null;

var icons = [
 "img/game/bunny.webp",
 "img/game/rabbit.webp",
 "img/icon64.png",
];

var drag = {
	on: false,
	sy:0,
	sx:0
};

var uos = 'ColorPick unofficial sponsor:';

var sponsors = [
	{
		img:chrome.extension.getURL('img/sponsors/colordoctor.jpg'),
		title:'Color Doctor\nhypertension tester',
		href:'https://amzn.to/2KWw7hJ'
	},{
		img:chrome.extension.getURL('img/sponsors/waterpik.jpg'),
		title:'Waterpik\njust add water',
		href:'https://amzn.to/2KXVEqM'
	},{
		img:chrome.extension.getURL('img/sponsors/picks.jpg'),
		title:'Pick\nVarious to choose from',
		href:'https://amzn.to/31PJJC7'
	},{
		img:chrome.extension.getURL('img/sponsors/laser.jpg'),
		title:'Color Laser Printer\nAre you tired of refilling ink?',
		href:'https://amzn.to/2KL8d9V'
	},{
		img:chrome.extension.getURL('img/sponsors/color.jpg'),
		title:'Color\nmost expensive',
		href:'https://amzn.to/2ZeTTug',
		maxw:'125px'
	},{
		img:chrome.extension.getURL('img/sponsors/prismacolor.jpg'),
		title:'Prismacolor\nProfessional Markers etc',
		href:'https://amzn.to/31K2kj0'
	},{
		img:chrome.extension.getURL('img/sponsors/bulb.jpg'),
		title:'Color Changing LED Bulbs\nWay too cool',
		href:'https://amzn.to/31S7pFS'
	},{
		img:chrome.extension.getURL('img/sponsors/purple.jpg'),
		title:'The color Purple\ngo get yourself a mattress',
		href:'https://amzn.to/2uhRjtF'
	}
];

var last_sponsor_index = -1;

function rollSponsor(){
	return Math.floor(Math.random()*sponsors.length);
}

function rollSponsorAgain(){
	var sponsor = rollSponsor();
	while( sponsor == last_sponsor_index ){
		sponsor = rollSponsor();
	}
	return sponsor;
}

function nextIconImage(g_moveCtr){
	// when this is called we already tested if(!waterm) return;

	waterml.src = chrome.extension.getURL(icons[g_moveCtr%icons.length]);

	//console.log('next from index', g_moveCtr, g_moveCtr % 6, watermct)

	//return;

	waterm.firstChild.style.display="block";

	if( g_moveCtr % 6 == 1 || g_moveCtr > 2){

		// waterml.src = chrome.extension.getURL('img/icon64.png');
		// Cr.empty(watermct);
		// Cr.elm('div',{id:'tip_'+((g_moveCtr + 4)%6),childNodes:[
		// 	Cr.txt('TEST!'),
		// ]}, watermct);

		closeX=Cr.elm('a',{
			style:'top:0;right:3px;position:absolute;cursor:pointer;text-decoration:none',
			title:chrome.i18n.getMessage('hideMinimize') + ' ' + uos,
			events:[
				['click', function(ev){
					waterm.name='';moveWm(ev);closeX.remove();
				}],
				['mouseover',function(ev){ev.target.style.textDecoration='underline';}],
				['mouseout',function(ev){ev.target.style.textDecoration='none';}]
			],
			childNodes:[Cr.txt('-_-')]
		}, waterm)


		var sponsor = sponsors[rollSponsorAgain()];

		Cr.empty(watermct);
		Cr.elm('div',{id:'tip_'+((g_moveCtr + 4)%6),childNodes:[
			Cr.elm('div',{
				title: uos,
				style:'font-size:8px',
				childNodes: [Cr.txt(uos)]}),
			Cr.elm('a',{
				href: sponsor.href,
				target: '_blank',
				style:'white-space:pre;text-align:center;display:block;text-decoration:none;',
				childNodes:[
					Cr.elm('img',{
						style: 'padding-bottom:5px;max-width: '+(sponsor.maxw || '100%')+' !important;max-height:47vh !important;display:block;',
						src: sponsor.img}),
					Cr.txt(sponsor.title)
				]
			}),
			Cr.elm('div',{
				title: uos,
				style:'font-size:8px',
				childNodes: [
					Cr.elm('form', {action: 'https://www.amazon.com/s', method: 'GET', childNodes:[
						Cr.elm('input', {type: 'hidden', name: 'tag', value: "colorpick01-20"}),
						Cr.elm('input', {type: 'search', name: 'k'}),
						Cr.elm('input', {type: 'submit', prompt: 'search', value: '\uD83D\uDD0D  Amazon', style:'position: absolute;right: 5px;font-size:8pt;'})
					]})
			]}),
		]}, watermct);


		waterm.firstChild.style.display="none";

		// waterm.firstChild.setAttribute('draggable', true);
		// waterm.firstChild.addEventListener('dragstart', function(ev){
		// 	drag.on=true;
		// 	drag.sy = ev.offsetY
		// });
		// waterm.firstChild.addEventListener('drag', function(ev){
		// 	console.log('ok',(ev.offsetY - drag.sy));

		// 	if( drag.on ){
		// 		waterm.style.top = ((waterm.style.top-0||0) + (ev.offsetY - drag.sy)) + 'px';
		// 	}

		// });
		// waterm.firstChild.addEventListener('dragend', function(){
		// 	drag.on=false;
		// });

		waterm.name='data-stay-put';
	}
}
	
function initGame(){

}
initGame();
