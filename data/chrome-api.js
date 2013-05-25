COMN_DBUG=false;
DESC_INCL='';
BLOOP_MAX=75;
DATA_URLP='';

function bloop(a){
	otext='';
	for(i in a){
		otext+=(i+'='+a[i]).substr(0,BLOOP_MAX)+', ';
	}
	return otext;
}


RSC_READY=-2;
self.port.on('dataUrlIs',function(dUrl){
	DATA_URLP=dUrl;
	RSC_READY++;
});
self.port.emit('getDataUrl');

localizedStrings={};
self.port.on('localizedStrings',function(messages){
	var ls=JSON.parse(messages);
	for( var i in ls ){
		localizedStrings[i] = ls[i].message;
	}
	RSC_READY++;
});
self.port.emit('getLocalization');

MAX_RESPONSE_COUNT = 900;
MAX_RESPONSE_WAIT  = 5000;

var firefoxChromeApi={
	responseIdentifer : 0,
	responseFunctions : [],
	responseCounter : 0,
	responseCounter : 900,
	lastResponseTimestamp : 0,
	
	setResponseIDbase : function(i){
		this.responseIdentifer=i;
	},
	
	registerResponse : function(fn){
		var curTime=new Date().getTime();
		if(curTime - this.lastResponseTimestamp > MAX_RESPONSE_WAIT){
			if(COMN_DBUG)console.log(DESC_INCL+'RESETING RESPONSE TIMERS');
			this.responseCounter = 0;
			this.responseFunctions=[];
		}else if(this.responseCounter > MAX_RESPONSE_COUNT)this.responseCounter=0;
		this.responseFunctions[this.responseIdentifer+(++this.responseCounter)]=fn;
		this.lastResponseTimestamp=curTime;
		return (this.responseIdentifer+this.responseCounter);
	},
	
	response : function(responseObj,responseFn){
		if(COMN_DBUG)console.log(DESC_INCL+'recip response: '+bloop(responseObj));
		if(responseObj.__ff_reg_resp && typeof(this.responseFunctions[responseObj.__ff_reg_resp])=='function'){
			if(COMN_DBUG)console.log(DESC_INCL+'recip response: '+responseObj.__ff_reg_resp);
			this.responseFunctions[responseObj.__ff_reg_resp](responseObj);
		}
	}
}

var chrome={
	storage : {
		local : {
			set : function(tosave, callbackfn){
				
				callbackfn();
			},
			get : function(toget, callbackfn){
				//callbackfn(obj);
			}
		},
		sync : {
			set : function(tosave, callbackfn){
				chrome.storage.local.set(tosave, callbackfn);
			},
			get : function(toget, callbackfn){
				chrome.storage.local.get(toget, callbackfn);
			}
		},
	},
	tabs : {
		getSelected : function(windowId,sendResponse){sendResponse({id:0,url:'http://'})},
		executeScript : function(){},
		create : function(){},
		update : function(){},
		sendRequest: function(tabid,requestObj,responseFn){
			requestObj.__ff_reg_resp=firefoxChromeApi.registerResponse(responseFn);
			if(COMN_DBUG)console.log(DESC_INCL+'chrome.tabs.sendRequest('+bloop(requestObj),typeof(responseFn));
			self.port.emit('tab-request',requestObj,{},responseFn)
		},
		sendMessage: function(tabid,requestObj,responseFn){
			chrome.tabs.sendRequest(tabid,requestObj,responseFn);
		}
	},
	runtime : {
		sendMessage : function(requestObj,responseFn){
			chrome.extension.sendRequest(requestObj,responseFn);
		},
		onMessage : {
			addListener : function(fn){
				chrome.extension.onRequest.addListener(fn);
			},
			removeListener : function(fn){
				chrome.extension.onRequest.removeListener(fn);
			}
		},
		connect : function(opts){
			//opts.name //{name:"popupshown"}
		},
		onConnect : {
			addListener : function(fn){

			}
		}
	},
	extension : {
		getURL: function(u){return DATA_URLP+u},
		onRequest: {
			addListener : function(fn){
				if(COMN_DBUG)console.log(DESC_INCL+'chrome.extension.addListener');
				self.port.on('request',function(request,sender,sendResponse){
					fn(request,sender,function(response){
						response.__ff_reg_resp=request.__ff_reg_resp;
						self.port.emit('response',response);
					});
				});
			},
			removeListener : function(fn){
				self.port.on('request',function(request,sender,sendResponse){});
			}
		},
		sendRequest: function(requestObj,responseFn){
			requestObj.__ff_reg_resp=firefoxChromeApi.registerResponse(responseFn);
			if(COMN_DBUG)console.log(DESC_INCL+'chrome.extension.sendRequest: '+bloop(requestObj));
			self.port.emit('request',requestObj,{},responseFn)
		}
	},
	i18n : {
		getMessage: function(m){
			if(localizedStrings[m])m=localizedStrings[m];
			return m;
		}
	},
	browserAction: {
		setIcon: function(){},
		setBadgeBackgroundColor: function(){},
		setBadgeText: function(){}
	},
	windows : {
		getCurrent: function(fn){
			fn(0);	
		}
	}
}
self.port.on('response',firefoxChromeApi.response.bind(firefoxChromeApi));
