var COMN_DBUG=false;
var DESC_INCL='';
var BLOOP_MAX=75;
var DATA_URLP='';
var RSC_READY=-2;
var MAX_RESPONSE_COUNT = 900;
var MAX_RESPONSE_WAIT  = 5000;

function bloop(a){
	otext='';
	for(i in a){
		otext+=(i+'='+a[i]).substr(0,BLOOP_MAX)+', ';
	}
	return otext;
}

self.port.on('dataUrlIs',function(dUrl){
	DATA_URLP=dUrl;
	RSC_READY++;
});
self.port.emit('getDataUrl');

var localizedStrings={};
self.port.on('localizedStrings',function(messages){
	var ls=JSON.parse(messages);
	for( var i in ls ){
		localizedStrings[i] = ls[i].message;
	}
	RSC_READY++;
});
self.port.emit('getLocalization');

var firefoxChromeApi={
	responseIdentifer : 0,
	responseFunctions : [],
	responseCounter : 0,
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
				self.port.on('storage-set-resp',function(resp){
					callbackfn(resp);
				});
				self.port.emit('storage-set-req',tosave);
			},
			get : function(toget, callbackfn){
				self.port.on('storage-get-resp',function(resp){
					callbackfn(resp);
				});
				self.port.emit('storage-get-req',toget);
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
		},
		captureVisibleTab: function(winid, opt, cbf){
			//{format:'jpeg',quality:100}
			self.port.on('captureVisibleTab_Resp',function(resp){
				cbf(resp);
			});
			self.port.emit('captureVisibleTab_Req');
		},
		connect : function(tabid, opts){
			if(COMN_DBUG)console.log(DESC_INCL+'chrome.tabs.connect: '+bloop(opts));
			self.port.emit('connect',opts)
		}
	},
	alarms : {
		create : function(opts){

		},
		onAlarm : {
			addListener : function(fn){

			}
		},
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
			if(COMN_DBUG)console.log(DESC_INCL+'chrome.runtime.connect: '+bloop(opts));
			self.port.emit('connect',opts)
		},
		onConnect : {
			addListener : function(fn){
				if(COMN_DBUG)console.log(DESC_INCL+'chrome.runtime.onConnect.addListener');
				self.port.on('connect',function(connectReq){
					connectReq.onDisconnect = chrome.runtime.onDisconnect;
					if(COMN_DBUG)console.log(DESC_INCL+'chrome.runtime.onConnect Listner Fired');
					fn(connectReq);
				});
			}
		},
		onDisconnect : {
			addListener : function(fn){
				if(COMN_DBUG)console.log(DESC_INCL+'chrome.runtime.onDisconnect.addListener');
				self.port.on('disconnect',function(connectReq){
					if(COMN_DBUG)console.log(DESC_INCL+'chrome.runtime.onDisconnect Listner Fired');
					fn(connectReq);
				});
			}
		},
		onUpdateAvailable : {
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
		setIcon: function(r){
			self.port.emit('browserAction_setIcon_Req',r);
		},
		setBadgeBackgroundColor: function(r){
			self.port.emit('browserAction_setBadgeBackgroundColor_Req',r);
		},
		setBadgeText: function(r){
			self.port.emit('browserAction_setBadgeText_Req',r);
		}
	},
	windows : {
		getCurrent: function(fn){
			fn(0);	
		}
	}
}
self.port.on('response',firefoxChromeApi.response.bind(firefoxChromeApi));
