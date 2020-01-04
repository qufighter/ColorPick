/*
The purpose of this script
is to find and identify the input[type=color] fields in this frame
and to add a feature to trigger ColorPick extension near these input fields

TL;DR this lets your users leverage ColorPick Eyedropper on your website as long as:
	1) the user has the extension
	2) your code uses an input type=color field
	3) the page is responsive enough that we may add the icon trigger before your input field
	    a) you may add the attribute colorpick-skip="1" to disable the extension for a particular input
	    b) you may add the attribute colorpick-after="1" to add the trigger after the input field instead of before

testing: test here https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color#Result
specifically the change event should fire when we assign the value

dev note: the scope of this script may be odd, in that it has access to other content scripts if those ran, but there is no guarantee they did run in this context either....
so great care is needed to name functions uniquely here, but also to register listeners carefully....
*/


var colorInputOpts={};
var lastColorInputField = null;
var colorInputsHaveRun = false;
var errorMessage = 'Sorry:';

function loadColorInputPrefs(cbf){
	// we can't import options_prefs as it may be added twice.. we really only need to parse one option here
	var defaults = {
		supportColorInputs: (navigator.platform.substr(0,3).toLowerCase()=='mac'?'false':'true')
	}
	var storage = chrome.storage.sync || chrome.storage.local;
	storage.get(defaults, function(obj) {
		if(chrome.runtime.lastError)console.log(chrome.runtime.lastError.message);
		obj = obj || {};
		for( var prop in defaults ){
			if( obj[prop] && obj[prop] !== 'false' ){
				colorInputOpts[prop] = true;
			}else{
				colorInputOpts[prop] = false;
			}
		}
		if(typeof(cbf)=='function')cbf();
	});
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// this listener is maybe duplicate in teh tab space... so lets not respond to most messages here.... (at least not by default)
	//console.log('we got a message in color-input... ', request);
	if( request.disableColorPicker ){
		// lets reset our input field, not tracking anythign now....
		lastColorInputField = null;

		// we can scan for more fields, no harm in it AFAIK....
		beginColorInputProcessing();

	}else if(request.hexValueWasSelected && lastColorInputField){
		lastColorInputField.value = '#'+request.hexValueWasSelected;
		lastColorInputField.dispatchEvent(new Event('change', {'bubbles':true}));
		lastColorInputField = null;
		chrome.runtime.sendMessage({disableColorPicker:true},function(r){});
		sendResponse({result:true});
	}

	//sendResponse({result:true});
});


function getClickListenerForColorInput(inputColor){
	return function(ev){
		var targ = ev.target;
		lastColorInputField = inputColor;
		try{
			chrome.runtime.sendMessage({activateForInput:true}, function(response){});
		}catch(e){
			alert(errorMessage + " " + e);
			targ.remove();
			removeColorPickInputTriggers(document);
		}
	}
}

function removeColorPickInputTriggers(context){
	var triggers = context.querySelectorAll('.colorpick-eyedropper-input-trigger');
	if( triggers && triggers.length ){
		for( var t=0; t<triggers.length; t++ ){
			triggers[t].remove();
		}
	}
}

function beginColorInputProcessing(){

	// we'll call this mulitple times... it should be able to both activate AND de-activate our features on any field....

	loadColorInputPrefs(function(){
		errorMessage = chrome.i18n.getMessage('reloadRequired');
		// first check our prefs and see.... also some delay won't hurt if dynamic dom is being processed....

		if( !colorInputsHaveRun && !colorInputOpts.supportColorInputs ){
			colorInputsHaveRun=true;// next time we'll still run... but only after ext is triggered, otherwise lets save some CPUs
			return;
		}

		var colorInputs = document.querySelectorAll('input[type=color]');
		if( !colorInputs || !colorInputs.length ) return;

		var toolTipMessage=chrome.i18n.getMessage('selectWithExt')+' - '+chrome.i18n.getMessage('seeAdvOption')+': "'+chrome.i18n.getMessage('supportColorInputs')+'"';

		for( var i=0,l=colorInputs.length; i<l; i++ ){

			if( colorInputs[i].getAttribute('colorpick-skip') ){
				continue;
			}

			if( colorInputs[i].getAttribute('colorpick-eyedropper-active') ){

				if( !colorInputOpts.supportColorInputs ){
					// de-activate time....
					removeColorPickInputTriggers(colorInputs[i].parentNode);
					colorInputs[i].removeAttribute('colorpick-eyedropper-active')
				}

				continue;
			}

			if( !colorInputOpts.supportColorInputs ) continue;

			var modeAfter = colorInputs[i].getAttribute('colorpick-after');

			var btn = document.createElement('img');
			btn.setAttribute('style', 'min-width:16px;min-height:16px;box-sizing:unset;box-shadow:none;background:unset;padding:'+(modeAfter?'0 0 0 6px':'0 6px 0 0')+';cursor:pointer;');
			btn.setAttribute('src', chrome.extension.getURL('img/icon16.png'));
			btn.setAttribute('title', toolTipMessage);
			btn.setAttribute('class', 'colorpick-eyedropper-input-trigger');
			btn.addEventListener('click', getClickListenerForColorInput(colorInputs[i]), true);

			colorInputs[i].parentNode.insertBefore(btn, (modeAfter ? colorInputs[i].nextSibling : colorInputs[i]));

			colorInputs[i].setAttribute('colorpick-eyedropper-active', true);
		}

		colorInputsHaveRun=true;

	});

}

beginColorInputProcessing();
