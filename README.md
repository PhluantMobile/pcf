# Phluant Client Framework Library

The Phluant Client Framework (PCF) Libaray is a framework for use by Phluant Mobile's clients in developing their rich media campaign assets.  The concept of the PCF libraray is to provide our clients with a code base thiat works both inside and outside of our ad serving network, which will substantially reduce the amount of time our company needs to launch a rich media campaign.  It also provides a number of core functionalites that are very common in the rich media campaigns we run.  It is written in pure JavaScript, so it will work independently of any other JavaScript framework library, i.e. jQuery.  Some features may require supporting libraries (i.e. Google Maps) and will be indicated as such in the documentation.  A list of items this framework supports is below, with links to scroll to documented sections.  

* [Element ID referencing](#markdown-header-element-id-referencing)
* [Initialization](#markdown-header-initialization)
* [Automatic MRAID detection and handling](#markdown-header-initialization)
* [Expands](#markdown-header-expands)
* [Contracts](#markdown-header-contracts)
* [Clickthroughs](#markdown-header-clickthroughs)
* [Custom trackers](#markdown-header-custom-trackers)
* [HTML5 video](#markdown-header-html5-video)
* [All geolocation and weather API calls to Phluant's resources](#markdown-header-geolocation-weather-api-calls)
* [HTML5 geolocation prompt with optional IP lookup as a fallback](#markdown-header-geolocation-prompt)
* [Store locator API call](#markdown-header-store-locator-api-call)
* [Google Maps](#markdown-header-google-maps)
* [Standard AJAX calls](#markdown-header-standard-ajax-calls)
* [Mobile and platform specific detection](#)
* [iOS version detection (namely for iOS 7)](#markdown-header-ios-version-detection)
* [Query string detection](#markdown-header-query-sring-detection)
* [Technical Support](#markdown-header-technical-support)

---

## How To Use

Place a JavaScript tag reference before any campaign specific code.  You may do this either in the head or inline.  We recommend you use the minified version for any non-development work.  For your convenience, we have a copy of the code on our CDN server you may use at http://mdn4.phluantmobile.net/jslib/pcf/.  Example tag:

```
<script src="http://mdn4.phluantmobile.net/jslib/pcf/pcf.min.js"></script>
```

All coding examples used in this documentaiton can utilize JS library equivelants (i.e. jQuery) unless otherwise specified.

---

### Element ID referencing

The ads Phluant Mobile serves up can be placed on a web site or mobile applicaiton with multiple ad instances.  Our namespacing function ensures any element ID referenced in the code will have the namespacing attribute added to it if needed, with the standard ```document.getElementById()``` function being the fallback.

Example:

```
<script>
var contract_div = pcf.gid('contract_div');
var expand_div = pcf.gid('expand_div');
var expand_btn = pcf.gid('expand_btn');
var close_btn = pcf.gid('close_btn');
</script>
```

_This step is strongly recommended, and is compatible when being used with JS libraries such as jQuery._

---

### Initialization

This step initializes the framework for expandable ads and interstitial/banner ads that need close functionalty.  The developer will need to ensure an appropriate callback function is designated for contracting/closing the ad.  This step also initializes any MRAID specific functionality if the MRAID framework is detected.

Example:

```
<script>
function contractAd(){
	expand_div.style.display = 'none';
	contract_div.style.display = 'block';
}

//Including the expand attribute is optional for expandable ads starting out in the contracted state.  For interstitial/banner ads, set the attribute to true.
pcf.init({
	'callback': contractAd,
	'expanded': false,
});
</script>
```

_This step is required for all expandable ads as interstitial/banner ads that need close funcitonality._

---

### Expands

This step ensures our framework receives the attributes of the ad in its expanded state, fires off the appropriate reporting tracker, and automatically handles any MRAID specific requirements.  For assets running outside of our ad serving network, a console log message will display the expansion properties.

Example:

```
<script>
expand_btn.addEventListener('click', function(){
	expand_div.style.display = 'block';
	contract_div.style.display = 'none';
	pcf.expand({
		'width': '320px',
		'height': '416px'
	});
}
</script>
```

_This step is required for all expandable ads._

---

### Contracts

This step ensures our framework can properly close the ad, fires off the appropriate reporting tracker, and automatically handle and MRAID specific requirements.  For assets running ourside of our ad serving network, a console log message will outputted indicating 'contracting'.  Because the ad specific close function was already passed to the framework with the initialization, it's only necessary to call the framework function.  Utilizing this funciton will also automatically close any video being played.

Example:

```
<script>
contract_btn.addEventListener('click', function(){
	pcf.contract();
});
</script>
```

_This step is requried for all expandable ads as well as interstitial/banner ads that require close functionality._

---

### Clickthroughs

This step ensures any user initiated clickthrough can be entered into our tracking system, and will open either a new browser tab (mobile web) or the mobile app's web viewer.  For assets running outside of our ad serving network, a console log message displaying the reporting name will be outputted.

Example of traditional hyperlink using the element ID as the reporting name:

```
<a id="clickthrough1" href="http://somesite.com">Clickthrough 1</a><br />
<a id="clickthrough2" href="http://othersite.com">Clickthrough 2</a>
<script>
var links = document.getElementsByTagName("a");
for (var i=0; i<links.length; i++){
    links[i].addEventListener("click", function (a){ 
    	a.preventDefault();
    	pcf.clickthru({
    		'url': links[i].href,
    		'name': links[i].id
    	});
    });
}
</script>
```

Example of using an element as a 'hotspot':

```
<div id="clickthrough"></div>
<script>
var clickthrough = pcf.gid('clickthrough');
clickthrough.addEventListener('click', function(){
	pcf.clickthru({
		'url': 'http://somesite.com',
		'name': 'clickthrough',
	});
});
</script>
```
_This step should be utilized for all clickthroughs._


---

### Custom Trackers

This step ensures that a specialized event can be entered into our tracking system, i.e. a user navigating to a certain section of the ad.  For assets running outside of our ad serving network, a console log message displaying the reporting name will be outputted.

Example: 

```
<ul>
	<li id="section1">Seciton 1</li>
	<li id="section2">Section 2</li>
</ul>
<div id="element1">
	Some content
</div>
<div id="element2">
	More content
</div>

<script>
var section1 = pcf.gid('section1');
var section2 = pcf.gid('section2');
var element1 = pcf.gid('element1');
var element2 = pcf.gid('element2');

section1.addEventListener('click', function(){
	element1.style.display = 'block';
	element2.style.display = 'none';
	pcf.track('element1Display');
});

section2.addEventListener('click', function(){
	element2.style.display = 'block';
	element1.style.display = 'none';
	pcf.track('element2Display');
});
</script>
```

---

### HTML5 Video

This step ensures that any HTML5 video that needs to be played can have the proper code rendered, inside or outside of Phluant's ad serving network.  It isn't necessary to include any video tags in the HTML.  All that is needed is a video container element and the proper JavaScript code.  It is also possible for a video to auto play on an expansion.  All that would be required is to add in the function callup to the applicable expand code.  All videos automatically close on the completion of the video or contracting the ad.  For any other events that require closure, ```pcf.video_close()``` can be utlized.

Additional Notes:
* The video_url spec can be either relative or absolute.
* Both video_url and container_id specs are required.  All other specs are optional.
* Default video attributes for displaying controls is true and inline (i.e. webkit-playsinline) are false.  These can be overwirtten.
* The video tag will take on the height and width of the parent container by, so be sure these are set properly!  The default z-index is 5000.  These values can be overwritten, along with any other styling attributes inserted as needed.
* Be sure to utilize the ```pcf.videoPlaying``` boolean if using a click function call, as this will ensure the video isn't called multiple times.
* The aspect_ratio default spec is 16:9, which is used if either the height or width can't be determined.  A custom aspect ration can be entered.

Example:

```
<div id="video_container"></div>
<script>
var video_container = pcf.gid('video_container');
video_container.addEventListener('click', function(){
	if(!pcf.videoPlaying){
		pcf.video({
			'video_url': 'videos/somevideo.mp4',
			'container_id': video_container,
			'aspect_ratio': '16:9',
			'attributes':{
				'controls': true,
				'inline': true
			},
			'style':{
				'zIndex': 50000
			}
		});
	}
});
</script>
```

---

### Geolocation/Weather API calls

Phluant maintains a web based application capable of providing geolocation and weather information based on location, using Maxmind and National Weather Service resources respectively.  All lookups are done by AJAX and require the developer to specifiy a callback function to return the data. Please be aware the mobile data providers have a wide latitude in assigning IP addresses to users, which may return an inaccurate location.


#### Geolocation

Geolocation Lookup Methods:
* IP Address (default)
* Postal Code
* City/Postal by Geo

IP Address code example:
```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
});
</script>
```

Postal Code Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'postal_code',
		'value': '98033'
	}
});
</script>
```

Postal Code Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'postal_code',
		'value': '98033'
	}
});
</script>
```

City/Postal by Geo Example:

```
<script>
function geoReturn(data){
	console.log(data);
}

pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'city_postal_by_geo',
		'value': '47.6727,-122.1873'
	}
});
</script>
```

All geolocation lookup methods return the following data:

* data.results.id: The ID of the database row.
* data.results.country: The abbreviated country.
* data.results.state_region: The abbreviated state, province, or region.
* data.results.city: The full city name.
* data.results.lat: The centralized reported latitude of the postal code.
* data.results.lon: The centralized reported longitude of the postal code.
* data.results.dma_code:  The DMA code for the user’s current location.
* data.results.area_code:  The prevailing area code for the user’s current location.  This has no correlation to the user’s actual area code.

_For a comphrehensive address lookup, please see the Google Maps geocoding functionality_

#### Weather

Weather Lookup Methods: 
* IP address (default)
* Postal code
* Lat/lng

Weather by IP Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.
pcf.geolocation({
	'callback': geoReturn,
	'data': {
		'type': 'weather',
		'end': '3 days',
	}
});
</script>
```

Weather by Postal Code Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.  The subtype spec must be specified as postal_code.
pcf.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'subtype': 'postal_code',
		'value': '98033'
	}
});
</script>
```

Weather by Geolocation Example:

```
<script>
function weatherReturn(data){
	console.log(data);
}

//The end spec defines the range of the weather data returned in hours or days, to a maximum of 14 days.  If the default of 1 day is desired, this step can be omitted.  The subtype spec must be specified as geo, and value is in lat,lng format.
pcf.geolocation({
	'callback': weatherReturn,
	'data': {
		'type': 'weather',
		'subtype': 'geo',
		'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```


The weather data returned can vary based on custom input values, but an example is provided below:

* data.status: the overall outcome of the query.  Is success or error.
* data.msg: An occasional message may appear if a particular outcome occurs.
* data.results city: The full city name.
* data. results.state_region: The abbreviated state, province, or region.
* data.results.postal_code: The postal code of the user’s location.
* data.results.lat: The centralized reported latitude of the postal code.
* data.results.lng: The centralized reported longitude of the postal code.
* data.results.nws_xml: The URL for the original NWS XML output.
* data.results.nws_page: The URL for a human friendly NWS weather report page.
* data.results.data.icon:  An array of weather icon images provided by the NWS.  Within each result contains the value, which is a hyperlink to the image, and start_valid_time.
* data.results.data.weather_conditions: An array of the weather conditions summary.  Within reach result contains the value, which is a human readable summary of the weather, and start_valid_time.
* data.results.data.maximum_temp: An array of the maximum daytime temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.results.data.minimum_temp: An array of the minimum daytime temperatures in fahrenheit. Within reach result contains the value, along with start_valid_time and end_valid_time.
* data.results.data.hourly_temp: An array of the hourly temperatures in fahrenheit. Within reach result contains the value, start_valid_time and end_valid_time.
* data.results.data.precipitation:  An array of the expected levels of precipitation in inches.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.clould_cover:  An array of the expected cloud cover levels in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.12_hour_precip_prob:  An array of the likeliness of precipitation in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.humidity:  An array of the humidity in percentage.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.wind_dir:  An array of the wind directions at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.
* data.results.data.wind_speed:  An array of the wind speed at specified time periods.  Within reach result contains the value, start_valid_time, and end_valid_time.

---

### Store Locator API Call

Phluant provides certain clients the ability to pull store location information information for various ads, namely to display the closest number of stores in relation to the user.  If your campaign has been set up with this feature, this API call will work for you.  All lookups are done by AJAX and require the developer to specifiy a callback function to return the data.

Lookup Methods: 
* IP address (default)
* Lat/lng

Required Specs:

* callback - the callback function.
* data.campaign_id - the campaign ID assigned by Phluant.


Optional Specs:

* data.limit - the limit on the number of stores.  Default is 3.
* data.dist - the limit on the maximum radius distance in miles.  Default is 30.
* data.value - if using a lat/lng lookup, set as lat,lng.
* data.subtype - specify as geo if using lat/lng values.

Store Location by IP Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values
pcf.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30
	}
});
</script>
```

Store Location by Geo Example:

```
<script>
function storeReturn(data){
	console.log(data);
}

//Distance and limit are shown as an example and can be omitted if satisfied with default values.  Subtype and value must be specified for a geolocaiton lookup.
pcf.get_stores({
	'callback': storeReturn,
	'data': {
		'campaign_id': 9999,
		'limit': 3,
		'dist': 30,
		'subtype': 'geo',
		'value': '47.676308399999996,-122.20762579999999'
	}
});
</script>
```
---

### Geolocation Prompt

The framework provides a function to prompt the user for their geocoordinates.  A callback function must be included to receive the results, which are returned as a JavaScript object.  The developer can optionally specify to use the geolocation IP lookup as a failover.

Example:
```
<script>

function geoReturn(data){
	console.log(data);
}

pcf.geolocation_prompt({
	'callback': geoReturn,
	'failover': true,
})

</script>
```

---

### Google Maps

The framework provides short hand functionality to utilize the Google Maps JavaScript API.  At present, both the geocoding and map drawing functions are supported.  Both features require the Google Maps JavaScript reference placed before the PCF reference, be it in the head or inline, and also require a callback function.  Example:

```
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false"></script>
```

#### Geocoding

Returns Google Maps API information on a location.  May be a full or partial address, city/state, postal code, lat/lng values, etc.

Example:

```
<script>

function gmapsReturn(data){
	console.log(data);
}

pcf.gmaps_geo({
	'address': '98033',
	'callback': gmapsReturn
});
</script>
```

For more information, please visit the about the [Google Maps Geocoder API page](https://developers.google.com/maps/documentation/javascript/geocoding).

_Per Google's API policy, the geolocator function is only to be used when populating a Google Map or to create an external clickthrough to Google Maps._

#### Map Draw

Uses relevant data to draw out a Google Map in a specified element.

Required specs:

* map_id - the element ID for the map.
* lat - the latitude for the map's central location.
* lng - the longitude for the map's central location.

Optional specs:

* map_zoom - the zoom level of the map.  Default is 10.
* markers - an object containing relevant information for any desired markers.
	* markers[i].lat - the latitude of the desired marker.  Required for marker to be set.
	* markers[i].lng - the longitude of the desired marker.  Required for marker to be set.
	* markers[i].clickthru - an object containing relevant information for any marker to be a clickthrough.  Default is a Google Maps hyperlink using the original lat/lng values as the start point and the lat/lng values as the end point
		* markers[i].clickthru.name - the name of the clickthru, used for reporting.  Essentially the same functionality as a standard clickthru.
		* markers[i].clickthru.url - An optional URL value that will override the default Google Maps link.
	* _The Map Draw function supports all of the optional marker specifications.  For more detained information,  please visit the [Google Maps Marker API page](https://developers.google.com/maps/documentation/javascript/markers)._

Example:

```
<div id="google_map"></div>
<script>
var google_map = pcf.gid('google_map');
var mapOptions = {
	'lat': 47.676308399999996,
	'lng': -122.20762579999999,
	'map_id': google_map,
	'map_zoom': 10,
	'markers': [],
}
//Pretend the data variable is an object that contains store infromation.
for(var i in data.results){
	var numAdd = eval(i+1);
	mapOptions.markers.push({
		'lat': data.results[i].lat,
		'lng': data.results[i].lng,
		'title': data.results[i].name,
		'zIndex': numAdd,
		'clickthru': {
			'name': 'GoogleMaps'
		}
	});
}
pcf.gmaps_draw(mapOptions);
</script>
```

---

### Standard AJAX Calls

The framework provides a function for standard AJAX calls.  Both GET and POST requests are supported.  If the expected return data is in JSON format, instructions can be passed to convert the data into a JavaScript object.  Using a callback function is required.  Please keep in mind that while this function is provided as a convenience, Phluant is not responsible for setting up the AJAX source for proper accessibility, i.e. cross-domain access.

Required specs:

* url - The URL the request is being made to.
* callback - The callback function for the data.

Optional specs:

* data - An object of any GET/POST key/value pairs needed to complete the request.
* method - Can be either GET or POST.  Default is GET.
* js_object - Can be set to true or false.  Should only be set if the expected return data is JSON.

Example:

```
<script>

 function ajaxReturn(data){
 	console.log(data);
 }

 pcf.ajax({
 	'url': 'http://somesite.com/get/some/data',
 	'callback': ajaxReturn,
 	'json_return': 'true',
 	'method': 'GET',
 	'data': {
 		'foo': 'bar',
 		'getmy': 'data',
 	}
 });
 </script>
```

 ---

### Mobile and Platform Specific Detection

The framework provides a method to detect if a mobile/tablet device is being used, along with specific type.  Will detect Android, Blackberry, iOS, Opera Mini, Windows Mobile, or if the user is using any of the previously mentioned platforms.  Returns null if the device isn't detected.

Example:

```
<script>
console.log(pcf.isMobile.Android());
console.log(pcf.isMobile.Blackberry());
console.log(pcf.isMobile.iOS());
console.log(pcf.isMobile.Opera());
console.log(pcf.isMobile.Windows());
console.log(pcf.isMobile.any());
</script>
```

### iOS version detection

The framework provides a method to detect what iOS version, if any, is being run.  This is namely for iOS 7, which currently has usability issues and bugs in the Safari browser.  Returns the numerical verision if an iOS version, returns 0 for all other devices.

Example:

```
<script>
console.log(pcf.iosVersion);
</script>
```


### Query String Detection

The framework provides a function to detect and return any query string keys and values as a JavaScript object, but specifying JSON is optional.  It works when the URL has a standard query string format such as ?foo=bar&getmy=data.

Example URL:  http://somesite.com/index.html?foo=bar&getmy=data.

Example JavaScript:
```
<script>
var query_string = pcf.query_string();
console.log(query_string);
</script>
```

---

### Technical Support

Phluant Mobile is committed to helping our clients in successfully using this framework to design and develop their mobile advertisements.  Please feel free to utilize this repository's issue tracker for general feedback, feature requests, bug reports, tech support questions, etc.  

---

(c)2014 Phluant Mobile, Inc.  All rights reserved.  This framework library is intended for use by Phluant Mobile clients for designing and developing mobile advertisements intended for eventual use in Phluant's ad serving network.  All other use is strictly prohibited.