document.addEventListener('DOMContentLoaded', function(){

	var winloc = window.location.hash.replace(/^#/,'');
	var winlocParts = winloc.split('#');

	winloc = winlocParts[0];

	if( winlocParts[1] == 'extSelf' ){
		Cr.elm('div',{
			style: Cr.css({
				position: 'absolute',
				width: '100%',
				color: 'grey',
				top: 0
			}),
			childNodes:[
				Cr.elm('h1', {
					style: 'margin:0;',
					childNodes:[Cr.txt(chrome.i18n.getMessage('colorProfileWarning1'))]
				}),
				Cr.elm('h3', {
					style: 'margin:0;',
					childNodes:[Cr.txt(chrome.i18n.getMessage('colorProfileWarning2'))]
				})
			]
		}, document.body);
	}

	var last = localStorage.lastImageSnap;
	if( !last && localStorage.cacheSnapshots == 'true' ){
		last = sessionStorage['session-pick-cache-'+winloc];
	}
	if( last ){
		document.getElementById('default_err').remove();
		document.getElementById('pick').addEventListener('load',function(){
			window.scrollBy(32,0)
		});
		document.getElementById('pick').src = last;
		localStorage.removeItem('lastImageSnap');

		if( localStorage.cacheSnapshots == 'true' ){
			sessionStorage['session-pick-cache-'+winloc] = last;
			sessionStorage['session-pick-about'] = "the setting to control this ColorPick feature is " + chrome.i18n.getMessage('cacheSnapshots');
		}
		triggerExtPopup()
	}else{
		Cr.elm('div',{
			style: 'font-weight:bold',
			childNodes:[
				Cr.txt(chrome.i18n.getMessage('cacheSnapshots'))
			]
		}, document.getElementById('default_err').firstChild);

		document.getElementById('pick').addEventListener('dragstart', function(ev){
			triggerExtPopup();
		})
		document.body.addEventListener('dragover', timeoutUpdatePosition);
		document.body.addEventListener('dragend', dragEnd);
	}

	window.location.title=chrome.i18n.getMessage('snapModeDesc') + ' - ' + chrome.i18n.getMessage('extName');

	Cr.elm('div',{
		class: 'default_err',
		style: Cr.css({
			position: 'fixed',
			width: '100%',
			color: 'grey',
			bottom: '0.5em',
			'z-index': -1
		}),
		childNodes:[
			Cr.elm('h3', {
				class: 'txt',
				style: 'margin:0;',
				childNodes:[Cr.txt(chrome.i18n.getMessage('snapModeDesc'))]
			})
		]
	}, document.body);
});

var lastX = 0, lastY=0;
function timeoutUpdatePosition(ev){
	ev.preventDefault();
	ev.dataTransfer.dropEffect = 'move';
	//crosshairCss();
	if( ev.pageY != lastY || ev.pageX != lastX ){
		doPerformupdate(ev);
	}
	lastX = ev.pageX;
	lastY = ev.pageY;
}

function doPerformupdate(ev){
	//mmf(ev);
	mmf({pageX: ev.pageX - 150, pageY: ev.pageY+150});
}

function dragEnd(ev){
	ev.preventDefault();
	picked(ev);
}

function triggerExtPopup(){
	chrome.windows.getCurrent(function(window){
		chrome.tabs.query({windowId: window.id, active: true}, function(tabs){
			var tabid=tabs[0].id;
			chrome.runtime.sendMessage({activateOnTab:true, tabi: tabid, forSnapMode: true},function(response){});
		});
	});
}