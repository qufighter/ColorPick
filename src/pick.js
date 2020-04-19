var ItIsTheExtensionColorPickButInsideAnExtensionPageNo = true;

document.addEventListener('DOMContentLoaded', function(){

	var last = localStorage.lastImageSnap;
	if( !last && localStorage.cacheSnapshots ){
		last = sessionStorage['session-pick-cache-'+window.location.hash.replace(/^#/,'')];
	}
	if( last ){
		document.getElementById('default_err').remove();
		document.getElementById('pick').addEventListener('load',function(){
			window.scrollBy(32,0)
		});
		document.getElementById('pick').src = last;
		localStorage.removeItem('lastImageSnap');

		if( localStorage.cacheSnapshots ){
			sessionStorage['session-pick-cache-'+window.location.hash.replace(/^#/,'')] = last;
			sessionStorage['session-pick-about'] = "the setting to control this ColorPick feature is " + chrome.i18n.getMessage('cacheSnapshots');
		}

		// trigger extension??? popup ??
		chrome.windows.getCurrent(function(window){
			chrome.tabs.query({windowId: window.id, active: true}, function(tabs){
				var tabid=tabs[0].id;
				chrome.runtime.sendMessage({activateOnTab:true, tabi: tabid},function(response){});
			});
		});
	}else{
		Cr.elm('div',{
			style: 'font-weight:bold',
			childNodes:[
				Cr.txt(chrome.i18n.getMessage('cacheSnapshots'))
			]
		}, document.getElementById('default_err').firstChild)
	}

});