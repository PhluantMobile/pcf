/*Phluant Client Framework v0.9 | (c) 2014 Phluant, Inc. All rights Reserved | See documentation for more details*/
pcf = {
	adInit: null,
	winLoaded: false,
	adIsExpanded: false,
	closeCallback: null,
	geocoder: null,
	iosVersion: null,
	isMobile: {
	    Android: function() {
	        return navigator.userAgent.match(/Android/i);
	    },
	    BlackBerry: function() {
	        return navigator.userAgent.match(/BlackBerry/i);
	    },
	    iOS: function() {
	        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	    },
	    Opera: function() {
	        return navigator.userAgent.match(/Opera Mini/i);
	    },
	    Windows: function() {
	        return navigator.userAgent.match(/IEMobile/i);
	    },
	    any: function() {
	        return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
	    }
	},
	isMraid: false,
	isPhad: false,
	modules: {
		'gmaps': ['http://localhost:8000/repositories/pcf/modules/gmaps/pcf.gmaps.js'],
		'bmaps': ['http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0', 'http://localhost:8000/repositories/pcf/modules/bmaps/pcf.bmaps.js'],
		'video': ['http://localhost:8000/repositories/pcf/modules/video/pcf.video.js'],
	},
	modsLoaded: true,
	phadConsoleLog: false,
	scriptTag: null,
	hashtag: null,
	executionID: null,
	campaignID: null,
	sessionID: null,
	container: null,
	webServiceUrl: 'http://lbs.phluant.com/web_services/',
	ajax: function(vars){
		ajaxRequest = new XMLHttpRequest();
		var sendData = '';
		var yql = false;
		if(typeof(vars.yql) != 'undefined'){
			yql = true;
		}
		if(typeof(vars.data) != 'undefined'){
			for(var i in vars.data){
				sendData += ((sendData != '')?'&':'')+i+'='+encodeURIComponent(vars.data[i]);
			}
		}
		if((vars.method != 'POST' || yql) && sendData != ''){
			vars.url += ((vars.url.indexOf('?') != -1)?'&':'?')+sendData;
		}
		var timeout = 10000;
		if(typeof(vars.timeout) == 'number'){
			timeout = vars.timeout;
		}
		if(yql){
			var format = ((typeof(vars.yql.format) == 'string')? vars.yql.format : 'json');
			var yql = 'format='+format+'&q='+encodeURIComponent('select * from '+format+' where url="' +vars.url+ '"');
			vars.url = 'http://query.yahooapis.com/v1/public/yql';
			console.log(yql);
			if(vars.method != 'POST'){
				vars.url += '?'+yql;
			}
			else{
				sendData = yql;
			}
		}
		ajaxRequest.open(vars.method, vars.url, true);
		if(vars.method == 'POST'){
			ajaxRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			ajaxRequest.send(sendData);
		}
		else{
			ajaxRequest.send();
		}
		var ajaxTimeout = setTimeout(function(){
			ajaxRequest.abort();
			if(typeof(vars.callback) != 'undefined'){
				vars.callback({
					'status': 'timeout',
				});
			}
		},timeout);
		ajaxRequest.onreadystatechange = function(){
			clearTimeout(ajaxTimeout);
			if (ajaxRequest.readyState == 4 && ajaxRequest.status == 200) {
				var resp = ajaxRequest.responseText;
				if(resp.status != 'error' && typeof(resp.request_info) == 'undefined'){
					if(typeof(vars.js_object) != 'undefined'){
						if(yql){
							resp = {
								'status': success,
								'results': resp,
							}
						}
						if(vars.js_object){
							resp = JSON.parse(resp);
						}
					}
					if(typeof(vars.callback) != 'undefined'){
						vars.callback(resp);
					}
				}
      }
    	else{
    		if(typeof(vars.callback) != 'undefined'){
      		vars.callback({
      			'status': 'error',
      			'request_info': ajaxRequest
      		});
      	}
    	}
		}
	},
	capitalize: function(str){
		return str.charAt(0).toUpperCase()+str.slice(1);
	},
	clickthru: function(vars){
		if(this.isPhad){
			if(this.phadConsoleLog){
				ph.u.log(vars.name);
			}
			ph.u.clickthru(vars.url, vars.name, this.sessionID);
		}
		else{
			console.log(vars.name);
			window.open(vars.url, '_blank');
		}
	},
	contract: function(){
		if(this.videoPlaying){
			this.video_close();
		}
		if(this.isMraid){
			mraid.close();
		}
		if(this.isPhad){
			ph.t.close("MainPanel", this.sessionID);
			if(this.phadConsoleLog){
				ph.u.log('contracting');
			}
		}
		else{
			console.log('contracting');
		}
		if(typeof(this.closeCallback) == 'function'){
			this.closeCallback();
		}
	},
	expand: function(vars){
		var logMsg = 'expanding to '+vars.width+'px width, '+vars.height+'px height.';
		if(this.isPhad){
			ph.t.expand('MainPanel', this.sessionID, false, {'width' : vars.width, 'height' : vars.height});
			if(this.phadConsoleLog){
				ph.u.log(logMsg);
			}
		}
		else{
			console.log(logMsg);
		}
		if(this.isMraid){
			this.adIsExpanded = true;
		}
	},
	image_tracker: function(url){
		if(this.isPhad){
			ph.u.addImage(url);
		}
		else{
			var img = document.createElement("img");
			img.src = url;
			img.height = '1px';
			img.width = '1px';
			document.getElementsByTagName('body')[0].appendChild(img);
		}
	},
	geolocation: function(vars){
		console.log(vars);
		var varsExport = {
			'url': this.webServiceUrl+'geolocation/export',
			'method': 'GET',
			'callback': vars.callback,
			'js_object': true,
		};
		if(typeof(vars.data) != 'undefined'){
			varsExport.data = vars.data;
		}
		this.ajax(varsExport);
	},
	geolocation_prompt: function(vars){
		var self = this;
		navigator.geolocation.getCurrentPosition(function(position){
			var location = {
				'lat': position.coords.latitude,
				'lng': position.coords.longitude
			}
            vars.callback(location);
        },function(e){
        	if(vars.failover){
        		self.geolocation(vars);
        	}
        	else{
        		vars.callback(false);
        	}
        });
	},
	get_stores: function(vars){
		console.log(vars);
		var varsExport = {
			'url': this.webServiceUrl+'phluant/export',
			'method': 'GET',
			'callback': vars.callback,
			'js_object': true,
			'data': {
				'limit': 3,
				'dist': 30
			}
		};
		if(typeof(vars.data.campaign_id) == 'undefined'){
			console.log('campaign_id is a required attribute for this function');
			return false;
		}
		for(var i in vars.data){
			varsExport.data[i] = vars.data[i];
		}
		varsExport.data.type = 'get_stores';
		this.ajax(varsExport);
	},
	gid: function(id){
		return document.getElementById(id);
	},

	init: function(vars){
		var self = this;
		if(typeof(vars.callback) == 'function'){
			this.closeCallback = vars.callback;
		}
		if(typeof(vars.init) == 'function'){
			this.adInit = vars.init;
		}
		if(typeof(vars.expanded) != 'undefined'){
			if(vars.expanded){
				self.adIsExpanded = true;
			}
		}
		if(typeof(mraid) != "undefined"){
			/*
			//commented out requirements for init and close functionality for the time being
			if(this.adInit == null){
				console.log('An initialization function must be set for MRAID to work properly.');
				return false;
			}
			if(this.closeCallback == null){
				console.log('A close function must be set for MRAID to work properly.');
				return false;
			}
			*/
		    this.isMraid = true;
		    mraid.setExpandProperties({useCustomClose:true});
		    mraid.addEventListener('stateChange', function(){
		        if(self.adIsExpanded){
		        	if(typeof(self.closeCallback) != 'null'){
		        		self.closeCallback();
		        	}
		            self.adIsExpanded = false;
		        }
		    });
		    document.body.style.margin="0px";
		    this.container.style.position="absolute";
		    var newMetaTag = document.createElement('meta');
		    newMetaTag.name = "viewport";
		    newMetaTag.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
		    document.getElementsByTagName('head')[0].appendChild( newMetaTag );
		}
		if(typeof(vars.modules) != 'undefined'){
			this.module_load(vars.modules);
		}
		else{
			this.init_ad();
		}
	},
	init_ad: function(){
		console.log('in init ad');
		if(this.adInit != null){
			if(this.isMraid){
				if(mraid.getState() === 'loading')
					mraid.addEventListener('ready', self.mraid_ready);
				else this.mraid_ready();
			}
			else this.adInit();
		}
	},
	iosVersionCheck: function() {
	    var agent = window.navigator.userAgent,
	        start = agent.indexOf( 'OS ' );
	    if( ( agent.indexOf( 'iPhone' ) > -1 || agent.indexOf( 'iPad' ) > -1 ) && start > -1 ){
	        return window.Number( agent.substr( start + 3, 3 ).replace( '_', '.' ) );
	    }
	    return 0;
	},
	module_load: function(mods){
		if(this.scriptTag == null){
			var s = document.getElementsByTagName('script');
			for(var i=0; i<s.length; i++){
				if(s[i].src.indexOf('pcf.js') != -1 || s[i].src.indexOf['pcf.min.js'] != -1){
					this.scriptTag = s[i];
					break;
				}
			}
		}
		var self = this;
		var max = mods.length;
		max--;
		console.log('max is '+max);
		for(var i=0; i<mods.length; i++){
			console.log('i is '+i);
			var theMod = this.modules[mods[i]];
			var mCount = theMod.length;
			for(m=0; m<theMod.length; m++){
				var newScript = document.createElement('script');
				newScript.src = theMod[m];
				document.body.insertBefore(newScript, this.scriptTag);
				newScript.onload = function(){
					console.log('in onload');
					console.log(m);
					if(m == mCount){
						console.log('adding in new script, i is '+i+', max is '+max);
						self[theMod] = new Object(window['pcf_module_'+theMod]);
						if(i == max){
							self.init_ad();
						}
					}
				}
			}
		}
	},
	mraid_ready: function(){
		if(mraid.isViewable()) this.mraid_view_change();
		else mraid.addEventListener('viewableChange', this.mraid_view_change);
	},
	mraid_view_change: function(){
		if(mraid.isViewable()) { /*TODO: don't check isViewable again*/
			if (!this.winLoaded) { /*Mraid doesn't fire the load event,*/
				winLoaded = true;  /*so we have to do it manually*/
				window.dispatchEvent(new Event('load'));
			}
			this.track('viewableChange');
			setTimeout(this.adInit.bind(this)); /*delay init until load callbacks fired*/
		}
	},
	query_string: function(jsonConvert){
		var url = window.location.href;
		if(url.indexOf('?') != -1){
			var urlObj = new Object();
			var qString = url.split('?');
			var params = qString[1].split('&');
			for(var i=0; i<params.length; i++){
				var result = params[i].split('=');
				urlObj[result[0]] = decodeURIComponent(result[1]);
			}
			if(jsonConvert){
				urlObj = JSON.stringify(urlObj);
			}
			return urlObj;
		}
		else{
			return false;
		}
	},
	session_import: function(vars){
		for(var i in vars){
			this[i] = vars[i];
		}
	},
	shoplocal: function(vars){
		var varsExport = {
			'url': this.webServiceUrl+'phluant/export',
			'method': 'GET',
			'callback': vars.callback,
			'js_object': true,
			'data': {
				'call_type': 'store',
			}
		};
		for(var i in vars.data){
			varsExport.data[i] = vars.data[i];
		}
		var req = ['company', 'campaignid'];
		for(var i=0; i<req.length; i++){
			if(typeof(varsExport.data[req[i]]) == 'undefined'){
				console.log(req[i]+' is a required attribute for the shoplocal function.');
				return false;
			}
		}
		if(varsExport.data.subtype == 'postal_code' && !this.valid_zip(varsExport.data.value)){
			console.log('invalid postal code format :'.varsExport.data.value);
			return false;
		}
		if(varsExport.data.call_type.indexOf('retailertag') != -1 && typeof(varsExport.data.retailertagids) == 'undefined'){
			console.log('category_tree_id must be defined for a shoplocal category lookup.');
			return false;
		}
		varsExport.data.type = 'shoplocal';
		this.ajax(varsExport);
	},
	track: function(name){
		if(this.isPhad){
			ph.u.track('interaction', 'cint='+name, this.sessionID);
			if(this.phadConsoleLog){
				ph.u.log(name);
			}
		}
		else{
			console.log(name);
		}
	},
	valid_email: function(email){
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return filter.test(email);
    },
	valid_geo: function(geoTest){
		passed = true;
		console.log(geoTest);
		geoTest = geoTest.split(',');
		if(typeof(geoTest) == 'object'){
			for(var i=0; i<geoTest.length; i++){
				if(isNaN(geoTest[i])){
					passed = false;
					break;
				}
			}
		}
		else{
			passed = false;
		}
		return passed;
	},
	valid_phone: function(phone_num){
	    if(phone_num){
	    	phone_num = phone_num.replace(/[^0-9]/g, '');
			return /^\d{10}/.test(zipTest);
	    };
	},
	valid_zip: function(zip){
       return /^\d{5}(-\d{4})?$/.test(zip);
    },
}

pcf.iosVersion = pcf.iosVersionCheck();

if(typeof(ph) == 'object'){
	pcf.isPhad = true;
}

window.addEventListener('load', function(){
	pcf.winLoaded = true;
});
