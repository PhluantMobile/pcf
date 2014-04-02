/*Phluant Client Framework v0.9 | (c) 2014 Phluant, Inc. All rights Reserved | See documentation for more details*/
pcf = {
	adInit: null,
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
	phadConsoleLog: false,
	videoPlaying: false,
	video_properties: {
		'aspect_ratio': '16:9',
		'attributes': {
			'webkit-playsinline': false,
			'controls': true,
			'autoplay': true,
		},
		'container_id': null,
		'close_callback': null,
		'full_screen': false,
		'hide_close_btn': true,
		'pause_callback': null,
		'play_callback': null,
		'reload': false,
		'style': {
			'width': '320px',
			'height': '180px',
			'zIndex': 5000,
			'margin': 0,
			'padding': 0,
		},
	},
	videoReload: false,
	hashtag: null,
	executionID: null,
	campaignID: null,
	sessionID: null,
	container: null,
	webServiceUrl: 'http://lbs.phluant.com/web_services/',
	ajax: function(vars){
		console.log(vars);
		ajaxRequest = new XMLHttpRequest(); 
		var sendData = '';
		console.log(typeof(vars.data));
		if(typeof(vars.data) != 'undefined'){
			for(var i in vars.data){
				if(sendData != ''){
					sendData += '&';
				}
				sendData += i+'='+encodeURIComponent(vars.data[i]);
			}
		}
		console.log(sendData);
		if(vars.method != 'POST' && sendData != ''){
			vars.url += '?'+sendData;
		}
		var timeout = 10000;
		if(typeof(vars.timeout) == 'number'){
			timeout = vars.timeout;
		}
		console.log(vars.url);
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
				if(typeof(vars.js_object) != 'undefined'){
					var resp = ajaxRequest.responseText;
					if(vars.js_object){
						resp = JSON.parse(resp);
					}
				}
				if(typeof(vars.callback) != 'undefined'){
					vars.callback(resp);
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
	gmaps_draw: function(vars){
		var mapZoom = 10;
		if(typeof(vars.map_zoom) != 'undefined'){
			mapZoom = vars.map_zoom;
		}
		var mapOptions = {
	        zoom: mapZoom,
	        center: new google.maps.LatLng(vars.center_lat, vars.center_lng),
	        disableDefaultUI: true,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    if(typeof(vars.map_id) == 'undefined'){
	    	console.log('A map id must be specified');
	    	return false;
	    }
	    else{
	    	if(typeof(vars.map_id) == 'string'){
	    		vars.map_id = this.gid(vars.map_id);
	    	}
	    }
	    var map = new google.maps.Map(vars.map_id, mapOptions);
	    if(typeof(vars.markers) != 'undefined'){
		    for (var i in vars.markers) {
		        var marker = vars.markers[i];
		        var myLatLng = new google.maps.LatLng(marker.lat, marker.lng);
		        var defaults = {
		        	position: myLatLng,
		        	map: map,
		        };
		        var ignore = ['lat', 'lng', 'clickthru'];
		        for(var m in marker){
		        	if(ignore.indexOf(marker[m]) == -1){
		        		defaults[m] = marker[m];
		        	}
		        }
		        var newMarker = new google.maps.Marker(defaults);
		        if(typeof(marker.clickthru) != 'undefined'){
		        	newMarker.clickthru = marker.clickthru;
		        	google.maps.event.addListener(newMarker, 'click', function() {
			            var url = 'http://maps.google.com/?saddr='+vars.user_lat+','+vars.user_lng+'&daddr='+this.position.k+','+this.position.A;
			            if(typeof(this.clickthru.url) != 'undefined'){
			            	url = this.clickthru.url;
			            }
			            if(pcf.isPhad){
			            	if(pcf.phadConsoleLog){
			            		ph.u.log(this.clickthru.name);
			            	}
			            	ph.u.clickthru(url, this.clickthru.name, pcf.sessionID);
			            }
			            else{
			            	console.log(this.clickthru.name);
			            	window.open(url, '_blank');
			            }
			        });
		        }
	    	}
    	}
	},
	gmaps_geo: function(vars){
		console.log(vars);
		var locType = 'address';
		if(typeof(vars.loc_type) != 'undefined'){
			locType = vars.loc_type;
		}
		if(this.geocoder == null){
			this.geocoder = new google.maps.Geocoder();
		}
		var self = this;
		if(locType == 'geo' || 'latLng'){
			console.log(vars.address);
			if(this.valid_geo(vars.address)){
				var geo = vars.address.split(',');
				var latLng = new google.maps.LatLng(geo[0], geo[1]);
				this.geocoder.geocode( { 'latLng' : latLng}, function(results, status) {
					self.gmaps_return(results, status, vars);
			    });
			}
			else{
				console.log('Must be a valid lat/lng set for reverse geocoding');
				return false;
			}
			
		}		else{
			console.log(vars.address);
			this.geocoder.geocode( { 'address' : encodeURIComponent(vars.address)}, function(results, status) {
				console.log(results);
				console.log(status);
				self.gmaps_return(results, status, vars);
		    });
		}
	},
	gmaps_return: function(results, status, vars){
		if(status == google.maps.GeocoderStatus.OK) {
			vars.callback(results);
         }
         else{
         	if(typeof(vars.failover) == 'boolean'){
         		if(vars.failover){
         			var geoVars = {};
         			geoVars.callback = vars.callback;
         			if(typeof(vars.failover_callback) != 'undefined'){
         				geoVars.callback = vars.failover_callback;
         			}
         			if(this.valid_zip(address)){
						geoVars.data.type =  'postal_code';
					}
					if(this.valid_geo(address)){
						geoVars.data.type =  'city_postal_by_geo';
					}
					if(typeof(geoVars.data.type) != 'undefined'){
						geoVars.data.value = vars.address;
					}
         			this.geolocation(geoVars);
         		}
         	}
         	else{
         		vars.callback(false);
         	}
         }
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
			if(this.adInit == null){
				console.log('An initialization function must be set for MRAID to work properly.');
				return false;
			}
			if(this.closeCallback == null){
				console.log('A close function must be set for MRAID to work properly.');
				return false;
			}
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
		if(this.adInit != null){
			if(this.isMraid){
				if(mraid.getState() === 'loading')
					mraid.addEventListener('ready', self.mraid_ready);
				else this.mraid_ready();
			}
			else this.adInit();
		}
	},
	mraid_ready: function(){
		if(mraid.isViewable) this.viewable_change();
		else mraid.addEventListener('viewableChange', this.viewable_change);
	},
	viewable_change: function(){
		if(mraid.isViewable) { //TODO: don't check isViewable again
			this.track('viewableChange');
			this.adInit();
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
				'store_limit': 1,
				'cat_limit': 10
			}
		};
		for(var i in vars.data){
			varsExport.data[i] = vars.data[i];
		}
		var req = ['company', 'campaign_id'];
		for(var i=0; i<req.length; i++){
			if(typeof(varsExport.data[i]) == 'undefined'){
				console.log(req[i]+' is a required attribute for the shoplocal function.');
				return false;
			}
		}
		if(varsExport.data.subtype == 'postal_code' && !this.valid_zip(varsExport.value)){
			console.log('invalid postal code format');
			return false;
		}
		if(varsExport.data.call_type.indexOf('category') != -1 && typeof(varsExport.data.category_tree_id) == 'undefined'){
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
	video: function(vars){
		var self = this;
		this.videoPlaying = true;
		objCheck = ['style', 'attributes'];
		if(!this.videoReload){
			for(var i in vars){
				if(objCheck.indexOf(i) != -1){
					for(var v in vars[i]){
						this.video_properties[i][v] = vars[i][v];
					}
				}
				else{
					this.video_properties[i] = vars[i];
				}
			}
		}
		if(this.video_properties.full_screen){
			this.video_properties.attributes['webkit-playsinline'] = false;
		}
		var cid = this.video_properties.container_id;
		this.video_properties.style.width = cid.offsetWidth+'px';
		this.video_properties.style.height = cid.offsetHeight+'px';
		var ar = this.video_properties.aspect_ratio.split(':');
		if(this.video_properties.style.width == '0px' && this.video_properties.style.height == '0px'){
			console.log('at least a height or a width for the video element or its parent element must be declared');
			return false;
		}
		if(this.video_properties.style.width != '0px' && this.video_properties.style.height == '0px'){
			this.video_properties.style.height = this.video_properties.style.width.replace('px','')*(ar[1]/ar[0])+'px';
		}
		if(this.video_properties.style.width == '0px' && this.video_properties.style.height != '0px'){
			this.video_properties.style.width = this.video_properties.style.height.replace('px','')*(ar[0]/[1])+'px';
		}
		if(this.isPhad){
			ph.v.play(this.video_properties.video_url, this.video_properties.name, this.campaignID, this.executionID, this.sessionID, cid);
			if(this.video_properties.hide_close_btn){
				var phVidClose = this.gid('phVidClose');
				if(phVidClose){
					phVidClose.style.display = 'none';
				}
			}
		}
		else{
			var videoHtml = '<video src="'+this.video_properties.video_url+'"></video>';
			cid.innerHTML = videoHtml;
		}
		var ph_videoElement = cid.getElementsByTagName('video')[0];
		if(ph_videoElement){
			for(var i in this.video_properties.attributes){
				ph_videoElement.setAttribute(i, this.video_properties.attributes[i]);
			}
			for(var i in this.video_properties.style){
				ph_videoElement.style[i] = this.video_properties.style[i];
			}
			ph_videoElement.addEventListener('play', function(){
				if(self.video_properties.full_screen){
					self.video_full_screen(elem);
				}
				if(typeof(self.video_properties.play_callback )== 'function'){
					self.video_properties.play_callback();
				}
			});
			ph_videoElement.addEventListener('pause', function(){
				if(typeof(self.video_properties.pause_callback )== 'function'){
					self.video_properties.pause_callback();
				}
			});
			if(this.video_properties.attributes.autoplay){
				setTimeout(function(){
					ph_videoElement.play();
				},500);
			}
			if(!this.video_properties.full_screen){
				ph_videoElement.addEventListener('webkitendfullscreen', function(){
			        self.video_close();
				});
			}
			ph_videoElement.addEventListener('ended', function(){
		        self.video_close();
		    });
		}
	},
	video_close: function(){
		if(this.isPhad){
			ph.v.remove();
		}
		else{
			this.video_properties.container_id.innerHTML = '';
		}
		this.videoPlaying = false;
		if(typeof(this.video_properties.close_callback) == 'function'){
			this.video_properties.close_callback();
		}
		if(this.video_properties.reload){
			this.videoReload = true;
			this.video_properties.attributes.autoplay = false;
			this.video();
		}
	},
	video_full_screen: function(elem){
		var self = this;
		var endEvent = 'endfullscreen';
		if(elem.requestFullscreen) {
		    elem.requestFullscreen();
		}
		else if(elem.mozRequestFullScreen) {
		    elem.mozRequestFullScreen();
		    endEvent = 'mozendfullscreen';
		} 
		else if(elem.webkitRequestFullscreen) {
			elem.webkitRequestFullscreen();
			endEvent = 'webkitendfullscreen';
		}
		else if(elem.msRequestFullscreen) {
		    elem.msRequestFullscreen();
		    endEvent = 'msendfullscreen';
		}
		elem.addEventListener(endEvent, function(){
	        self.video_close();
		});
	},
}
pcf.iosVersion = pcf.iosVersionCheck();
if(typeof(ph) == 'object'){
	pcf.isPhad = true;
}